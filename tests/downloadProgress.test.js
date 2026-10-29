import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../src/pages/ScheduleWallpaper/TemplateWorkspace.jsx', import.meta.url), 'utf8');
const download = source.slice(source.indexOf('  async function download('), source.indexOf('  const preview ='));

function host() {
  const state = { open: true, busy: false, error: '', downloads: 0 };
  let resolveBlob, rejectBlob;
  const blob = new Promise((resolve, reject) => { resolveBlob = resolve; rejectBlob = reject; });
  const context = {
    canDownload: true, template: { id: 'test' }, schedule: { classes: [] }, resolution: { id: 'mobile', width: 1080, height: 2400 }, scheduleSource: 'sample',
    active: { current: true }, exportResult: null, exportKey: 'test', vote: { liked: true },
    setDownloadOptions: value => { state.open = value; },
    setExporting: value => { state.busy = value; },
    setExportError: value => { state.error = value; },
    setMessage() {}, setMessageKind() {}, setExportResult() {}, setThankYouDesign() {},
    performance: { now: () => 0 }, templateProperties: () => ({}), trackEvent() {},
    requestAnimationFrame: callback => callback(), setTimeout,
    prepareWallpaperAssets: async () => ({}), document: { createElement: () => ({}) },
    drawWallpaper: () => ({ overflow: false }), canvasBlob: () => blob,
    downloadBlob: () => { state.downloads++; return { inApp: false }; }, recordDownload() {},
  };
  runInNewContext(`${download}\nglobalThis.start = download;`, context);
  return { state, start: context.start, resolveBlob, rejectBlob };
}

test('download popup stays open through PNG creation and closes after download starts', async () => {
  const page = host();
  const pending = page.start(true);
  assert.equal(page.state.busy, true);
  assert.equal(page.state.open, true);
  assert.equal(page.state.downloads, 0);
  page.resolveBlob({});
  await pending;
  assert.equal(page.state.open, false);
  assert.equal(page.state.busy, false);
  assert.equal(page.state.downloads, 1);
});

test('PNG failure keeps the popup open with a retryable inline error', async () => {
  const page = host();
  const pending = page.start(false);
  await new Promise(resolve => setTimeout(resolve, 0));
  page.rejectBlob(new Error('Could not create PNG'));
  await pending;
  assert.equal(page.state.open, true);
  assert.equal(page.state.busy, false);
  assert.equal(page.state.error, 'Could not create PNG');
  assert.equal(page.state.downloads, 0);
});
