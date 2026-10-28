import test from 'node:test';
import assert from 'node:assert/strict';
import { feedbackTime } from '../src/utils/feedbackTime.js';

test('feedback list shows elapsed time with stable boundary labels', () => {
  const now = Date.UTC(2026, 9, 28, 12);
  const ago = milliseconds => new Date(now - milliseconds).toISOString();
  assert.equal(feedbackTime(ago(59999), now), 'Just now');
  assert.equal(feedbackTime(ago(60000), now), '1 minute ago');
  assert.equal(feedbackTime(ago(120000), now), '2 minutes ago');
  assert.equal(feedbackTime(ago(7200000), now), '2 hours ago');
  assert.equal(feedbackTime(ago(86400000), now), 'yesterday');
  assert.equal(feedbackTime(ago(172800000), now), '2 days ago');
  assert.equal(feedbackTime(ago(-1000), now), 'Just now');
  assert.equal(feedbackTime('invalid', now), 'Unknown date');
});
