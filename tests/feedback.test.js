import test from 'node:test';
import assert from 'node:assert/strict';
import { createFeedbackStore } from '../server/feedbackStore.js';
import { createFeedbackHandler } from '../api/feedback.js';
import { createAdminHandler } from '../api/admin.js';
import { createSession } from '../server/adminAuth.js';

test('ten feedback submissions per IP reach the protected admin inbox and reset at Manila midnight', async () => {
  let time = Date.UTC(2026, 9, 28, 15, 59, 59);
  const env = { IMPORT_LIMIT_SECRET: 'feedback-integration-test', ADMIN_PASSWORD: 'feedback-test-password-long-enough' };
  const store = createFeedbackStore({ env, now: () => time });
  const handler = createFeedbackHandler({ store });
  const admin = createAdminHandler({ env, feedback: createFeedbackStore({ env }) });
  const request = { method: 'POST', socket: { remoteAddress: '192.0.2.89' }, headers: { host: 'example.com', origin: 'https://example.com', 'content-type': 'application/json' }, body: { category: 'Feature request', message: 'Feedback integration test' } };
  const response = () => ({ setHeader() {}, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } });
  let allowance = response(); await handler({ ...request, method: 'GET' }, allowance);
  assert.equal(allowance.code, 200); assert.equal(allowance.body.remaining, 10);
  for (let index = 0; index < 10; index++) {
    const result = response(); await handler(request, result); assert.equal(result.code, 201);
  }
  let result = response(); await handler(request, result); assert.equal(result.code, 429);
  allowance = response(); await handler({ ...request, method: 'GET' }, allowance);
  assert.equal(allowance.body.remaining, 0); assert.equal(allowance.body.limit, 10);
  // Client-supplied forwarding headers cannot bypass the local IP limit.
  result = response(); await handler({ ...request, headers: { ...request.headers, 'x-forwarded-for': '192.0.2.90' } }, result); assert.equal(result.code, 429);
  result = response(); await handler({ ...request, socket: { remoteAddress: '192.0.2.90' } }, result); assert.equal(result.code, 201);
  const inbox = { method: 'GET', url: '/api/admin?action=feedback', headers: {} };
  result = response(); await admin(inbox, result); assert.equal(result.code, 401);
  result = response(); await admin({ ...inbox, headers: { cookie: `schedsnap_admin=${createSession(env)}` } }, result);
  assert.equal(result.code, 200);
  const accepted = result.body.feedback.filter(item => item.message === request.body.message);
  assert.equal(accepted.length, 11);
  assert.ok(accepted.every(item => item.id && !item.resolved));
  time += 1000;
  allowance = response(); await handler({ ...request, method: 'GET' }, allowance);
  assert.equal(allowance.body.remaining, 10);
  result = response(); await handler(request, result); assert.equal(result.code, 201);
});

test('feedback limit resets daily and only accepted submissions are stored', async () => {
  let now = Date.UTC(2026, 0, 1);
  const store = createFeedbackStore({ env: { FEEDBACK_DAILY_LIMIT: '2' }, now: () => now });
  const request = { socket: { remoteAddress: '192.0.2.42' } };
  const message = { category: 'Feature request', message: 'Add a design' };
  assert.equal(await store.submit(request, message), true);
  assert.equal(await store.submit(request, message), true);
  assert.equal(await store.submit(request, message), false);
  assert.equal((await store.read()).filter(item => item.message === message.message).length, 2);
  now += 86400000;
  assert.equal(await store.submit(request, message), true);
});

