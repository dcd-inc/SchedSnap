import test from 'node:test';
import assert from 'node:assert/strict';
import { capybaraTemplates } from '../src/assets/capybaraTemplates.js';
import { wallpaperTemplates } from '../src/assets/templates.js';
import manifest from '../src/assets/cloudinaryManifest.js';
import { templateSchema } from '../shared/templateSchema.js';
import { matchesGalleryCategory } from '../src/config/collections.js';
import { searchWallpaperTemplates } from '../src/utils/wallpaperSearch.js';
import { drawWallpaper } from '../src/utils/canvasHelpers.js';
import { galleryPreviewTemplate, customizeWallpaperTemplate } from '../src/utils/wallpaperTheme.js';
import { templateSchedule, deviceResolutions } from '../src/assets/templates.js';

test('five approved Capybara mobile designs are published-ready and discoverable', () => {
  assert.equal(capybaraTemplates.length, 5);
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
  assert.equal(searchWallpaperTemplates(capybaraTemplates, 'capybara').length, 5);
  assert.ok(searchWallpaperTemplates(capybaraTemplates, 'strawberry').some(t => t.id === 'capybara-strawberry-hood'));
  assert.ok(searchWallpaperTemplates(capybaraTemplates, 'daisy').some(t => t.id === 'capybara-daisy-yellow'));
});

test('Capybara previews match exports and retain all meetings in dense schedules', () => {
  const dense = { classes: Array.from({ length: 3 }, (_, i) => ({
    courseCode: `CS ${101 + i}`, subject: 'Computer Science',
    meetings: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => ({ day, startTime: `${8 + i * 3}:00`, endTime: `${9 + i * 3}:30`, room: 'Room 101' })),
  })) };
  const ctx = new Proxy({ font: '', measureText(text) { return { width: text.length * Number(this.font.match(/([\d.]+)px/)?.[1] || 36) * 0.52 }; } }, {
    get: (target, key) => key in target ? target[key] : ['canvas', 'getTransform'].includes(key) ? undefined : () => {},
  });
  for (const item of capybaraTemplates) for (const schedule of [templateSchedule, dense]) {
    const template = customizeWallpaperTemplate(item, {}, 'mobile');
    const render = preset => drawWallpaper({ getContext: () => ctx }, { schedule, template: preset, resolution: deviceResolutions.mobile });
    const result = render(template);
    if (schedule === templateSchedule) assert.equal(result.overflow, false, item.id);
    assert.equal(result.plans.flatMap(p => p.entries).length, schedule === dense ? 15 : 5);
    if (schedule === templateSchedule) assert.ok(result.scheduleBounds.y + result.scheduleBounds.height <= 2400 * 0.64, item.id);
    assert.deepEqual(render(customizeWallpaperTemplate(galleryPreviewTemplate(item), {}, 'mobile')).scheduleBounds, result.scheduleBounds);
  }
});
