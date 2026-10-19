// Original feminine fashion and beauty motifs, drawn as seamless 240-unit tiles.
const TAU = Math.PI * 2;
const line = (c, pts, fill = false) => {
  c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
  if (fill) { c.closePath(); c.fill(); } else c.stroke();
};
const oval = (c, x, y, rx, ry = rx, angle = 0, fill = false) => {
  c.beginPath(); c.ellipse(x, y, rx, ry, angle, 0, TAU); fill ? c.fill() : c.stroke();
};
const curve = (c, start, ...parts) => { c.beginPath(); c.moveTo(...start); parts.forEach(p => c.bezierCurveTo(...p)); c.stroke(); };
const box = (c, x, y, w, h, r = 4, fill = false) => {
  c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r);
  c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r); c.lineTo(x, y + r);
  c.quadraticCurveTo(x, y, x + r, y); fill ? c.fill() : c.stroke();
};
const palettes = [
  ['#faeaf0', '#bd889e', '#a97486', '#563544'],
  ['#f8e8e4', '#c5948d', '#b09a6d', '#573a37'],
  ['#f1eafa', '#aa93be', '#be8caa', '#4e3c60'],
  ['#fceaf1', '#cb98b0', '#ac7d94', '#59394b'],
  ['#f8eee9', '#bd9890', '#bb9c74', '#553e37'],
  ['#f5e9f1', '#b28eaa', '#c7a185', '#533a50'],
];

