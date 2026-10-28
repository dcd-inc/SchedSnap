import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { narutoTemplates } from '../src/assets/narutoTemplates.js';
import { animeTemplates } from '../src/assets/animeTemplates.js';
import { wallpaperTemplates } from '../src/assets/templates.js';
import { matchesGalleryCategory } from '../src/config/collections.js';
import { templateSchema } from '../shared/templateSchema.js';
import manifest from '../src/assets/cloudinaryManifest.js';

test('Naruto includes the four retained reference compositions and the existing Anime designs once', () => {
  const old = animeTemplates.filter(t => /\bNaruto\b/i.test(t.keywords));
  assert.equal(old.length, 5);
  assert.equal(narutoTemplates.length, 4);
  const expected = [...old, ...narutoTemplates];
  assert.deepEqual(wallpaperTemplates.filter(t => matchesGalleryCategory(t, 'naruto')).map(t => t.id).sort(), expected.map(t => t.id).sort());
  for (const template of expected) {
    assert.ok(matchesGalleryCategory(template, 'anime'));
    assert.equal(wallpaperTemplates.filter(t => t.id === template.id).length, 1);
  }
  // Remote catalog records may still use the original Anime collection.
  for (const template of old) assert.ok(matchesGalleryCategory({ id: template.id, collection: 'anime' }, 'naruto'));
  assert.equal(matchesGalleryCategory({ id: 'another-anime-design', collection: 'anime' }, 'naruto'), false);
});

test('each Naruto reference has three distinct full-resolution uploaded compositions', () => {
  const review = JSON.parse(readFileSync(new URL('../documentation/naruto/artwork-manifest.json', import.meta.url)));
  assert.equal(review.assets.length, 12);
  assert.equal(new Set(review.assets.map(a => a.sha256)).size, 12);
  for (const template of narutoTemplates.filter(t => review.assets.some(a => a.id === t.id))) {
    templateSchema.parse({ ...template, status: 'published' });
    assert.equal(template.mobileOnly, undefined);
    assert.equal(template.image, template.deviceImages.mobile);
    for (const [device, [width, height]] of Object.entries({ mobile: [1080, 2400], tablet: [1600, 2560], laptop: [1920, 1080] })) {
      const path = template.deviceImages[device];
      const asset = review.assets.find(a => a.path === `public${path}`);
      assert.ok(asset?.opaque && asset.dimensionsValid && asset.visuallyReviewed, path);
      assert.deepEqual([manifest[path]?.width, manifest[path]?.height], [width, height]);
      assert.equal(manifest[path].publicId, `schedsnap${path.slice(0, -4)}-${asset.sha256.slice(0, 16)}`);
      assert.ok(device === 'laptop' ? asset.inkBounds.x >= 0.70 : asset.inkBounds.y >= 0.77, `${template.id}/${device}: clear timetable area`);
    }
  }
});

test('browser Canvas previews retain sample and dense meetings without artwork overlap', () => {
  const review = JSON.parse(readFileSync(new URL('../documentation/naruto/schedule-review.json', import.meta.url)));
  assert.equal(review.length, 24);
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
