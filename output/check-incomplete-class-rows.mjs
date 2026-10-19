import puppeteer from 'file:///C:/Users/picar/AppData/Local/npm-cache/_npx/0f94ee7615faf582/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import assert from 'node:assert/strict';
const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
 const page=await browser.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));await page.setViewport({width:1440,height:1000});
 await page.goto('http://localhost:5173/services/schedule-wallpaper');await page.waitForSelector('.template-option');
 await page.evaluate(()=>[...document.querySelectorAll('button')].find(el=>el.textContent==='Reject cookies')?.click());
 await page.$eval('.template-option',el=>el.click());await page.waitForSelector('dialog[open] footer > button');await page.$eval('dialog[open] footer > button',el=>el.click());
 await page.waitForSelector('.upload-alternatives');await page.$$eval('.upload-alternatives button',els=>els.find(el=>el.textContent.includes('sample')).click());await page.waitForSelector('[data-incomplete="true"]');
 assert.equal(await page.$$eval('[data-incomplete="true"]',els=>els.length),3);assert.equal(await page.$$eval('.class-row-warning',els=>els.length),3);
 assert.equal(await page.$eval('.classes-next .preview',el=>el.disabled),true);
 assert.ok(await page.$$eval('[data-incomplete="true"] .class-name',els=>els.every(el=>el.textContent==='Incomplete details')));
 assert.ok(await page.$$eval('[data-incomplete="true"] .class-row-details',els=>els.every(el=>!el.textContent.includes('—'))));
 assert.ok(await page.$eval('.class-row-details',el=>parseFloat(getComputedStyle(el).fontSize)>=14));
 await page.waitForSelector('canvas[aria-busy="false"]');await page.screenshot({path:'documentation/previews/incomplete-class-rows.png',fullPage:true});
 for(const [name,field] of [['New class','subject'],['Purposive Communication','endTime'],['General Physics','day']]){
  await page.click(`.class-row-edit[aria-label^="Edit ${name},"]`);await page.waitForSelector('.class-edit-dialog[open]');
  assert.ok(await page.$eval(`#edit-class-${field}`,el=>el.getAttribute('aria-invalid')==='true'));
  assert.equal(await page.$eval(`#edit-class-${field}`,el=>el===document.activeElement),true);
  if(field==='day'){await page.setViewport({width:390,height:844});await page.screenshot({path:'documentation/previews/incomplete-class-fields-mobile.png',fullPage:true});}
  await page.$eval('.class-edit-dialog footer > div .button-secondary',el=>el.click());
 }
 await page.click('.class-row-edit[aria-label^="Edit New class,"]');await page.waitForSelector('.class-edit-dialog[open]');
 await page.$eval('#edit-class-subject',el=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,'Mathematics');el.dispatchEvent(new Event('input',{bubbles:true}));});await page.click('.class-edit-dialog [type="submit"]');
 await page.waitForFunction(()=>document.querySelectorAll('[data-incomplete="true"]').length===2);
 assert.equal(await page.$$eval('.class-row-warning',els=>els.length),2);
 assert.equal(await page.$eval('.classes-next .preview',el=>el.disabled),true);
 await page.click('.class-row-edit[aria-label^="Edit Purposive Communication,"]');await page.waitForSelector('.class-edit-dialog[open]');
 await page.$eval('#edit-class-endTime',el=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,'15:00');el.dispatchEvent(new Event('input',{bubbles:true}));});await page.click('.class-edit-dialog [type="submit"]');
 await page.waitForFunction(()=>document.querySelectorAll('[data-incomplete="true"]').length===1);
 await page.click('.class-row-edit[aria-label^="Edit General Physics,"]');await page.waitForSelector('.class-edit-dialog[open]');await page.select('#edit-class-day','Thursday');await page.click('.class-edit-dialog [type="submit"]');
 await page.waitForFunction(()=>!document.querySelector('.classes-next .preview').disabled);
 assert.equal(await page.$$eval('.class-row-warning',els=>els.length),0);assert.deepEqual(errors,[]);console.log('PASS: three yellow warning rows; missing fields highlighted and focused immediately; saving clears warning; mobile sheet');
}finally{await browser.close();}
