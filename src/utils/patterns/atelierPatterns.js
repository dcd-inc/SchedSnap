// Original printmaking, lace and inlay compositions; coordinates use a 240-unit repeat.
const TAU = Math.PI * 2;
const line = (c, points, fill = false) => { c.beginPath(); points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); if (fill) { c.closePath(); c.fill(); } else c.stroke(); };
const oval = (c, x, y, rx, ry = rx, angle = 0, fill = false) => { c.beginPath(); c.ellipse(x, y, rx, ry, angle, 0, TAU); fill ? c.fill() : c.stroke(); };
const bend = (c, start, controls, fill = false) => { c.beginPath(); c.moveTo(...start); controls.forEach(p => c.bezierCurveTo(...p)); if (fill) { c.closePath(); c.fill(); } else c.stroke(); };
const grid = (c, step, draw) => { for (let y = 0; y < 240; y += step) for (let x = 0; x < 240; x += step) { c.save(); c.translate(x, y); draw(c, x / step, y / step); c.restore(); } };
const medallions = (c, draw) => { for (const [x, y] of [[60, 60], [180, 180]]) { c.save(); c.translate(x, y); draw(c); c.restore(); } };
const palettes = [
  ['#fcf1e5', '#bd9476', '#c6aa60', '#523d2e'],
  ['#edf3ed', '#83a294', '#c0aa81', '#334d41'],
  ['#eef0fb', '#6b86c2', '#c59c86', '#354365'],
  ['#faebf0', '#b9829c', '#b5ac79', '#563b4a'],
  ['#fff3d8', '#c29b45', '#6c9fa0', '#544627'],
  ['#f0ecf7', '#a08aba', '#c6ab8c', '#493b5e'],
  ['#edf4f6', '#739cae', '#b9b277', '#314d5a'],
];
const motifs = [
  ['paisley', 'Paisley Heirloom', 'Swept teardrop paisleys containing curved rows of pearl stitches', 420, (c, a) => medallions(c, () => {
    bend(c, [0, 46], [[-71, 19, -47, -48, -8, -33], [17, -22, 8, -58, 31, -52], [11, -24, 67, 23, 0, 46]]);
    c.strokeStyle = a; bend(c, [-2, 30], [[-40, 11, -34, -22, -11, -18], [5, -15, 13, -3, 11, 11]]);
    c.fillStyle = a; for (let i = 0; i < 7; i++) oval(c, -23 + 7 * i, 12 + 9 * Math.sin(i * .6), 2.4, 2.4, 0, true);
  })],
  ['hemp-stitch', 'Hemp Stitch', 'Sashiko six-rayed hemp-leaf diamonds with alternating stitched spokes', 380, (c, a) => grid(c, 120, () => {
    c.translate(60, 60); c.setLineDash([5, 4]);
    for (let i = 0; i < 6; i++) { c.save(); c.rotate(i * TAU / 6); line(c, [[0, 0], [51, 0], [25.5, 44], [0, 0]]); c.strokeStyle = a; line(c, [[0, 0], [38, 22]]); c.restore(); }
  })],
  ['shippo', 'Enamel Overlaps', 'Interlocking circular enamel lenses with little accent arcs at their junctions', 400, (c, a) => grid(c, 120, () => {
    oval(c, 0, 0, 60); oval(c, 60, 60, 60); c.strokeStyle = a;
    c.beginPath(); c.arc(60, 0, 18, 0, Math.PI); c.stroke(); c.beginPath(); c.arc(0, 60, 18, -Math.PI / 2, Math.PI / 2); c.stroke();
  })],
  ['standing-steam', 'Silk Hour', 'Paired bowed columns enclosing little floating horizontal stitch bars', 400, (c, a) => {
    for (let x = 0; x < 240; x += 80) { bend(c, [x + 20, 0], [[x - 20, 60, x + 60, 60, x + 20, 120], [x - 20, 180, x + 60, 180, x + 20, 240]]); bend(c, [x + 60, 0], [[x + 100, 60, x + 20, 60, x + 60, 120], [x + 100, 180, x + 20, 180, x + 60, 240]]); c.strokeStyle = a; for (const y of [25, 145]) line(c, [[x + 33, y], [x + 47, y]]); c.strokeStyle = c.fillStyle; }
  }],
  ['picot', 'Picot Ribbon', 'Airy lace bands with tiny looped picot edging and paired center beads', 380, (c, a) => {
    for (const y of [50, 170]) { line(c, [[0, y], [240, y]]); line(c, [[0, y + 22], [240, y + 22]]); for (let x = 15; x < 240; x += 30) { oval(c, x, y - 8, 6, 8); oval(c, x, y + 30, 6, 8); } c.fillStyle = a; for (let x = 15; x < 240; x += 30) { oval(c, x - 3, y + 11, 2.5, 2.5, 0, true); oval(c, x + 4, y + 11, 2.5, 2.5, 0, true); } c.fillStyle = c.strokeStyle; }
  }],
  ['eyelet', 'Eyelet Linen', 'Staggered embroidered eyelets with radial buttonhole stitches and little companion bars', 380, (c, a) => medallions(c, () => {
    oval(c, 0, 0, 18, 13); for (let i = 0; i < 16; i++) { const q = i * TAU / 16; line(c, [[20 * Math.cos(q), 15 * Math.sin(q)], [29 * Math.cos(q), 23 * Math.sin(q)]]); }
    c.strokeStyle = a; line(c, [[-9, 39], [9, 39]]); line(c, [[-9, -39], [9, -39]]);
  })],
  ['bobbin', 'Bobbin Lace', 'Braided bobbin-lace diamonds with tiny looped corners and contrasting cross ties', 400, (c, a) => medallions(c, () => {
    for (let i = 0; i < 4; i++) { c.save(); c.rotate(i * Math.PI / 2); bend(c, [0, -41], [[28, -48, 45, -26, 41, 0]]); oval(c, 0, -44, 5, 7); c.restore(); }
    c.strokeStyle = a; line(c, [[-24, -24], [24, 24]]); line(c, [[24, -24], [-24, 24]]);
  })],
  ['chain-stitch', 'Chain Stitch Lane', 'Offset stitched chains made from pointed overlapping loops and small tie marks', 400, (c, a) => {
    for (const x of [60, 180]) for (let y = 0; y < 240; y += 40) { bend(c, [x, y], [[x - 26, y + 13, x - 17, y + 37, x, y + 40], [x + 17, y + 37, x + 26, y + 13, x, y]]); c.strokeStyle = a; line(c, [[x - 4, y + 14], [x + 4, y + 14]]); c.strokeStyle = c.fillStyle; }
  }],
  ['feather-stitch', 'Feather Seam', 'Branching Y-shaped embroidery stitches alternating along upright seams', 380, (c, a) => {
    for (const x of [60, 180]) for (let y = 0; y < 240; y += 40) { line(c, [[x - 22, y + 5], [x, y + 25], [x, y + 40]]); c.strokeStyle = a; line(c, [[x + 22, y + 5], [x, y + 25]]); c.strokeStyle = c.fillStyle; }
  }],
  ['satin-fans', 'Satin Swatches', 'Alternating triangular satin-stitch bundles with contrasting edge tacks', 400, (c, a) => grid(c, 120, (_, x, y) => {
    c.translate(60, 60); c.rotate((x + y) % 2 ? Math.PI / 2 : 0); for (let i = -5; i <= 5; i++) line(c, [[i * 6, 30], [i * 6, -30 + Math.abs(i) * 9]]);
    c.strokeStyle = a; line(c, [[-34, 37], [34, 37]]); line(c, [[0, -39], [0, -30]]);
  })],
  ['french-knots', 'Knot Constellations', 'Triangular clusters of double-loop French knots with separate connecting stitches', 400, (c, a) => medallions(c, () => {
    for (const [x, y] of [[0, -25], [-23, 18], [23, 18]]) { oval(c, x - 3, y, 6, 4, .5); oval(c, x + 3, y, 6, 4, -.5); }
    c.strokeStyle = a; line(c, [[-10, -8], [-15, 2]]); line(c, [[10, -8], [15, 2]]); line(c, [[-6, 20], [6, 20]]);
  })],
  ['bead-ovals', 'Pearled Cartouches', 'Long ornamental cartouches lined with separate pearl beads and slender center inlays', 440, (c, a) => medallions(c, () => {
    oval(c, 0, 0, 27, 48); for (let i = 0; i < 20; i++) { const q = i * TAU / 20; oval(c, 36 * Math.cos(q), 57 * Math.sin(q), 2, 2, 0, true); }
    c.fillStyle = a; line(c, [[0, -23], [8, 0], [0, 23], [-8, 0]], true);
  })],
  ['lozenge-inlay', 'Ribbon Inlay', 'Interleaved hollow ribbon lozenges with alternating straight center bands', 420, (c, a) => grid(c, 120, () => {
    line(c, [[8, 60], [60, 18], [112, 60], [60, 102], [8, 60]]); line(c, [[27, 60], [60, 34], [93, 60], [60, 86], [27, 60]]);
    c.strokeStyle = a; c.lineWidth = 6; line(c, [[60, 44], [60, 76]]); line(c, [[0, 0], [18, 18]]);
  })],
  ['bargello', 'Bargello Steps', 'Needlepoint flame bands assembled from long stepped vertical stitches', 420, (c, a) => {
    for (let x = 0; x < 240; x += 12) { const d = Math.abs((x % 120) - 60) / 3; c.lineWidth = 7; line(c, [[x + 6, 20 + d], [x + 6, 71 + d]]); c.strokeStyle = a; line(c, [[x + 6, 132 - d], [x + 6, 182 - d]]); c.strokeStyle = c.fillStyle; }
  }],
  ['ikat-flames', 'Ikat Lantern', 'Feather-edged elongated ikat lantern silhouettes divided into contrasting halves', 420, (c, a) => medallions(c, () => {
    for (let x = -28; x <= 28; x += 5) { const h = 48 - Math.abs(x) * 1.1 + (x % 2 ? 3 : -3); line(c, [[x, -h], [x, 0]]); c.strokeStyle = a; line(c, [[x, 4], [x, h]]); c.strokeStyle = c.fillStyle; }
  })],
  ['brocade-filigree', 'Filigree Scrollwork', 'Mirrored S-shaped brocade scrolls with hanging three-bead pendants', 440, (c, a) => medallions(c, () => {
    for (const d of [-1, 1]) bend(c, [0, 30], [[d * 66, 26, d * 49, -48, d * 18, -37], [d * 2, -28, d * 28, -10, d * 31, -26]]);
    c.fillStyle = a; for (const [x, y] of [[0, 42], [-7, 49], [7, 49]]) oval(c, x, y, 3, 3, 0, true);
  })],
  ['celtic', 'Celtic Crossing', 'Squared interlace knots with deliberate open crossing gaps and accent bridge strokes', 420, (c, a) => medallions(c, () => {
    c.lineWidth = 5; for (let i = 0; i < 4; i++) { c.save(); c.rotate(i * Math.PI / 2); bend(c, [-8, -12], [[-52, -47, 27, -65, 25, -27], [24, -9, 9, 0, 0, 9]]); c.restore(); }
    c.strokeStyle = a; line(c, [[-9, -9], [9, 9]]); line(c, [[-9, 17], [-17, 9]]);
  })],
  ['battenberg', 'Battenberg Lace', 'Rounded rectangular lace tapes tied by slender diagonal ladder rungs', 400, (c, a) => grid(c, 120, () => {
    c.beginPath(); c.roundRect(13, 13, 94, 94, 24); c.stroke(); c.beginPath(); c.roundRect(27, 27, 66, 66, 17); c.stroke();
    c.strokeStyle = a; for (const [x, y] of [[13, 13], [107, 13], [107, 107], [13, 107]]) line(c, [[x, y], [x < 60 ? 37 : 83, y < 60 ? 37 : 83]]); line(c, [[47, 60], [73, 60]]);
  })],
  ['venetian', 'Venetian Connections', 'Open lace hexagons joined by fine radial thread bridges and contrasting center crosses', 420, (c, a) => medallions(c, () => {
    for (const r of [24, 44]) line(c, Array.from({ length: 7 }, (_, i) => [r * Math.cos(i * TAU / 6), r * Math.sin(i * TAU / 6)]));
    for (let i = 0; i < 12; i++) { const q = i * TAU / 12; line(c, [[27 * Math.cos(q), 27 * Math.sin(q)], [39 * Math.cos(q), 39 * Math.sin(q)]]); }
    c.strokeStyle = a; line(c, [[-8, 0], [8, 0]]); line(c, [[0, -8], [0, 8]]);
  })],
  ['smocking', 'Honey Smocking', 'Pinched fabric folds connecting staggered rows of small stitched bow centers', 420, (c, a) => {
    for (let y = 0; y < 240; y += 80) for (let x = 0; x < 240; x += 80) { bend(c, [x, y], [[x + 15, y + 36, x + 25, y + 4, x + 40, y + 40], [x + 55, y + 76, x + 65, y + 44, x + 80, y + 80]]); c.strokeStyle = a; line(c, [[x + 32, y + 40], [x + 48, y + 40]]); c.strokeStyle = c.fillStyle; }
  }],
  ['ribbon-braid', 'Three Strand Braid', 'Three alternating diagonal ribbon segments weaving into broad braided bands', 420, (c, a) => {
    for (const x of [60, 180]) for (let y = -40; y < 240; y += 60) { line(c, [[x - 26, y], [x + 26, y + 35], [x + 26, y + 49], [x - 26, y + 14]], true); c.fillStyle = a; line(c, [[x + 26, y + 30], [x - 26, y + 65], [x - 26, y + 79], [x + 26, y + 44]], true); c.fillStyle = c.strokeStyle; }
  }],
  ['hemstitch', 'Hemstitch Journal', 'Parallel open hemstitch ladders alternating with little four-thread bundles', 400, (c, a) => {
    for (const y of [50, 170]) { line(c, [[0, y - 12], [240, y - 12]]); line(c, [[0, y + 12], [240, y + 12]]); for (let x = 0; x < 240; x += 24) line(c, [[x, y - 12], [x + 8, y + 12]]); c.strokeStyle = a; for (let x = 12; x < 240; x += 48) { line(c, [[x - 6, y + 41], [x + 6, y + 53]]); line(c, [[x + 6, y + 41], [x - 6, y + 53]]); } c.strokeStyle = c.fillStyle; }
  }],
  ['drawn-thread', 'Drawn Thread', 'Fine rectangular drawn-thread windows with radiating tension stitches', 400, (c, a) => medallions(c, () => {
    c.strokeRect(-27, -35, 54, 70); for (let i = -2; i <= 2; i++) { line(c, [[i * 8, -35], [i * 3, -8]]); line(c, [[i * 8, 35], [i * 3, 8]]); }
    c.strokeStyle = a; for (const d of [-1, 1]) for (const y of [-20, 0, 20]) line(c, [[d * 27, y], [d * 7, y * .3]]);
  })],
  ['passementerie', 'Tassel Trim', 'Decorative suspended tassels with looped heads, bound collars and fine hanging fringe', 440, (c, a) => medallions(c, () => {
    oval(c, 0, -30, 12, 17); for (let i = -3; i <= 3; i++) line(c, [[i * 3, -3], [i * 6, 40 - Math.abs(i) * 3]]);
    c.strokeStyle = a; c.lineWidth = 5; line(c, [[-13, -8], [13, -8]]); line(c, [[-11, 1], [11, 1]]);
  })],
  ['couching', 'Couched Ribbons', 'Broad softly bent cords secured by short perpendicular accent stitches', 420, (c, a) => {
    c.lineWidth = 10; for (const y of [60, 180]) bend(c, [0, y], [[40, y - 40, 80, y + 40, 120, y], [160, y - 40, 200, y + 40, 240, y]]);
    c.strokeStyle = a; c.lineWidth = 3; for (const y of [60, 180]) for (const x of [0, 60, 120, 180]) line(c, [[x - 3, y - 10], [x + 3, y + 10]]);
  }],
  ['copperplate', 'Copperplate Swirls', 'Engraved pinched oval flourishes with fine parallel shading and accent terminals', 440, (c, a) => medallions(c, () => {
    bend(c, [-39, 24], [[-62, -25, 12, -51, 33, -16], [53, 14, 0, 47, -18, 22], [-32, 3, -5, -6, 7, 4]]);
    for (let i = 0; i < 5; i++) line(c, [[-31 + i * 5, -20], [-20 + i * 5, -30]]);
    c.fillStyle = a; oval(c, -39, 24, 4, 4, 0, true); oval(c, 7, 4, 4, 4, 0, true);
  })],
  ['bookmarble', 'Combed Marbling', 'Combed feather marbling with repeated hooked channels and fine contrasting spines', 440, (c, a) => {
    for (let x = 0; x < 240; x += 40) for (let y = 0; y < 240; y += 80) { for (const d of [-1, 1]) bend(c, [x + 20, y + 76], [[x + d * 35, y + 28, x + d * 30, y - 8, x + 20, y + 6]]); c.strokeStyle = a; line(c, [[x + 20, y + 20], [x + 20, y + 67]]); c.strokeStyle = c.fillStyle; }
  }],
  ['raku', 'Raku Fragments', 'Separated ceramic glaze panels with branching crackle lines and colored corner slivers', 440, (c, a) => grid(c, 120, () => {
    line(c, [[13, 17], [102, 10], [111, 100], [20, 110], [13, 17]]); line(c, [[13, 56], [54, 63], [70, 10]]); line(c, [[54, 63], [73, 104]]); line(c, [[54, 63], [109, 49]]);
    c.fillStyle = a; line(c, [[20, 24], [42, 22], [22, 44]], true); line(c, [[83, 95], [104, 73], [105, 94]], true);
  })],
  ['wire-fleur', 'Wirework Petals', 'Decorative metalwork motifs made from pointed folded wire petals and small raised beads', 420, (c, a) => medallions(c, () => {
    for (let i = 0; i < 3; i++) { c.save(); c.rotate(i * TAU / 3); bend(c, [0, 0], [[-27, -17, -20, -43, 0, -49], [20, -43, 27, -17, 0, 0]]); c.restore(); }
    c.fillStyle = a; for (let i = 0; i < 3; i++) { const q = i * TAU / 3 + Math.PI / 6; oval(c, Math.cos(q) * 26, Math.sin(q) * 26, 4, 4, 0, true); }
  })],
  ['needle-crown', 'Needle Crowns', 'Tiny lace coronets with five loop-tipped points and contrasting rounded bases', 420, (c, a) => medallions(c, () => {
    line(c, [[-35, 20], [-41, -17], [-19, 0], [0, -31], [19, 0], [41, -17], [35, 20]]);
    for (const [x, y] of [[-41, -22], [0, -36], [41, -22]]) oval(c, x, y, 4, 4);
    c.strokeStyle = a; c.lineWidth = 5; line(c, [[-34, 27], [34, 27]]);
  })],
  ['lace-pennants', 'Lace Pennants', 'Soft curved triangular lace flags with open holes and contrasting suspension loops', 420, (c, a) => {
    for (const [x, y] of [[60, 40], [180, 160]]) { bend(c, [x - 36, y], [[x - 18, y + 7, x + 18, y + 7, x + 36, y], [x + 30, y + 31, x + 13, y + 45, x, y + 57], [x - 13, y + 45, x - 30, y + 31, x - 36, y]]); oval(c, x, y + 22, 10, 7); c.strokeStyle = a; oval(c, x - 30, y - 7, 5, 7); oval(c, x + 30, y - 7, 5, 7); c.strokeStyle = c.fillStyle; }
  }],
  ['soutache', 'Soutache Curls', 'Parallel soutache cord spirals ending in contrasting enclosed oval drops', 440, (c, a) => medallions(c, () => {
    for (const d of [-5, 5]) bend(c, [-30 + d, 39], [[-52 + d, -17, -8 + d, -51, 21 + d, -26], [55 + d, 7, 8 + d, 33, 1 + d, 0]]);
    c.strokeStyle = a; oval(c, 1, -5, 7, 11, -.3);
  })],
  ['tambour', 'Tambour Bursts', 'Radiating curved tambour embroidery dashes arranged as open four-corner bursts', 400, (c, a) => medallions(c, () => {
    for (let i = 0; i < 4; i++) { c.save(); c.rotate(i * Math.PI / 2); for (let j = 0; j < 4; j++) bend(c, [8 + j * 8, -5], [[12 + j * 8, -15, 10 + j * 8, -26, 4 + j * 8, -34]]); c.restore(); }
    c.fillStyle = a; line(c, [[0, -7], [7, 0], [0, 7], [-7, 0]], true);
  })],
  ['lace-fans', 'Palmier Lace', 'Open folding lace wedges with rounded tips and contrasting scalloped inner bridges', 440, (c, a) => medallions(c, () => {
    for (const d of [-1, 1]) { bend(c, [0, 35], [[d * 16, -12, d * 65, -38, d * 45, -48], [d * 23, -57, d * 3, -13, 0, 35]]); line(c, [[0, 35], [d * 30, -33]]); }
    c.strokeStyle = a; bend(c, [-22, 2], [[-18, -9, -5, -9, 0, 1], [5, -9, 18, -9, 22, 2]]);
  })],
  ['cutwork', 'Cutwork Garden', 'Paired crescent-shaped cutwork openings with ladder-like embroidered bridges', 420, (c, a) => medallions(c, () => {
    for (const d of [-1, 1]) { bend(c, [d * 8, -39], [[d * 65, -33, d * 65, 33, d * 8, 39], [d * 32, 12, d * 32, -12, d * 8, -39]]); }
    c.strokeStyle = a; for (let y = -21; y <= 21; y += 14) line(c, [[-17, y], [17, y]]);
  })],
];

export const atelierPatterns = motifs.map(([id, name, description, tileSize, render], index) => {
  const [background, patternColor, patternAccent, ink] = palettes[index % palettes.length];
  return { id: `atelier-${id}`, name, description, background, patternColor, patternAccent, ink, tileSize,
    draw(c, { color = patternColor, accent = patternAccent } = {}) {
      c.save(); c.strokeStyle = color; c.fillStyle = color; c.lineWidth = 2.5; c.lineCap = 'round'; c.lineJoin = 'round';
      // Periodic neighbors preserve all edge-crossing threads and ornamental strokes.
      for (const x of [-240, 0, 240]) for (const y of [-240, 0, 240]) { c.save(); c.translate(x, y); render(c, accent); c.restore(); }
      c.restore();
    },
  };
});
