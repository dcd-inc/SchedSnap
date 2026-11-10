import test from 'node:test';
import assert from 'node:assert/strict';
import { createKeepAliveHandler } from '../api/keep-alive.js';

const env = { CRON_SECRET: 'test-secret-that-is-at-least-32-characters', SUPABASE_DB_URL: 'private-db-url' };
async function call(handler, { method = 'GET', token = `Bearer ${env.CRON_SECRET}` } = {}) {
  const response = {
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
  await handler({ method, headers: { authorization: token } }, response);
  assert.equal(response.headers['Cache-Control'], 'no-store');
  return response;
}

test('rejects unsupported methods, missing configuration, and invalid secrets before connecting', async () => {
  const connect = () => assert.fail('Must not connect');
  const handler = createKeepAliveHandler({ env, connect });
  const method = await call(handler, { method: 'POST' });
  assert.equal(method.statusCode, 405);
  assert.equal(method.headers.Allow, 'GET');
  for (const token of ['', 'Bearer wrong', `Bearer ${'x'.repeat(env.CRON_SECRET.length)}`]) {
    assert.equal((await call(handler, { token })).statusCode, 401);
  }
  for (const settings of [{}, { ...env, CRON_SECRET: 'short' }, { ...env, SUPABASE_DB_URL: '' }]) {
    assert.equal((await call(createKeepAliveHandler({ env: settings, connect }))).statusCode, 503);
  }
});

test('queries the database on every authorized call and closes the connection without returning rows', async () => {
  let queries = 0;
  let closed = 0;
  const sql = async strings => {
    assert.equal(strings.join(''), 'select 1 from schedsnap_creator.submissions limit 1');
    queries++;
    return [{ private: 'must not be exposed' }];
  };
  sql.end = async options => { assert.equal(options.timeout, 1); closed++; };
  const handler = createKeepAliveHandler({ env, connect: settings => { assert.equal(settings, env); return sql; } });
  for (let i = 0; i < 2; i++) {
    const response = await call(handler);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, { ok: true });
  }
  assert.equal(queries, 2);
  assert.equal(closed, 2);
});

test('database failures return a generic failure and still close the connection', async () => {
  let closed = false;
  const sql = async () => { throw new Error('private database credentials'); };
  sql.end = async () => { closed = true; };
  for (const connect of [() => sql, () => { throw new Error('private connection details'); }]) {
    const response = await call(createKeepAliveHandler({ env, connect }));
    assert.equal(response.statusCode, 503);
    assert.deepEqual(response.body, { error: 'Database check failed.' });
  }
  assert.equal(closed, true);
});
