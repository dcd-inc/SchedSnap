import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { snoopyReferenceTemplates } from '../src/assets/snoopyReferenceTemplates.js';
import { snoopyTemplates } from '../src/assets/snoopyTemplates.js';
import { matchesGalleryCategory } from '../src/config/collections.js';
import { templateSchema } from '../shared/templateSchema.js';
import manifest from '../src/assets/cloudinaryManifest.js';

test('all three references appear once in Snoopy with separate device artwork', () => {
  assert.equal(snoopyReferenceTemplates.length, 3);
  const review = JSON.parse(readFileSync(new URL('../documentation/snoopy-references/artwork-manifest.json', import.meta.url)));
  assert.equal(review.assets.length, 9);
  assert.equal(new Set(review.assets.map(a => a.sha256)).size, 9);
  for (const template of snoopyReferenceTemplates) {
    templateSchema.parse({ ...template, status: 'published' });
    assert.ok(matchesGalleryCategory(template, 'snoopy'));
    assert.equal(snoopyTemplates.filter(t => t.id === template.id).length, 1);
    assert.equal(template.image, template.deviceImages.mobile);
    for (const [device, size] of Object.entries({ mobile: [1080, 2400], tablet: [1600, 2560], laptop: [1920, 1080] })) {
      const path = template.deviceImages[device];
      const asset = review.assets.find(a => a.path === `public${path}`);
      assert.ok(asset?.opaque && asset.dimensionsValid && asset.visuallyReviewed, path);
      assert.deepEqual([manifest[path]?.width, manifest[path]?.height], size);
      assert.equal(manifest[path].publicId, `schedsnap${path.slice(0, -4)}-${asset.sha256.slice(0, 16)}`);
    }
  }
});

test('browser Canvas checks keep sample and dense schedules clear of all nine drawings', () => {
  const review = JSON.parse(readFileSync(new URL('../documentation/snoopy-references/schedule-review.json', import.meta.url)));
  assert.equal(review.length, 18);
  for (const item of review) {
    assert.equal(item.overflow, false, `${item.id}/${item.device}/${item.schedule}`);
    assert.equal(item.meetings, item.schedule === 'dense' ? 15 : 5);
    const b = item.scheduleBounds;
    assert.ok(item.device === 'laptop'
      ? (b.x + b.width) / item.coordinateWidth < item.inkBounds.x
      : (b.y + b.height) / item.coordinateHeight < item.inkBounds.y,
    `${item.id}/${item.device}/${item.schedule}: artwork stays clear`);
  }
});
