import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { narutoExtraTemplates } from '../src/assets/narutoExtraTemplates.js';
import { narutoTemplates } from '../src/assets/narutoTemplates.js';
import { matchesGalleryCategory } from '../src/config/collections.js';
import { templateSchema } from '../shared/templateSchema.js';
import manifest from '../src/assets/cloudinaryManifest.js';
import { schedulePosition } from '../src/utils/canvasHelpers.js';

test('all five references appear once in Naruto with separate device artwork', () => {
  assert.equal(narutoExtraTemplates.length, 5);
  const review = JSON.parse(readFileSync(new URL('../documentation/naruto-extra/artwork-manifest.json', import.meta.url)));
  assert.equal(review.assets.length, 15);
  assert.equal(new Set(review.assets.map(a => a.sha256)).size, 15);
  for (const template of narutoExtraTemplates) {
    templateSchema.parse({ ...template, status: 'published' });
    assert.ok(matchesGalleryCategory(template, 'naruto'));
    assert.equal(narutoTemplates.filter(t => t.id === template.id).length, 1);
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

test('Naruto uses the left edge and the other revisions meet the right and bottom edges', () => {
  const review = JSON.parse(readFileSync(new URL('../documentation/naruto-extra/artwork-manifest.json', import.meta.url)));
  for (const template of narutoExtraTemplates) {
    const left = template.id === 'naruto-resolute-ink';
    assert.equal(schedulePosition({ ...template, device: 'laptop' }), left ? 'right' : 'left');
    for (const asset of review.assets.filter(a => a.id === template.id)) {
      assert.ok(asset.inkBounds.bottom >= 0.98, `${asset.id}/${asset.device}: bottom edge`);
      assert.ok(left ? asset.inkBounds.x <= 0.02 : asset.inkBounds.right >= 0.98,
        `${asset.id}/${asset.device}: side edge`);
    }
  }
});

test('browser Canvas checks keep sample and dense schedules clear of all fifteen drawings', () => {
  const review = JSON.parse(readFileSync(new URL('../documentation/naruto-extra/schedule-review.json', import.meta.url)));
  assert.equal(review.length, 30);
  for (const item of review) {
    assert.equal(item.overflow, false, `${item.id}/${item.device}/${item.schedule}`);
    assert.equal(item.meetings, item.schedule === 'dense' ? 15 : 5);
    const b = item.scheduleBounds;
    assert.ok((b.x + b.width) / item.coordinateWidth < item.inkBounds.x
      || b.x / item.coordinateWidth > item.inkBounds.right
      || (b.y + b.height) / item.coordinateHeight < item.inkBounds.y
      || b.y / item.coordinateHeight > item.inkBounds.bottom,
    `${item.id}/${item.device}/${item.schedule}: artwork stays clear`);
  }
});
