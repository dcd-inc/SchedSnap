import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareImage } from '../src/utils/imageHelpers.js';
import { MAX_IMAGE_BYTES, MAX_SOURCE_BYTES } from '../shared/uploadLimits.js';

function browser(t, { sizes = [100], width = 1600, height = 900 } = {}) {
  const formats = [];
  let closed = 0;
  const draws = [];
  const canvas = { getContext: () => ({ fillRect() {}, drawImage(...args) { draws.push(args); } }), toBlob(callback, type, quality) {
    formats.push({ type, quality });
    queueMicrotask(() => callback({ size: sizes.shift(), type }));
  } };
  t.mock.method(globalThis, 'createImageBitmap', async () => ({ width, height, close() { closed++; } }));
  t.mock.property(globalThis, 'document', { createElement: () => canvas });
  t.mock.property(globalThis, 'FileReader', class {
    readAsDataURL(blob) { this.result = `data:${blob.type};base64,aW1hZ2U=`; queueMicrotask(() => this.onload()); }
  });
  return { formats, canvas, draws, closed: () => closed };
}

// Node has no createImageBitmap; make a configurable stub for the browser mock.
globalThis.createImageBitmap ??= async () => {};
globalThis.document ??= undefined;
globalThis.FileReader ??= undefined;

test('small PNG screenshots retain lossless text and matching MIME/base64 data', async t => {
  const page = browser(t);
  const result = await prepareImage({ type: 'image/png', size: 200, name: 'schedule.png' });
  assert.equal(result.mimeType, 'image/png');
  assert.equal(result.preview, `data:image/png;base64,${result.image}`);
  assert.equal(result.name, 'schedule.png');
  assert.deepEqual(page.formats, [{ type: 'image/png', quality: undefined }]);
  assert.equal(page.closed(), 1);
});

test('oversized PNG encodings fall back to bounded JPEG and large photos resize proportionally', async t => {
  const page = browser(t, { sizes: [MAX_IMAGE_BYTES + 1, MAX_IMAGE_BYTES + 1, 100], width: 4000, height: 2000 });
  const result = await prepareImage({ type: 'image/png', size: 200 });
  assert.equal(result.mimeType, 'image/jpeg');
  assert.deepEqual(page.formats.map(item => item.type), ['image/png', 'image/jpeg', 'image/jpeg']);
  assert.equal(page.canvas.width, 2400);
  assert.equal(page.canvas.height, 1200);
  assert.equal(page.closed(), 1);
});

test('unusable uploads fail before encoding and release decoded bitmaps on errors', async t => {
  const page = browser(t, { sizes: [MAX_IMAGE_BYTES + 1, MAX_IMAGE_BYTES + 1, MAX_IMAGE_BYTES + 1] });
  await assert.rejects(prepareImage({ type: 'image/gif', size: 100 }), /JPG, PNG, or WebP/);
  await assert.rejects(prepareImage({ type: 'image/png', size: MAX_SOURCE_BYTES + 1 }), /10 MB/);
  await assert.rejects(prepareImage({ type: 'image/jpeg', size: 100 }), /too large after compression/);
  assert.equal(page.closed(), 1);
});

test('crops original pixels before resizing so timetable text retains detail', async t => {
  const page = browser(t, { width: 6000, height: 4000 });
  await prepareImage({ type: 'image/png', size: 200 }, { x: 0.25, y: 0.25, width: 0.5, height: 0.5 });
  assert.deepEqual(page.draws[0].slice(1), [1500, 1000, 3000, 2000, 0, 0, 2400, 1600]);
  assert.equal(page.closed(), 1);
});

test('invalid crop bounds fail without encoding and release the bitmap', async t => {
  const page = browser(t);
  for (const crop of [{ x: -0.1, y: 0, width: 0.5, height: 1 }, { x: 0.8, y: 0, width: 0.5, height: 1 }, { x: 0, y: 0, width: 0, height: 1 }, { x: NaN, y: 0, width: 1, height: 1 }]) {
    await assert.rejects(prepareImage({ type: 'image/png', size: 200 }, crop), /Select a crop/);
  }
  assert.equal(page.draws.length, 0);
  assert.equal(page.closed(), 4);
});
