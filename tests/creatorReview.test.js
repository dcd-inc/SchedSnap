import assert from 'node:assert/strict';
import test from 'node:test';
import { createCreatorReview } from '../server/creatorReview.js';
import { visibleTemplateDevices } from '../shared/templateVisibility.js';

const id = '6db812a3-eabe-4b7f-b9b9-f19e73587e09';
const revision = '8902a93a-6d29-4bca-8921-66ce071b6e47';
const env = { CLOUDINARY_CLOUD_NAME: 'test', CLOUDINARY_API_KEY: 'test', CLOUDINARY_API_SECRET: 'test' };
const asset = `schedsnap/admin/artwork/${id}`;
const expectedId = `community-${id}`;

test('review search filters pending titles and artists before applying pagination', async () => {
  let called = false;
  const db = async (parts, ...values) => {
    called = true;
    const query = parts.join('?');
    assert.match(query, /status in \('in_review', 'publishing'\)/);
    assert.match(query, /strpos\(lower\(title\).*strpos\(lower\(artist\).*order by.*limit/s);
    assert.deepEqual(values, ['Fern%_&', 'Fern%_&', 'tablet', 25, 24]);
    return [{ id, title: 'Fern%_&', artist: 'Studio Fern', status: 'in_review', artwork_id: id, revision, device: 'tablet' }];
  };
  const review = createCreatorReview({ env, db });
  const reply = {};
  await review.list({ url: '/api/admin?action=creator-submissions&device=tablet&page=2&query=%20Fern%25_%26%20' }, {
    status(code) { reply.status = code; return this; },
    json(data) { reply.data = data; },
  });
  assert.equal(called, true);
  assert.equal(reply.status, 200);
  assert.equal(reply.data.submissions[0].id, id);
  assert.equal(reply.data.submissions[0].device, 'tablet');
  assert.equal(reply.data.hasMore, false);
});

function fixture({ templates = [], failWrite = false, device } = {}) {
  let status = 'in_review';
  const calls = [];
  const db = async (parts, ...values) => {
    const sql = parts.join('?');
    if (sql.includes('pg_advisory_xact_lock')) return [];
    if (sql.includes("set status = 'publishing'")) {
      assert.deepEqual(values, [id, revision]);
      status = 'publishing';
      return [{ id, title: 'Fern at dusk', artist: 'Studio Fern', artwork_id: id, ai_generated: true, device }];
    }
    if (sql.includes("set status = 'published'")) {
      assert.equal(status, 'publishing');
      status = 'published';
      return [{ id }];
    }
    if (sql.includes("status = 'in_review' returning id")) {
      assert.deepEqual(values.slice(0, 2), ['needs_changes', 'Shift the art lower']);
      status = 'needs_changes';
      return [{ id }];
    }
    throw new Error('Unexpected SQL');
  };
  db.begin = fn => fn(db);
  const store = {
    async read() { return { revision: 'seed', templates }; },
    async write(next) {
      if (failWrite) throw new Error('Temporary catalog error');
      templates = next.templates;
    },
  };
  const fetcher = async (url, options) => {
    calls.push(url);
    if (url.includes('/download?')) return new Response('art', { headers: { 'content-type': 'image/jpeg' } });
    assert.equal(options.body.get('public_id'), asset);
    return Response.json({ public_id: asset, type: 'upload', format: 'jpg' });
  };
  const review = createCreatorReview({ env, db, store, fetcher });
  return {
    state: () => ({ status, templates, calls }),
    async decide(decision, note) {
      const reply = {};
      await review.decide({ body: { id, revision, decision, ...(note && { note }) } }, {
        status(code) { reply.status = code; return this; },
        json(json) { reply.json = json; },
      });
      return reply;
    },
  };
}

test('approval publishes a mobile-only catalog design credited to the creator', async () => {
  const review = fixture();
  assert.equal((await review.decide('approve')).status, 200);
  const { status, templates, calls } = review.state();
  assert.equal(status, 'published');
  assert.equal(templates[0].id, expectedId);
  assert.equal(templates[0].artistCredit, 'Studio Fern');
  assert.equal(templates[0].mobileOnly, true);
  assert.equal(templates[0].aiGenerated, true);
  assert.match(templates[0].image, /\/image\/upload\//);
  assert.equal(calls.length, 2);
});

test('tablet and laptop approvals publish only the submitted device variant', async () => {
  for (const device of ['tablet', 'laptop']) {
    const review = fixture({ device });
    assert.equal((await review.decide('approve')).status, 200);
    const [template] = review.state().templates;
    assert.deepEqual(visibleTemplateDevices(template), [device]);
    assert.deepEqual(template.deviceImages, { [device]: template.image });
  }
});

test('approval retries use the existing catalog record and a failed write stays retryable', async () => {
  const interrupted = fixture({ failWrite: true });
  assert.equal((await interrupted.decide('approve')).status, 503);
  assert.equal(interrupted.state().status, 'publishing');
  const existing = fixture({ templates: [{ id: expectedId }] });
  assert.equal((await existing.decide('approve')).status, 200);
  assert.equal(existing.state().calls.length, 0);
});

test('requesting changes requires a note and leaves the artwork private', async () => {
  const review = fixture();
  assert.equal((await review.decide('needs_changes')).status, 400);
  assert.equal((await review.decide('needs_changes', 'Shift the art lower')).status, 200);
  assert.deepEqual(review.state(), { status: 'needs_changes', templates: [], calls: [] });
});
