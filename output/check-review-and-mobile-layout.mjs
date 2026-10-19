import puppeteer from 'file:///C:/Users/picar/AppData/Local/npm-cache/_npx/0f94ee7615faf582/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import assert from 'node:assert/strict';
import {sampleSchedule} from '../src/assets/sampleSchedule.js';
const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
 const schedule=structuredClone(sampleSchedule);schedule.warnings=['Check the imported room abbreviation against your original schedule.'];schedule.classes[1].meetings[0]={...schedule.classes[1].meetings[0],day:'Monday',startTime:'08:30',endTime:'10:00'};
 await page.evaluateOnNewDocument(schedule=>sessionStorage.setItem('schedsnap-class-draft-v1',JSON.stringify({schedule,title:'Class Schedule',source:'image'})),schedule);
 await page.goto('http://localhost:5173/services/schedule-wallpaper');await page.waitForSelector('.template-option');await page.evaluate(()=>[...document.querySelectorAll('button')].find(el=>el.textContent==='Reject cookies')?.click());await page.$eval('.template-option',el=>el.click());await page.waitForSelector('dialog[open] footer > button');await page.$eval('dialog[open] footer > button',el=>el.click());await page.waitForSelector('.restore-classes-dialog[open]');await page.$eval('.restore-classes-actions .button-primary',el=>el.click());
 await page.waitForFunction(()=>document.querySelectorAll('.review-warning-row').length===2);
 assert.ok(await page.$eval('.classes-next .preview',el=>el.disabled));
 assert.equal(await page.$('.review-notes'),null);
 await page.waitForSelector('canvas[aria-busy="false"]');await page.screenshot({path:'documentation/previews/review-warning-rows-mobile.png',fullPage:true});
 await page.$eval('.review-warning-row button',el=>el.scrollIntoView({block:'center',behavior:'instant'}));await page.click('.review-warning-row button');await page.waitForFunction(()=>document.querySelectorAll('.review-warning-row').length===1);
 assert.ok(await page.$eval('.classes-next .preview',el=>el.disabled),'Overlap must remain blocking');
 assert.equal(await page.$('.review-warning-row button'),null,'Live conflicts cannot be dismissed');
 await page.click('.class-row-edit[aria-label^="Edit Mathematics"]');await page.waitForSelector('.class-edit-dialog[open]');await page.select('#edit-class-day','Tuesday');await page.click('.class-edit-dialog [type="submit"]');
 await page.waitForFunction(()=>!document.querySelector('.classes-next .preview').disabled);assert.equal(await page.$('.review-warning-row'),null);
 await page.click('.classes-next .preview');await page.waitForSelector('.schedule-layout-picker');await page.click('.schedule-layout-picker summary');
 for(const value of ['timeline','grouped-list','day-columns','stacked']){await page.click(`.schedule-layout-option:has(input[value="${value}"])`);await page.waitForFunction(value=>document.querySelector('.schedule-layout-picker :checked')?.value===value,{},value);await page.waitForSelector('canvas[aria-busy="false"]');}
 await page.click('.customize-appearance summary');await page.waitForFunction(()=>document.querySelector('.customize-appearance').open&&!document.querySelector('.schedule-layout-picker').open);
 await page.$eval('.schedule-layout-picker summary',el=>el.scrollIntoView({block:'end',behavior:'instant'}));await page.click('.schedule-layout-picker summary');await page.waitForFunction(()=>document.querySelector('.schedule-layout-picker').open&&!document.querySelector('.customize-appearance').open);
 assert.equal(await page.$$eval('details[name="wallpaper-settings"][open]',els=>els.length),1);
 await page.screenshot({path:'documentation/previews/mobile-layout-fixed.png',fullPage:true});assert.deepEqual(errors,[]);console.log('PASS: red review rows block Continue; imported note resolved explicitly; overlaps clear only after fixing; all mobile layouts apply; one accordion at a time');
}finally{await browser.close();}
