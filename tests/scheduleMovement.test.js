import test from 'node:test';
import assert from 'node:assert/strict';
import { drawWallpaper, scheduleMovement } from '../src/utils/canvasHelpers.js';
import { sampleSchedule } from '../src/assets/sampleSchedule.js';

test('all four directions translate schedules without resizing at each device and preview size', () => {
  const ctx = { measureText(text) { return { width: text.length * 20 }; }, scale() {}, translate() {}, fillRect() {}, fillText() {}, beginPath() {}, roundRect() {}, fill() {}, stroke() {}, arc() {}, save() {}, restore() {} };
  const canvas = { getContext() { return ctx; } };
  const base = { background: '#fff', ink: '#000', muted: '#333', surface: '#fff', line: '#ccc' };
  for (const resolution of [{ id: 'mobile', width: 1080, height: 2400 }, { id: 'mobile', width: 540, height: 1200 }, { id: 'tablet', width: 1600, height: 2560 }, { id: 'tablet', width: 2560, height: 1600 }, { id: 'laptop', width: 1920, height: 1080 }]) {
    const render = settings => drawWallpaper(canvas, { schedule: sampleSchedule, template: { ...base, ...settings }, resolution });
    const before = render({});
    for (const [axis, coordinate] of [['horizontal', 'x'], ['vertical', 'y']]) for (const value of [-100, -50, 50, 100]) {
      const after = render({ [`${axis}Position`]: value });
      assert.equal(after.overflow, false, `${resolution.id}/${axis}/${value}`);
      assert.equal(after.size, before.size);
      assert.equal(after.scheduleBounds.width, before.scheduleBounds.width);
      assert.equal(after.scheduleBounds.height, before.scheduleBounds.height);
      assert.ok(value < 0 ? after.scheduleBounds[coordinate] < before.scheduleBounds[coordinate] : after.scheduleBounds[coordinate] > before.scheduleBounds[coordinate]);
      assert.ok(after.scheduleBounds.x >= -0.001);
      const width = resolution.id === 'mobile' ? 1080 : 1920;
      assert.ok(after.scheduleBounds.x + after.scheduleBounds.width <= width + 0.001);
    }
    assert.deepEqual(render({ horizontalPosition: 0, verticalPosition: 0 }).scheduleBounds, before.scheduleBounds);
  }
  assert.equal(scheduleMovement({ horizontalPosition: -500 }, 'horizontal'), -100);
  assert.equal(scheduleMovement({ verticalPosition: 'invalid' }, 'vertical'), 0);
});


test('mobile vertical movement reaches the bottom margin for every layout and artwork type', () => {
  const ctx = { measureText(text) { return { width: text.length * 20 }; }, scale() {}, translate() {}, fillRect() {}, fillText() {}, beginPath() {}, roundRect() {}, fill() {}, stroke() {}, arc() {}, save() {}, restore() {} };
  const canvas = { getContext: () => ctx };
  const resolution = { id: 'mobile', width: 1080, height: 2400 };
  for (const layout of ['stacked', 'timeline', 'grouped-list', 'day-columns']) for (const artwork of [{}, { layout: 'mascot' }, { artworkFooter: true }]) {
    const template = { background: '#fff', ink: '#000', muted: '#333', surface: '#fff', line: '#ccc', ...artwork, scheduleLayout: layout, verticalPosition: 100 };
    const result = drawWallpaper(canvas, { schedule: { classes: [sampleSchedule.classes[0]] }, template, resolution });
    assert.ok(Math.abs(result.scheduleBounds.y + result.scheduleBounds.height - 2340) < 0.001, `${layout}/${artwork.layout || 'background'}`);
  }
});


test('increasing mobile container height does not hide a schedule that fits the canvas', () => {
  const ctx = { measureText(text) { return { width: text.length * 20 }; }, scale() {}, translate() {}, fillRect() {}, fillText() {}, beginPath() {}, roundRect() {}, fill() {}, stroke() {}, arc() {}, save() {}, restore() {} };
  const canvas = { getContext: () => ctx };
  for (const artwork of [{ layout: 'mascot' }, { artworkFooter: true }]) {
    const template = { background: '#fff', ink: '#000', muted: '#333', surface: '#fff', line: '#ccc', ...artwork, containerHeight: 114, containerWidth: 120 };
    const result = drawWallpaper(canvas, { schedule: sampleSchedule, template, resolution: { id: 'mobile', width: 1080, height: 2400 } });
    assert.equal(result.overflow, false);
    assert.equal(result.plans.length, 5);
    assert.ok(result.scheduleBounds.y + result.scheduleBounds.height <= 2340);
  }
});
