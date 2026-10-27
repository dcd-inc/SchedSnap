import test from 'node:test';
import assert from 'node:assert/strict';
import { scheduleSideMargin, drawWallpaper } from "../src/utils/canvasHelpers.js";
import { sampleSchedule } from '../src/assets/sampleSchedule.js';

test('legacy tablet side settings move the schedule without shrinking it', () => {
  assert.equal(scheduleSideMargin({ leftMargin: 20 }, 'left'), 0);
  assert.equal(scheduleSideMargin({ leftMargin: 100, leftMarginEnabled: true }, 'left'), 20);
  const ctx = { measureText(text) { return { width: text.length * 20 }; }, scale() {}, translate() {}, fillRect() {}, fillText() {}, beginPath() {}, roundRect() {}, fill() {}, stroke() {}, arc() {}, save() {}, restore() {} };
  const canvas = { getContext() { return ctx; } };
  const template = { background: '#fff', ink: '#000', muted: '#333', surface: '#fff', line: '#ccc' };
  const resolution = { id: 'tablet', width: 1600, height: 2560 };
  const before = drawWallpaper(canvas, { schedule: sampleSchedule, template, resolution });
  const disabled = drawWallpaper(canvas, { schedule: sampleSchedule, template: { ...template, leftMargin: 20 }, resolution });
  const after = drawWallpaper(canvas, { schedule: sampleSchedule, template: { ...template, leftMargin: 20, leftMarginEnabled: true }, resolution });
  assert.deepEqual(disabled.scheduleBounds, before.scheduleBounds);
  assert.equal(after.overflow, false);
  assert.ok(after.scheduleBounds.x > before.scheduleBounds.x);
  assert.equal(after.scheduleBounds.width, before.scheduleBounds.width);
});
