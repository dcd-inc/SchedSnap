import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareWallpaperAssets } from '../src/utils/wallpaperAssets.js';
globalThis.document ??= undefined;

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
