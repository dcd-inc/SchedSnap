import puppeteer from 'file:///C:/Users/picar/AppData/Local/npm-cache/_npx/0f94ee7615faf582/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import assert from 'node:assert/strict';

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0' });
  const rejectCookies = await page.$('button::-p-text(Reject cookies)');
  if (rejectCookies) await rejectCookies.click();
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewport({ width, height: 900 });
    for (const device of ['tablet', 'laptop']) {
      const section = await page.$(`.device-showcase-${device}`);
      await section.scrollIntoView();
      for (let slide = 0; slide < 3; slide++) {
        const metrics = await section.evaluate(async el => {
          const img = el.querySelector('picture img');
          await img.decode();
          const box = el.querySelector('picture').getBoundingClientRect();
          const arrow = el.querySelector('.showcase-image-next').getBoundingClientRect();
          return { width: box.width, height: box.height, arrowWidth: arrow.width, arrowHeight: arrow.height, loaded: img.naturalWidth > 0 };
        });
        assert.ok(metrics.loaded);
        assert.ok(metrics.arrowWidth >= 44 && metrics.arrowHeight >= 44);
        if (width <= 768) assert.ok(Math.abs(metrics.width / metrics.height - 4 / 3) < 0.01);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}`);
        if (width === 390 || width === 768 || width === 1440) await section.screenshot({ path: `output/showcase-${device}-${width}-${slide}.png` });
        await section.$eval('.showcase-image-next', el => el.click());
      }
    }
  }
  assert.deepEqual(errors, []);
  console.log('PASS: all tablet/laptop slides load at 320/390/768/1024/1440px; compact mobile frames; 44px controls; no horizontal overflow or page errors.');
} finally {
  await browser.close();
}