test('feedback handler validates input and reports storage failures', async () => {
  const handler = createFeedbackHandler({ store: { submit: async () => { throw Error(); } } });
  const request = { method: 'POST', headers: { host: 'example.com', origin: 'https://example.com', 'content-type': 'application/json' }, body: { category: 'Feature request', message: 'x'.repeat(501) } };
  const response = { setHeader() {}, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
  await handler(request, response); assert.equal(response.code, 400);
  request.body.message = 'A suggestion';
  await handler(request, response); assert.equal(response.code, 503);
});

test('status persists for legacy feedback and can be reopened', async () => {
  const entry = JSON.stringify({ category: 'Design suggestion', message: 'More capybaras', createdAt: '2026-01-01T00:00:00.000Z' });
  const statuses = new Map();
  const fetcher = async (_url, options) => {
    const [command, key, ...args] = JSON.parse(options.body);
    const result = command === 'LRANGE' ? [entry] : command === 'HGETALL' ? (key.endsWith(':status') ? [...statuses].flat() : []) : command === 'HSET' ? (statuses.set(args[0], args[1]), 1) : null;
    return { ok: true, json: async () => ({ result }) };
  };
  const store = createFeedbackStore({ env: { UPSTASH_REDIS_REST_URL: 'https://redis.example.com', UPSTASH_REDIS_REST_TOKEN: 'token', IMPORT_LIMIT_SECRET: 'secret' }, fetcher });
  const [original] = await store.read();
  assert.equal(original.resolved, false);
  assert.match(original.id, /^legacy-/);
  assert.equal(await store.setResolved(original.id, true), true);
  assert.equal((await store.read())[0].resolved, true);
  assert.equal(await store.setResolved(original.id, false), true);
  assert.equal((await store.read())[0].resolved, false);
  for (const status of ['archived', 'trash', 'open']) {
    assert.equal(await store.setStatus(original.id, status), true);
    const [item] = await store.read();
    assert.equal(item.status, status === 'trash' ? 'open' : status);
    assert.equal(item.resolved, false);
    assert.equal(item.message, 'More capybaras');
  }
  assert.equal(await store.setStatus('missing', 'trash'), false);
  await assert.rejects(store.setStatus(original.id, 'invalid'), /Invalid feedback status/);
  assert.equal(await store.setResolved('missing', true), false);
});

test('Redis feedback uses allowed hash commands and tolerates legacy list permission denial', async () => {
  const entries = new Map(); const statuses = new Map(); let count = 0;
  const fetcher = async (_url, options) => {
    const [command, ...args] = JSON.parse(options.body);
    if (command === 'LRANGE') return { ok: false, json: async () => ({ error: "NOPERM User has no permissions to run the 'lrange' command" }) };
    let result;
    if (command === 'EVAL') {
      if (args[1] === '3') {
        assert.match(args[0], /HDEL/);
        const payload = JSON.parse(args[5]);
        assert.deepEqual(payload.legacy, []);
        for (const id of payload.ids) { entries.delete(id); for (const field of [id, `star:${id}`, `read:${id}`]) statuses.delete(field); }
        result = 1;
      } else { assert.match(args[0], /HSET/); entries.set(args[7], args[6]); result = ++count <= 10 ? 1 : 0; }
    }
    else if (command === 'HGETALL') result = [...(args[0].endsWith(':status') ? statuses : entries)].flat();
    else if (command === 'HSET') { for (let index = 1; index < args.length; index += 2) statuses.set(args[index], args[index + 1]); result = 1; }
    else throw new Error(`Unexpected command: ${command}`);
    return { ok: true, json: async () => ({ result }) };
  };
  const env = { UPSTASH_REDIS_REST_URL: 'https://redis.example.com', UPSTASH_REDIS_REST_TOKEN: 'token', IMPORT_LIMIT_SECRET: 'secret' };
  const store = createFeedbackStore({ env, fetcher });
  assert.equal(await store.submit({ socket: { remoteAddress: '192.0.2.55' } }, { category: 'Feature request', message: 'A suggestion' }), true);
  const [item] = await store.read(); assert.equal(item.message, 'A suggestion');
  assert.equal(await store.setResolved(item.id, true), true);
  assert.equal((await store.read())[0].resolved, true);
  assert.equal(await store.updateMany([item.id], { starred: true }), true);
  assert.equal(await store.updateMany([item.id], { read: true }), true);
  assert.equal(await store.updateMany([item.id], { status: 'trash' }), true);
  const persisted = createFeedbackStore({ env, fetcher });
  let [updated] = await persisted.read();
  assert.equal(updated.starred, true); assert.equal(updated.read, true); assert.equal(updated.status, 'open');
  assert.equal(await persisted.updateMany([item.id], { status: 'open' }), true);
  [updated] = await persisted.read();
  assert.equal(updated.starred, true); assert.equal(updated.read, true); assert.equal(updated.status, 'open');
  assert.equal(await persisted.updateMany([item.id, 'missing'], { status: 'archived' }), false);
  assert.equal((await persisted.read())[0].status, 'open');
  assert.equal(await persisted.deleteMany([item.id]), true);
  assert.equal(entries.size, 0); assert.equal(statuses.size, 0);
  assert.deepEqual(await persisted.read(), []);
});

test('permanent local deletion removes message metadata without resetting the daily allowance', async () => {
  const store = createFeedbackStore({ env: { IMPORT_LIMIT_SECRET: 'delete-feedback-test', FEEDBACK_DAILY_LIMIT: '1' } });
  const request = { socket: { remoteAddress: '192.0.2.169' } };
  await store.submit(request, { category: 'Feature request', message: 'Delete this test message' });
  const item = (await store.read()).find(entry => entry.message === 'Delete this test message');
  await store.updateMany([item.id], { starred: true });
  assert.equal(await store.deleteMany([item.id]), true);
  assert.equal((await store.read()).some(entry => entry.id === item.id), false);
  assert.equal((await store.status(request)).remaining, 0);
});

test('legacy deletion preserves stable IDs and metadata for surviving messages', async () => {
  const raw = JSON.stringify({ category: 'Feature request', message: 'Legacy request', createdAt: '2026-01-01T00:00:00.000Z' });
  const entries = new Map(), statuses = new Map();
  let legacy = [raw, raw];
  const fetcher = async (_url, options) => {
    const [command, ...args] = JSON.parse(options.body);
    let result;
    if (command === 'LRANGE') result = legacy;
    else if (command === 'HGETALL') result = [...(args[0].endsWith(':status') ? statuses : entries)].flat();
    else if (command === 'HSET') { for (let index = 1; index < args.length; index += 2) statuses.set(args[index], args[index + 1]); result = 1; }
    else if (command === 'EVAL') {
      assert.match(args[0], /existing\[i\] ~= item.raw/);
      assert.match(args[0], /HDEL/);
      const payload = JSON.parse(args[5]);
      assert.equal(payload.legacy.length, 2);
      assert.deepEqual(payload.legacy.map(item => item.raw), legacy);
      for (const item of payload.legacy) if (!item.remove) entries.set(item.id, item.stored);
      legacy = [];
      for (const id of payload.ids) { entries.delete(id); for (const field of [id, `star:${id}`, `read:${id}`]) statuses.delete(field); }
      result = 1;
    } else throw Error(`Unexpected command ${command}`);
    return { ok: true, json: async () => ({ result }) };
  };
  const store = createFeedbackStore({ env: { UPSTASH_REDIS_REST_URL: 'https://redis.example.com', UPSTASH_REDIS_REST_TOKEN: 'token', IMPORT_LIMIT_SECRET: 'secret' }, fetcher });
  const [first, second] = await store.read();
  await store.updateMany([first.id, second.id], { starred: true });
  assert.equal(await store.deleteMany([first.id]), true);
  const surviving = await store.read();
  assert.equal(surviving.length, 1); assert.equal(surviving[0].id, second.id); assert.equal(surviving[0].starred, true);
  assert.equal(statuses.has(`star:${first.id}`), false); assert.equal(legacy.length, 0);
});
