import puppeteer from 'file:///C:/Users/picar/AppData/Local/npm-cache/_npx/0f94ee7615faf582/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import assert from 'node:assert/strict';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });
  const catalog = await page.evaluate(async () => (await (await fetch('/api/catalog')).json()).templates);
  assert.equal(catalog.filter(t => t.family === 'generative-prints').length, 100);
  for (const [device, width, height] of [['mobile', 390, 844], ['tablet', 820, 1180], ['laptop', 1440, 1000]]) {
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.goto(`http://127.0.0.1:5173/services/schedule-wallpaper/print-geo-arcade?step=preview&device=${device}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.customize-appearance', { timeout: 30000 });
    await page.$$eval('button', buttons => buttons.find(button => button.textContent.trim() === 'Reject cookies')?.click());
    await page.click('.customize-appearance > summary');
    await page.waitForSelector('.customize-appearance[open]');
    await page.waitForSelector('.flow-preview-art canvas[aria-busy="false"]');
    const selector = '.flow-preview-art canvas';
    const before = await page.$eval(selector, c => c.toDataURL());
    for (const id of ['pattern-scale', 'pattern-opacity']) {
      await page.focus(`#${id}`);
      await page.keyboard.press('ArrowRight');
      await page.waitForFunction(() => document.querySelector('#pattern-scale')?.value !== '100' || document.querySelector('#pattern-opacity')?.value !== '75');
    }
    await page.waitForFunction(({ selector, before }) => document.querySelector(selector)?.getAttribute('aria-busy') === 'false' && document.querySelector(selector)?.toDataURL() !== before, {}, { selector, before });
    await page.click('.appearance-reset');
    await page.waitForFunction(({ selector, before }) => document.querySelector(selector)?.getAttribute('aria-busy') === 'false' && document.querySelector(selector)?.toDataURL() === before, {}, { selector, before });
    assert.equal(await page.$eval('#pattern-scale', el => el.value), '100');
    assert.equal(await page.$eval('#pattern-opacity', el => el.value), '75');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${device}: no horizontal overflow`);
    await page.$eval('#pattern-scale', el => el.scrollIntoView({ block: 'center' }));
    await page.screenshot({ path: `output/generative-patterns/editor-${device}.png` });
    await page.$eval('.flow-preview-art', el => el.scrollIntoView({ block: 'start' }));
    await page.screenshot({ path: `output/generative-patterns/preview-${device}.png` });
    console.log(`PASS ${device}: controls update artwork, reset restores exact pixels, no horizontal overflow`);
  }
  assert.deepEqual(errors, []);
} finally { await browser.close(); }
