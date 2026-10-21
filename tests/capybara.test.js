import test from 'node:test';
import assert from 'node:assert/strict';
import { capybaraTemplates } from '../src/assets/capybaraTemplates.js';
import { wallpaperTemplates } from '../src/assets/templates.js';
import manifest from '../src/assets/cloudinaryManifest.js';
import { templateSchema } from '../shared/templateSchema.js';
import { matchesGalleryCategory } from '../src/config/collections.js';
import { searchWallpaperTemplates } from '../src/utils/wallpaperSearch.js';




test('27 approved Capybara mobile designs are published-ready and discoverable', () => {
  assert.equal(capybaraTemplates.length, 27);
  for (const template of capybaraTemplates) {
    assert.equal(wallpaperTemplates.filter(t => t.id === template.id).length, 1);
    assert.equal(templateSchema.parse({ ...template, status: 'published' }).mobileOnly, true);
    assert.deepEqual(Object.keys(template.deviceImages), ['mobile']);
    assert.ok(matchesGalleryCategory(template, 'capybara'));
    assert.ok(template.keywords.length <= 500);
    const asset = manifest[template.image];
    assert.ok(asset?.url);
    assert.equal(asset.width, 1080);
    assert.equal(asset.height, 2400);
  }
  assert.equal(searchWallpaperTemplates(capybaraTemplates, 'capybara').length, 27);
  assert.ok(searchWallpaperTemplates(capybaraTemplates, 'strawberry').some(t => t.id === 'capybara-strawberry-hood'));
  assert.ok(searchWallpaperTemplates(capybaraTemplates, 'daisy').some(t => t.id === 'capybara-daisy-yellow'));
});
