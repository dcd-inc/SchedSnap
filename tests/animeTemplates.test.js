import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { animeTemplates } from '../src/assets/animeTemplates.js';
import { templateSchema } from '../shared/templateSchema.js';
import { matchesGalleryCategory } from '../src/config/collections.js';
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

test('fifteen distinct mobile anime artworks publish and match their categories', () => {
  assert.equal(animeTemplates.length, 15);
  assert.equal(new Set(animeTemplates.map(t => t.id)).size, 15);
  for (const template of animeTemplates) {
    assert.equal(templateSchema.parse({ ...template, status: 'published' }).mobileOnly, true);
    assert.equal(matchesGalleryCategory(template, 'anime'), true);
    assert.deepEqual(Object.keys(template.deviceImages), ['mobile']);
    const png = readFileSync(new URL(`../public${template.image}`, import.meta.url));
    assert.equal(png.readUInt32BE(16), 1080);
    assert.equal(png.readUInt32BE(20), 2400);
  }
  assert.equal(animeTemplates.filter(t => t.collection === 'hunter-x-hunter').length, 1);
});

test('anime keywords find franchises and reference motifs', () => {
  for (const query of ['Naruto', 'Hunter', 'Attack on Titan', 'Demon Slayer', 'Jujutsu', 'sword', 'cyan']) {
    assert.ok(searchWallpaperTemplates(animeTemplates, query).length, query);
  }
});
