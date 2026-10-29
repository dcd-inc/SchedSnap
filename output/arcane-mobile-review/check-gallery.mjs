import puppeteer from 'file:///C:/Users/picar/AppData/Local/npm-cache/_npx/0f94ee7615faf582/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import assert from 'node:assert/strict';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000 });
  await page.goto('http://127.0.0.1:5174/services/schedule-wallpaper?collection=arcane', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.template-option canvas[aria-busy="false"]', { timeout: 60000 });
  const catalog = await page.evaluate(async () => (await (await fetch('/api/catalog')).json()).templates.filter(t => t.collection === 'arcane' && t.id.startsWith('arcane-')));
  assert.equal(catalog.length, 12);
  assert.equal(new Set(catalog.map(t => t.id)).size, 12);
  assert.ok(catalog.every(t => t.mobileOnly && t.keywords.includes('League of Legends') && t.image.startsWith('https://res.cloudinary.com/')));
  assert.ok(catalog.every(t => !/torn-newsprint|sepia-panels|contour-cast/.test(t.id)));
  await page.screenshot({ path: 'output/arcane-mobile-review/gallery-desktop.png', fullPage: true });
  await page.setViewport({ width: 390, height: 844 });
  await page.screenshot({ path: 'output/arcane-mobile-review/gallery-mobile.png', fullPage: true });
  console.log('Public catalog verified: 12 unique published Arcane records; gallery rendered at desktop and mobile sizes.');
} finally { await browser.close(); }
