import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

// Exercise the real component effect without requiring a DOM or JSX test dependency.
const source = readFileSync(new URL('../src/pages/ScheduleWallpaper/CanvasPreview.jsx', import.meta.url), 'utf8')
  .split('export function WallpaperCanvas')[1].split('  return <><canvas')[0];

function host({ lazy = true, observer = true, prepare } = {}) {
  const node = { width: lazy ? 1 : 270, height: lazy ? 1 : 600 };
  const observers = [], draws = [], states = [], layouts = [];
  let effect;
  const context = {
    useRef: () => ({ current: node }),
    useState: value => [value, next => states.push(next)],
    useMemo: fn => fn(),
    useEffect: fn => { effect = fn; },
    prepareWallpaperAssets: prepare || (() => Promise.resolve()),
    drawWallpaper: (canvas, options) => {
      canvas.width = options.resolution.width; canvas.height = options.resolution.height;
      draws.push(options);
      return { overflow: false };
    },
    setTimeout: fn => { queueMicrotask(fn); },
    ...(observer ? { IntersectionObserver: class {
      constructor(callback) { this.callback = callback; observers.push(this); }
      observe(target) { assert.equal(target, node); }
      disconnect() { this.disconnected = true; }
    } } : {}),
  };
  runInNewContext(`function WallpaperCanvas${source}\n}\nglobalThis.mount = WallpaperCanvas;`, context);
  context.mount({ schedule: { classes: [] }, template: {}, resolution: { width: 270, height: 600 }, lazy, onLayout: layout => layouts.push(layout) });
  const cleanup = effect();
  return { node, draws, states, layouts, cleanup, observers, nearby: value => observers[0].callback([{ isIntersecting: value }]) };
}

const settle = () => new Promise(resolve => setImmediate(resolve));

test('gallery releases distant pixels and redraws when scrolling back', async () => {
  const page = host();
  assert.equal(page.node.width * page.node.height, 1);
  page.nearby(false);
  assert.equal(page.draws.length, 0);
  page.nearby(true);
  await settle();
  assert.equal(page.node.width * page.node.height, 162000);
  page.nearby(true);
  await settle();
  assert.equal(page.draws.length, 1);
  page.nearby(false);
  assert.equal(page.node.width * page.node.height, 1);
  page.nearby(true);
  await settle();
  assert.equal(page.draws.length, 2);
  assert.equal(page.layouts.at(-1).ready, true);
  page.cleanup();
  assert.equal(page.node.width, 1);
  assert.equal(page.observers[0].disconnected, true);
});

test('rapid scrolling and unmounting cannot revive an obsolete async render', async () => {
  const pending = [];
  const page = host({ prepare: () => new Promise(resolve => pending.push(resolve)) });
  page.nearby(true);
  page.nearby(false);
  page.nearby(true);
  pending[0]();
  await settle();
  assert.equal(page.draws.length, 0);
  pending[1]();
  await settle();
  assert.equal(page.draws.length, 1);
  page.nearby(false);
  page.nearby(true);
  page.cleanup();
  pending[2]();
  await settle();
  assert.equal(page.draws.length, 1);
  assert.equal(page.node.width, 1);
});

test('obsolete asset failures stay hidden, and returning previews can recover', async () => {
  const pending = [];
  const page = host({ prepare: () => new Promise((resolve, reject) => pending.push({ resolve, reject })) });
  page.nearby(true);
  page.nearby(false);
  pending[0].reject(new Error('stale error'));
  await settle();
  assert.equal(page.layouts.length, 0);
  page.nearby(true);
  pending[1].reject(new Error('current error'));
  await settle();
  assert.equal(page.layouts.at(-1).error, 'current error');
  page.nearby(false);
  page.nearby(true);
  pending[2].resolve();
  await settle();
  assert.equal(page.layouts.at(-1).error, '');
  page.cleanup();
});

test('editor previews and browsers without IntersectionObserver still render immediately', async () => {
  for (const options of [{ lazy: false }, { observer: false }]) {
    const page = host(options);
    await settle();
    assert.equal(page.draws.length, 1);
    assert.equal(page.observers.length, 0);
    assert.equal(page.node.width, 270);
    page.cleanup();
  }
});
