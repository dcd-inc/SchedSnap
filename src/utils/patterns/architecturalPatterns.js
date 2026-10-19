// Original architectural and textile geometry, repeated on a 240-unit square.
const TAU = Math.PI * 2;
const path = (c, points, fill = false) => {
  c.beginPath(); points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
  if (fill) { c.closePath(); c.fill(); } else c.stroke();
};
const dot = (c, x, y, r) => { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); };
const ring = (c, x, y, r) => { c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke(); };
const grid = (c, step, fn) => {
  for (let y = 0; y < 240; y += step) for (let x = 0; x < 240; x += step) {
    c.save(); c.translate(x, y); fn(c, x / step, y / step); c.restore();
  }
};
const trace = (c, fn, n = 120) => path(c, Array.from({ length: n + 1 }, (_, i) => fn(i / n)));
const palettes = [
  ['#faf0e5', '#c99c84', '#d8bc73', '#513629'],
  ['#edf3ec', '#8bac9a', '#c8b291', '#294b43'],
  ['#eaf0ff', '#2c54bb', '#ea8b35', '#26395c'],
  ['#f8edf3', '#bd93b0', '#d5b98b', '#55364a'],
  ['#fff1c9', '#c47e1f', '#238b96', '#4a381c'],
  ['#f2f3ee', '#9cadaa', '#c1a28b', '#344247'],
  ['#fff0e9', '#db998a', '#97acca', '#5c3b35'],
];

