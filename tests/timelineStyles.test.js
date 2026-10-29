import test from 'node:test';
import assert from 'node:assert/strict';
import { customizeWallpaperTemplate, timelineDayStyle, timelineLineWidth } from '../src/utils/wallpaperTheme.js';

test('Timeline presets alternate opacity, color days, and retain appearance settings', () => {
  const base = { ink: '#123456', surface: '#ffffff', containerOpacity: 80, containerBorder: false };
  assert.equal(timelineDayStyle({ ...base, containerStyle: 'colored-light' }, 0).ink, '#243044');
  assert.equal(timelineDayStyle({ ...base, containerStyle: 'colored-dark' }, 0).ink, '#243044');
  assert.equal(timelineDayStyle({ ...base, containerStyle: 'colored', colorIntensity: 0 }, 0).surface, '#ffffff');
  assert.equal(timelineDayStyle({ ...base, containerStyle: 'colored', colorIntensity: 100 }, 0).surface, '#ed839b');
  assert.equal(timelineDayStyle({ ...base, containerStyle: 'colored-alternating' }, 1).ink, '#243044');
  const colored = { ...base, containerStyle: 'colored-light', containerFill: false };
  assert.notEqual(timelineDayStyle(colored, 0).surface, timelineDayStyle(colored, 1).surface);
  assert.equal(timelineDayStyle(colored, 0).containerFill, false);
  assert.equal(timelineDayStyle(colored, 0).containerBorder, false);
  assert.equal(timelineDayStyle({ ...base, containerStyle: 'outline' }, 0).containerFill, false);
  assert.equal(timelineDayStyle(base, 0), base);
});

test('Timeline line thickness defaults and bounds are consistent', () => {
  assert.equal(timelineLineWidth({}), 2);
  assert.equal(timelineLineWidth({ timelineLineWidth: -1 }), 0.5);
  assert.equal(timelineLineWidth({ timelineLineWidth: 10 }), 10);
  assert.equal(timelineLineWidth({ timelineLineWidth: 24 }), 24);
  assert.equal(timelineLineWidth({ timelineLineWidth: 30 }), 24);
});

test('custom text colors apply to headings and all colored card text', () => {
  for (const containerStyle of ['colored', 'colored-glass']) {
    const template = customizeWallpaperTemplate({ ink: '#123456', muted: '#555555', headingInk: '#000000', containerStyle }, { ink: '#a02070' }, 'tablet');
    const day = timelineDayStyle(template, 0);
    assert.equal(day.ink, '#a02070');
    assert.equal(day.muted, '#a02070');
    assert.equal(day.headingInk, '#a02070');
  }
});
