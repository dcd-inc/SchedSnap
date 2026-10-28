import test from 'node:test';
import assert from 'node:assert/strict';
import { feedbackPageOptions, paginateFeedback } from '../server/feedbackPagination.js';

const entries = Array.from({ length: 45 }, (_, index) => ({ id: String(99 - index), createdAt: new Date(Date.UTC(2026, 9, 28, 12, 0, -index)).toISOString(), status: index === 44 ? 'archived' : 'open', starred: index % 2 === 0, category: 'Feature request', message: `Suggestion ${index}` }));
test('feedback pages are bounded, stable across new arrivals, filtered, and count folders', () => {
  const options = feedbackPageOptions(new URLSearchParams('limit=20'));
  const first = paginateFeedback(entries, options);
  assert.equal(first.feedback.length, 20); assert.equal(first.counts.open, 44); assert.equal(first.counts.starred, 23);
  assert.ok(first.nextCursor);
  const secondOptions = feedbackPageOptions(new URLSearchParams({ limit: '20', cursor: first.nextCursor }));
  const second = paginateFeedback([{ ...entries[0], id: 'new', createdAt: '2026-10-29T00:00:00.000Z' }, ...entries], secondOptions);
  assert.equal(second.feedback.length, 20);
  assert.equal(second.feedback[0].id, entries[20].id);
  assert.ok(second.feedback.every(item => !first.feedback.some(previous => previous.id === item.id)));
  const last = paginateFeedback(entries, feedbackPageOptions(new URLSearchParams({ limit: '20', cursor: second.nextCursor })));
  assert.equal(last.feedback.length, 4); assert.equal(last.nextCursor, null);
  const starred = paginateFeedback(entries, feedbackPageOptions(new URLSearchParams('limit=50&folder=starred')));
  assert.equal(starred.feedback.length, 23); assert.ok(starred.feedback.every(item => item.starred));
  assert.equal(paginateFeedback(entries, feedbackPageOptions(new URLSearchParams('limit=20&q=Suggestion+43'))).feedback.length, 1);
  for (const params of ['limit=999', 'limit=0', 'limit=1.5', 'folder=invalid', 'category=invalid', 'cursor=invalid']) assert.throws(() => feedbackPageOptions(new URLSearchParams(params)));
});
