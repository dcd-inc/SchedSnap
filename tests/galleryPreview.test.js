import test from 'node:test';
import assert from 'node:assert/strict';
import { deviceResolutions, templateSchedule, wallpaperTemplates } from '../src/assets/templates.js';
import { drawWallpaper } from '../src/utils/canvasHelpers.js';
import { customizeWallpaperTemplate, galleryPreviewTemplate } from '../src/utils/wallpaperTheme.js';

function render(template, resolution) {
  const ctx = new Proxy({ measureText(text) { return { width: text.length * 20 }; },
    createLinearGradient() { return { addColorStop() {} }; } }, {
    get(target, key) { return key in target ? target[key] : ['canvas', 'getTransform'].includes(key) ? undefined : () => {}; },
  });
  return drawWallpaper({ getContext: () => ctx }, { schedule: templateSchedule, template, resolution });
}



test('portrait tablet samples align while explicit user placement remains available', () => {
  const original = wallpaperTemplates.find(template => template.collection === 'chiikawa');
  const originalCopy = structuredClone(original);
  const expected = render(customizeWallpaperTemplate(galleryPreviewTemplate(original), {}, 'tablet'), deviceResolutions.tablet).scheduleBounds;
  for (const template of wallpaperTemplates.filter(template => template.collection === 'chiikawa')) {
    const result = render(customizeWallpaperTemplate(galleryPreviewTemplate(template), {}, 'tablet'), deviceResolutions.tablet);
    assert.equal(result.overflow, false, template.id);
    assert.equal(result.scheduleBounds.y, expected.y, template.id);
    assert.ok(Math.abs(result.scheduleBounds.x + result.scheduleBounds.width / 2 - 960) < 0.001, template.id);
  }
  const moved = customizeWallpaperTemplate(galleryPreviewTemplate(original), { verticalPosition: 50 }, 'mobile');
  assert.notDeepEqual(render(moved, deviceResolutions.mobile).scheduleBounds, render(galleryPreviewTemplate(original), deviceResolutions.mobile).scheduleBounds);
  assert.deepEqual(original, originalCopy);
});
