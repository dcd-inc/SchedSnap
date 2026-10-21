import test from 'node:test';
import assert from 'node:assert/strict';
import { snoopyTemplates } from '../src/assets/snoopyTemplates.js';
import { matchesGalleryCategory } from '../src/config/collections.js';
import { searchWallpaperTemplates } from '../src/utils/wallpaperSearch.js';
import { templateSchema } from '../shared/templateSchema.js';




test('Snoopy designs publish in their own category and are found through Peanuts and Woodstock', () => {
  assert.equal(snoopyTemplates.length, 9);
  for (const template of snoopyTemplates) {
    const parsed = templateSchema.parse({ ...template, status: 'published' });
    assert.equal(matchesGalleryCategory(parsed, 'snoopy'), true);
    assert.equal(matchesGalleryCategory(parsed, 'sanrio'), false);
  }
  for (const query of ['Snoopy', 'Peanuts', 'Woodstock']) {
    assert.deepEqual(new Set(searchWallpaperTemplates(snoopyTemplates, query)), new Set(snoopyTemplates));
  }
});
