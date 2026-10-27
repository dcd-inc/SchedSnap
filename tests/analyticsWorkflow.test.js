import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { parse } from 'espree';

// Execute real component handlers with local browser/API substitutes. No production events.
function handler(file, name, overrides = {}, attribute = false) {
  const source = readFileSync(new URL(`../src/pages/ScheduleWallpaper/${file}.jsx`, import.meta.url), 'utf8');
  const ast = parse(source, { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true }, range: true });
  const nodes = [];
  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (node.type) nodes.push(node);
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(walk);
      else if (value && typeof value === 'object') walk(value);
    }
  }
  walk(ast);
  const node = attribute
    ? nodes.find(n => n.type === 'JSXAttribute' && n.name.name === name)?.value.expression
    : nodes.find(n => n.type === 'FunctionDeclaration' && n.id.name === name)
      || nodes.find(n => n.type === 'VariableDeclarator' && n.id.name === name)?.init;
  assert.ok(node, `${file}:${name} exists`);
  const callable = node.type === 'CallExpression' ? node.arguments[0] : node;
  const events = [];
  const context = {
    trackEvent: (event, properties) => events.push({ event, properties }),
    templateProperties, template, device: 'tablet', resolution: { id: 'tablet', width: 1600, height: 2560 },
    active: { current: true }, locked: { current: false }, busy: false, preparing: false, importBlocked: false, uploadingBackground: false,
    performance: { now: () => 100 }, Math, AbortController, structuredClone,
    URL: { createObjectURL: () => 'blob:local-test' },
    requestAnimationFrame: fn => fn(),
  };
  // State setters are irrelevant to event delivery; specialized setters below capture transitions.
  for (const n of nodes) if (n.type === 'Identifier' && /^(set[A-Z]|on[A-Z])/.test(n.name)) context[n.name] = () => {};
  Object.assign(context, overrides);
  return { events, context, run: runInNewContext(`(${source.slice(...callable.range)})`, context) };
}

const analytics = readFileSync(new URL('../src/lib/analytics.js', import.meta.url), 'utf8');
const templateProperties = runInNewContext(analytics.slice(analytics.indexOf('export function templateProperties')).replace('export ', '') + '\ntemplateProperties');
const template = { id: 'test-design', collection: 'test', device: 'tablet', scheduleLayout: 'day-columns', containerStyle: 'colored-glass', image: 'PRIVATE_IMAGE', scheduleTitle: 'PRIVATE_TITLE' };
const schedule = { classes: [{ subject: 'PRIVATE_SUBJECT' }], warnings: [] };

test('preview/download metadata covers every device, layout, style and background without content', () => {
  for (const device of ['mobile', 'tablet', 'laptop']) {
    for (const scheduleLayout of ['stacked', 'grouped-list', 'day-columns', 'day-cards', 'timeline']) {
      for (const containerStyle of ['glass', 'solid', 'colored', 'colored-glass', 'outline', 'none']) {
        for (const customBackground of [false, true]) {
          const properties = templateProperties({ ...template, device, scheduleLayout, containerStyle, customBackground });
          assert.equal(properties.device, device);
          assert.equal(properties.schedule_layout, scheduleLayout);
          assert.equal(properties.container_style, containerStyle);
          assert.equal(properties.background_type, customBackground ? 'custom' : 'preset');
          assert.doesNotMatch(JSON.stringify(properties), /PRIVATE/);
        }
      }
    }
  }
});

test('gallery device, sort, style and layout handlers emit the selected choices', () => {
  for (const [name, value, property] of [['changeDevice', 'laptop', 'device'], ['changeSort', 'downloads', 'sort'], ['changeStyle', 'glass', 'container_style'], ['changeLayout', 'grouped-list', 'schedule_layout']]) {
    const action = handler('Index', name, { templateId: '', customBackgroundId: 'custom-background' });
    action.run(value);
    assert.equal(action.events[0].properties[property], value);
  }
  const appearance = handler('Index', 'onAppearanceChange', { templateId: 'test-design', changeLayout() {} }, true);
  appearance.run('containerStyle', 'outline');
  assert.equal(appearance.events[0].properties.container_style, 'outline');
});

