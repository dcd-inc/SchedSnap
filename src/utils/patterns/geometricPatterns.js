const TAU = Math.PI * 2;
const circle = (c, x, y, r, fill = true) => { c.beginPath(); c.arc(x, y, r, 0, TAU); fill ? c.fill() : c.stroke(); };
const polygon = (c, points, fill = true) => { c.beginPath(); points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); fill ? c.fill() : c.stroke(); };
const line = (c, points) => { c.beginPath(); points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); };
const arc = (c, x, y, r, a, b) => { c.beginPath(); c.arc(x, y, r, a, b); c.stroke(); };
const grid = (c, step, fn) => { for (let y = 0; y < 240; y += step) for (let x = 0; x < 240; x += step) { c.save(); c.translate(x, y); fn(c, x / step, y / step); c.restore(); } };
const palette = [
  ['#f8eadb', '#c4876c', '#e5b74d', '#543b31'],
  ['#eaf0e5', '#7e9b78', '#bfaa75', '#354b3d'],
  ['#e9efff', '#2854b8', '#ee7359', '#21335e'],
  ['#f6eaf2', '#b58fac', '#d6ae76', '#563c54'],
  ['#fff1c7', '#c57920', '#178d87', '#4a351d'],
];

const motifs = [
  ['arcade', 'Apricot Arcade', 'Paired architectural arches with inset doorways', 300, (c, a) => grid(c, 120, () => { c.lineWidth = 15; arc(c, 60, 69, 39, Math.PI, TAU); line(c, [[21, 69], [21, 110]]); line(c, [[99, 69], [99, 110]]); c.strokeStyle = a; c.lineWidth = 5; arc(c, 60, 69, 19, Math.PI, TAU); line(c, [[41, 69], [41, 110]]); line(c, [[79, 69], [79, 110]]); })],
  ['fan-fold', 'Fan Fold', 'Layered quarter-circle fans in alternating corners', 320, (c, a) => grid(c, 120, (_, x, y) => { if ((x + y) % 2) { c.translate(120, 120); c.rotate(Math.PI); } c.lineWidth = 8; [20, 40, 60, 80, 100].forEach((r, i) => { c.strokeStyle = i % 2 ? a : c.fillStyle; arc(c, 0, 0, r, 0, Math.PI / 2); }); })],
  ['truchet', 'Ribbon Junction', 'Continuous corner turns forming wandering ribbon paths', 260, (c, a) => grid(c, 120, (_, x, y) => { if ((x + y) % 2) { c.translate(120, 0); c.rotate(Math.PI / 2); } c.lineWidth = 14; arc(c, 0, 0, 60, 0, Math.PI / 2); c.strokeStyle = a; arc(c, 120, 120, 60, Math.PI, Math.PI * 1.5); })],
  ['links', 'Loop Letters', 'Interlocked oval outlines and tiny joining beads', 300, (c, a) => grid(c, 120, () => { c.lineWidth = 7; c.beginPath(); c.ellipse(60, 60, 48, 26, -Math.PI / 4, 0, TAU); c.stroke(); c.strokeStyle = a; c.beginPath(); c.ellipse(60, 60, 48, 26, Math.PI / 4, 0, TAU); c.stroke(); })],
  ['bauhaus', 'Pocket Bauhaus', 'Asymmetric circles, corner blocks and small accent bars', 350, (c, a) => grid(c, 120, (_, x, y) => { c.translate(60, 60); c.rotate((x + y * 2) * Math.PI / 2); c.fillRect(-48, -48, 46, 46); circle(c, 23, 23, 25); c.fillStyle = a; c.fillRect(5, -44, 39, 12); c.fillRect(-44, 7, 12, 36); })],
  ['pinwheel', 'Sorbet Pinwheels', 'Four curved blades spinning around open centers', 300, (c, a) => grid(c, 120, () => { c.translate(60, 60); for (let i = 0; i < 4; i++) { c.rotate(Math.PI / 2); c.fillStyle = i % 2 ? a : c.strokeStyle; c.beginPath(); c.moveTo(4, 4); c.bezierCurveTo(50, 0, 54, 18, 44, 44); c.closePath(); c.fill(); } })],
  ['terraces', 'Sunset Terraces', 'Nested stepped pyramids with a contrasting cap', 320, (c, a) => grid(c, 120, () => { c.lineWidth = 5; for (let i = 0; i < 4; i++) { const d = i * 12; line(c, [[10 + d, 105], [10 + d, 78 - d], [36 + d, 78 - d], [36 + d, 26 - d], [84 - d, 26 - d], [84 - d, 78 - d], [110 - d, 78 - d], [110 - d, 105]]); } c.fillStyle = a; circle(c, 60, 15, 5); })],
  ['capsules', 'Capsule Parade', 'Staggered diagonal pill shapes with split color tips', 270, (c, a) => grid(c, 120, (_, x, y) => { c.translate(60, 60); c.rotate((x + y) % 2 ? -Math.PI / 4 : Math.PI / 4); c.lineCap = 'round'; c.lineWidth = 24; line(c, [[-30, 0], [30, 0]]); c.strokeStyle = a; line(c, [[10, 0], [30, 0]]); })],
  ['basket', 'Sunday Basket', 'Over-under bundles of short woven strips', 240, (c, a) => grid(c, 60, (_, x, y) => { c.translate(30, 30); if ((x + y) % 2) { c.rotate(Math.PI / 2); c.fillStyle = a; } [-16, -4, 8].forEach(v => c.fillRect(-24, v, 48, 7)); })],
  ['kite', 'Kite Market', 'Tall folded kites with fine tails and small companions', 320, (c, a) => grid(c, 120, () => { polygon(c, [[60, 10], [90, 50], [60, 90], [30, 50]]); c.fillStyle = a; polygon(c, [[60, 10], [90, 50], [60, 50]]); c.lineWidth = 2; line(c, [[60, 90], [66, 100], [60, 112]]); circle(c, 105, 100, 6); })],
  ['scallop', 'Scallop Studio', 'Overlapping shell scales with fine interior ribs', 260, (c, a) => { c.lineWidth = 4; for (let y = 0; y <= 240; y += 60) for (let x = -60; x <= 240; x += 120) { const cx = x + (y % 120 ? 60 : 0); c.strokeStyle = y % 120 ? a : c.fillStyle; [28, 40, 52].forEach(r => arc(c, cx, y, r, Math.PI, TAU)); } }],
  ['hourglass', 'Hourglass Garden', 'Paired bow-tie silhouettes with floating center dots', 280, (c, a) => grid(c, 120, () => { polygon(c, [[15, 15], [105, 15], [60, 53]]); c.fillStyle = a; polygon(c, [[15, 105], [105, 105], [60, 67]]); circle(c, 60, 60, 4); })],
  ['cubes', 'Paper Cubes', 'Open isometric boxes with one softly colored face', 330, (c, a) => grid(c, 120, () => { c.lineWidth = 3; polygon(c, [[60, 13], [103, 38], [60, 63], [17, 38]], false); c.fillStyle = a; polygon(c, [[60, 63], [103, 38], [103, 88], [60, 113]]); line(c, [[17, 38], [17, 88], [60, 113], [60, 63]]); })],
  ['sunburst', 'Daybreak Medallions', 'Delicate rays around offset solid sun centers', 360, (c, a) => grid(c, 120, () => { c.translate(60, 60); c.lineWidth = 3; for (let i = 0; i < 16; i++) { c.rotate(TAU / 16); line(c, [[30, 0], [49, 0]]); } c.fillStyle = a; circle(c, 0, 0, 19); })],
  ['stairwave', 'Staircase Current', 'Parallel angular ribbons climbing across the tile', 260, (c, a) => { c.lineWidth = 7; for (let y = -240; y < 480; y += 30) { c.strokeStyle = y % 60 ? a : c.fillStyle; line(c, [[0, y], [60, y], [60, y - 60], [120, y - 60], [120, y - 120], [180, y - 120], [180, y - 180], [240, y - 180]]); } }],
  ['rosette', 'Tile Rosettes', 'Eight-petal geometric flowers and contrasting seed dots', 320, (c, a) => grid(c, 120, () => { c.translate(60, 60); for (let i = 0; i < 8; i++) { c.rotate(TAU / 8); polygon(c, [[10, 0], [33, -10], [48, 0], [33, 10]]); } c.fillStyle = a; circle(c, 0, 0, 6); })],
  ['brackets', 'Bracket Club', 'Alternating oversized brackets with quiet round accents', 300, (c, a) => grid(c, 120, (_, x, y) => { c.translate(60, 60); c.rotate((x + y) % 2 * Math.PI / 2); c.lineWidth = 8; line(c, [[-15, -40], [-40, -40], [-40, 40], [-15, 40]]); line(c, [[15, -40], [40, -40], [40, 40], [15, 40]]); c.fillStyle = a; circle(c, 0, 0, 10); })],
  ['checker-arc', 'Curved Chess', 'Checkerboard squares paired with inset quarter circles', 260, (c, a) => grid(c, 60, (_, x, y) => { if ((x + y) % 2) c.fillRect(0, 0, 60, 60); else { c.fillStyle = a; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 48, 0, Math.PI / 2); c.closePath(); c.fill(); } })],
  ['deco', 'Deco Lanterns', 'Tiered angular lantern outlines with suspended beads', 350, (c, a) => grid(c, 120, () => { c.lineWidth = 3; [0, 12, 24].forEach(d => polygon(c, [[60, 8 + d], [108 - d, 60], [60, 112 - d], [12 + d, 60]], false)); c.fillStyle = a; circle(c, 60, 60, 5); })],
  ['orbit', 'Orbital Notes', 'Tilted elliptical orbits with two small satellites', 380, (c, a) => grid(c, 120, () => { c.lineWidth = 3; c.beginPath(); c.ellipse(60, 60, 53, 22, -Math.PI / 4, 0, TAU); c.stroke(); c.fillStyle = a; circle(c, 60, 60, 14); circle(c, 23, 97, 6); circle(c, 97, 23, 4); })],
  ['chevron', 'Folded Herringbone', 'Disconnected chevron ribbons with alternating colored folds', 260, (c, a) => grid(c, 60, (_, x, y) => { c.fillStyle = (x + y) % 2 ? a : c.strokeStyle; polygon(c, [[4, 8], [30, 28], [56, 8], [56, 27], [30, 47], [4, 27]]); })],
  ['portholes', 'Porthole Post', 'Off-center rings interrupted by neat accent tabs', 320, (c, a) => grid(c, 120, () => { c.lineWidth = 9; arc(c, 60, 60, 37, 0.25, TAU - 0.25); c.fillStyle = a; c.fillRect(87, 54, 24, 12); circle(c, 50, 60, 7); })],
  ['tangram', 'Tangram Picnic', 'A tiny arrangement of triangles, a square and a slanted tile', 350, (c, a) => grid(c, 120, () => { polygon(c, [[12, 12], [63, 12], [12, 63]]); polygon(c, [[70, 18], [108, 56], [70, 56]]); c.fillStyle = a; polygon(c, [[18, 74], [45, 101], [72, 74], [45, 47]]); polygon(c, [[80, 69], [108, 69], [95, 108], [67, 108]]); })],
  ['cross-tile', 'Soft Cross Tiles', 'Broad plus signs surrounded by diamond punctuation', 280, (c, a) => grid(c, 120, () => { polygon(c, [[43, 18], [77, 18], [77, 43], [102, 43], [102, 77], [77, 77], [77, 102], [43, 102], [43, 77], [18, 77], [18, 43], [43, 43]]); c.fillStyle = a; polygon(c, [[0, -9], [9, 0], [0, 9], [-9, 0]]); })],
  ['window', 'Window Seats', 'Four-pane rounded windows with one contrasting pane', 330, (c, a) => grid(c, 120, () => { c.lineWidth = 4; c.strokeRect(20, 16, 80, 88); line(c, [[60, 16], [60, 104]]); line(c, [[20, 60], [100, 60]]); c.fillStyle = a; c.fillRect(66, 66, 28, 32); })],
  ['windmill', 'Windmill Paper', 'Four crisp triangular sails around tiny square hubs', 300, (c, a) => grid(c, 120, () => { c.translate(60, 60); for (let i = 0; i < 4; i++) { c.rotate(Math.PI / 2); c.fillStyle = i % 2 ? a : c.strokeStyle; polygon(c, [[6, -6], [46, -46], [46, -6]]); } c.fillRect(-4, -4, 8, 8); })],
  ['hex-nest', 'Honeycomb Keepsakes', 'Nested hexagonal medallions with off-center color chips', 360, (c, a) => grid(c, 120, () => { c.lineWidth = 3; [28, 48].forEach(r => polygon(c, Array.from({ length: 6 }, (_, i) => [60 + r * Math.cos(i * TAU / 6), 60 + r * Math.sin(i * TAU / 6)]), false)); c.fillStyle = a; circle(c, 60, 60, 8); })],
  ['umbrellas', 'Umbrella Afternoon', 'Striped half-disc canopies with fine hooked handles', 350, (c, a) => grid(c, 120, () => { c.beginPath(); c.arc(60, 61, 43, Math.PI, TAU); c.closePath(); c.fill(); c.fillStyle = a; c.beginPath(); c.ellipse(60, 61, 18, 43, 0, Math.PI, TAU); c.closePath(); c.fill(); c.lineWidth = 3; line(c, [[60, 64], [60, 92]]); arc(c, 52, 92, 8, 0, Math.PI); })],
  ['rays', 'Corner Frequency', 'Straight radiating beams converging in alternating corners', 320, (c, a) => grid(c, 120, (_, x, y) => { if ((x + y) % 2) { c.translate(120, 120); c.rotate(Math.PI); } c.lineWidth = 3; for (let i = 0; i <= 5; i++) { c.strokeStyle = i % 2 ? a : c.fillStyle; line(c, [[10, 10], [110, 10 + i * 20]]); line(c, [[10, 10], [10 + i * 20, 110]]); } })],
  ['pearls', 'Pearl Abacus', 'Horizontal bead rows with alternating elongated spacers', 280, (c, a) => grid(c, 120, () => { c.lineWidth = 2; [30, 90].forEach(y => line(c, [[0, y], [120, y]])); circle(c, 30, 30, 13); circle(c, 90, 90, 13); c.fillStyle = a; c.fillRect(73, 20, 34, 20); c.fillRect(13, 80, 34, 20); })],
  ['maze', 'Little Labyrinth', 'Square spiral paths surrounding accent centers', 300, (c, a) => grid(c, 120, () => { c.lineWidth = 5; line(c, [[108, 108], [12, 108], [12, 12], [108, 12], [108, 86], [34, 86], [34, 34], [86, 34], [86, 64], [56, 64]]); c.fillStyle = a; circle(c, 56, 64, 5); })],
  ['moon-phase', 'Moonphase Tiles', 'Solid crescents paired with thin outlined full moons', 320, (c, a) => grid(c, 120, () => { c.beginPath(); c.arc(57, 60, 42, Math.PI / 2, Math.PI * 1.5); c.bezierCurveTo(35, 35, 35, 85, 57, 102); c.fill(); c.strokeStyle = a; c.lineWidth = 3; circle(c, 87, 60, 18, false); })],
  ['diamonds', 'Diamond Ribbons', 'Slender faceted diamonds joined by tiny square studs', 300, (c, a) => grid(c, 120, () => { polygon(c, [[60, 8], [84, 60], [60, 112], [36, 60]]); c.fillStyle = a; polygon(c, [[60, 8], [84, 60], [60, 60]]); c.fillRect(8, 54, 12, 12); c.fillRect(100, 54, 12, 12); })],
  ['totems', 'Totem Stack', 'Balanced circles, triangles and platforms in small towers', 380, (c, a) => grid(c, 120, () => { circle(c, 60, 29, 17); polygon(c, [[60, 53], [88, 88], [32, 88]]); c.fillStyle = a; c.fillRect(24, 96, 72, 11); c.fillRect(43, 55, 34, 5); })],
  ['ripple-square', 'Square Echoes', 'Alternating rounded-line square ripples with central dashes', 300, (c, a) => grid(c, 120, (_, x, y) => { c.translate(60, 60); c.rotate((x + y) % 2 * Math.PI / 4); c.lineWidth = 3; [20, 37].forEach(r => c.strokeRect(-r, -r, r * 2, r * 2)); c.strokeStyle = a; c.lineWidth = 8; line(c, [[-8, 0], [8, 0]]); })],
];

export const geometricPatterns = motifs.map(([id, name, description, tileSize, draw], index) => {
  const [background, patternColor, patternAccent, ink] = palette[index % palette.length];
  return {
    id: `geo-${id}`, name, description, background, patternColor, patternAccent, ink, tileSize,
    draw(ctx, { color = patternColor, accent = patternAccent } = {}) {
      ctx.save();
      ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineJoin = 'round';
      // Neighbor copies preserve motifs that cross any edge of the logical tile.
      for (const x of [-240, 0, 240]) for (const y of [-240, 0, 240]) {
        ctx.save(); ctx.translate(x, y); draw(ctx, accent); ctx.restore();
      }
      ctx.restore();
    },
  };
});
