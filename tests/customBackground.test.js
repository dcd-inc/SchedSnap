import test from 'node:test';
import assert from 'node:assert/strict';
import { clearBackgroundDraft, clearCustomBackground, createCustomBackground, readBackgroundDraft, readCustomBackground, saveBackgroundDraft, saveCustomBackground } from '../src/lib/customBackground.js';
import { cloudinaryAssetUrl } from '../src/utils/cloudinaryAssets.js';
import { customizeWallpaperTemplate } from '../src/utils/wallpaperTheme.js';

test('custom backgrounds retain local artwork and use the existing layout controls on every device', () => {
  const image = 'data:image/png;base64,aGVsbG8=';
  const template = createCustomBackground(image);
  for (const device of ['mobile', 'tablet', 'laptop']) {
    const customized = customizeWallpaperTemplate(template, { scheduleLayout: 'grouped', ink: '#112233' }, device);
    assert.equal(customized.image, image);
    assert.equal(customized.scheduleLayout, 'grouped');
    assert.equal(customized.ink, '#112233');
    assert.equal(cloudinaryAssetUrl(customized.image), image);
  }
});

test('unfinished background drafts restore without overwriting the current wallpaper', () => {
  const data = new Map();
  const storage = { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) };
  const current = createCustomBackground('data:image/png;base64,Y3VycmVudA==', 'mobile');
  const replacement = createCustomBackground('data:image/png;base64,bmV3', 'laptop');
  saveCustomBackground(storage, current);
  assert.equal(saveBackgroundDraft(storage, replacement), true);
  assert.deepEqual(readBackgroundDraft(storage), replacement);
  assert.deepEqual(readCustomBackground(storage), current);
  clearBackgroundDraft(storage);
  assert.equal(readBackgroundDraft(storage), null);
  assert.deepEqual(readCustomBackground(storage), current);
  clearCustomBackground(storage);
  assert.equal(readCustomBackground(storage), null);
});

test('custom background storage validates its contents and handles unavailable storage', () => {
  const data = new Map();
  const storage = { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value) };
  assert.equal(readCustomBackground(storage), null);
  const template = createCustomBackground('data:image/jpeg;base64,aGVsbG8=');
  assert.equal(saveCustomBackground(storage, template), true);
  assert.deepEqual(readCustomBackground(storage), template);
  for (const device of ['mobile', 'tablet', 'laptop']) {
    const selected = createCustomBackground(template.image, device);
    assert.equal(saveCustomBackground(storage, selected), true);
    assert.equal(readCustomBackground(storage).device, device);
  }
  assert.throws(() => createCustomBackground(template.image, 'unsupported'));
  for (const value of ['https://example.com/photo.jpg', 'data:image/svg+xml;base64,aGVsbG8=', 'data:image/png;base64,broken!']) {
    assert.throws(() => createCustomBackground(value));
    storage.setItem('schedsnap-custom-background-v1', value);
    assert.equal(readCustomBackground(storage), null);
  }
  const blocked = { getItem() { throw new Error('Blocked'); }, setItem() { throw new Error('Full'); } };
  assert.equal(readCustomBackground(blocked), null);
  assert.equal(saveCustomBackground(blocked, template), false);
});
