import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { collageTemplates } from '../src/assets/collageTemplates.js';
import manifest from '../src/assets/cloudinaryManifest.js';
import { templateSchema } from '../shared/templateSchema.js';
import { withTemplateKeywords } from '../shared/templateKeywords.js';
import { searchWallpaperTemplates } from '../src/utils/wallpaperSearch.js';
import { matchesGalleryCategory } from '../src/config/collections.js';

test('Collage publishes thirty unique mobile-only backgrounds with validated uploads', () => {
  assert.equal(collageTemplates.length, 30);
  assert.equal(new Set(collageTemplates.map(t => t.id)).size, 30);
  for (const design of collageTemplates) {
    const asset = manifest[design.image];
    assert.equal(asset?.width, 1080, design.id);
    assert.equal(asset?.height, 2400, design.id);
    assert.equal(design.mobileOnly, true);
    assert.deepEqual(Object.keys(design.deviceImages), ['mobile']);
    const png = readFileSync(new URL(`../public${design.image}`, import.meta.url));
    assert.equal(png.readUInt32BE(16), 1080);
    assert.equal(png.readUInt32BE(20), 2400);
    assert.ok(matchesGalleryCategory(design, 'collage'));
    templateSchema.parse(withTemplateKeywords({ ...design, status: 'published', image: asset.url, deviceImages: { mobile: asset.url } }));
  }
});

test('Collage keywords find the collection and individual subjects', () => {
  const designs = collageTemplates.map(withTemplateKeywords);
  assert.equal(searchWallpaperTemplates(designs, 'collage').length, 30);
  assert.equal(searchWallpaperTemplates(designs, 'scrapbook').length, 30);
  for (const [query, id] of [['Arctic Monkeys', 'crimson-indie-rock'], ['Saturn', 'celestial-art-journal'], ['My Chemical Romance', 'gothic-guitarist'], ['Harley Davidson', 'rock-and-roll-archive']]) {
    assert.deepEqual(searchWallpaperTemplates(designs, query).map(t => t.id), [`collage-${id}`]);
  }
});
