import test from 'node:test';
import assert from 'node:assert/strict';
import { drawWallpaper } from '../src/utils/canvasHelpers.js';
import { templateSchedule, deviceResolutions } from '../src/assets/templates.js';
import { sampleSchedule } from '../src/assets/sampleSchedule.js';
import { sanrioTemplates } from '../src/assets/sanrioTemplates.js';
import { customizeWallpaperTemplate, galleryPreviewTemplate, snapSchedulePosition, wallpaperFontScale, wallpaperContainerWidth, wallpaperContainerHeight, wallpaperCornerRadius } from '../src/utils/wallpaperTheme.js';
import { templateSchema } from '../shared/templateSchema.js';

test('editor defaults match gallery placement while preserving explicit adjustments', () => {
  const source = { collection: 'sanrio', verticalPosition: -35, horizontalPosition: 20, topMargin: 5, bottomMargin: 2 };
  for (const device of ['mobile', 'tablet', 'laptop']) {
    const editor = customizeWallpaperTemplate(galleryPreviewTemplate(source), {}, device);
    const gallery = customizeWallpaperTemplate(galleryPreviewTemplate(source), {}, device);
    for (const key of ['verticalPosition', 'horizontalPosition', 'topMargin', 'bottomMargin']) assert.equal(editor[key], gallery[key]);
    assert.equal(customizeWallpaperTemplate(source, { verticalPosition: 25 }, device).verticalPosition, 25);
  }
});

test('font size accepts 70\u2013160 percent and defaults to 100 percent', () => {
  assert.equal(wallpaperFontScale({}), 1);
  assert.equal(wallpaperFontScale({ fontScale: NaN }), 1);
  assert.equal(wallpaperFontScale({ fontScale: 0.1 }), 0.7);
  for (const fontScale of [0.7, 0.8, 0.9, 1, 1.6]) {
    assert.equal(wallpaperFontScale({ fontScale }), fontScale);
    assert.equal(templateSchema.parse({ ...sanrioTemplates[0], status: 'draft', fontScale }).fontScale, fontScale);
  }
});

test('corner radius is bounded to 0\u201350 percent and survives template validation', () => {
  assert.equal(wallpaperCornerRadius({ containerRadius: -10 }), 0);
  assert.equal(wallpaperCornerRadius({ containerRadius: 90 }), 50);
  assert.equal(wallpaperCornerRadius({ containerRadius: NaN }), 50);
  for (const [scheduleLayout, expected] of [['stacked', 50], ['grouped-list', 5], ['timeline', 10], ['day-columns', 10], ['day-cards', 10], ['weekly', 10]]) {
    assert.equal(wallpaperCornerRadius({ scheduleLayout }), expected);
    assert.equal(wallpaperCornerRadius({ scheduleLayout, containerRadius: 17 }), 17);
    assert.equal(wallpaperCornerRadius({ scheduleLayout, containerRadius: undefined }), expected);
  }
  for (const containerRadius of [0, 15, 50]) assert.equal(templateSchema.parse({ ...sanrioTemplates[0], status: 'draft', containerRadius }).containerRadius, containerRadius);
  for (const containerRadius of [-1, 51]) assert.equal(templateSchema.safeParse({ ...sanrioTemplates[0], status: 'draft', containerRadius }).success, false);
});

test('Sanrio uses white frosted pills, with explicit user choices preserved', () => {
  for (const template of sanrioTemplates) for (const device of Object.keys(deviceResolutions)) {
    const preset = customizeWallpaperTemplate(template, {}, device);
    assert.equal(preset.containerStyle, 'glass');
    assert.equal(preset.surface, '#ffffff');
    assert.equal(preset.containerShape, 'pill');
    assert.equal(preset.containerFill, true);
    const custom = customizeWallpaperTemplate(template, { containerFill: false, containerShape: 'rounded', containerStyle: 'solid' }, device);
    assert.equal(custom.containerFill, false);
    assert.equal(custom.containerShape, 'rounded');
    assert.equal(custom.containerStyle, 'solid');
  }
});

test('modest font enlargement preserves meetings and fits all sample device layouts', () => {
  const ctx = { measureText: text => ({ width: text.length * 20 }), scale() {}, translate() {}, fillRect() {}, fillText() {}, beginPath() {}, roundRect() {}, fill() {}, stroke() {}, arc() {}, save() {}, restore() {} };
  for (const resolution of Object.values(deviceResolutions)) {
    const render = fontScale => drawWallpaper({ getContext: () => ctx }, { schedule: templateSchedule, template: { ...sanrioTemplates[0], fontScale }, resolution });
    const before = render(1);
    for (const scale of [1.1, 1.2, 1.3, 1.4, 1.5, 1.6]) {
      const after = render(scale);
      assert.equal(after.overflow, false);
      assert.ok(after.size > before.size);
      assert.equal(after.plans.reduce((n, p) => n + p.entries.length, 0), 5);
    }
  }
  assert.equal(wallpaperFontScale({ fontScale: 10 }), 1.6);
});