const motifs = [
  ['meander', 'Meander Gallery', 'Continuous Greek-key square fretwork with inset accent bars', 320, (c, a) => {
    c.lineWidth = 7;
    for (const y of [12, 132]) path(c, [[0, y], [102, y], [102, y + 78], [24, y + 78], [24, y + 24], [78, y + 24], [78, y + 54], [54, y + 54]]);
    c.strokeStyle = a; for (const y of [12, 132]) path(c, [[120, y + 108], [222, y + 108], [222, y + 30], [144, y + 30], [144, y + 84], [198, y + 84]]);
  }],
  ['quatrefoil', 'Courtyard Trellis', 'Connected four-lobed quatrefoil outlines and diamond joins', 320, (c, a) => grid(c, 120, () => {
    c.beginPath(); c.moveTo(60, 18); c.bezierCurveTo(90, -5, 125, 30, 102, 60); c.bezierCurveTo(125, 90, 90, 125, 60, 102); c.bezierCurveTo(30, 125, -5, 90, 18, 60); c.bezierCurveTo(-5, 30, 30, -5, 60, 18); c.stroke();
    c.fillStyle = a; path(c, [[60, 49], [71, 60], [60, 71], [49, 60]], true);
  })],
  ['octagon', 'Octagon Courtyard', 'Clipped-corner octagonal floor tiles with square corner inserts', 300, (c, a) => grid(c, 120, () => {
    path(c, [[34, 5], [86, 5], [115, 34], [115, 86], [86, 115], [34, 115], [5, 86], [5, 34], [34, 5]]);
    c.fillStyle = a; path(c, [[0, -19], [19, 0], [0, 19], [-19, 0]], true); c.fillRect(51, 51, 18, 18);
  })],
  ['guilloche', 'Security Silk', 'Fine guilloche spirograph medallions with contrasting orbital threads', 380, (c, a) => grid(c, 120, () => {
    c.lineWidth = 1.4;
    for (let j = 0; j < 2; j++) { c.strokeStyle = j ? a : c.fillStyle; trace(c, t => { const q = t * TAU; return [60 + (35 + 12 * Math.cos(8 * q + j * Math.PI)) * Math.cos(q), 60 + (35 + 12 * Math.cos(8 * q + j * Math.PI)) * Math.sin(q)]; }, 240); }
  })],
  ['optic-lens', 'Optic Lens', 'Vertical op-art threads squeezed into repeating optical lenses', 340, (c, a) => {
    c.lineWidth = 2.5; for (let x = 0; x < 240; x += 10) { c.strokeStyle = x % 30 ? c.fillStyle : a; trace(c, t => [x + 8 * Math.sin(x / 240 * TAU) * Math.sin(t * TAU), t * 240]); }
  }],
  ['shard-mosaic', 'Shard Assembly', 'Irregular angular mosaic facets fitted into asymmetric blocks', 350, (c, a) => grid(c, 120, () => {
    path(c, [[5, 5], [75, 5], [46, 47], [5, 75]], true); path(c, [[115, 38], [115, 115], [71, 91]], true);
    c.fillStyle = a; path(c, [[82, 5], [115, 5], [115, 30], [70, 78], [52, 48]], true); path(c, [[5, 84], [46, 55], [66, 94], [111, 115], [5, 115]], true);
  })],
  ['crosshatch', 'Tailor Chalk', 'Soft diagonal crosshatched rectangles arranged as cozy woven blocks', 320, (c, a) => grid(c, 60, (_, x, y) => {
    c.beginPath(); c.rect(5, 5, 50, 50); c.clip(); c.strokeStyle = (x + y) % 2 ? a : c.fillStyle;
    for (let i = -60; i <= 120; i += 9) { path(c, [[i, 0], [i + 60, 60]]); path(c, [[i, 0], [i - 60, 60]]); }
  })],
  ['houndstooth', 'Cocoa Houndstooth', 'Cozy broken textile checks with hooked four-prong corners', 320, (c, a) => grid(c, 60, (_, x, y) => {
    c.fillStyle = (x + y) % 2 ? a : c.strokeStyle;
    path(c, [[0, 15], [15, 0], [30, 0], [30, 15], [45, 0], [60, 0], [45, 15], [45, 30], [60, 30], [60, 45], [45, 60], [30, 60], [30, 45], [15, 60], [0, 60], [15, 45], [15, 30], [0, 30]], true);
  })],
  ['argyle', 'Sunday Argyle', 'Large alternating harlequin diamonds crossed by dashed diagonal stitching', 340, (c, a) => {
    for (const [x, y] of [[60, 60], [180, 180]]) path(c, [[x, y - 58], [x + 58, y], [x, y + 58], [x - 58, y]], true);
    c.strokeStyle = a; c.lineWidth = 3; c.setLineDash([5, 5]);
    for (let k = -240; k <= 240; k += 120) { path(c, [[k, 0], [k + 240, 240]]); path(c, [[k, 240], [k + 240, 0]]); }
  }],
  ['dentil', 'Dentil Cornice', 'Decorative cornice bands with hanging dentil teeth and double rules', 300, (c, a) => {
    for (let y = 20; y < 240; y += 80) { c.fillRect(0, y, 240, 7); for (let x = 8; x < 240; x += 30) c.fillRect(x, y + 7, 16, 23); c.strokeStyle = a; path(c, [[0, y - 9], [240, y - 9]]); path(c, [[0, y + 43], [240, y + 43]]); }
  }],
  ['balusters', 'Balcony Hour', 'Turned architectural balusters standing between contrasting horizontal rails', 360, (c, a) => {
    for (let x = 20; x < 240; x += 60) { c.beginPath(); c.moveTo(x - 7, 24); c.lineTo(x + 7, 24); c.bezierCurveTo(x - 8, 58, x + 22, 66, x + 14, 88); c.bezierCurveTo(x + 3, 103, x + 8, 105, x + 8, 116); c.lineTo(x - 8, 116); c.bezierCurveTo(x - 8, 105, x - 3, 103, x - 14, 88); c.bezierCurveTo(x - 22, 66, x + 8, 58, x - 7, 24); c.fill(); }
    c.fillStyle = a; for (const y of [14, 120, 154, 225]) c.fillRect(0, y, 240, 7);
    for (let x = 20; x < 240; x += 60) { c.fillRect(x - 5, 165, 10, 49); dot(c, x, 188, 12); }
  }],
  ['portcullis', 'Garden Gate', 'Crossed wrought-iron bars with alternating pointed spear tips', 300, (c, a) => {
    c.lineWidth = 4; for (let x = 20; x < 240; x += 40) { path(c, [[x, 0], [x, 240]]); c.fillStyle = a; for (const y of [30, 150]) path(c, [[x, y - 13], [x + 7, y], [x, y + 13], [x - 7, y]], true); }
    c.strokeStyle = a; for (const y of [65, 95, 185, 215]) path(c, [[0, y], [240, y]]);
  }],
  ['lancets', 'Abbey Tracery', 'Pointed twin lancet windows with a circular tracery opening', 380, (c, a) => grid(c, 120, () => {
    c.beginPath(); c.moveTo(20, 110); c.lineTo(20, 58); c.quadraticCurveTo(22, 25, 60, 6); c.quadraticCurveTo(98, 25, 100, 58); c.lineTo(100, 110); c.closePath(); c.stroke();
    c.strokeStyle = a; for (const x of [41, 79]) { c.beginPath(); c.moveTo(x - 13, 100); c.lineTo(x - 13, 66); c.quadraticCurveTo(x - 12, 51, x, 40); c.quadraticCurveTo(x + 12, 51, x + 13, 66); c.lineTo(x + 13, 100); c.stroke(); } ring(c, 60, 29, 10);
  })],
  ['fluting', 'Column Atelier', 'Fluted classical columns with tiered capitals and alternating accent channels', 400, (c, a) => grid(c, 120, () => {
    c.fillRect(24, 13, 72, 7); c.fillRect(31, 25, 58, 7); c.fillRect(28, 103, 64, 7);
    for (let x = 39; x <= 81; x += 14) { c.strokeStyle = x === 53 ? a : c.fillStyle; path(c, [[x, 38], [x, 95]]); } c.strokeStyle = a; path(c, [[16, 117], [104, 117]]);
  })],
  ['ashlar', 'Ashlar Morning', 'Offset rows of irregular cut-stone polygons with small accent keystones', 300, (c, a) => {
    for (let y = 0; y < 240; y += 60) for (let x = -120; x < 240; x += 120) { const d = y % 120 ? 60 : 0; c.fillStyle = (x + y) % 120 ? a : c.strokeStyle; path(c, [[x + d + 4, y + 8], [x + d + 97, y + 4], [x + d + 115, y + 19], [x + d + 107, y + 53], [x + d + 12, y + 56]], true); }
  }],
  ['brick-bond', 'Flemish Bond', 'Alternating long brick stretchers and square colored headers with mortar gaps', 300, (c, a) => {
    for (let y = 0; y < 240; y += 40) for (let x = -120; x < 240; x += 120) { const d = y % 80 ? 60 : 0; c.fillRect(x + d + 3, y + 3, 75, 34); c.fillStyle = a; c.fillRect(x + d + 84, y + 3, 33, 34); c.fillStyle = c.strokeStyle; }
  }],
  ['reed-screen', 'Reed Screen', 'Offset vertical reed bundles crossed by pairs of accent binding stitches', 280, (c, a) => grid(c, 80, (_, x, y) => {
    for (let i = 0; i < 5; i++) path(c, [[16 + i * 10, 2], [16 + i * 10, 78]]);
    c.strokeStyle = a; c.lineWidth = 4; for (const d of [0, 9]) path(c, [[8, 23 + d + ((x + y) % 2) * 20], [65, 32 + d + ((x + y) % 2) * 20]]);
  })],
  ['marquetry', 'Marquetry Hall', 'Inlaid wooden parquet tiles made from alternating diagonal trapezoids', 320, (c, a) => grid(c, 120, (_, x, y) => {
    c.translate(60, 60); c.rotate((x + y) % 2 * Math.PI / 2);
    for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? a : c.strokeStyle; path(c, [[-56 + i * 28, -56], [-32 + i * 28, -56], [56, 32 - i * 28], [56, 56 - i * 28]], true); }
  })],
  ['coffers', 'Coffer Ceiling', 'Recessed square coffers with diagonal corner braces and central accent panels', 360, (c, a) => grid(c, 120, () => {
    c.strokeRect(7, 7, 106, 106); c.strokeRect(25, 25, 70, 70);
    for (const [x, y] of [[7, 7], [113, 7], [113, 113], [7, 113]]) path(c, [[x, y], [x < 60 ? 25 : 95, y < 60 ? 25 : 95]]);
    c.fillStyle = a; c.fillRect(45, 45, 30, 30);
  })],
  ['ogee', 'Ogee Passage', 'Continuous pointed ogee lattice with central suspended lozenges', 330, (c, a) => grid(c, 120, () => {
    c.beginPath(); c.moveTo(60, 0); c.bezierCurveTo(60, 32, 0, 28, 0, 60); c.bezierCurveTo(0, 92, 60, 88, 60, 120); c.bezierCurveTo(60, 88, 120, 92, 120, 60); c.bezierCurveTo(120, 28, 60, 32, 60, 0); c.stroke();
    c.fillStyle = a; path(c, [[60, 38], [74, 60], [60, 82], [46, 60]], true);
  })],
  ['log-cabin', 'Cabin Quilt', 'Log-cabin quilt blocks built from winding rectangular fabric strips', 340, (c, a) => grid(c, 120, () => {
    c.fillRect(45, 45, 30, 30); c.fillRect(25, 25, 70, 14); c.fillRect(25, 25, 14, 70); c.fillRect(5, 5, 110, 14); c.fillRect(5, 5, 14, 110);
    c.fillStyle = a; c.fillRect(81, 45, 14, 50); c.fillRect(45, 81, 50, 14); c.fillRect(101, 25, 14, 90); c.fillRect(25, 101, 90, 14);
  })],
  ['tatami', 'Tatami Rooms', 'Alternating horizontal and vertical paired mat panels with fine reed interiors', 380, (c, a) => grid(c, 120, (_, x, y) => {
    c.translate(60, 60); if ((x + y) % 2) c.rotate(Math.PI / 2);
    c.strokeRect(-54, -54, 108, 50); c.strokeRect(-54, 4, 108, 50); c.strokeStyle = a;
    for (let y = -46; y <= 48; y += 8) if (Math.abs(y) > 7) path(c, [[-45, y], [45, y]]);
  })],
  ['quilting', 'Padded Diamonds', 'Soft diagonal quilt seams interrupted by little four-stitch buttons', 360, (c, a) => {
    for (let k = -240; k <= 240; k += 80) { path(c, [[k, 0], [k + 240, 240]]); path(c, [[k, 240], [k + 240, 0]]); }
    c.strokeStyle = a; c.lineWidth = 4; grid(c, 80, () => { path(c, [[-8, -8], [8, 8]]); path(c, [[8, -8], [-8, 8]]); });
  }],
  ['accordion', 'Folded Concertina', 'Asymmetric accordion pleats with alternating broad and slender facets', 300, (c, a) => {
    for (let x = 0; x < 240; x += 60) { path(c, [[x, 0], [x + 33, 24], [x + 33, 240], [x, 216]], true); c.fillStyle = a; path(c, [[x + 39, 24], [x + 54, 0], [x + 54, 216], [x + 39, 240]], true); c.fillStyle = c.strokeStyle; }
  }],
  ['feather-weave', 'Chevron Loom', 'Stepped interleaved diagonal parallelograms arranged as a textile feather', 280, (c, a) => grid(c, 120, () => {
    for (let y = -30; y < 150; y += 30) { path(c, [[5, y], [55, y + 28], [55, y + 49], [5, y + 21]], true); c.fillStyle = a; path(c, [[65, y + 28], [115, y], [115, y + 21], [65, y + 49]], true); c.fillStyle = c.strokeStyle; }
  })],
  ['curtain', 'Beaded Doorway', 'Hanging chains of alternating faceted beads and short cylindrical spacers', 300, (c, a) => {
    for (let x = 30; x < 240; x += 60) { path(c, [[x, 0], [x, 240]]); for (let y = 20; y < 240; y += 80) { path(c, [[x, y - 12], [x + 12, y], [x, y + 12], [x - 12, y]], true); c.fillStyle = a; c.fillRect(x - 5, y + 30, 10, 19); c.fillStyle = c.strokeStyle; } }
  }],
  ['reeded-glass', 'Reeded Glass', 'Closely spaced vertical bands with alternating semicircular optical offsets', 360, (c, a) => {
    for (let x = 0; x < 240; x += 20) { c.fillRect(x + 2, 0, 4, 240); c.strokeStyle = a; trace(c, t => [x + 12 + 4 * Math.cos(t * TAU * 2), t * 240]); }
  }],
  ['rose-window', 'Rose Compass', 'Circular stained-glass tracery split into radial panes and a contrasting inner wheel', 400, (c, a) => grid(c, 120, () => {
    c.lineWidth = 2.5; ring(c, 60, 60, 51); ring(c, 60, 60, 43);
    for (let i = 0; i < 12; i++) { const q = i * TAU / 12; path(c, [[60 + 22 * Math.cos(q), 60 + 22 * Math.sin(q)], [60 + 43 * Math.cos(q), 60 + 43 * Math.sin(q)]]); }
    c.strokeStyle = a; ring(c, 60, 60, 22); for (let i = 0; i < 6; i++) { const q = i * TAU / 6; ring(c, 60 + 13 * Math.cos(q), 60 + 13 * Math.sin(q), 8); }
  })],
  ['optic-check', 'Checker Tunnel', 'Alternating checker rectangles compressed toward two optical vanishing bands', 340, (c, a) => {
    const edges = [0, 10, 24, 44, 76, 120, 164, 196, 216, 230, 240];
    for (let y = 0; y < 12; y++) for (let x = 0; x < edges.length - 1; x++) { c.fillStyle = (x + y) % 2 ? a : c.strokeStyle; c.fillRect(edges[x] + 1, y * 20 + 1, edges[x + 1] - edges[x] - 2, 18); }
  }],
  ['zipper', 'Zip Stitch', 'Alternating zipper teeth interlocked along paired fine tracks', 280, (c, a) => {
    for (const x of [60, 180]) { path(c, [[x - 17, 0], [x - 17, 240]]); path(c, [[x + 17, 0], [x + 17, 240]]); for (let y = 4; y < 240; y += 24) { c.fillRect(x - 13, y, 23, 8); c.fillStyle = a; c.fillRect(x - 10, y + 12, 23, 8); c.fillStyle = c.strokeStyle; } }
  }],
  ['basket-stars', 'Caned Octets', 'Diagonal cane-screen octagons joined by contrasting short corner bars', 320, (c, a) => grid(c, 80, () => {
    path(c, [[23, 5], [57, 5], [75, 23], [75, 57], [57, 75], [23, 75], [5, 57], [5, 23], [23, 5]]);
    c.strokeStyle = a; c.lineWidth = 5; path(c, [[0, 0], [23, 23]]); path(c, [[80, 0], [57, 23]]); path(c, [[0, 80], [23, 57]]); path(c, [[80, 80], [57, 57]]);
  })],
  ['deco-wings', 'Deco Wings', 'Symmetrical angular wing friezes with nested horizontal feather bars', 360, (c, a) => grid(c, 120, () => {
    for (let i = 0; i < 5; i++) { const y = 20 + i * 16; path(c, [[8 + i * 7, y], [60, y + 20], [112 - i * 7, y]]); }
    c.fillStyle = a; path(c, [[60, 26], [69, 43], [60, 60], [51, 43]], true);
  })],
  ['arc-blocks', 'Keystone Vaults', 'Wedge-cut arch stones forming segmented masonry vaults', 380, (c, a) => grid(c, 120, () => {
    for (let i = 0; i < 7; i++) { const q = Math.PI + i * Math.PI / 7; c.fillStyle = i === 3 ? a : c.strokeStyle; c.beginPath(); c.arc(60, 88, 51, q + .025, q + Math.PI / 7 - .025); c.arc(60, 88, 31, q + Math.PI / 7 - .025, q + .025, true); c.closePath(); c.fill(); }
    c.fillRect(9, 94, 20, 20); c.fillRect(91, 94, 20, 20);
  })],
  ['bowed-grid', 'Elastic Net', 'Alternating inward and outward bowed square cells with inset accent seams', 300, (c, a) => grid(c, 120, () => {
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(60, 35, 120, 0); c.quadraticCurveTo(85, 60, 120, 120); c.quadraticCurveTo(60, 85, 0, 120); c.quadraticCurveTo(35, 60, 0, 0); c.stroke();
    c.strokeStyle = a; c.beginPath(); c.moveTo(35, 35); c.quadraticCurveTo(60, 48, 85, 35); c.quadraticCurveTo(72, 60, 85, 85); c.quadraticCurveTo(60, 72, 35, 85); c.quadraticCurveTo(48, 60, 35, 35); c.stroke();
  })],
  ['twill', 'Blanket Twill', 'Cozy stepped diagonal textile floats alternating with tiny perpendicular warp threads', 340, (c, a) => grid(c, 30, (_, x, y) => {
    if ((x + y) % 4 < 2) c.fillRect(2, 3, 26, 12);
    else { c.fillStyle = a; c.fillRect(4, 3, 5, 24); c.fillRect(16, 3, 5, 24); }
  })],
];

export const architecturalPatterns = motifs.map(([id, name, description, tileSize, render], index) => {
  const [background, patternColor, patternAccent, ink] = palettes[index % palettes.length];
  return {
    id: `arch-${id}`, name, description, background, patternColor, patternAccent, ink, tileSize,
    draw(ctx, { color = patternColor, accent = patternAccent } = {}) {
      ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color;
      ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      // Neighbor copies preserve every stroke or facet that crosses a tile edge.
      for (const dx of [-240, 0, 240]) for (const dy of [-240, 0, 240]) {
        ctx.save(); ctx.translate(dx, dy); render(ctx, accent); ctx.restore();
      }
      ctx.restore();
    },
  };
});
