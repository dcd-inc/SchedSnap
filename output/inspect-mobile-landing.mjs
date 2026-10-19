import puppeteer from 'file:///C:/Users/picar/AppData/Local/npm-cache/_npx/0f94ee7615faf582/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import assert from 'node:assert/strict';

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.evaluateOnNewDocument(() => {
    const observer = new MutationObserver(() => {
      const hero = document.querySelector('.hero-art img');
      if (hero) { window.initialHero = hero; observer.disconnect(); }
    });
    observer.observe(document, { childList: true, subtree: true });
  });
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'output/mobile-landing-after.png' });
  assert.equal(await page.evaluate(() => window.initialHero === document.querySelector('.hero-art img')), true, 'Hydration must retain the prerendered hero');
  assert.deepEqual(errors, [], 'No hydration errors');
  console.log(JSON.stringify(await page.evaluate(() => ({
    title: document.title,
    width: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    images: [...document.images].filter(i => i.getBoundingClientRect().top < innerHeight).map(i => ({ src: i.currentSrc, width: i.width, height: i.height })),
    resources: performance.getEntriesByType('resource').map(r => ({ name: r.name, size: r.transferSize })),
  })), null, 2));
  for (const width of [320, 412, 768, 1440]) {
    await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `No overflow at ${width}px`);
  }
  await page.screenshot({ path: 'output/desktop-landing-after.png' });
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await page.click('.mobile-nav-toggle');
  assert.equal(await page.$eval('.mobile-nav-toggle', el => el.getAttribute('aria-expanded')), 'true');
  await page.click('.mobile-section-links a[href="#how-it-works"]');
  assert.equal(await page.$eval('.mobile-nav-toggle', el => el.getAttribute('aria-expanded')), 'false');
  await page.click('.hero-action');
  await page.waitForFunction(() => [...document.fonts].some(font => font.family === 'Geist Variable'));
  for (const family of ['Geist Variable', 'Poppins', 'Inter Variable', 'Great Vibes', 'Quicksand']) {
    assert.equal(await page.evaluate(async family => (await document.fonts.load(`600 32px "${family}"`)).length > 0, family), true, `${family} remains available in the editor`);
  }
  await page.goto('http://127.0.0.1:4173/?iab=1', { waitUntil: 'networkidle0' });
  assert.ok(await page.$('.iab-banner'), 'In-app browser banner still appears after hydration');
  assert.deepEqual(errors, [], 'Navigation and in-app browsers have no hydration errors');
  console.log('PASS: hero retained; no hydration errors; no overflow at 320/390/412/768/1440px; mobile navigation works; editor fonts load; in-app browser banner works.');
} finally {
  await browser.close();
}
