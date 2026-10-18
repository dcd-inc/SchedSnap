import test from 'node:test';
import assert from 'node:assert/strict';
import { generativePatterns, generativePatternTemplates } from '../src/assets/generativePatterns.js';
import { wallpaperTemplates, deviceResolutions } from '../src/assets/templates.js';
import { templateSchema } from '../shared/templateSchema.js';
import { customizeWallpaperTemplate } from '../src/utils/wallpaperTheme.js';
import { patternScale, patternOpacity } from '../src/utils/patternBackground.js';

test('100 original motifs are discoverable, independently drawable, and publishable on every device', () => {
  assert.equal(generativePatterns.length, 100);
  assert.equal(new Set(generativePatterns.map(p => p.id)).size, 100);
  assert.equal(new Set(generativePatterns.map(p => p.name)).size, 100);
  const signatures = new Set();
  for (const design of generativePatterns) {
    const commands = [];
    let saves = 0;
    const ctx = new Proxy({}, {
      get: (_, key) => (...args) => {
        if (key === 'save') saves++;
        if (key === 'restore') { saves--; assert.ok(saves >= 0, design.id); }
        for (const argument of args) if (typeof argument === 'number') assert.ok(Number.isFinite(argument), `${design.id} ${key}`);
        commands.push([key, ...args]);
      },
      set: (_, key, value) => { commands.push([key, value]); return true; },
    });
    design.draw(ctx, { color: '#111111', accent: '#222222', seed: 123 });
    assert.equal(saves, 0, `${design.id}: balanced drawing state`);
    assert.ok(commands.length > 5, `${design.id}: real geometry`);
    signatures.add(JSON.stringify(commands));
  }
  assert.equal(signatures.size, 100, 'every motif has different geometry with identical colors/seed');
  for (const template of generativePatternTemplates) {
    assert.ok(wallpaperTemplates.some(t => t.id === template.id));
    assert.ok(!template.mobileOnly && !template.image);
    assert.equal(templateSchema.safeParse({ ...template, status: 'published' }).success, true, template.id);
    for (const device of Object.keys(deviceResolutions)) {
      const settings = { background: '#f0eeee', patternColor: '#ab1234', patternAccent: '#1234ab', patternScale: 150, patternOpacity: 40 };
      const customized = customizeWallpaperTemplate(template, settings, device);
      for (const [key, value] of Object.entries(settings)) assert.equal(customized[key], value, `${template.id}: ${device} ${key}`);
      const parsed = templateSchema.parse({ ...customized, status: 'published' });
      for (const key of Object.keys(settings)) assert.equal(parsed[key], settings[key]);
    }
  }
});

test('pattern controls are bounded and invalid published settings are rejected', () => {
  assert.equal(patternScale({}), 100);
  assert.equal(patternScale({ patternScale: NaN }), 100);
  assert.equal(patternScale({ patternScale: 1 }), 50);
  assert.equal(patternScale({ patternScale: 500 }), 200);
  assert.equal(patternOpacity({}), 75);
  assert.equal(patternOpacity({ patternOpacity: 0 }), 0);
  assert.equal(patternOpacity({ patternOpacity: Infinity }), 75);
  for (const settings of [{ patternScale: 49 }, { patternScale: 201 }, { patternOpacity: -1 }, { patternOpacity: 101 }, { patternAccent: 'javascript:bad' }, { pattern: 'unknown-print' }]) {
    assert.equal(templateSchema.safeParse({ ...generativePatternTemplates[0], ...settings, status: 'published' }).success, false);
  }
});