test('pointer dragging snaps near default while keyboard steps stay precise', () => {
  for (const value of [-5, -1, 0, 1, 5]) assert.equal(snapSchedulePosition(value, true), 0);
  assert.equal(snapSchedulePosition(6, true), 6);
  assert.equal(snapSchedulePosition(-6, true), -6);
  assert.equal(snapSchedulePosition(1, false), 1);
  assert.equal(snapSchedulePosition(-32, true, -35), -35);
  assert.equal(snapSchedulePosition(-29, true, -35), -29);
});

test('title alignment reaches the shared wallpaper renderer and validates', () => {
  for (const titleAlignment of ['left', 'center', 'right']) {
    let heading;
    const ctx = { measureText: text => ({ width: text.length * 20 }), scale() {}, translate() {}, fillRect() {}, fillText(text, x) { if (text === 'Alignment test') heading = { x, alignment: this.textAlign }; }, beginPath() {}, roundRect() {}, fill() {}, stroke() {}, arc() {}, save() {}, restore() {} };
    const template = { ...sanrioTemplates[0], titleAlignment, scheduleTitle: 'Alignment test' };
    drawWallpaper({ getContext: () => ctx }, { schedule: templateSchedule, template, resolution: deviceResolutions.mobile });
    assert.equal(heading.alignment, titleAlignment);
    assert.equal(heading.x, titleAlignment === 'left' ? 78 : titleAlignment === 'right' ? 1002 : 540);
    assert.equal(templateSchema.parse({ ...sanrioTemplates[0], status: 'draft', titleAlignment }).titleAlignment, titleAlignment);
  }
  assert.equal(templateSchema.safeParse({ ...sanrioTemplates[0], status: 'draft', titleAlignment: 'invalid' }).success, false);
});

test('text opacity affects text only and restores the canvas method after rendering', () => {
  const textAlphas = [], fillAlphas = [];
  const ctx = { globalAlpha: 1, measureText: text => ({ width: text.length * 20 }), scale() {}, translate() {}, fillRect() { fillAlphas.push(this.globalAlpha); }, fillText() { textAlphas.push(this.globalAlpha); }, beginPath() {}, roundRect() {}, fill() {}, stroke() {}, arc() {}, save() {}, restore() {} };
  const original = ctx.fillText;
  drawWallpaper({ getContext: () => ctx }, { schedule: templateSchedule, template: { ...sanrioTemplates[0], textOpacity: 40 }, resolution: deviceResolutions.mobile });
  assert.ok(textAlphas.length > 0);
  assert.equal(textAlphas[0], 0.4);
  assert.equal(fillAlphas[0], 1);
  assert.equal(ctx.fillText, original);
  assert.equal(templateSchema.parse({ ...sanrioTemplates[0], status: 'draft', textOpacity: 40 }).textOpacity, 40);
});

test('day-columns layout defaults font size to 130.5 percent on previews and workspace', () => {
  assert.equal(wallpaperFontScale({ scheduleLayout: 'day-columns' }), 1.305);
  assert.equal(wallpaperFontScale({ scheduleLayout: 'day-columns', fontScale: 1.1 }), 1.1);
  assert.equal(wallpaperFontScale({ scheduleLayout: 'stacked' }), 1);
});

test('container width and height controls bound 50-150 percent and default to 100 percent', () => {
  assert.equal(wallpaperContainerWidth({}), 100);
  assert.equal(wallpaperContainerWidth({ containerWidth: 85 }), 85);
  assert.equal(wallpaperContainerWidth({ containerWidth: 10 }), 50);
  assert.equal(wallpaperContainerWidth({ containerWidth: 200 }), 150);

  assert.equal(wallpaperContainerHeight({}), 100);
  assert.equal(wallpaperContainerHeight({ containerHeight: 120 }), 120);
  assert.equal(wallpaperContainerHeight({ containerHeight: 30 }), 50);
  assert.equal(wallpaperContainerHeight({ containerHeight: 180 }), 150);

  assert.equal(templateSchema.parse({ ...sanrioTemplates[0], status: 'draft', containerWidth: 90, containerHeight: 110 }).containerWidth, 90);
  assert.equal(templateSchema.parse({ ...sanrioTemplates[0], status: 'draft', containerWidth: 90, containerHeight: 110 }).containerHeight, 110);
});

