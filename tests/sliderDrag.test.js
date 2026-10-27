import test from 'node:test';
import assert from 'node:assert/strict';
import { sliderDragValue, sliderStops } from '../src/utils/sliderDrag.js';

const drag = overrides => sliderDragValue({ startValue: 50, deltaX: 0, deltaY: 0, width: 220, min: 0, max: 100, step: 1, threshold: 12, ...overrides });

test('quick stops are limited to five distinct, valid values including both ends', () => {
  assert.deepEqual(sliderStops(0, 100, 1), [0, 25, 50, 75, 100]);
  assert.deepEqual(sliderStops(-100, 100, 1), [-100, -50, 0, 50, 100]);
  assert.deepEqual(sliderStops(70, 160, 0.5), [70, 92.5, 115, 137.5, 160]);
  assert.deepEqual(sliderStops(0, 2, 1), [0, 1, 2]);
  for (const stop of sliderStops(0.5, 6, 0.5)) assert.equal((stop - 0.5) % 0.5, 0);
});

test('taps, small slips, and vertical scrolling do not change slider values', () => {
  assert.equal(drag({}), undefined);
  assert.equal(drag({ deltaX: 11 }), undefined);
  assert.equal(drag({ deltaX: -12 }), undefined);
  assert.equal(drag({ deltaX: 30, deltaY: 50 }), undefined);
  assert.equal(drag({ deltaX: -30, deltaY: -50 }), undefined);
});

test('deliberate dragging moves relative to the starting value at half speed', () => {
  assert.equal(drag({ deltaX: 52 }), 60);
  assert.equal(drag({ deltaX: -52 }), 40);
  assert.equal(drag({ startValue: 20, deltaX: 52 }), 30);
  assert.equal(drag({ deltaX: 46, threshold: 6 }), 60);
});

test('dragging respects bounds and integer, fractional, and larger steps', () => {
  assert.equal(drag({ deltaX: 1000 }), 100);
  assert.equal(drag({ deltaX: -1000 }), 0);
  assert.equal(drag({ startValue: 0, min: -100, max: 100, deltaX: -52 }), -20);
  assert.equal(drag({ startValue: 2, min: 0.5, max: 6, step: 0.5, deltaX: 52 }), 2.5);
  assert.equal(drag({ startValue: 100, min: 70, max: 160, step: 10, deltaX: 52 }), 110);
});

test('an active drag stays horizontal and returns smoothly through its starting point', () => {
  assert.equal(drag({ active: true, deltaX: 52, deltaY: 70 }), 60);
  assert.equal(drag({ active: true, deltaX: 8, deltaY: 70 }), 50);
  assert.equal(drag({ active: true, deltaX: 0, deltaY: 70 }), 50);
  assert.equal(drag({ active: true, deltaX: -8, deltaY: 70 }), 50);
  assert.equal(drag({ active: true, deltaX: -52, deltaY: 70 }), 40);
});
