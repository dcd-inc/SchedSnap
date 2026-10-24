import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareWallpaperAssets } from '../src/utils/wallpaperAssets.js';
globalThis.document ??= undefined;
globalThis.Image ??= undefined;

test('canvas preparation loads only the selected font once and retries failed loads', async t => {
  const loads = [];
  let fail = false;
  t.mock.property(globalThis, 'document', { fonts: { async load(font) { loads.push(font); if (fail) throw new Error('Font unavailable'); } } });
  await prepareWallpaperAssets({}, { id: 'mobile' });
  assert.equal(loads.length, 6);
  assert.ok(loads.every(font => font.includes('DM Sans Variable')));
  await prepareWallpaperAssets({}, { id: 'mobile' });
  assert.equal(loads.length, 6);
  fail = true;
  await assert.rejects(prepareWallpaperAssets({ fontFamily: 'Poppins' }), /Font unavailable/);
  fail = false;
  await prepareWallpaperAssets({ fontFamily: 'Poppins' });
  assert.equal(loads.filter(font => font.includes('Poppins')).length, 12);
});

test('artwork cache stays bounded, retains recently used images and reloads evicted artwork', async t => {
  const loaded = [];
  t.mock.property(globalThis, 'document', { fonts: { async load() {} } });
  t.mock.property(globalThis, 'Image', class {
    set src(value) { loaded.push(value); queueMicrotask(() => this.onload()); }
  });
  const load = id => prepareWallpaperAssets({ image: `https://res.cloudinary.com/example/image/upload/cache-${id}.png` }, { width: 270, height: 600 });
  const first = await load(0);
  for (let i = 1; i < 24; i++) await load(i);
  assert.equal(await load(0), first);
  await load(24);
  assert.equal(await load(0), first);
  assert.equal(loaded.length, 25);
  await load(1);
  assert.equal(loaded.length, 26);
  assert.equal(first.crossOrigin, 'anonymous');
  for (let i = 25; i < 125; i++) await load(i);
  assert.notEqual(await load(0), first);
});

test('concurrent artwork loads share a request and failed images can retry', async t => {
  const requests = [];
  t.mock.property(globalThis, 'document', { fonts: { async load() {} } });
  t.mock.property(globalThis, 'Image', class {
    set src(value) { this.url = value; requests.push(this); }
  });
  const template = { image: 'https://res.cloudinary.com/example/image/upload/cache-retry.png' };
  const first = prepareWallpaperAssets(template);
  const second = prepareWallpaperAssets(template);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requests.length, 1);
  requests[0].onerror();
  await Promise.all([assert.rejects(first, /could not load/), assert.rejects(second, /could not load/)]);
  const retry = prepareWallpaperAssets(template);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requests.length, 2);
  requests[1].onload();
  assert.equal(await retry, requests[1]);
});

test('an evicted request failing late does not remove a newer request for the same artwork', async t => {
  const requests = [];
  t.mock.property(globalThis, 'document', { fonts: { async load() {} } });
  t.mock.property(globalThis, 'Image', class {
    set src(value) { this.url = value; requests.push(this); }
  });
  const load = id => prepareWallpaperAssets({ image: `https://res.cloudinary.com/example/image/upload/late-${id}.png` });
  const old = assert.rejects(load('original'), /could not load/);
  await new Promise(resolve => setImmediate(resolve));
  for (let i = 0; i < 24; i++) {
    const next = load(i);
    await new Promise(resolve => setImmediate(resolve));
    requests.at(-1).onload();
    await next;
  }
  const current = load('original');
  await new Promise(resolve => setImmediate(resolve));
  const latest = requests.at(-1);
  requests[0].onerror();
  await old;
  const shared = load('original');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requests.at(-1), latest);
  latest.onload();
  assert.equal(await current, latest);
  assert.equal(await shared, latest);
});
