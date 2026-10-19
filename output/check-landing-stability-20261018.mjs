import puppeteer from 'file:///C:/Users/picar/AppData/Local/npm-cache/_npx/0f94ee7615faf582/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

const baseline = process.argv.includes('--baseline');
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.evaluateOnNewDocument(() => {
    try { localStorage.setItem('schedsnap:pageviews', '12967'); } catch { /* Ignore opaque browser documents. */ }
    const observer = new MutationObserver(() => {
      const hero = document.querySelector('.hero-art img');
      if (hero) { window.initialHero = hero; observer.disconnect(); }
    });
    observer.observe(document, { childList: true, subtree: true });
  });
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle0' });
  console.log('Returning visitor hero retained:', await page.evaluate(() => window.initialHero === document.querySelector('.hero-art img')));
  if (!baseline) assert.equal(await page.evaluate(() => window.initialHero === document.querySelector('.hero-art img')), true, 'Returning visitors retain the prerendered hero');
  const measurements = [];
  for (const device of ['mobile', 'tablet', 'laptop']) {
    const selector = `.device-showcase-${device}`;
    await page.$eval(selector, section => section.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await page.waitForFunction(selector => document.querySelector(`${selector} img`).complete, {}, selector);
    await page.evaluate(selector => {
      const section = document.querySelector(selector);
      window.slideBefore = { img: section.querySelector('img'), src: section.querySelector('img').currentSrc, y: scrollY, height: section.getBoundingClientRect().height, focus: document.activeElement };
    }, selector);
    await page.waitForFunction(selector => document.querySelector(`${selector} img`).currentSrc !== window.slideBefore.src, { timeout: 12000 }, selector);
    const result = await page.evaluate(selector => {
      const section = document.querySelector(selector);
      return { sameImage: window.slideBefore.img === section.querySelector('img'), scrollDelta: scrollY - window.slideBefore.y, heightDelta: section.getBoundingClientRect().height - window.slideBefore.height, sameFocus: document.activeElement === window.slideBefore.focus };
    }, selector);
    measurements.push({ device, ...result });
    if (!baseline) {
      assert.equal(result.sameImage, true, `${device}: retain the image element`);
      assert.equal(result.scrollDelta, 0, `${device}: stable scroll`);
      assert.equal(result.heightDelta, 0, `${device}: stable frame`);
      assert.equal(result.sameFocus, true, `${device}: stable focus`);
    }
  }
  if (!baseline) {
    // A slow or failed replacement must leave the current artwork visible.
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.setCacheEnabled(false);
    await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle0' });
    await page.setRequestInterception(true);
    let release;
    let failImages = true;
    const blocked = new Promise(resolve => { release = resolve; });
    page.on('request', async request => {
      if (failImages && request.url().includes('/catalog-mobile/mascot-')) { await blocked; await request.abort(); }
      else await request.continue();
    });
    await page.$eval('.device-showcase-mobile', el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await page.$eval('.device-showcase-mobile img', img => img.decode());
    await page.evaluate(() => { window.originalSrc = document.querySelector('.device-showcase-mobile img').currentSrc; });
    await page.click('.device-showcase-mobile .showcase-image-next');
    assert.equal(await page.$eval('.device-showcase-mobile img', img => img.currentSrc), await page.evaluate(() => window.originalSrc));
    release();
    await page.waitForNetworkIdle();
    assert.equal(await page.$eval('.device-showcase-mobile img', img => img.currentSrc), await page.evaluate(() => window.originalSrc));
    failImages = false;
    await page.click('.device-showcase-mobile .showcase-image-next');
    await page.waitForFunction(() => document.querySelector('.device-showcase-mobile img').currentSrc !== window.originalSrc);
    const pausedSrc = await page.$eval('.device-showcase-mobile img', img => img.currentSrc);
    await new Promise(resolve => setTimeout(resolve, 3500));
    assert.equal(await page.$eval('.device-showcase-mobile img', img => img.currentSrc), pausedSrc, 'Reduced motion disables autoplay');
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `No overflow at ${width}`);
      if (width === 390 || width === 1440) {
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
        await page.screenshot({ path: `output/landing-stability-${width}-20261018.png` });
      }
    }
    assert.deepEqual(errors, []);
  }
  await writeFile(`output/landing-stability-${baseline ? 'before' : 'after'}-20261018.json`, JSON.stringify({ measurements, errors }, null, 2));
  console.log(JSON.stringify({ measurements, errors }, null, 2));
} finally {
  await browser.close();
}