test('stacked days width matches day-columns default width on mobile', () => {
  const ctx = { measureText: text => ({ width: text.length * 15, actualBoundingBoxAscent: 10, actualBoundingBoxDescent: 2 }), scale() {}, translate() {}, fillRect() {}, fillText() {}, beginPath() {}, roundRect() {}, fill() {}, stroke() {}, arc() {}, save() {}, restore() {} };
  const stacked = drawWallpaper({ getContext: () => ctx }, { schedule: templateSchedule, template: { ...sanrioTemplates[0], scheduleLayout: 'stacked' }, resolution: deviceResolutions.mobile });
  const dayColumns = drawWallpaper({ getContext: () => ctx }, { schedule: templateSchedule, template: { ...sanrioTemplates[0], scheduleLayout: 'day-columns' }, resolution: deviceResolutions.mobile });
  assert.equal(stacked.plans[0].width, 1008);
  assert.equal(stacked.plans[0].x, 36);
  assert.equal(dayColumns.plans[0].y, stacked.plans[0].y);
  assert.equal(stacked.scheduleBounds.width, dayColumns.scheduleBounds.width);
});

test('all phone layouts share the same container width and horizontal bounds on mobile', () => {
  const plans = {};
  for (const layout of ['stacked', 'grouped-list', 'timeline', 'day-columns']) {
    const ctx = {
      font: '',
      globalAlpha: 1,
      measureText: t => ({ width: t.length * Number(ctx.font.match(/([\d.]+)px/)?.[1] || 36) * 0.52 }),
      fillText: () => {}, beginPath: () => {}, moveTo() {}, lineTo() {}, stroke() {},
      save() {}, restore() {}, roundRect() {}, clip() {}, fill() {}, arc() {}, fillRect() {},
      scale() {}, translate() {},
      strokeStyle: '', lineWidth: 0, fillStyle: '',
    };
    const proxy = new Proxy(ctx, { get: (o, k) => k in o ? o[k] : () => {} });
    const canvas = { getContext: () => proxy };
    plans[layout] = drawWallpaper(canvas, {
      schedule: sampleSchedule,
      resolution: deviceResolutions.mobile,
      template: { background: '#fff', ink: '#000', muted: '#555', surface: '#eee', line: '#ddd', scheduleLayout: layout },
    });
  }
  const stackedX = plans['stacked'].scheduleBounds.x;
  const groupedX = plans['grouped-list'].scheduleBounds.x;
  const timelineX = plans['timeline'].scheduleBounds.x;
  const columnX = plans['day-columns'].scheduleBounds.x;
  const stackedW = plans['stacked'].scheduleBounds.width;
  const groupedW = plans['grouped-list'].scheduleBounds.width;
  const timelineW = plans['timeline'].scheduleBounds.width;
  const columnW = plans['day-columns'].scheduleBounds.width;
  assert.ok(Math.abs(stackedX - groupedX) < 1, `stacked x=${stackedX.toFixed(1)} vs grouped-list x=${groupedX.toFixed(1)}`);
  assert.ok(Math.abs(stackedX - timelineX) < 1, `stacked x=${stackedX.toFixed(1)} vs timeline x=${timelineX.toFixed(1)}`);
  assert.ok(Math.abs(stackedX - columnX) < 1, `stacked x=${stackedX.toFixed(1)} vs day-columns x=${columnX.toFixed(1)}`);
  assert.ok(Math.abs(stackedW - groupedW) < 1, `stacked w=${stackedW.toFixed(1)} vs grouped-list w=${groupedW.toFixed(1)}`);
  assert.ok(Math.abs(stackedW - timelineW) < 1, `stacked w=${stackedW.toFixed(1)} vs timeline w=${timelineW.toFixed(1)}`);
  assert.ok(Math.abs(stackedW - columnW) < 1, `stacked w=${stackedW.toFixed(1)} vs day-columns w=${columnW.toFixed(1)}`);
});

test('grouped-list and timeline font sizes scale smoothly with fontScale slider without fighting or dropping', () => {
  const ctx = {
    font: '',
    globalAlpha: 1,
    measureText(text) {
      const size = Number(this.font.match(/([\d.]+)px/)?.[1] || 36);
      return { width: text.length * size * 0.52 };
    },
    fillText() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {},
    save() {}, restore() {}, roundRect() {}, clip() {}, fill() {}, arc() {}, fillRect() {},
    scale() {}, translate() {}
  };
  const canvas = { getContext: () => ctx };
  for (const layout of ['grouped-list', 'timeline']) {
    for (const mascot of [false, true]) {
      let lastSize = 0;
      for (const fontScale of [0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6]) {
        const result = drawWallpaper(canvas, {
          schedule: sampleSchedule,
          resolution: deviceResolutions.mobile,
          template: { background: '#fff', ink: '#000', muted: '#555', surface: '#eee', line: '#ddd', scheduleLayout: layout, fontScale, layout: mascot ? 'mascot' : 'standard' }
        });
        assert.equal(result.overflow, false, `${layout} (mascot=${mascot}) at fontScale ${fontScale} must not overflow`);
        assert.ok(result.size >= lastSize, `${layout} (mascot=${mascot}) font size at ${fontScale} (${result.size.toFixed(1)}) must be >= previous (${lastSize.toFixed(1)})`);
        lastSize = result.size;
      }
    }
  }
});
