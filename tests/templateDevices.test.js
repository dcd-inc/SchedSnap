import test from 'node:test';
import assert from 'node:assert/strict';
import { narutoTemplates } from '../src/assets/narutoTemplates.js';
import { supportsTemplateDevice } from '../src/utils/templateDevices.js';
import { availableTemplateDevices, visibleTemplateDevices, templateDeviceStatus, matchesTemplateDeviceStatus } from '../shared/templateVisibility.js';

test('admin status filters and badges follow the selected device', () => {
  const template = { id: 'partial-visibility', status: 'published', hiddenDevices: ['tablet'] };
  assert.equal(templateDeviceStatus(template, 'tablet'), 'hidden');
  assert.equal(templateDeviceStatus(template, 'mobile'), 'published');
  assert.equal(matchesTemplateDeviceStatus(template, 'tablet', 'hidden'), true);
  assert.equal(matchesTemplateDeviceStatus(template, 'tablet', 'published'), false);
  assert.equal(matchesTemplateDeviceStatus(template, 'mobile', 'hidden'), false);
  assert.equal(matchesTemplateDeviceStatus(template, 'mobile', 'published'), true);
  assert.equal(matchesTemplateDeviceStatus(template, 'tablet', 'all'), true);
  assert.equal(matchesTemplateDeviceStatus({ ...template, status: 'hidden' }, 'mobile', 'hidden'), true);
  assert.equal(matchesTemplateDeviceStatus({ ...template, status: 'draft' }, 'tablet', 'draft'), true);
  assert.equal(matchesTemplateDeviceStatus({ ...template, status: 'draft' }, 'tablet', 'hidden'), false);
  for (const status of ['all', 'hidden', 'published', 'draft']) {
    assert.equal(matchesTemplateDeviceStatus({ ...template, mobileOnly: true }, 'tablet', status), false);
  }
});

test('visibility hides individual sizes without losing their availability', () => {
  const template = { id: 'all-sizes', status: 'published', hiddenDevices: ['tablet'] };
  assert.deepEqual(availableTemplateDevices(template), ['mobile', 'tablet', 'laptop']);
  assert.deepEqual(visibleTemplateDevices(template), ['mobile', 'laptop']);
  assert.equal(supportsTemplateDevice(template, 'tablet'), false);
  assert.equal(supportsTemplateDevice(template, 'laptop'), true);
  assert.deepEqual(visibleTemplateDevices({ ...template, status: 'hidden' }), []);
});

test('only existing background variants are selectable; cutouts and patterns adapt', () => {
  assert.deepEqual(availableTemplateDevices({ deviceImages: { mobile: '/mobile.png' } }), ['mobile']);
  assert.deepEqual(availableTemplateDevices({ mobileOnly: true }), ['mobile']);
  for (const template of [{ layout: 'mascot' }, { pattern: 'grid' }]) {
    assert.deepEqual(availableTemplateDevices(template), ['mobile', 'tablet', 'laptop']);
  }
});

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
