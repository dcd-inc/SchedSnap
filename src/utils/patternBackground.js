import { generativePatternMap } from '../assets/generativePatterns.js';

const tileCache = new Map();
const TILE_SIZE = 240;
const CACHE_PIXEL_LIMIT = 8 * 1024 * 1024;
let cachedPixels = 0;

function bounded(value, fallback, min, max) {
  const number = Number(value ?? fallback);
  return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback;
}

export function patternScale(template) {
  return bounded(template.patternScale, 100, 50, 200);
}

export function patternOpacity(template) {
  return bounded(template.patternOpacity, 75, 0, 100);
}

export function drawPatternBackground(ctx, template, width, height) {
  const design = generativePatternMap.get(template.pattern);
  if (!design || patternOpacity(template) === 0) return;
  const color = template.patternColor || design.patternColor;
  const accent = template.patternAccent || design.patternAccent;
  const logicalSize = design.tileSize * Math.min(width, height) / 1080 * patternScale(template) / 100;
  const transform = ctx.getTransform?.();
  const outputScale = transform ? Math.hypot(transform.a, transform.b) : 1;
  const pixels = Math.max(TILE_SIZE, Math.min(1440, Math.ceil(logicalSize * outputScale / TILE_SIZE) * TILE_SIZE));
  const key = `${design.id}:${color}:${accent}:${pixels}`;
  let tile = tileCache.get(key);
  if (!tile) {
    // DOM-free layout tests have no raster surface; browsers use a cached tile.
    tile = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(pixels, pixels)
      : typeof document !== 'undefined' ? document.createElement('canvas') : null;
    if (!tile) return;
    tile.width = pixels; tile.height = pixels;
    const tileContext = tile.getContext('2d');
    tileContext.save();
    tileContext.scale(pixels / TILE_SIZE, pixels / TILE_SIZE);
    design.draw(tileContext, { color, accent, seed: generativeSeed(design.id) });
    tileContext.restore();
    // Bound pixel memory as well as entry count when exporting larger devices.
    while (tileCache.size && (tileCache.size >= 48 || cachedPixels + pixels * pixels > CACHE_PIXEL_LIMIT)) {
      const oldest = tileCache.keys().next().value;
      const evicted = tileCache.get(oldest);
      cachedPixels -= evicted.width * evicted.height;
      tileCache.delete(oldest);
    }
    tileCache.set(key, tile);
    cachedPixels += pixels * pixels;
  }
  const pattern = ctx.createPattern(tile, 'repeat');
  if (!pattern) return;
  // Scale against the shorter edge, preserving motif proportions on every device.
  const scale = logicalSize / pixels;
  ctx.save();
  ctx.globalAlpha *= patternOpacity(template) / 100;
  ctx.scale(scale, scale);
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, width / scale, height / scale);
  ctx.restore();
}

function generativeSeed(id) {
  let seed = 2166136261;
  for (const character of id) seed = Math.imul(seed ^ character.charCodeAt(0), 16777619) >>> 0;
  return seed;
}
