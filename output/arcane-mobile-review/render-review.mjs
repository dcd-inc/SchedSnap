import puppeteer from 'file:///C:/Users/picar/AppData/Local/npm-cache/_npx/0f94ee7615faf582/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100 });
  await page.goto('http://127.0.0.1:5174/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts.ready);
  await mkdir('output/arcane-mobile-review/schedules', { recursive: true });
  const results = await page.evaluate(async () => {
    const { arcaneTemplates } = await import('/src/assets/arcaneTemplates.js');
    const { drawWallpaper } = await import('/src/utils/canvasHelpers.js');
    const { galleryScheduleFor, mobileResolution } = await import('/src/assets/wallpaperPresets.js');
    const { sampleSchedule } = await import('/src/assets/sampleSchedule.js');
    const { galleryPreviewTemplate } = await import('/src/utils/wallpaperTheme.js');
    const results = [];
    for (const design of arcaneTemplates) {
      const image = new Image(); image.src = design.image; await image.decode();
      const template = galleryPreviewTemplate(design);
      const canvas = document.createElement('canvas');
      const sample = drawWallpaper(canvas, { schedule: galleryScheduleFor(template), template, resolution: mobileResolution, backgroundImage: image });
      const png = canvas.toDataURL('image/png').split(',')[1];
      const dense = { classes: sampleSchedule.classes.map(course => ({ ...course, meetings: [...course.meetings, { ...course.meetings[0], startTime: '16:00', endTime: '17:00' }] })), warnings: [] };
      const denseLayout = drawWallpaper(canvas, { schedule: dense, template, resolution: mobileResolution, backgroundImage: image });
      results.push({ id: template.id, overflow: sample.overflow, denseOverflow: denseLayout.overflow, png });
    }
    return results;
  });
  for (const { id, png, overflow, denseOverflow } of results) {
    assert.equal(overflow, false, id);
    assert.equal(denseOverflow, false, `${id} dense schedule`);
    await writeFile(`output/arcane-mobile-review/schedules/${id}.png`, Buffer.from(png, 'base64'));
  }
  await writeFile('output/arcane-mobile-review/schedule-validation.json', JSON.stringify(results.map(({ png, ...result }) => result), null, 2));
  console.log(`Rendered ${results.length} shared gallery schedules; samples and ten-meeting dense schedules fit.`);
} finally { await browser.close(); }