test('gallery keeps the selected No container style and upload layouts are marked custom', () => {
  const source = readFileSync(new URL('../src/pages/ScheduleWallpaper/Index.jsx', import.meta.url), 'utf8');
  const ast = parse(source, { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true }, range: true });
  const component = ast.body.find(node => node.type === 'ExportDefaultDeclaration').declaration;
  const style = component.body.body.find(node => node.type === 'VariableDeclaration' && node.declarations.some(item => item.id.name === 'previewStyle')).declarations[0].init;
  const value = selected => runInNewContext(source.slice(...style.range), { search: { get: () => selected } });
  assert.equal(value('none'), 'none');
  assert.equal(value('glass'), 'glass');
  assert.equal(value('invalid'), 'glass');
  const upload = handler('Index', 'changeLayout', { templateId: 'upload', uploadingBackground: true, customBackgroundId: 'custom-background' });
  upload.run('grouped-list');
  assert.equal(upload.events[0].properties.background_type, 'custom');
  const preset = handler('Index', 'changeLayout', { templateId: 'test-design', customBackgroundId: 'custom-background' });
  preset.run('grouped-list');
  assert.equal(preset.events[0].properties.background_type, 'preset');
});

test('creator step records once after consent and records again after consent is renewed', () => {
  const source = readFileSync(new URL('../src/pages/ScheduleWallpaper/Index.jsx', import.meta.url), 'utf8');
  const ast = parse(source, { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true }, range: true });
  const component = ast.body.find(node => node.type === 'ExportDefaultDeclaration').declaration;
  const effect = component.body.body.find(node => node.type === 'ExpressionStatement' && node.expression.callee?.name === 'useEffect' && source.slice(...node.range).includes("trackEvent('wallpaper_step_viewed'"));
  assert.ok(effect);
  const events = [];
  const context = { analyticsConsent: null, lastTrackedStep: { current: null }, templateId: '', template: null,
    uploadingBackground: false, step: 'design', device: 'mobile', scheduleSource: 'unknown', schedule,
    trackEvent: event => events.push(event), templateProperties };
  const run = runInNewContext(`(${source.slice(...effect.expression.arguments[0].range)})`, context);
  run();
  assert.deepEqual(events, []);
  context.analyticsConsent = 'granted';
  run(); run();
  assert.deepEqual(events, ['wallpaper_step_viewed']);
  context.analyticsConsent = 'denied';
  run();
  context.analyticsConsent = 'granted';
  run();
  assert.deepEqual(events, ['wallpaper_step_viewed', 'wallpaper_step_viewed']);
});

test('manual and sample actions are distinct from successful imports', () => {
  const manual = handler('TemplateWorkspace', 'enterManually', { hasSchedule: false });
  manual.run();
  assert.equal(manual.events[0].event, 'manual_schedule_started');
  const sample = handler('Index', 'onSample', { sampleSchedule: schedule, dismissNotification() {} }, true);
  sample.run();
  assert.equal(sample.events[0].event, 'sample_schedule_loaded');
});

test('schedule image upload and crop success are separate from AI imports; failures are recorded', async () => {
  for (const fail of [false, true]) {
    let cropSource;
    const action = handler('Uploader', 'choose', {
      requestId: { current: 0 }, inspectImage: async () => { if (fail) throw new Error('private failure'); return { width: 100, height: 100, close() {} }; },
      setCropSource: value => { cropSource = value; },
    });
    await action.run({ type: 'image/png', size: 100, name: 'PRIVATE_FILE' });
    assert.equal(action.events[0].event, 'schedule_upload_started');
    if (fail) assert.equal(action.events[1].event, 'schedule_upload_failed');
    else {
      const crop = handler('Uploader', 'confirmCrop', { cropSource, requestId: { current: 1 }, prepareImage: async () => ({ preview: 'PRIVATE_IMAGE' }) });
      await crop.run({});
      assert.equal(crop.events[0].event, 'schedule_upload_succeeded');
      assert.doesNotMatch(JSON.stringify(crop.events), /PRIVATE/);
    }
  }
});

