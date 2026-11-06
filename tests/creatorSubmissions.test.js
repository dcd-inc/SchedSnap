import assert from 'node:assert/strict';
import test from 'node:test';
import { createCreatorSubmissionsHandler } from '../api/creator-submissions.js';

const owner = '87cd4e94-6bb8-4a86-9ba7-14d117e079f4';
const item = '6db812a3-eabe-4b7f-b9b9-f19e73587e09';
const revision = '8902a93a-6d29-4bca-8921-66ce071b6e47';
const env = {
  VITE_SUPABASE_URL: 'https://test.supabase.co',
  VITE_SUPABASE_PUBLISHABLE_KEY: 'test-key',
  CLOUDINARY_CLOUD_NAME: 'test',
  CLOUDINARY_API_KEY: 'test',
  CLOUDINARY_API_SECRET: 'test',
};
const user = { id: owner, email: 'private@example.test', email_confirmed_at: '2026-11-06', app_metadata: { provider: 'google' } };

function fixture({ row, creatorName = 'Studio Fern', account = user } = {}) {
  const queries = [];
  const db = async (parts, ...values) => {
    const query = parts.join('?');
    queries.push({ query, values });
    if (query.includes('select creator_name')) return [{ creator_name: creatorName }];
    if (query.includes('for update')) return row ? [row] : [];
    return [];
  };
  db.begin = callback => callback(db);
  const fetcher = async url => {
    assert.equal(String(url), 'https://test.supabase.co/auth/v1/user');
    return Response.json(account);
  };
  const handler = createCreatorSubmissionsHandler({ env, db, fetcher });
  return {
    queries,
    async request(body, authorization = 'Bearer test.token') {
      const output = { headers: {} };
      await handler({ method: body ? 'POST' : 'GET', body, headers: { authorization } }, {
        setHeader(name, value) { output.headers[name] = value; },
        status(code) { output.status = code; return this; },
        json(json) { output.json = json; },
      });
      return output;
    },
  };
}

test('creator endpoints require a Google session', async () => {
  const guest = fixture();
  const reply = await guest.request(undefined, '');
  assert.equal(reply.status, 401);
  assert.equal(reply.headers['Cache-Control'], 'private, no-store');
  const passwordUser = fixture({ account: { ...user, app_metadata: { provider: 'email' } } });
  assert.equal((await passwordUser.request()).status, 403);
  assert.equal(passwordUser.queries.length, 0);
});

test('profile returns the creator name and avatar without the verified email', async () => {
  const api = fixture();
  const reply = await api.request({ action: 'profile', creatorName: '  Studio Fern  ' });
  assert.deepEqual(reply.json, { creatorName: 'Studio Fern', avatar: null });
  assert.equal(api.queries[0].values[1], user.email);
  assert.deepEqual(api.queries[1].values, ['Studio Fern', false, null, owner]);
});

test('profile avatar changes accept presets and reject remote URLs', async () => {
  const api = fixture();
  assert.equal((await api.request({ action: 'profile', avatar: 'cat' })).status, 200);
  assert.deepEqual(api.queries[1].values, [null, true, 'cat', owner]);
  assert.equal((await api.request({ action: 'profile', avatar: 'https://example.test/photo' })).status, 400);
});

test('profile avatars accept a small uploaded photo and reject oversized ones', async () => {
  const api = fixture();
  const photo = `data:image/jpeg;base64,${Buffer.from([255, 216, 255, 0]).toString('base64')}`;
  assert.equal((await api.request({ action: 'profile', avatar: photo })).status, 200);
  assert.deepEqual(api.queries[1].values, [null, true, photo, owner]);
  const oversized = Buffer.alloc(200 * 1024 + 1);
  oversized.set([255, 216, 255]);
  assert.equal((await api.request({ action: 'profile', avatar: `data:image/jpeg;base64,${oversized.toString('base64')}` })).status, 400);
});

test('submission writes require a creator profile and reject injected artist or review status', async () => {
  const api = fixture({ creatorName: null });
  const body = { action: 'update', id: item, revision, title: 'Test', rights: true, aiGenerated: false };
  assert.equal((await api.request(body)).status, 409);
  assert.equal((await api.request({ ...body, aiGenerated: undefined })).status, 400);
  assert.equal((await api.request({ ...body, artist: 'Someone else' })).status, 400);
  assert.equal((await api.request({ ...body, status: 'published' })).status, 400);
});

test('edits and deletes are owner scoped and reject stale or published records', async () => {
  const body = { action: 'delete', id: item, revision };
  const missing = fixture();
  assert.equal((await missing.request(body)).status, 404);
  assert.deepEqual(missing.queries.find(({ query }) => query.includes('for update')).values, [item, owner]);
  assert.equal((await fixture({ row: { revision: item, status: 'in_review' } }).request(body)).status, 409);
  assert.equal((await fixture({ row: { revision, status: 'published' } }).request(body)).status, 409);
});
