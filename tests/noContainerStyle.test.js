import test from 'node:test';
import assert from 'node:assert/strict';
import { timelineDayStyle } from '../src/utils/wallpaperTheme.js';
test('no container suppresses fill and border while retaining text settings', () => {
  const result = timelineDayStyle({ containerStyle: 'none', containerFill: true, containerBorder: true, ink: '#123456' }, 0);
  assert.equal(result.containerFill, false);
  assert.equal(result.containerBorder, false);
  assert.equal(result.ink, '#123456');
});