test('imports report actual provider/model, timing, failures and cancellations', async () => {
  for (const outcome of ['gemini', 'deepseek', 'failed', 'cancelled']) {
    const request = { current: null };
    const action = handler('Index', 'analyze', {
      image: { image: 'PRIVATE_IMAGE', mimeType: 'image/png' }, request,
      api: { post: async () => { if (outcome === 'failed') throw { response: { status: 503 } }; if (outcome === 'cancelled') request.current.abort(); return { data: { schedule, provider: outcome, model: `${outcome}-test` } }; } },
      scheduleSchema: { safeParse: data => ({ success: true, data }) }, rememberImportUsage() {}, getAnalysisErrorMessage: () => 'Failed',
    });
    await action.run();
    assert.equal(action.events[0].event, 'schedule_import_started');
    const result = action.events[1];
    assert.equal(result.event, outcome === 'failed' ? 'schedule_import_failed' : outcome === 'cancelled' ? 'schedule_import_cancelled' : 'schedule_import_succeeded');
    if (['gemini', 'deepseek'].includes(outcome)) {
      assert.equal(result.properties.ai_provider, outcome);
      assert.equal(result.properties.ai_model, `${outcome}-test`);
      assert.equal(result.properties.class_count, 1);
      assert.equal(result.properties.duration_ms, 0);
    }
    assert.doesNotMatch(JSON.stringify(action.events), /PRIVATE/);
  }
});

test('custom photo preparation, crop failures and selection are tracked without photo content', async () => {
  for (const fail of [false, true]) {
    const choose = handler('CustomBackgroundUpload', 'choose', { uploadDevice: 'mobile', inspectImage: async () => { if (fail) throw new Error('PRIVATE_ERROR'); return { width: 100, height: 100, close() {} }; } });
    await choose.run([{ name: 'PRIVATE_FILE' }]);
    assert.equal(choose.events[0].event, 'custom_background_upload_started');
    if (fail) assert.equal(choose.events[1].properties.stage, 'inspect');
    const crop = handler('CustomBackgroundUpload', 'confirmCrop', { uploadDevice: 'mobile', source: { file: {} }, prepareImage: async () => { if (fail) throw new Error('PRIVATE_ERROR'); return { preview: 'PRIVATE_IMAGE' }; }, createCustomBackground: () => ({}), updateCandidate() {}, focusUpload() {} });
    await crop.run({});
    assert.equal(crop.events[0].event, fail ? 'custom_background_upload_failed' : 'custom_background_upload_succeeded');
    assert.doesNotMatch(JSON.stringify([...choose.events, ...crop.events]), /PRIVATE/);
  }
  const selected = handler('Index', 'onSelect', { previewLayout: 'stacked', previewStyle: 'glass', window: { sessionStorage: {} }, saveCustomBackground: () => true, navigate() {}, devicePath: x => x, basePath: '/creator', step: 'upload', previousTemplate: null }, true);
  selected.run({ ...template, customBackground: true });
  assert.equal(selected.events[0].event, 'custom_background_selected');
  assert.equal(selected.events[0].properties.background_type, 'custom');
});

test('downloads include final preferences and input method, count repeats, and exclude failed exports', async () => {
  for (const scheduleSource of ['manual', 'sample', 'image', 'draft']) {
    for (const outcome of ['success', 'repeat', 'failure']) {
      const action = handler('TemplateWorkspace', 'download', {
        canDownload: true, scheduleSource, schedule, exportKey: 'current', exportResult: outcome === 'repeat' ? { key: 'current' } : null,
        prepareWallpaperAssets: async () => ({}), document: { createElement: () => ({}) },
        drawWallpaper: () => ({ overflow: false }), canvasBlob: async () => { if (outcome === 'failure') throw new Error('PRIVATE_ERROR'); return {}; },
        downloadBlob: () => ({ inApp: false }), recordDownload() {}, vote: { liked: true },
      });
      await action.run();
      assert.equal(action.events[0].event, 'wallpaper_download_requested');
      assert.equal(action.events[1].event, outcome === 'failure' ? 'wallpaper_download_failed' : 'wallpaper_download_started');
      assert.equal(action.events[1].properties.schedule_source, scheduleSource);
      assert.equal(action.events[1].properties.device, 'tablet');
      assert.equal(action.events[1].properties.container_style, 'colored-glass');
      if (outcome === 'repeat') assert.equal(action.events[2].event, 'wallpaper_download_repeated');
      assert.doesNotMatch(JSON.stringify(action.events), /PRIVATE/);
    }
  }
});