const motifs = [
  ['compact-mirrors', 'Blush Compact Mirrors', 'Girly hinged compact mirrors with oval reflections and polished clasps.', 380, (c, a) => {
    oval(c, 0, -16, 24, 21); oval(c, 0, -16, 18, 15); oval(c, 0, 20, 26, 13); line(c, [[-6, 3], [6, 3]]);
    c.strokeStyle = a; curve(c, [-10, -20], [-7, -27, 0, -29, 7, -24]); c.fillStyle = a; oval(c, 0, 21, 17, 7, 0, true); box(c, -5, 31, 10, 4, 2, true);
  }],
  ['velvet-lipsticks', 'Velvet Lipsticks', 'Feminine lipstick tubes with softly slanted tips and contrasting gold-tone collars.', 370, (c, a) => {
    box(c, -13, 0, 26, 32, 3); line(c, [[-10, 0], [-10, -24]]); curve(c, [-10, -24], [-10, -31, 8, -40, 10, -29]); line(c, [[10, -29], [10, 0]]);
    c.strokeStyle = a; c.lineWidth = 6; line(c, [[-12, -1], [12, -1]]); c.fillStyle = a; box(c, -7, 21, 14, 5, 1, true);
  }],
  ['manicure-bottles', 'Manicure Bottles', 'Rounded nail polish bottles with tall caps and colored lacquer windows.', 350, (c, a) => {
    box(c, -20, -4, 40, 34, 7); box(c, -11, -33, 22, 29, 3); c.strokeStyle = a;
    line(c, [[-5, -26], [-5, -10]]); line(c, [[4, -26], [4, -10]]); c.fillStyle = a; box(c, -13, 4, 26, 18, 4, true);
  }],
  ['perfume-atomizers', 'Powder Room Perfume', 'Vintage perfume atomizers with squeeze bulbs, curling hoses, and fluted glass.', 400, (c, a) => {
    box(c, -25, -2, 44, 32, 7); line(c, [[-13, -2], [-13, -13], [7, -13], [7, -2]]); line(c, [[-17, -17], [12, -17]]);
    curve(c, [9, -12], [36, -25, 37, -3, 25, -3]); c.fillStyle = a; oval(c, 31, 3, 10, 6, -.2, true);
    c.strokeStyle = a; [-15, -3, 9].forEach(x => line(c, [[x, 6], [x, 22]]));
  }],
  ['powder-brushes', 'Powder Brush Ballet', 'Fluffy domed beauty brushes with short handles and colored ferrules.', 370, (c, a) => {
    box(c, -6, 4, 12, 33, 5); line(c, [[-12, 4], [-17, -9]]); line(c, [[12, 4], [17, -9]]);
    curve(c, [-17, -9], [-38, -40, 38, -40, 17, -9]); c.strokeStyle = a; c.lineWidth = 6; line(c, [[-11, 3], [11, 3]]);
    c.lineWidth = 2.8; curve(c, [-9, -25], [-10, -18, -7, -13, -6, -9]); curve(c, [7, -26], [11, -20, 7, -13, 6, -9]);
  }],
  ['hair-claws', 'Lilac Hair Claws', 'Scalloped hair claw clips with curved teeth and a colored hinge bead.', 370, (c, a) => {
    curve(c, [-30, -4], [-20, -35, 20, -35, 30, -4]); line(c, [[-30, -4], [-22, 16], [-17, 3], [-11, 20], [-5, 4], [2, 21], [9, 4], [16, 17], [22, 0], [30, -4]]);
    c.strokeStyle = a; curve(c, [-20, -9], [-8, -22, 8, -22, 20, -9]); c.fillStyle = a; oval(c, 0, -16, 4, 4, 0, true);
  }],
  ['dresser-combs', 'Dresser Combs', 'Wide rounded dresser combs with evenly spaced teeth and inset spine stripes.', 350, (c, a) => {
    box(c, -32, -20, 64, 13, 5); for (let x = -27; x < 29; x += 8) line(c, [[x, -7], [x, 24]]);
    c.strokeStyle = a; line(c, [[-23, -14], [23, -14]]); c.fillStyle = a; oval(c, 0, 34, 4, 2, 0, true);
  }],
  ['velcro-rollers', 'Saturday Hair Rollers', 'Cylindrical hair rollers with mesh ridges and contrasting end caps.', 370, (c, a) => {
    line(c, [[-27, -14], [20, -14]]); line(c, [[-27, 14], [20, 14]]); oval(c, 20, 0, 8, 14); curve(c, [-27, -14], [-38, -10, -38, 10, -27, 14]);
    c.strokeStyle = a; [-21, -11, -1, 9].forEach(x => line(c, [[x, -11], [x, 11]])); oval(c, 20, 0, 3, 7);
  }],
  ['satin-scrunchies', 'Satin Scrunchie Cloud', 'Soft gathered scrunchies with irregular fabric lobes and contrasting fold marks.', 400, (c, a) => {
    const pts = Array.from({ length: 48 }, (_, i) => { const t = i * TAU / 48, r = 26 + 5 * Math.cos(t * 8); return [Math.cos(t) * r, Math.sin(t) * r]; });
    line(c, [...pts, pts[0]]); oval(c, 0, 0, 11); c.strokeStyle = a;
    for (let i = 0; i < 8; i++) { const t = i * TAU / 8; line(c, [[Math.cos(t) * 15, Math.sin(t) * 15], [Math.cos(t + .1) * 25, Math.sin(t + .1) * 25]]); }
  }],
  ['drop-earrings', 'Pearl Drop Earrings', 'Paired feminine drop earrings with oval hoops and colored hanging pearls.', 370, (c, a) => {
    [-17, 17].forEach(x => { oval(c, x, -7, 10, 18); oval(c, x, -26, 3); line(c, [[x, 11], [x, 18]]); });
    c.fillStyle = a; [-17, 17].forEach(x => oval(c, x, 25, 7, 9, 0, true));
  }],
  ['slingback-heels', 'Slingback Heels', 'Elegant slingback high heels with gently pointed toes and colored sole seams.', 410, (c, a) => {
    line(c, [[-30, -17], [-20, -21], [-4, 3], [26, 15], [31, 21], [-6, 21], [-19, 3], [-23, 29], [-28, 29], [-28, -2], [-30, -17]]);
    curve(c, [-29, -18], [-17, -33, -5, -17, -5, -7]); c.strokeStyle = a; line(c, [[-5, 16], [26, 16]]); line(c, [[-22, -8], [-15, -13]]);
  }],
  ['mary-jane-shoes', 'Mary Jane Promenade', 'Rounded Mary Jane shoes with buttoned instep straps and curved toe seams.', 400, (c, a) => {
    c.beginPath(); c.moveTo(-31, 9); c.lineTo(-27, -17); c.bezierCurveTo(-10, -16, -10, 2, 4, 3); c.bezierCurveTo(36, 1, 41, 25, 18, 25); c.lineTo(-31, 25); c.closePath(); c.stroke();
    c.strokeStyle = a; curve(c, [-14, -10], [-20, 6, -6, 12, 2, 5]); curve(c, [12, 7], [13, 14, 15, 19, 21, 21]); c.fillStyle = a; oval(c, -11, 5, 3, 3, 0, true);
  }],
  ['top-handle-bags', 'Rose Handbag Hour', 'Structured feminine top-handle handbags with small clasps and rounded corners.', 380, (c, a) => {
    box(c, -29, -8, 58, 39, 7); curve(c, [-17, -8], [-17, -39, 17, -39, 17, -8]); line(c, [[-28, 0], [0, 13], [28, 0]]);
    c.fillStyle = a; box(c, -6, 8, 12, 10, 2, true); c.strokeStyle = a; line(c, [[-20, 22], [-11, 22]]); line(c, [[11, 22], [20, 22]]);
  }],
  ['cat-eye-sunglasses', 'Cat Eye Afternoon', 'Upturned cat-eye sunglasses with broad rims and diagonal lens reflections.', 390, (c, a) => {
    curve(c, [-35, -13], [-22, -11, -6, -15, -5, -2], [-5, 22, -28, 24, -35, -13]); curve(c, [35, -13], [22, -11, 6, -15, 5, -2], [5, 22, 28, 24, 35, -13]);
    curve(c, [-5, -2], [-2, -7, 2, -7, 5, -2]); c.strokeStyle = a; c.lineWidth = 4; line(c, [[-26, -3], [-17, 7]]); line(c, [[17, -3], [26, 7]]);
  }],
  ['lip-gloss-wands', 'Lip Gloss Notes', 'Open lip gloss tubes paired with angled applicator wands and soft color swatches.', 380, (c, a) => {
    box(c, -22, -3, 20, 38, 4); box(c, -19, -10, 14, 8, 2); c.save(); c.translate(16, -9); c.rotate(.3);
    box(c, -7, -25, 14, 19, 3); line(c, [[0, -6], [0, 19]]); c.fillStyle = a; oval(c, 0, 24, 4, 8, .15, true); c.restore();
    c.fillStyle = a; box(c, -17, 5, 10, 23, 3, true);
  }],
  ['mascara-mornings', 'Mascara Mornings', 'Mascara tubes and open spoolie brushes with contrasting fine bristle bands.', 390, (c, a) => {
    box(c, -24, -6, 18, 42, 5); box(c, 8, 4, 15, 28, 4); line(c, [[15, 4], [15, -27]]);
    c.strokeStyle = a; for (let y = -30; y < -6; y += 5) line(c, [[9, y], [22, y + 2]]); c.fillStyle = a; box(c, -20, 9, 10, 13, 2, true);
  }],
  ['satin-pillows', 'Satin Pillow Talk', 'Plump boudoir pillows with stitched inset seams and curved satin highlights.', 410, (c, a) => {
    c.beginPath(); c.moveTo(-31, -22); c.bezierCurveTo(-11, -17, 11, -17, 31, -22); c.bezierCurveTo(25, -8, 25, 8, 31, 22); c.bezierCurveTo(11, 17, -11, 17, -31, 22); c.bezierCurveTo(-25, 8, -25, -8, -31, -22); c.stroke();
    c.strokeStyle = a; box(c, -22, -13, 44, 26, 5); curve(c, [-16, -7], [-11, -10, -5, -10, 0, -9]); curve(c, [7, 8], [13, 11, 17, 7, 18, 2]);
  }],
  ['slip-dresses', 'Satin Slip Dresses', 'Airy feminine slip dresses with fine shoulder straps and contrasting curved hems.', 420, (c, a) => {
    line(c, [[-13, -22], [-12, -36], [-6, -36], [-6, -23]]); line(c, [[13, -22], [12, -36], [6, -36], [6, -23]]);
    curve(c, [-16, -23], [-6, -17, 6, -17, 16, -23]); line(c, [[-16, -23], [-11, -1], [-28, 32]]); line(c, [[16, -23], [11, -1], [28, 32]]);
    c.strokeStyle = a; curve(c, [-28, 32], [-10, 40, 10, 40, 28, 32]); curve(c, [6, 8], [1, 18, 0, 25, 1, 31]);
  }],
  ['party-dresses', 'Petal Party Dresses', 'Sweet fit-and-flare party dresses with cap sleeves and broad colored waistbands.', 420, (c, a) => {
    line(c, [[-10, -30], [-22, -24], [-29, -11], [-19, -5], [-15, -12], [-11, 0], [-32, 29]]);
    line(c, [[10, -30], [22, -24], [29, -11], [19, -5], [15, -12], [11, 0], [32, 29]]);
    curve(c, [-10, -30], [-4, -20, 4, -20, 10, -30]); curve(c, [-32, 29], [-13, 39, 13, 39, 32, 29]); c.strokeStyle = a; c.lineWidth = 6; line(c, [[-12, 1], [12, 1]]);
    c.lineWidth = 2.8; line(c, [[-7, 10], [-15, 29]]); line(c, [[7, 10], [15, 29]]);
  }],
  ['vanity-tables', 'Vanity Table Reverie', 'Tiny dressing tables with round mirrors, curved legs, and colored drawer pulls.', 430, (c, a) => {
    box(c, -31, -2, 62, 18, 3); oval(c, 0, -24, 19, 23); line(c, [[-12, -5], [-12, -1]]); line(c, [[12, -5], [12, -1]]);
    curve(c, [-26, 17], [-22, 27, -30, 34, -24, 39]); curve(c, [26, 17], [22, 27, 30, 34, 24, 39]); line(c, [[-10, -1], [-10, 15]]); line(c, [[10, -1], [10, 15]]);
    c.fillStyle = a; [-20, 0, 20].forEach(x => oval(c, x, 7, 2.5, 2.5, 0, true)); c.strokeStyle = a; curve(c, [-8, -28], [-5, -36, 3, -38, 8, -32]);
  }],
  ['hair-dryer-club', 'Hair Dryer Club', 'Rounded retro hair dryers with side vents, short handles, and curling cords.', 400, (c, a) => {
    box(c, -27, -27, 52, 27, 11); line(c, [[-25, -24], [-35, -24], [-35, -3], [-25, -3]]); line(c, [[2, 1], [1, 26], [15, 26], [18, -1]]);
    c.strokeStyle = a; [-17, -10, -3].forEach(x => line(c, [[x, -21], [x, -7]])); curve(c, [8, 27], [9, 47, -16, 43, -13, 31]);
  }],
  ['face-cream-jars', 'Vanilla Face Cream', 'Wide beauty cream jars with raised lids, curved labels, and tiny highlight marks.', 360, (c, a) => {
    box(c, -27, -6, 54, 33, 7); box(c, -29, -19, 58, 13, 4); c.strokeStyle = a; line(c, [[-20, -13], [20, -13]]);
    box(c, -17, 3, 34, 15, 5); c.fillStyle = a; oval(c, 0, 10, 5, 3, 0, true); line(c, [[20, -29], [23, -34]]);
  }],
  ['hand-cream-tubes', 'Hand Cream Ritual', 'Tapered hand cream tubes with crimped tops and contrasting oval labels.', 380, (c, a) => {
    line(c, [[-23, -32], [23, -32], [14, 24], [-14, 24], [-23, -32]]); box(c, -14, 24, 28, 10, 3);
    c.strokeStyle = a; line(c, [[-18, -25], [18, -25]]); c.fillStyle = a; oval(c, 0, -2, 12, 16, 0, true);
  }],
  ['makeup-palettes', 'Mauve Makeup Palettes', 'Open eyeshadow palettes with six rounded pans and a small reflected lid.', 400, (c, a) => {
    box(c, -33, -6, 66, 38, 4); box(c, -29, -34, 58, 28, 4); box(c, -23, -28, 46, 16, 2);
    c.fillStyle = a; for (const x of [-23, -5, 13]) for (const y of [2, 17]) box(c, x, y, 12, 10, 2, true);
    c.strokeStyle = a; line(c, [[-13, -22], [-5, -16]]); line(c, [[-4, -24], [6, -16]]);
  }],
  ['powder-puffs', 'Powder Puff Clouds', 'Fluffy round powder puffs with broad satin finger straps and little dust pearls.', 370, (c, a) => {
    oval(c, -1, 0, 28, 25); oval(c, -1, 0, 23, 20); c.strokeStyle = a; c.lineWidth = 11; line(c, [[-20, -3], [18, -3]]);
    c.fillStyle = a; oval(c, 33, 24, 3, 3, 0, true); oval(c, 23, 31, 2.5, 2.5, 0, true);
  }],
  ['pearl-bracelets', 'Pearl Bracelet Keepsakes', 'Delicate oval pearl bracelets with alternating colored beads and a polished clasp.', 390, (c, a) => {
    oval(c, 0, 0, 29, 23); for (let i = 0; i < 12; i++) { const t = i * TAU / 12; oval(c, Math.cos(t) * 29, Math.sin(t) * 23, 5); }
    c.fillStyle = a; [1, 4, 7, 10].forEach(i => { const t = i * TAU / 12; oval(c, Math.cos(t) * 29, Math.sin(t) * 23, 3.5, 3.5, 0, true); }); box(c, -6, -28, 12, 8, 3, true);
  }],
  ['padded-headbands', 'Padded Headband Parade', 'Soft padded headbands with open ends and a curved contrasting fabric seam.', 360, (c, a) => {
    c.beginPath(); c.moveTo(-24, 25); c.bezierCurveTo(-53, -44, 53, -44, 24, 25); c.lineTo(15, 21); c.bezierCurveTo(34, -30, -34, -30, -15, 21); c.closePath(); c.stroke();
    c.strokeStyle = a; curve(c, [-23, 12], [-38, -32, 38, -32, 23, 12]);
  }],
  ['sleeping-masks', 'Beauty Sleep Masks', 'Soft curved sleep masks with gathered side straps and embroidered closed lashes.', 390, (c, a) => {
    c.beginPath(); c.moveTo(-31, -7); c.bezierCurveTo(-34, -29, 34, -29, 31, -7); c.bezierCurveTo(31, 20, 11, 23, 0, 6); c.bezierCurveTo(-11, 23, -31, 20, -31, -7); c.stroke();
    line(c, [[-32, -9], [-40, -2], [-31, 7]]); line(c, [[32, -9], [40, -2], [31, 7]]); c.strokeStyle = a;
    curve(c, [-22, -3], [-18, 3, -12, 3, -8, -3]); curve(c, [8, -3], [12, 3, 18, 3, 22, -3]); [-18, -12, 12, 18].forEach(x => line(c, [[x, 1], [x, 6]]));
  }],
  ['sunhat-strolls', 'Sunhat Strolls', 'Wide-brimmed summer hats with curved crowns and contrasting feminine hatbands.', 410, (c, a) => {
    oval(c, 0, 15, 38, 13); curve(c, [-21, 10], [-22, -33, 22, -33, 21, 10]); curve(c, [-21, 10], [-11, 18, 11, 18, 21, 10]);
    c.strokeStyle = a; c.lineWidth = 6; curve(c, [-21, 3], [-9, 10, 9, 10, 21, 3]); c.lineWidth = 2.8; curve(c, [-29, 18], [-17, 25, 16, 25, 29, 18]);
  }],
  ['ankle-boots', 'Rose Ankle Boots', 'Rounded fashion ankle boots with small block heels, zip seams, and contrasting cuffs.', 410, (c, a) => {
    line(c, [[-22, -31], [7, -31], [7, -3], [27, 6]]); curve(c, [27, 6], [41, 17, 34, 24, 20, 24]);
    line(c, [[20, 24], [-7, 24], [-7, 32], [-22, 32], [-22, -31]]); c.strokeStyle = a; c.lineWidth = 6; line(c, [[-20, -23], [5, -23]]);
    c.lineWidth = 2.8; line(c, [[-12, -15], [-12, 15]]); c.fillStyle = a; box(c, -15, -16, 6, 6, 1, true); line(c, [[-3, 18], [27, 18]]);
  }],
];

export const vanityPatterns = motifs.map(([id, name, description, tileSize, motif], index) => {
  const [background, patternColor, patternAccent, ink] = palettes[index % palettes.length];
  return {
    id: `vanity-${id}`, name, description, background, patternColor, patternAccent, ink, tileSize,
    draw(c, { color = patternColor, accent = patternAccent } = {}) {
      c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
      for (const [x, y, tilt] of [[37, 42, -.16], [163, 77, .16], [94, 173, .1], [226, 213, -.12]]) {
        for (const dx of [-240, 0, 240]) for (const dy of [-240, 0, 240]) {
          c.save(); c.translate(x + dx, y + dy); c.rotate(tilt); c.lineWidth = 2.8;
          c.strokeStyle = color; c.fillStyle = color; motif(c, accent); c.restore();
        }
      }
      c.restore();
    },
  };
});
