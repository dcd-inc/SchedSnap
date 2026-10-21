import test from 'node:test';
import assert from 'node:assert/strict';
import { getCropView, moveCrop, resizeCrop } from '../src/utils/imageCrop.js';

const box = { left: 0.2, top: 0.2, right: 0.8, bottom: 0.8 };

test('preview zooms to the selection with handle clearance without changing the crop', () => {
  const selection = { left: 0.2, top: 0.3, right: 0.6, bottom: 0.5 };
  const view = getCropView(selection);
  assert.ok(view.left < selection.left && view.right > selection.right);
  assert.ok(view.top < selection.top && view.bottom > selection.bottom);
  assert.ok(view.right - view.left < 0.5);
  assert.ok((selection.right - selection.left) / (view.right - view.left) > 0.98, 'selection fills at least 98% of preview width');
  assert.deepEqual(selection, { left: 0.2, top: 0.3, right: 0.6, bottom: 0.5 });
  assert.deepEqual(getCropView({ left: 0, top: 0, right: 1, bottom: 1 }), { left: 0, top: 0, right: 1, bottom: 1 });
  assert.equal(getCropView({ left: 0, top: 0.7, right: 0.2, bottom: 1 }).bottom, 1);
});

test('corner movement in a zoomed preview maps back to original image coordinates', () => {
  const view = getCropView(box);
  const moved = resizeCrop(box, 'nw', 0.1 * (view.right - view.left), 0.1 * (view.bottom - view.top));
  assert.ok(Math.abs(moved.left - 0.2612) < 1e-10);
  assert.ok(Math.abs(moved.top - 0.2612) < 1e-10);
  assert.equal(moved.right, box.right);
});

test('wide and tall crops zoom uniformly inside the same preview dimensions', () => {
  for (const selection of [{ left: 0.2, top: 0.4, right: 0.8, bottom: 0.5 }, { left: 0.1, top: 0.1, right: 0.2, bottom: 0.7 }]) {
    const view = getCropView(selection);
    const width = view.right - view.left;
    const height = view.bottom - view.top;
    assert.ok(Math.abs(width - height) < 1e-10, 'image scales equally in both axes');
    assert.ok(view.left <= selection.left && view.right >= selection.right);
    assert.ok(view.top <= selection.top && view.bottom >= selection.bottom);
    assert.ok(width < 1, 'image zooms in');
  }
});

test('each corner adjusts only its edges and stays inside the image', () => {
  assert.deepEqual(resizeCrop(box, 'nw', -1, -1), { left: 0, top: 0, right: 0.8, bottom: 0.8 });
  assert.deepEqual(resizeCrop(box, 'se', 1, 1), { left: 0.2, top: 0.2, right: 1, bottom: 1 });
  assert.deepEqual(resizeCrop(box, 'ne', 0.1, -0.1), { left: 0.2, top: 0.1, right: 0.9, bottom: 0.8 });
  const small = resizeCrop(box, 'sw', 1, -1);
  assert.ok(Math.abs(small.right - small.left - 0.05) < 1e-10);
  assert.ok(Math.abs(small.bottom - small.top - 0.05) < 1e-10);
});

test('moving a crop preserves its size and stops at image boundaries', () => {
  const moved = moveCrop(box, -2, 2);
  assert.equal(moved.left, 0);
  assert.equal(moved.bottom, 1);
  assert.ok(Math.abs(moved.right - moved.left - 0.6) < 1e-10);
  assert.ok(Math.abs(moved.bottom - moved.top - 0.6) < 1e-10);
  assert.deepEqual(moveCrop({ left: 0, top: 0, right: 1, bottom: 1 }, 1, -1), { left: 0, top: 0, right: 1, bottom: 1 });
});
