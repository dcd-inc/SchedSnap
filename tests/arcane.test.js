import test from 'node:test';
import assert from 'node:assert/strict';
import { arcaneTemplates } from '../src/assets/arcaneTemplates.js';
import manifest from '../src/assets/cloudinaryManifest.js';
import { templateSchema } from '../shared/templateSchema.js';
import { withTemplateKeywords } from '../shared/templateKeywords.js';
import { searchWallpaperTemplates } from '../src/utils/wallpaperSearch.js';

test('only the twelve approved Arcane wallpapers publish with uploaded mobile art', () => {
  assert.equal(arcaneTemplates.length, 12);
  for (const design of arcaneTemplates) {
    assert.doesNotMatch(design.id, /torn-newsprint|sepia-panels|contour-cast/);
    const asset = manifest[design.image];
    assert.equal(asset.width, 1080);
    assert.equal(asset.height, 2400);
    assert.equal(design.mobileOnly, true);
    templateSchema.parse(withTemplateKeywords({ ...design, status: 'published', image: asset.url, deviceImages: { mobile: asset.url } }));
  }
});

test('Arcane search finds the collection, specific characters, and artwork styles', () => {
  const designs = arcaneTemplates.map(withTemplateKeywords);
  assert.equal(searchWallpaperTemplates(designs, 'League of Legends').length, 12);
  assert.deepEqual(searchWallpaperTemplates(designs, 'Caitlyn Kiramman').map(t => t.id), ['arcane-caitlyn-rose-newsprint']);
  assert.deepEqual(searchWallpaperTemplates(designs, 'Firelights').map(t => t.id), ['arcane-ekko-mint-newsprint']);
  assert.equal(searchWallpaperTemplates(designs, 'newsprint').length, 4);
});
