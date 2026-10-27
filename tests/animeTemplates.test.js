import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { animeTemplates } from '../src/assets/animeTemplates.js';


import { searchWallpaperTemplates } from '../src/utils/wallpaperSearch.js';
import { drawWallpaper } from '../src/utils/canvasHelpers.js';
import { templateSchedule, deviceResolutions } from '../src/assets/templates.js';

test('original fifteen backgrounds dim by 20% before schedule text is drawn', () => {
  const { assets } = JSON.parse(readFileSync(new URL('../documentation/anime-collection/prompts-and-sources.json', import.meta.url)));
  const originals = animeTemplates.filter(t => assets.some(a => a.id === t.id));
  assert.equal(originals.length, 15);
  for (const template of originals) {
    assert.equal(template.overlay, 'rgba(0,0,0,0.2)');
    const calls = [];
    const context = new Proxy({ measureText: text => ({ width: text.length * 20 }),
      fillRect() { calls.push(this.fillStyle); }, fillText() { calls.push('text'); },
      createLinearGradient: () => ({ addColorStop() {} }),
    }, { get: (target, key) => key in target ? target[key] : ['canvas', 'getTransform'].includes(key) ? undefined : () => {} });
    const render = t => drawWallpaper({ getContext: () => context }, { schedule: templateSchedule, template: t, resolution: deviceResolutions.mobile });
    const dimmed = render(template);
    assert.ok(calls.indexOf(template.overlay) >= 0);
    assert.ok(calls.indexOf(template.overlay) < calls.indexOf('text'));
    assert.deepEqual(dimmed.scheduleBounds, render({ ...template, overlay: undefined }).scheduleBounds);
    assert.equal(dimmed.overflow, false);
  }
});



test('anime keywords find franchises and reference motifs', () => {
  for (const query of ['Naruto', 'Hunter', 'Attack on Titan', 'Demon Slayer', 'Jujutsu', 'sword', 'cyan']) {
    assert.ok(searchWallpaperTemplates(animeTemplates, query).length, query);
  }
});
