import test from 'node:test';
import assert from 'node:assert/strict';
import { narutoTemplates } from '../src/assets/narutoTemplates.js';
import { supportsTemplateDevice } from '../src/utils/templateDevices.js';

test('the four retained Naruto references are available only on laptops, including remote records', () => {
  assert.equal(narutoTemplates.length, 4);
  for (const template of narutoTemplates) {
    for (const record of [template, { id: template.id }]) {
      assert.equal(supportsTemplateDevice(record, 'mobile'), false, template.id);
      assert.equal(supportsTemplateDevice(record, 'tablet'), false, template.id);
      assert.equal(supportsTemplateDevice(record, 'laptop'), true, template.id);
    }
  }
});

test('other designs retain their existing device availability', () => {
  for (const device of ['mobile', 'tablet', 'laptop']) {
    assert.equal(supportsTemplateDevice({ id: 'other-design' }, device), true);
    assert.equal(supportsTemplateDevice({ id: 'mobile-design', mobileOnly: true }, device), device === 'mobile');
  }
});
