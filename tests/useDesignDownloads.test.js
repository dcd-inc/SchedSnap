import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

test('download ranking waits for the current device and settles on failure', async () => {
  const slots = [], requests = [];
  let cursor, result, device = 'mobile', effect, cleanup, dependencies;
  const context = {
    window: new EventTarget(),
    useCallback: fn => fn,
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index], next => { slots[index] = typeof next === 'function' ? next(slots[index]) : next; render(); }];
    },
    useEffect(fn, deps) {
      // The refresh callback is stable in React.
      if (!dependencies || deps.slice(1).some((value, index) => value !== dependencies[index])) {
        dependencies = deps.slice(1);
        effect = fn;
      }
    },
    api: { get: () => new Promise((resolve, reject) => requests.push({ resolve, reject })) },
  };
  const source = readFileSync(new URL('../src/lib/useDesignDownloads.js', import.meta.url), 'utf8')
    .replace(/^import .*;\r?$/gm, '').replaceAll('export ', '').replace('default function', 'function');
  runInNewContext(`${source}\nglobalThis.useHook = useDesignDownloads;`, context);
  function render() {
    cursor = 0;
    result = context.useHook(device);
    if (effect) { cleanup?.(); const run = effect; effect = null; cleanup = run(); }
  }
  const settle = () => new Promise(resolve => setImmediate(resolve));
  render();
  assert.equal(result.loading, true);
  requests[0].resolve({ data: { downloads: { first: 12 } } });
  await settle();
  assert.equal(result.loading, false);
  assert.equal(result.downloads.first, 12);
  result.refresh();
  assert.equal(result.loading, false);
  device = 'tablet';
  render();
  assert.equal(result.loading, true);
  assert.equal(result.downloads.first, undefined);
  requests[1].resolve({ data: { downloads: { first: 99 } } });
  requests[2].reject(new Error('Offline'));
  await settle();
  assert.equal(result.loading, false);
  assert.ok(result.error);
  assert.equal(result.downloads.first, undefined);
  cleanup();
});
