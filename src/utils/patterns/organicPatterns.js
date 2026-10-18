// Original Canvas artwork. Coordinates repeat on a 240-unit tile.
const TAU = Math.PI * 2;
const palettes = [
  ['#f5efe3', '#96ab76', '#c38a62', '#344735'],
  ['#f9eae3', '#bc7e6d', '#8a98b8', '#593e43'],
  ['#eaf1f0', '#64988f', '#a0ab76', '#254d4a'],
  ['#eeebf5', '#9174b0', '#b68d6b', '#443653'],
  ['#f6efd7', '#aa934a', '#789f92', '#51492d'],
  ['#e8eff7', '#698fb4', '#a383b8', '#30465e'],
  ['#f5e7ed', '#b27592', '#8e9e6b', '#583d4c'],
];

function path(ctx, points, close = false) {
  ctx.beginPath();
  points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  if (close) ctx.closePath();
}
function curve(ctx, fn, start = 0, end = 240, step = 3) {
  const points = [];
  for (let t = start; t <= end; t += step) points.push(fn(t));
  path(ctx, points);
  ctx.stroke();
}
function ellipse(ctx, x, y, rx, ry, angle = 0, fill = true) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, angle, 0, TAU);
  fill ? ctx.fill() : ctx.stroke();
}
function wrap(ctx, draw) {
  for (let x = -240; x <= 240; x += 240) for (let y = -240; y <= 240; y += 240) {
    ctx.save(); ctx.translate(x, y); draw(); ctx.restore();
  }
}
function blob(ctx, x, y, radius, phase = 0, fill = true) {
  const points = [];
  for (let i = 0; i <= 100; i++) {
    const a = i / 100 * TAU;
    const r = radius * (1 + .14 * Math.sin(a * 3 + phase) + .08 * Math.cos(a * 5 - phase));
    points.push([x + Math.cos(a) * r, y + Math.sin(a) * r]);
  }
  path(ctx, points, true); fill ? ctx.fill() : ctx.stroke();
}
const motifs = [
  ['tidal-script', 'Tidal Script', 'Long, fine ocean handwriting', 300, (c, a) => {
    c.lineWidth = 2.6;
    for (let y = -24; y <= 264; y += 24) { c.strokeStyle = y % 48 === 0 ? a : c.fillStyle; curve(c, x => [x, y + 11 * Math.sin(x / 240 * TAU)]); }
  }],
  ['ribbon-river', 'Ribbon River', 'Wide meandering ribbons with fine banks', 330, (c, a) => {
    for (let y = -60; y <= 300; y += 80) {
      c.lineWidth = 18; curve(c, x => [x, y + 23 * Math.sin(x / 240 * TAU)]);
      c.strokeStyle = a; c.lineWidth = 2.6; curve(c, x => [x, y + 30 + 23 * Math.sin(x / 240 * TAU)]);
      c.strokeStyle = c.fillStyle;
    }
  }],
  ['sea-fans', 'Sea Fans', 'Overlapping open fans like rippling water', 240, (c, a) => {
    wrap(c, () => { for (const [x, y] of [[0, 0], [120, 120]]) for (let r = 16; r <= 105; r += 15) {
      c.strokeStyle = r % 30 === 1 ? a : c.fillStyle; c.beginPath(); c.arc(x, y, r, 0, Math.PI); c.stroke();
    } });
  }],
  ['contour-islands', 'Contour Islands', 'Nested organic topographic islands', 340, (c, a) => {
    for (const [x, y] of [[60, 65], [182, 178]]) for (let r = 12; r < 57; r += 9) { c.strokeStyle = r < 30 ? a : c.fillStyle; blob(c, x, y, r, x, false); }
  }],
  ['river-pebbles', 'River Pebbles', 'Smooth asymmetrical stones and small insets', 280, (c, a) => {
    for (const [x, y, r] of [[45, 47, 32], [157, 55, 39], [88, 166, 42], [202, 174, 25]]) {
      blob(c, x, y, r, x); c.fillStyle = a; ellipse(c, x - 7, y - 8, r / 5, r / 7); c.fillStyle = c.strokeStyle;
    }
  }],
  ['petal-drift', 'Petal Drift', 'Loose paired petals floating across paper', 240, (c, a) => {
    for (const [x, y, t] of [[45, 45, -.6], [165, 75, .8], [85, 173, .4], [205, 195, -.8]]) {
      ellipse(c, x, y, 10, 27, t); c.fillStyle = a; ellipse(c, x + 16, y + 7, 8, 21, t + .8); c.fillStyle = c.strokeStyle;
    }
  }],
  ['rain-garden', 'Rain Garden', 'Slanted rain strokes and tiny ripple pools', 240, (c, a) => {
    c.lineWidth = 3;
    for (let x = 24; x < 240; x += 60) for (let y = 15; y < 240; y += 80) { path(c, [[x, y], [x - 10, y + 22]]); c.stroke(); }
    c.strokeStyle = a; for (const [x, y] of [[48, 65], [168, 145], [105, 225]]) ellipse(c, x, y, 19, 5, 0, false);
  }],
  ['spiral-postcards', 'Spiral Postcards', 'Airy handwound spiral medallions', 300, (c, accent) => {
    for (const [x, y] of [[60, 60], [180, 180]]) { c.strokeStyle = x === 60 ? c.fillStyle : accent; curve(c, t => { const a = t / 240 * TAU * 2.5; const r = 3 + t / 6; return [x + Math.cos(a) * r, y + Math.sin(a) * r]; }); }
  }],
  ['eddy-curls', 'Eddy Curls', 'Open curling eddies flowing in alternating directions', 300, (c, a) => {
    for (const [x, y, d] of [[60, 60, 1], [180, 180, -1]]) {
      c.strokeStyle = d === 1 ? c.fillStyle : a; c.beginPath(); c.moveTo(x - 45 * d, y + 40); c.bezierCurveTo(x + 85 * d, y + 40, x + 60 * d, y - 55, x, y - 35); c.bezierCurveTo(x - 45 * d, y - 20, x - 15 * d, y + 20, x + 12 * d, y); c.stroke();
    }
  }],
  ['vertical-streams', 'Vertical Streams', 'Upright streams with staggered swells', 280, (c, a) => {
    for (let x = -20; x < 280; x += 40) { c.strokeStyle = (x + 20) % 80 === 0 ? a : c.fillStyle; curve(c, y => [x + 12 * Math.sin(y / 240 * TAU + x / 40 * Math.PI), y]); }
  }],
  ['braided-tides', 'Braided Tides', 'Interlaced double waves dotted with pearls', 320, (c, a) => {
    for (let y = 40; y < 240; y += 80) {
      for (const d of [-1, 1]) curve(c, x => [x, y + d * 20 * Math.sin(x / 120 * TAU)]);
      c.fillStyle = a; for (let x = 0; x <= 240; x += 60) ellipse(c, x, y, 4, 4);
    }
  }],
  ['scallop-clouds', 'Scallop Clouds', 'Soft cloud scallops in offset rows', 240, (c, a) => {
    wrap(c, () => { for (const [x, y] of [[0, 40], [120, 160]]) {
      c.fillStyle = x === 0 ? c.strokeStyle : a;
      c.beginPath(); c.moveTo(x - 65, y + 15); c.bezierCurveTo(x - 70, y - 10, x - 35, y - 35, x - 15, y - 15); c.bezierCurveTo(x, y - 60, x + 50, y - 50, x + 50, y - 12); c.bezierCurveTo(x + 85, y - 10, x + 80, y + 20, x + 55, y + 20); c.closePath(); c.fill();
    } });
  }],
  ['lotus-pools', 'Lotus Pools', 'Leaf-shaped pools enclosed by ripples', 330, (c, a) => {
    for (const [x, y] of [[60, 60], [180, 180]]) {
      ellipse(c, x, y, 48, 32, -.3, false); ellipse(c, x, y, 36, 23, -.3, false);
      c.fillStyle = a; c.beginPath(); c.moveTo(x - 18, y + 10); c.quadraticCurveTo(x - 25, y - 28, x + 22, y - 15); c.quadraticCurveTo(x + 25, y + 16, x - 18, y + 10); c.fill();
    }
  }],
  ['sea-grass', 'Sea Grass', 'Swaying grass stems with almond leaves', 300, (c, a) => {
    for (const [x, y] of [[45, 20], [165, 140]]) {
      c.beginPath(); c.moveTo(x, y + 80); c.bezierCurveTo(x + 30, y + 45, x - 25, y + 25, x + 8, y); c.stroke();
      for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? a : c.strokeStyle; ellipse(c, x + (i % 2 ? 11 : -6), y + 15 + i * 15, 5, 13, i % 2 ? .8 : -.8); }
    }
  }],
  ['crescent-surf', 'Crescent Surf', 'Offset crescents like little breaking waves', 240, (c, a) => {
    for (let y = 30; y < 240; y += 80) for (let x = 30; x < 240; x += 80) {
      c.fillStyle = (x + y - 60) % 160 === 0 ? c.strokeStyle : a;
      c.beginPath(); c.moveTo(x - 24, y + 15); c.bezierCurveTo(x + 22, y + 32, x + 40, y - 30, x + 4, y - 24); c.bezierCurveTo(x + 24, y - 6, x + 3, y + 14, x - 24, y + 15); c.fill();
    }
  }],
  ['driftwood-loops', 'Driftwood Loops', 'Rounded elongated loops crossing at gentle angles', 320, (c, a) => {
    for (const [x, y, t] of [[60, 60, -.6], [180, 180, .6]]) { c.strokeStyle = c.fillStyle; ellipse(c, x, y, 20, 51, t, false); c.strokeStyle = a; ellipse(c, x, y, 10, 39, t, false); }
  }],
  ['bubble-trails', 'Bubble Trails', 'Clusters of airy bubbles in ascending sizes', 260, (c, a) => {
    wrap(c, () => { for (const [x, y] of [[45, 45], [165, 165]]) for (let i = 0; i < 5; i++) { c.strokeStyle = i % 2 ? a : c.fillStyle; ellipse(c, x + Math.sin(i * 1.4) * 19, y + i * 22, 5 + i * 2.5, 5 + i * 2.5, 0, false); } });
  }],
  ['wavy-checker', 'Wavy Checker', 'Undulating checkerboard islands', 280, (c, a) => {
    wrap(c, () => { for (let y = 0; y < 240; y += 60) for (let x = 0; x < 240; x += 60) if ((x + y) % 120 === 0) {
      c.fillStyle = x % 120 === 0 ? c.strokeStyle : a;
      const p = []; for (let t = 0; t <= 60; t += 3) p.push([x + t, y + 8 * Math.sin(t / 60 * TAU)]); for (let t = 60; t >= 0; t -= 3) p.push([x + t, y + 60 + 8 * Math.sin(t / 60 * TAU)]); path(c, p, true); c.fill();
    } });
  }],
  ['archipelago', 'Archipelago', 'Scattered island silhouettes and tiny satellite islets', 340, (c, a) => {
    blob(c, 65, 64, 43, 1); blob(c, 180, 177, 32, 4); c.fillStyle = a; blob(c, 158, 58, 12, 2); blob(c, 52, 175, 17, 5); ellipse(c, 112, 128, 4, 4);
  }],
  ['dune-bands', 'Dune Bands', 'Layered desert dune ribbons', 340, (c, a) => {
    for (let y = -80; y < 320; y += 80) { c.lineWidth = 24; curve(c, x => [x, y + 15 * Math.sin(x / 240 * TAU) + 7 * Math.cos(x / 120 * TAU)]); c.strokeStyle = a; c.lineWidth = 2.6; curve(c, x => [x, y + 23 + 15 * Math.sin(x / 240 * TAU) + 7 * Math.cos(x / 120 * TAU)]); c.strokeStyle = c.fillStyle; }
  }],
  ['teardrop-mosaic', 'Teardrop Mosaic', 'Alternating upright and inverted water drops', 260, (c, a) => {
    for (let y = 40; y < 240; y += 80) for (let x = 40; x < 240; x += 80) { c.save(); c.translate(x, y); c.rotate((x + y) % 160 ? Math.PI : 0); c.fillStyle = (x + y) % 160 ? a : c.strokeStyle; c.beginPath(); c.moveTo(0, -29); c.bezierCurveTo(45, 18, 5, 39, -15, 23); c.bezierCurveTo(-30, 8, -9, -9, 0, -29); c.fill(); c.restore(); }
  }],
  ['orbit-garden', 'Orbit Garden', 'Tilted elliptical orbits with little moons', 340, (c, a) => {
    for (const [x, y] of [[60, 60], [180, 180]]) { ellipse(c, x, y, 48, 24, -.6, false); ellipse(c, x, y, 36, 17, -.6, false); c.fillStyle = a; ellipse(c, x + 35, y - 27, 7, 7); }
  }],
  ['fern-whispers', 'Fern Whispers', 'Delicate symmetric fern fronds', 320, (c, a) => {
    for (const [x, y] of [[55, 18], [175, 138]]) { path(c, [[x, y], [x, y + 84]]); c.stroke(); for (let i = 1; i <= 5; i++) { const w = 23 - i * 2.5; for (const d of [-1, 1]) { c.fillStyle = d < 0 ? c.strokeStyle : a; c.beginPath(); c.moveTo(x, y + i * 13); c.quadraticCurveTo(x + d * w, y + i * 13 - 25, x + d * w, y + i * 13 - 12); c.quadraticCurveTo(x + d * w, y + i * 13, x, y + i * 13); c.fill(); } } }
  }],
  ['sine-stitches', 'Sine Stitches', 'Dashed serpentine embroidered lines', 260, (c, a) => {
    c.setLineDash([5, 7]); c.lineWidth = 3; for (let y = -20; y <= 260; y += 40) { c.strokeStyle = (y + 20) % 80 === 0 ? c.fillStyle : a; curve(c, x => [x, y + 13 * Math.sin(x / 120 * TAU)]); }
  }],
  ['puddle-pearls', 'Puddle Pearls', 'Irregular open puddles with scattered pearls', 300, (c, a) => {
    blob(c, 65, 65, 40, 4, false); blob(c, 178, 175, 46, 2, false); c.fillStyle = a; for (const [x, y, r] of [[145, 40, 5], [40, 162, 7], [90, 213, 4], [213, 95, 6], [64, 65, 3]]) ellipse(c, x, y, r, r);
  }],
  ['jellyfish-drift', 'Jellyfish Drift', 'Little umbrella bells trailing soft tendrils', 340, (c, a) => {
    for (const [x, y] of [[60, 45], [180, 165]]) { c.beginPath(); c.arc(x, y, 29, Math.PI, TAU); c.quadraticCurveTo(x, y + 14, x - 29, y); c.fill(); c.strokeStyle = a; for (const d of [-14, 0, 14]) curve(c, t => [x + d + 4 * Math.sin(t / 45 * TAU), y + t], 7, 48); c.strokeStyle = c.fillStyle; }
  }],
  ['ripple-diamonds', 'Ripple Diamonds', 'Nested softened diamonds like water reflections', 300, (c, a) => {
    for (const [x, y] of [[60, 60], [180, 180]]) for (let r = 12; r < 55; r += 12) { c.strokeStyle = r % 24 === 0 ? a : c.fillStyle; c.beginPath(); c.moveTo(x, y - r); c.quadraticCurveTo(x + 8, y - 8, x + r, y); c.quadraticCurveTo(x + 8, y + 8, x, y + r); c.quadraticCurveTo(x - 8, y + 8, x - r, y); c.quadraticCurveTo(x - 8, y - 8, x, y - r); c.stroke(); }
  }],
  ['knot-garden', 'Knot Garden', 'Open figure-eight loops and quiet center beads', 300, (c, a) => {
    for (const [x, y] of [[60, 60], [180, 180]]) { curve(c, t => { const a = t / 240 * TAU; return [x + 44 * Math.sin(a), y + 24 * Math.sin(2 * a)]; }); c.fillStyle = a; ellipse(c, x, y, 4, 4); }
  }],
  ['feather-falls', 'Feather Falls', 'Fine curved feather vanes with open spines', 340, (c, a) => {
    for (const [x, y] of [[55, 20], [175, 140]]) { c.strokeStyle = c.fillStyle; c.beginPath(); c.moveTo(x - 8, y + 90); c.quadraticCurveTo(x + 15, y + 45, x, y); c.stroke(); for (let i = 0; i < 6; i++) for (const d of [-1, 1]) { c.strokeStyle = d < 0 ? c.fillStyle : a; c.beginPath(); c.moveTo(x + 4, y + 12 + i * 11); c.quadraticCurveTo(x + d * 28, y + i * 11, x + d * 18, y + i * 11 - 5); c.stroke(); } }
  }],
  ['oyster-shells', 'Oyster Shells', 'Asymmetric shell outlines with radiating ribs', 330, (c, a) => {
    for (const [x, y] of [[60, 65], [180, 185]]) { c.strokeStyle = c.fillStyle; c.beginPath(); c.moveTo(x, y + 30); c.bezierCurveTo(x - 75, y + 7, x - 30, y - 60, x, y - 44); c.bezierCurveTo(x + 45, y - 60, x + 69, y + 13, x, y + 30); c.stroke(); c.strokeStyle = a; for (const d of [-26, -13, 0, 13, 26]) { c.beginPath(); c.moveTo(x, y + 25); c.quadraticCurveTo(x + d * 1.5, y - 4, x + d, y - 34); c.stroke(); } }
  }],
  ['wind-combs', 'Wind Combs', 'Bundles of short sweeping wind strokes', 300, (c, a) => {
    for (const [x, y] of [[30, 40], [150, 160]]) for (let i = 0; i < 5; i++) { c.strokeStyle = i % 2 ? a : c.fillStyle; c.beginPath(); c.moveTo(x, y + i * 9); c.bezierCurveTo(x + 20, y + i * 9 - 24, x + 55, y + i * 9 + 18, x + 78, y + i * 9 - 3); c.stroke(); }
  }],
  ['coral-branches', 'Coral Branches', 'Rounded branching coral sprigs', 320, (c, a) => {
    c.lineWidth = 4; for (const [x, y] of [[60, 35], [180, 155]]) { path(c, [[x, y + 65], [x, y - 6]]); c.stroke(); for (const [d, h] of [[-1, 10], [1, 28], [-1, 44]]) { c.beginPath(); c.moveTo(x, y + h + 10); c.quadraticCurveTo(x + d * 27, y + h + 15, x + d * 25, y + h - 16); c.stroke(); c.fillStyle = a; ellipse(c, x + d * 25, y + h - 16, 5, 5); } }
  }],
  ['almond-current', 'Almond Current', 'Long curving almond shapes in offset pairs', 280, (c, a) => {
    for (const [x, y, d] of [[50, 60, 1], [175, 180, -1]]) { c.save(); c.translate(x, y); c.rotate(d * .65); c.beginPath(); c.moveTo(0, -48); c.bezierCurveTo(40, -15, 40, 15, 0, 48); c.bezierCurveTo(-13, 10, -13, -10, 0, -48); c.fill(); c.strokeStyle = a; c.beginPath(); c.moveTo(0, -30); c.quadraticCurveTo(19, 0, 0, 30); c.stroke(); c.restore(); }
  }],
  ['crescent-contours', 'Crescent Contours', 'Nested open horseshoe contours', 300, (c, a) => {
    for (const [x, y] of [[60, 60], [180, 180]]) for (let r = 15; r <= 48; r += 11) { c.strokeStyle = r < 30 ? a : c.fillStyle; c.beginPath(); c.arc(x, y, r, .2 * Math.PI, 1.8 * Math.PI); c.stroke(); }
  }],
  ['spring-coils', 'Spring Coils', 'Continuous loose coil ribbons', 340, (c, a) => {
    for (let y = 60; y < 240; y += 120) curve(c, t => [t + 15 * Math.sin(t / 60 * TAU), y + 24 * Math.cos(t / 60 * TAU)], -60, 300);
    c.fillStyle = a; for (const [x, y] of [[30, 120], [150, 0], [150, 240]]) ellipse(c, x, y, 4, 4);
  }],
];

export const organicPatterns = motifs.map(([id, name, description, tileSize, render], index) => {
  const [background, patternColor, patternAccent, ink] = palettes[index % palettes.length];
  return {
    id: `flow-${id}`, name, description, background, patternColor, patternAccent, ink, tileSize,
    draw(ctx, { color = patternColor, accent = patternAccent } = {}) {
      ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2.6;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      render(ctx, accent); ctx.restore();
    },
  };
});
