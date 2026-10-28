import test from 'node:test';
import assert from 'node:assert/strict';
import { createFeedbackMutations } from '../src/lib/feedbackMutations.js';

test('feedback clicks publish immediately and repeated toggles save in order', async () => {
  const item = { id: 'one', status: 'open', starred: false, read: false };
  const requests = [], pending = [], errors = [];
  const queue = createFeedbackMutations({ request: async (_action, body) => { requests.push(body); await new Promise(resolve => pending.push(resolve)); }, publish: (_old, next) => Object.assign(item, next), onError: error => errors.push(error) });
  queue.change([item], { starred: true });
  assert.equal(item.starred, true); assert.equal(requests.length, 0);
  queue.change([item], { starred: false });
  assert.equal(item.starred, false);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requests.length, 1); pending.shift()();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requests.length, 2); assert.equal(requests[1].starred, false); pending.shift()();
  await queue.idle(); assert.equal(item.starred, false); assert.deepEqual(errors, []);
});

test('failed saves restore the last confirmed field without undoing newer changes', async () => {
  const item = { id: 'one', status: 'open', starred: false, read: false };
  const errors = [];
  let attempts = 0;
  const queue = createFeedbackMutations({ request: async () => { if (++attempts === 2) throw Error('offline'); }, publish: (_old, next) => Object.assign(item, next), onError: error => errors.push(error) });
  await queue.change([item], { starred: true });
  queue.change([item], { starred: false });
  queue.change([item], { status: 'archived' });
  assert.equal(item.starred, false); assert.equal(item.status, 'archived');
  await queue.idle();
  assert.equal(item.starred, true); assert.equal(item.status, 'archived'); assert.equal(errors.length, 1);
});

test('a failed permanent deletion restores the message immediately', async () => {
  const item = { id: 'one', status: 'open', starred: true, read: true };
  const errors = [];
  const queue = createFeedbackMutations({ request: async () => { throw Error('offline'); }, publish: (_old, next) => Object.assign(item, next), onError: error => errors.push(error) });
  const saving = queue.change([item], { deleted: true });
  assert.equal(item.deleted, true);
  await saving;
  assert.equal(item.deleted, undefined); assert.equal(item.starred, true); assert.equal(item.read, true); assert.equal(errors.length, 1);
});
