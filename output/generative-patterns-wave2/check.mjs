import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import puppeteer from 'file:///C:/Users/picar/AppData/Local/npm-cache/_npx/0f94ee7615faf582/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';

// Local verification only: use the browser already available on this workstation.
const destination = resolve('output/generative-patterns-wave2');
await mkdir(destination, { recursive: true });
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const writePng = (path, data) => writeFile(path, Buffer.from(data.split(',')[1], 'base64'));
try {
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => {
    window.patternQA = {
      ...await import('/src/assets/generativePatterns.js'),
      ...await import('/src/assets/templates.js'),
      ...await import('/src/utils/canvasHelpers.js'),
      ...await import('/src/utils/patternBackground.js'),
      ...await import('/src/utils/wallpaperTheme.js'),
    };
    await document.fonts.ready;
  });
  const allMotifs = await page.evaluate(() => {
    const q = window.patternQA, c = document.createElement('canvas'); c.width = 240; c.height = 240; const ctx = c.getContext('2d');
    return q.generativePatterns.map(p => { ctx.clearRect(0,0,240,240); ctx.fillStyle='#ffffff';ctx.fillRect(0,0,240,240); p.draw(ctx,{color:'#111111',accent:'#555555',seed:123}); return c.toDataURL(); });
  });
  assert.equal(new Set(allMotifs).size, 200, 'new geometries must differ from every previous motif at identical size and colors');
  const ids = await page.evaluate(() => window.patternQA.generativePatternTemplates.slice(100).map(t => t.id));
  assert.equal(ids.length, 100);
  const results = [];
  for (const device of ['mobile', 'tablet', 'laptop']) {
    await mkdir(resolve(destination, device), { recursive: true });
    for (const id of ids) {
      const result = await page.evaluate(({ id, device }) => {
        const qa = window.patternQA;
        const source = qa.generativePatternTemplates.find(t => t.id === id);
        const template = qa.customizeWallpaperTemplate(source, {}, device);
        const resolution = qa.deviceResolutions[device];
        const canvas = document.createElement('canvas');
        const layout = qa.drawWallpaper(canvas, { template, resolution, schedule: qa.templateSchedule });
        if (layout.overflow) throw new Error(`${id} ${device}: schedule overflow`);
        const sample = canvas.toDataURL('image/png');
        qa.drawWallpaper(canvas, { template: { ...template, showTitle: false }, resolution, schedule: { classes: [], warnings: [] } });
        const artwork = canvas.toDataURL('image/png');
        const probe = document.createElement('canvas'); probe.width = 256; probe.height = 256;
        const ctx = probe.getContext('2d');
        const fingerprint = overrides => {
          ctx.clearRect(0, 0, 256, 256); ctx.fillStyle = overrides.background || template.background; ctx.fillRect(0, 0, 256, 256);
          qa.drawPatternBackground(ctx, { ...template, ...overrides }, 256, 256);
          return probe.toDataURL();
        };
        const baseline = fingerprint({});
        const changes = Object.fromEntries(Object.entries({ patternColor: '#1122ff', patternAccent: '#ff1133', patternScale: 175, patternOpacity: 0, background: '#11ff22' }).map(([key, value]) => [key, fingerprint({ [key]: value }) !== baseline]));
        const mono = fingerprint({ background: '#ffffff', patternColor: '#111111', patternAccent: '#333333', patternOpacity: 100, patternScale: 100 });
        return { id, device, width: canvas.width, height: canvas.height, changes, sample, artwork, mono };
      }, { id, device });
      const { artwork, sample, mono, ...summary } = result;
      for (const [key, changed] of Object.entries(summary.changes)) if (!changed) console.log(`FAIL ${id} ${device}: ${key} has no visible effect`);
      await writePng(resolve(destination, device, `${id}.png`), artwork);
      if (['print-geo-arcade', 'print-flow-pebbles', 'print-play-bow'].includes(id) || [ids[0], ids[35], ids[70]].includes(id)) await writePng(resolve(destination, `${device}-${id}-schedule.png`), sample);
      results.push({ ...summary, mono });
    }
    console.log(`PASS ${device}: 100 full-resolution PNGs, schedules fit, five customization controls change pixels`);
  }
  for (const device of ['mobile', 'tablet', 'laptop']) assert.equal(new Set(results.filter(r => r.device === device).map(r => r.mono)).size, 100, `${device}: unique monochrome motifs`);
  for (let group = 0; group < 4; group++) {
    const data = await page.evaluate(async group => {
      const qa = window.patternQA;
      const sheet = document.createElement('canvas'); sheet.width = 1500; sheet.height = 1975;
      const c = sheet.getContext('2d'); c.fillStyle = '#f0f2f4'; c.fillRect(0, 0, sheet.width, sheet.height);
      c.fillStyle = '#18283d'; c.font = 'bold 28px Arial'; c.fillText(`SchedSnap · original prints ${group * 25 + 1}–${group * 25 + 25}`, 24, 44);
      qa.generativePatternTemplates.slice(100 + group * 25, 100 + group * 25 + 25).forEach((t, i) => {
        const tile = document.createElement('canvas');
        qa.drawWallpaper(tile, { template: t, resolution: qa.deviceResolutions.mobile, schedule: qa.templateSchedule });
        const x = 24 + i % 5 * 295, y = 75 + Math.floor(i / 5) * 375;
        c.drawImage(tile, x + 62, y, 148, 329);
        c.fillStyle = '#18283d'; c.font = '16px Arial'; c.fillText(`${100 + group * 25 + i + 1}. ${t.name}`, x, y + 354, 275);
      });
      return sheet.toDataURL('image/png');
    }, group);
    await writePng(resolve(destination, `contact-sheet-${group + 1}.png`), data);
  }
  await writeFile(resolve(destination, 'verification.json'), JSON.stringify({ exports: 300, totalCollection: 200, all200UniqueAtIdenticalTileSizeAndColors: true, devices: ['mobile', 'tablet', 'laptop'], uniqueMotifsPerDevice: 100, results: results.map(({ mono: _mono, ...r }) => r) }, null, 2));
  console.log('PASS: 100 monochrome-distinct motifs on each device; 4 contact sheets saved.');
  assert.ok(results.every(r => Object.values(r.changes).every(Boolean)), 'all controls must visibly affect every motif');
} finally {
  await browser.close();
}
