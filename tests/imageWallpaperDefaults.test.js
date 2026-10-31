import test from 'node:test';
import assert from 'node:assert/strict';
import { wallpaperTemplates, deviceResolutions, templateSchedule } from '../src/assets/templates.js';
import { drawWallpaper } from '../src/utils/canvasHelpers.js';
import { supportsTemplateDevice } from '../src/utils/templateDevices.js';
import { customizeWallpaperTemplate, galleryPreviewTemplate, wallpaperCornerRadius } from '../src/utils/wallpaperTheme.js';

function render(template, resolution) {
  const text = [], rectangles = [];
  const context = new Proxy({
    font: '',
    measureText(value) { return { width: value.length * Number(this.font.match(/([\d.]+)px/)?.[1] || 36) * 0.52 }; },
    fillText(value) { text.push(value); },
    roundRect(x, y, width, height, radius) { rectangles.push({ x, y, width, height, radius }); },
    createLinearGradient() { return { addColorStop() {} }; },
  }, { get: (target, key) => key in target ? target[key] : ['canvas', 'getTransform'].includes(key) ? undefined : () => {} });
  const layout = drawWallpaper({ getContext: () => context }, { schedule: templateSchedule, template, resolution });
  return { ...layout, text, rectangles };
}

test('every catalog image renders titled pill rows on each supported device', () => {
  const designs = wallpaperTemplates.filter(template => template.image);
  assert.ok(designs.length > 0, 'audit the full illustrated catalog');
  for (const original of designs) {
    const snapshot = structuredClone(original);
    for (const [device, resolution] of Object.entries(deviceResolutions)) {
      if (!supportsTemplateDevice(original, device)) continue;
      const template = customizeWallpaperTemplate(galleryPreviewTemplate(original), { scheduleLayout: 'stacked' }, device);
      const label = `${original.id} / ${device}`;
      assert.equal(wallpaperCornerRadius(template), 50, label);
      for (const key of ['image', 'deviceImages', 'background', 'ink', 'muted', 'surface', 'line']) assert.deepEqual(template[key], original[key], `${label} keeps ${key}`);
      const result = render(template, resolution);
      assert.equal(result.overflow, false, label);
      assert.equal(result.text.filter(value => value === 'Class Schedule').length, 1, label);
      assert.equal(result.plans.length, 5, label);
      assert.equal(result.plans.reduce((sum, day) => sum + day.entries.length, 0), 5, label);
      for (const plan of result.plans) {
        assert.ok(result.rectangles.some(box => box.x === plan.x && box.y === plan.y && box.width === plan.width && box.height === plan.height && box.radius === Math.min(plan.width, plan.height) / 2), `${label} draws a pill for ${plan.day}`);
      }
    }
    assert.deepEqual(original, snapshot, `${original.id} source stays unchanged`);
  }
});

test('older catalog shapes and hidden titles upgrade, while explicit appearance choices still win', () => {
  const original = { ...wallpaperTemplates.find(template => template.image), containerShape: 'rounded', containerRadius: 10, showTitle: false, showScheduleTitle: false };
  for (const device of Object.keys(deviceResolutions)) {
    const defaults = customizeWallpaperTemplate(original, {}, device);
    assert.equal(defaults.containerRadius, 50);
    assert.equal(defaults.showTitle, true);
    assert.equal(defaults.showScheduleTitle, true);
    const settings = { containerShape: 'rounded', containerRadius: 8, showTitle: false, showScheduleTitle: false };
    const custom = customizeWallpaperTemplate(original, settings, device);
    for (const [key, value] of Object.entries(settings)) assert.equal(custom[key], value, `${device} / ${key}`);
    const rendered = render(custom, deviceResolutions[device]);
    assert.equal(rendered.text.includes('Class Schedule'), false);
    assert.equal(rendered.plans.length, 5);
    // Reset appearance clears settings and restores the shared image defaults.
    assert.deepEqual(customizeWallpaperTemplate(original, {}, device), defaults);
  }
});

test('other layouts and custom backgrounds retain their own container defaults', () => {
  const source = { ...wallpaperTemplates.find(template => template.image), containerRadius: 10, containerShape: 'rounded' };
  for (const scheduleLayout of ['timeline', 'grouped-list', 'day-columns', 'day-cards', 'weekly']) {
    assert.equal(customizeWallpaperTemplate(source, { scheduleLayout }).containerRadius, 10, scheduleLayout);
  }
  const custom = { ...source, customBackground: true, showTitle: false };
  assert.equal(customizeWallpaperTemplate(custom, {}).containerRadius, 10);
  assert.equal(customizeWallpaperTemplate(custom, {}).showTitle, false);
});
