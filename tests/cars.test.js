import test from 'node:test';
import assert from 'node:assert/strict';
import manifest from '../src/assets/cloudinaryManifest.js';
import { carTemplates } from '../src/assets/carTemplates.js';
import { wallpaperTemplates } from '../src/assets/templates.js';
import { galleryCategories, matchesGalleryCategory } from '../src/config/collections.js';
import { templateSchema } from '../shared/templateSchema.js';
import { withTemplateKeywords } from '../shared/templateKeywords.js';
import { searchWallpaperTemplates } from '../src/utils/wallpaperSearch.js';

test('both approved car sets are distinct mobile-only publishable catalog records', () => {
  assert.equal(carTemplates.length, 16);
  assert.equal(new Set(carTemplates.map(t => t.id)).size, 16);
  assert.equal(carTemplates.filter(t => t.family === 'original').length, 8);
  assert.equal(carTemplates.filter(t => t.family === 'reference').length, 8);
  assert.ok(galleryCategories.some(c => c.id === 'cars' && c.name === 'Cars'));
  for (const design of carTemplates) {
    assert.equal(design.mobileOnly, true);
    assert.deepEqual(Object.keys(design.deviceImages), ['mobile']);
    assert.ok(matchesGalleryCategory(design, 'cars'));
    assert.ok(!matchesGalleryCategory(design, 'anime'));
    assert.ok(wallpaperTemplates.some(t => t.id === design.id));
    templateSchema.parse({ ...withTemplateKeywords(design), status: 'published' });
    const asset = manifest[design.image];
    assert.equal(asset.width, 1080);
    assert.equal(asset.height, 2400);
    templateSchema.parse({ ...withTemplateKeywords(design), status: 'published', image: asset.url, deviceImages: { mobile: asset.url } });
  }
});

test('car keyword searches find brands, colors and the correct artwork details', () => {
  const designs = carTemplates.map(withTemplateKeywords);
  assert.equal(searchWallpaperTemplates(designs, 'automotive').length, 16);
  for (const [query, id] of [['McLaren', 'cars-carbon-shadow'], ['Ferrari', 'cars-scarlet-hibiscus'], ['Porsche', 'cars-pink-type'], ['blue wheels', 'cars-blue-type'], ['hibiscus', 'cars-blush-hibiscus'], ['typography', 'cars-champagne-type']]) {
    assert.ok(searchWallpaperTemplates(designs, query).some(t => t.id === id), query);
  }
  for (const design of designs) {
    assert.ok(design.keywords.length <= 500);
    const tags = design.keywords.toLowerCase().split(', ');
    assert.equal(new Set(tags).size, tags.length);
    if (design.family === 'reference') assert.ok(!tags.includes('flowers'));
  }
});
