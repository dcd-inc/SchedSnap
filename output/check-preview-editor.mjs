import puppeteer from 'file:///C:/Users/picar/AppData/Local/npm-cache/_npx/0f94ee7615faf582/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import assert from 'node:assert/strict';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  const page = await browser.newPage();
  page.on('dialog', dialog => dialog.accept());
  await page.setViewport({ width: 1440, height: 1000 });
  const fingerprint = canvas => {
    const copy = document.createElement('canvas');
    copy.width = canvas.width;
    copy.height = Math.floor(canvas.height * 0.78);
    copy.getContext('2d').drawImage(canvas, 0, canvas.height - copy.height, canvas.width, copy.height, 0, 0, copy.width, copy.height);
    return copy.toDataURL();
  };
  for (const device of ['mobile', 'tablet', 'laptop']) {
    for (const style of ['colored', 'colored-glass']) for (const layout of (device === 'laptop' ? ['stacked', 'grouped-list', 'day-columns', 'day-cards'] : ['stacked', 'grouped-list', 'day-columns', 'timeline'])) {
      await page.goto(`http://127.0.0.1:5173/services/schedule-wallpaper?device=${device}&layout=${layout}&style=${style}`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.template-option');
      await page.$eval('.template-option', el => el.click());
      await page.waitForSelector('dialog[open] canvas[aria-busy="false"]');
      const preview = await page.$eval('dialog[open] canvas', fingerprint);
      await page.$eval('dialog[open] footer > button', el => el.click());
      await page.waitForFunction(() => location.pathname.split('/').length > 3);
      await page.waitForSelector('canvas[aria-busy="false"]');
      const editor = await page.$eval('canvas[aria-busy="false"]', fingerprint);
      assert.equal(editor, preview, `${device} ${layout} ${style}: preview/editor differ below sample clock`);
      console.log(`PASS ${device} ${layout} ${style}: preview matches editor`);
    }
  }
} finally { await browser.close(); }
