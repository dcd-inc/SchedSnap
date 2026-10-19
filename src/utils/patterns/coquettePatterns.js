// Original romantic ribbon, lace and paper compositions on a 240-unit repeat.
const TAU = Math.PI * 2;
const line = (c, ps, fill = false) => { c.beginPath(); ps.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); if (fill) { c.closePath(); c.fill(); } else c.stroke(); };
const oval = (c, x, y, rx, ry = rx, angle = 0, fill = false) => { c.beginPath(); c.ellipse(x, y, rx, ry, angle, 0, TAU); fill ? c.fill() : c.stroke(); };
const curve = (c, p, cs, fill = false) => { c.beginPath(); c.moveTo(...p); cs.forEach(q => c.bezierCurveTo(...q)); if (fill) { c.closePath(); c.fill(); } else c.stroke(); };
const heart = (c, x, y, s, fill = false) => curve(c, [x, y + s], [[x - s * 2, y, x - s, y - s * 1.7, x, y - s * .5], [x + s, y - s * 1.7, x + s * 2, y, x, y + s]], fill);
const repeat = (c, draw) => { for (const [x, y, angle] of [[55, 52, -.12], [176, 178, .12]]) { c.save(); c.translate(x, y); c.rotate(angle); draw(c); c.restore(); } };
const grid = (c, step, draw) => { for (let y = 0; y < 240; y += step) for (let x = 0; x < 240; x += step) { c.save(); c.translate(x, y); draw(c); c.restore(); } };
const pearls = (c, count, rx, ry, r = 2.5) => { for (let i = 0; i < count; i++) { const q = i * TAU / count; oval(c, rx * Math.cos(q), ry * Math.sin(q), r, r, 0, true); } };
const palettes = [
  ['#fff0f3', '#c58c9d', '#9c566c', '#613b4b'],
  ['#f0f3fc', '#99accb', '#bf8d9f', '#3f4a67'],
  ['#f8effa', '#ad91c1', '#c9a5aa', '#553f66'],
  ['#fff3ec', '#c7a18b', '#b77989', '#61453c'],
  ['#f9e9ef', '#bd819e', '#9cabb5', '#5e354c'],
  ['#f4f0e8', '#afa6b2', '#ba8396', '#514356'],
  ['#fceef0', '#b87888', '#c7b374', '#633a47'],
];
const motifs = [
  ['corset', 'Corset Reverie', 'Coquette hourglass corsetry panels with crossed ribbon lacing and scalloped upper cups', 440, (c, a) => repeat(c, () => {
    curve(c, [-32, -32], [[-18, -44, -5, -39, 0, -31], [5, -39, 18, -44, 32, -32], [30, -7, 17, 3, 29, 34], [15, 42, -15, 42, -29, 34], [-17, 3, -30, -7, -32, -32]]);
    c.strokeStyle = a; for (let y = -25; y < 25; y += 12) { line(c, [[-8, y], [8, y + 11]]); line(c, [[8, y], [-8, y + 11]]); } line(c, [[-20, -27], [-15, 26]]); line(c, [[20, -27], [15, 26]]);
  })],
  ['ribbon-ladder', 'Satin Lace Up', 'Vertical satin ribbon lacing through paired embroidered eyelet rails', 420, (c, a) => {
    for (const x of [60, 180]) { for (let y = 10; y < 240; y += 40) { oval(c, x - 19, y, 4); oval(c, x + 19, y, 4); } c.strokeStyle = a; c.lineWidth = 5; for (let y = 10; y < 240; y += 40) { line(c, [[x - 19, y], [x + 19, y + 40]]); line(c, [[x + 19, y], [x - 19, y + 40]]); } c.strokeStyle = c.fillStyle; c.lineWidth = 2.5; }
  }],
  ['cameo', 'Cameo Keepsake', 'Scalloped oval cameo settings with an abstract curled ribbon silhouette inside', 440, (c, a) => repeat(c, () => {
    oval(c, 0, 0, 29, 41); pearls(c, 20, 37, 49); c.strokeStyle = a;
    curve(c, [-7, 23], [[-13, 2, 15, 1, 10, -17], [6, -31, -12, -25, -10, -13], [-8, -4, 11, -4, 1, 12]]); line(c, [[-14, 25], [14, 25]]);
  })],
  ['wax-seal', 'Rose Wax Promise', 'Wavy wax seals on folded ribbon tails with tiny engraved heart centers', 430, (c, a) => repeat(c, () => {
    line(c, [[-16, 16], [-23, 44], [-10, 37], [-3, 48], [3, 18]]); line(c, [[5, 16], [12, 43], [19, 33], [30, 40], [22, 13]]);
    const p = Array.from({ length: 61 }, (_, i) => { const q = i * TAU / 60, r = 28 + 2.8 * Math.sin(q * 10); return [Math.cos(q) * r, Math.sin(q) * r - 8]; }); line(c, p, true);
    c.strokeStyle = a; heart(c, 0, -8, 10);
  })],
  ['rosette-badge', 'Ribbon Rosette Club', 'Pleated award rosettes with angular ribbon tails and a contrasting scalloped center', 440, (c, a) => repeat(c, () => {
    line(c, [[-17, 14], [-25, 48], [-10, 41], [-1, 48], [2, 17]]); line(c, [[6, 17], [15, 43], [24, 33], [34, 36], [23, 8]]);
    line(c, Array.from({ length: 33 }, (_, i) => { const q = i * TAU / 32, r = i % 2 ? 24 : 31; return [r * Math.cos(q), r * Math.sin(q) - 7]; })); c.fillStyle = a; oval(c, 0, -7, 16, 16, 0, true);
  })],
  ['locket', 'Secret Heart Locket', 'Open hinged heart lockets with a smaller colored inset and dainty suspension loops', 440, (c, a) => repeat(c, () => {
    heart(c, -16, 3, 18); heart(c, 22, 3, 18); oval(c, 0, -30, 6, 9); line(c, [[0, -21], [0, 17]]);
    c.fillStyle = a; heart(c, 22, 3, 10, true);
  })],
  ['pendant-chain', 'Pendant Waltz', 'Fine pendant chains with alternating elongated pearl drops and tiny ribbon collars', 420, (c, a) => {
    for (const x of [60, 180]) { for (let y = 0; y < 240; y += 120) { curve(c, [x - 32, y], [[x - 26, y + 21, x - 13, y + 31, x, y + 37], [x + 13, y + 31, x + 26, y + 21, x + 32, y]]); oval(c, x, y + 65, 11, 22); c.strokeStyle = a; line(c, [[x - 8, y + 41], [x + 8, y + 41]]); line(c, [[x, y + 44], [x, y + 53]]); c.strokeStyle = c.fillStyle; } }
  }],
  ['stitched-heart', 'Laced Love Notes', 'Large open hearts with parallel inner ribbon stitches crossing their centers', 440, (c, a) => repeat(c, () => {
    heart(c, 0, -4, 31); c.strokeStyle = a; for (let y = -17; y < 17; y += 11) { line(c, [[-12, y], [12, y + 9]]); line(c, [[12, y], [-12, y + 9]]); }
  })],
  ['scroll-letter', 'Scrolled Love Letter', 'Curled paper love letters with rolled edges, small written strokes and dangling heart seals', 440, (c, a) => repeat(c, () => {
    curve(c, [-31, -29], [[-42, -40, -22, -49, -19, -34]]); line(c, [[-31, -29], [-24, 29], [25, 29], [19, -34], [-19, -34]]); curve(c, [25, 29], [[38, 42, 16, 48, 12, 32]]);
    c.strokeStyle = a; for (const y of [-17, -7, 3]) line(c, [[-12, y], [10, y]]); heart(c, 3, 17, 7);
  })],
  ['ruffle-hem', 'Ruffle Hem', 'Flowing scalloped fabric hems with fine pleat stitches and contrasting satin top bands', 420, (c, a) => {
    for (const y of [40, 160]) { for (let x = 0; x < 240; x += 40) curve(c, [x, y + 28], [[x + 8, y + 56, x + 32, y + 56, x + 40, y + 28]]); for (let x = 12; x < 240; x += 20) line(c, [[x, y + 12], [x + 3, y + 31]]); c.strokeStyle = a; c.lineWidth = 7; line(c, [[0, y], [240, y]]); c.strokeStyle = c.fillStyle; c.lineWidth = 2.5; }
  }],
  ['scallop-envelope', 'Scalloped Correspondence', 'Rounded square stationery envelopes with scalloped flaps and tiny heart fastening tabs', 430, (c, a) => repeat(c, () => {
    c.beginPath(); c.roundRect(-35, -24, 70, 48, 7); c.stroke(); curve(c, [-35, -20], [[-25, -3, -16, -2, -12, -5], [-8, 7, 8, 7, 12, -5], [16, -2, 25, -3, 35, -20]]);
    c.fillStyle = a; heart(c, 0, 3, 6, true); c.strokeStyle = a; line(c, [[-33, 21], [-14, 7]]); line(c, [[33, 21], [14, 7]]);
  })],
  ['heart-trellis', 'Heart Trellis', 'Upright heart outlines joined by little curved ribbon bridges and colored teardrop buds', 420, (c, a) => grid(c, 120, () => {
    heart(c, 60, 42, 25); curve(c, [60, 68], [[58, 92, 30, 86, 24, 104]]); curve(c, [60, 68], [[62, 92, 90, 86, 96, 104]]);
    c.fillStyle = a; oval(c, 24, 104, 4, 8, .5, true); oval(c, 96, 104, 4, 8, -.5, true);
  })],
  ['tulle-hearts', 'Tulle Confessions', 'Fine dotted tulle diamonds with alternate tiny filled heart intersections', 380, (c, a) => {
    c.setLineDash([1, 7]); for (let k = -240; k <= 240; k += 80) { line(c, [[k, 0], [k + 240, 240]]); line(c, [[k, 240], [k + 240, 0]]); }
    c.fillStyle = a; grid(c, 80, () => heart(c, 0, 0, 6, true));
  }],
  ['pearl-festoons', 'Pearl Festoons', 'Scalloped pearl swags with grouped drop beads and contrasting ribbon suspension tabs', 440, (c, a) => {
    for (const y of [30, 150]) for (const x of [0, 120]) { for (let i = 0; i <= 10; i++) oval(c, x + i * 12, y + 30 * Math.sin(i * Math.PI / 10), 2.8, 2.8, 0, true); oval(c, x + 60, y + 45, 4, 9); c.fillStyle = a; line(c, [[x - 5, y - 6], [x + 5, y - 6], [x + 8, y + 7], [x - 8, y + 7]], true); c.fillStyle = c.strokeStyle; }
  }],
  ['folded-knots', 'Satin Fold Knots', 'Angular folded ribbon knots with asymmetric forked tails and colored tucked ends', 420, (c, a) => repeat(c, () => {
    line(c, [[-8, -8], [-38, -22], [-28, 12], [-8, 6], [3, -14], [35, -17], [26, 17], [7, 7]]); line(c, [[-8, 6], [-22, 38], [-9, 31], [-1, 38], [4, 8]]);
    c.fillStyle = a; line(c, [[-8, -9], [9, -9], [9, 9], [-8, 9]], true); line(c, [[9, 10], [15, 33], [22, 25], [31, 28], [24, 13]], true);
  })],
  ['pleated-ruff', 'Pleated Ruff', 'Open circular ribbon ruffs with alternating radial pleats and four contrasting tie beads', 440, (c, a) => repeat(c, () => {
    for (let i = 0; i < 24; i++) { const q = i * TAU / 24; line(c, [[22 * Math.cos(q), 22 * Math.sin(q)], [(i % 2 ? 36 : 42) * Math.cos(q), (i % 2 ? 36 : 42) * Math.sin(q)]]); } oval(c, 0, 0, 22); c.fillStyle = a; for (let i = 0; i < 4; i++) { const q = i * Math.PI / 2; oval(c, 16 * Math.cos(q), 16 * Math.sin(q), 3, 3, 0, true); }
  })],
  ['broderie', 'Broderie Ribbon', 'Romantic embroidered ribbon strips with paired oval cutouts and small accent cross stitches', 420, (c, a) => {
    for (const y of [55, 175]) { line(c, [[0, y - 23], [240, y - 23]]); line(c, [[0, y + 23], [240, y + 23]]); for (let x = 20; x < 240; x += 40) { oval(c, x - 5, y, 5, 12, -.45); oval(c, x + 5, y, 5, 12, .45); } c.strokeStyle = a; for (let x = 0; x < 240; x += 40) { line(c, [[x - 4, y - 4], [x + 4, y + 4]]); line(c, [[x + 4, y - 4], [x - 4, y + 4]]); } c.strokeStyle = c.fillStyle; }
  }],
  ['sachet', 'Lavender Sachet Letters', 'Soft drawstring keepsake sachets with gathered tops and contrasting heart-shaped labels', 440, (c, a) => repeat(c, () => {
    curve(c, [-19, -20], [[-18, -7, -35, 17, -26, 32], [-11, 43, 21, 40, 27, 27], [31, 10, 15, -5, 19, -20]]); line(c, [[-19, -20], [-25, -37], [-8, -30], [2, -40], [11, -30], [25, -37], [19, -20]]);
    c.strokeStyle = a; line(c, [[-20, -18], [20, -18]]); curve(c, [18, -18], [[37, -17, 37, 6, 26, 4]]); c.fillStyle = a; heart(c, 0, 13, 11, true);
  })],
  ['bookplate', 'Romantic Bookplate', 'Curled rectangular bookplate frames with petite side flourishes and centered heart emblems', 440, (c, a) => repeat(c, () => {
    line(c, [[-28, -30], [28, -30], [28, 30], [-28, 30], [-28, -30]]); for (const d of [-1, 1]) curve(c, [d * 28, -20], [[d * 48, -29, d * 48, -1, d * 29, 0], [d * 48, 1, d * 48, 29, d * 28, 20]]);
    c.strokeStyle = a; heart(c, 0, -2, 11); line(c, [[-15, 19], [15, 19]]);
  })],
  ['heart-window', 'Sweetheart Windows', 'Heart-shaped stained-paper windows divided by curved accent seam lines', 430, (c, a) => repeat(c, () => {
    heart(c, 0, -5, 33); c.strokeStyle = a; line(c, [[0, -19], [0, 25]]); curve(c, [-27, -9], [[-10, 0, 10, 0, 27, -9]]); curve(c, [-18, 13], [[-5, 6, 5, 6, 18, 13]]);
  })],
  ['ballet-ticket', 'Recital Invitations', 'Curved theatre invitation cards with pierced corner holes and diagonal satin bands', 440, (c, a) => repeat(c, () => {
    line(c, [[-33, -26], [33, -26], [33, 26], [-33, 26], [-33, -26]]); for (const x of [-24, 24]) for (const y of [-17, 17]) oval(c, x, y, 3); line(c, [[-14, -7], [15, -7]]); line(c, [[-14, 3], [9, 3]]);
    c.fillStyle = a; line(c, [[-33, 8], [-33, 18], [9, -26], [-1, -26]], true);
  })],
  ['doll-dress', 'Paper Doll Dresses', 'Tiny flared dresses with scalloped skirts, narrow bodices and contrasting waist sashes', 440, (c, a) => repeat(c, () => {
    line(c, [[-10, -31], [-20, -23], [-13, -9], [-20, 6], [-34, 31]]); curve(c, [-34, 31], [[-21, 43, -12, 34, -10, 32], [-4, 43, 6, 43, 11, 32], [16, 40, 26, 40, 34, 31]]); line(c, [[34, 31], [20, 6], [13, -9], [20, -23], [10, -31]]); curve(c, [-10, -31], [[-7, -20, 7, -20, 10, -31]]);
    c.strokeStyle = a; c.lineWidth = 6; line(c, [[-13, -1], [13, -1]]); line(c, [[13, 0], [26, 14]]);
  })],
  ['puff-sleeves', 'Puff Sleeve Daydream', 'Romantic puff-sleeved blouses with curved collars and small contrasting button rows', 440, (c, a) => repeat(c, () => {
    curve(c, [-10, -27], [[-32, -43, -50, -6, -28, 5], [-21, 7, -16, -2, -15, -9]]); curve(c, [10, -27], [[32, -43, 50, -6, 28, 5], [21, 7, 16, -2, 15, -9]]); line(c, [[-15, -9], [-18, 29], [18, 29], [15, -9]]); line(c, [[-10, -27], [0, -17], [10, -27]]);
    c.fillStyle = a; for (const y of [-7, 4, 15]) oval(c, 0, y, 2.8, 2.8, 0, true);
  })],
  ['satin-crossings', 'Satin Crossing', 'Broad crossing diagonal satin strips with forked ribbon breaks and petite stitched joins', 420, (c, a) => grid(c, 120, () => {
    line(c, [[8, 8], [23, 8], [112, 97], [112, 112], [97, 112], [8, 23]], true); c.fillStyle = a; line(c, [[97, 8], [112, 8], [112, 23], [23, 112], [8, 112], [8, 97], [52, 53], [61, 64]], true);
  })],
  ['woven-hearts', 'Heart Ribbon Weave', 'Two open interwoven heart ribbons with visible contrasting underpass segments', 440, (c, a) => repeat(c, () => {
    c.lineWidth = 4; heart(c, -10, -3, 24); c.strokeStyle = a; heart(c, 12, 7, 24); line(c, [[-20, 42], [-26, 50]]);
  })],
  ['scallop-checks', 'Scalloped Patch Notes', 'Separated wavy-edged fabric checks with tiny contrasting heart appliques', 400, (c, a) => grid(c, 120, () => {
    curve(c, [21, 18], [[34, 5, 45, 24, 60, 15], [78, 6, 88, 24, 101, 18], [114, 33, 96, 46, 105, 61], [113, 77, 96, 88, 102, 102], [86, 113, 75, 97, 59, 105], [43, 113, 31, 97, 18, 102], [6, 87, 24, 74, 15, 60], [6, 45, 24, 32, 21, 18]]);
    c.fillStyle = a; heart(c, 60, 59, 11, true);
  })],
  ['streamers', 'Ribbon Waltz', 'Loose upright satin streamers with outlined folded turns and contrasting hanging tips', 440, (c, a) => {
    for (const x of [60, 180]) { curve(c, [x - 15, 0], [[x + 42, 34, x - 47, 89, x + 12, 120], [x + 63, 151, x - 26, 211, x - 15, 240]]); curve(c, [x - 5, 0], [[x + 52, 34, x - 37, 89, x + 22, 120], [x + 73, 151, x - 16, 211, x - 5, 240]]); c.fillStyle = a; line(c, [[x + 8, 112], [x + 18, 116], [x + 25, 129], [x + 10, 124]], true); c.fillStyle = c.strokeStyle; }
  }],
  ['embossed-loops', 'Looped Letterpress', 'Romantic looping brackets framing small center bars and colored dot pairs', 430, (c, a) => repeat(c, () => {
    for (const d of [-1, 1]) curve(c, [0, -35], [[d * 47, -47, d * 55, -3, d * 26, 0], [d * 55, 3, d * 47, 47, 0, 35]]); line(c, [[-13, -7], [13, -7]]); line(c, [[-13, 7], [13, 7]]);
    c.fillStyle = a; oval(c, 0, -23, 3, 3, 0, true); oval(c, 0, 23, 3, 3, 0, true);
  })],
  ['love-stamps', 'Love Postage', 'Scalloped postage stamp silhouettes with centered hearts and paired cancellation dashes', 440, (c, a) => repeat(c, () => {
    c.beginPath(); c.moveTo(-25, -35); for (let x = -25; x < 25; x += 10) c.quadraticCurveTo(x + 5, -27, x + 10, -35); for (let y = -35; y < 35; y += 10) c.quadraticCurveTo(17, y + 5, 25, y + 10); for (let x = 25; x > -25; x -= 10) c.quadraticCurveTo(x - 5, 27, x - 10, 35); for (let y = 35; y > -35; y -= 10) c.quadraticCurveTo(-17, y - 5, -25, y - 10); c.stroke();
    c.fillStyle = a; heart(c, 0, -4, 13, true); c.strokeStyle = a; line(c, [[-11, 19], [11, 19]]);
  })],
  ['heart-chains', 'Linked Heart Chains', 'Delicate upright heart chains connected by separate contrasting oval links', 430, (c, a) => {
    for (const x of [60, 180]) for (const y of [25, 145]) { heart(c, x, y, 23); c.strokeStyle = a; oval(c, x, y + 54, 5, 20); c.strokeStyle = c.fillStyle; }
  }],
  ['frilly-cuffs', 'Frilly Cuff Notes', 'Little pleated ruffle cuffs with scalloped openings and contrasting double button studs', 430, (c, a) => repeat(c, () => {
    line(c, [[-30, -11], [-26, 25], [26, 25], [30, -11]]); for (let x = -30; x < 30; x += 12) curve(c, [x, -11], [[x - 1, -32, x + 13, -32, x + 12, -11]]); for (const x of [-18, -6, 6, 18]) line(c, [[x, -10], [x * .8, 12]]);
    c.fillStyle = a; oval(c, -7, 18, 3.5, 3.5, 0, true); oval(c, 7, 18, 3.5, 3.5, 0, true);
  })],
  ['bell-skirts', 'Bell Skirt Ballet', 'Full bell-shaped skirts with narrow waistbands, inset pleats and contrasting scalloped underskirts', 440, (c, a) => repeat(c, () => {
    curve(c, [-12, -30], [[-15, -4, -20, 14, -37, 29], [-9, 41, 9, 41, 37, 29], [20, 14, 15, -4, 12, -30]]); line(c, [[-12, -30], [12, -30]]); for (const x of [-17, 0, 17]) line(c, [[x * .4, -19], [x, 23]]);
    c.strokeStyle = a; c.lineWidth = 4; curve(c, [-37, 33], [[-30, 44, -22, 44, -17, 37], [-10, 48, 1, 48, 6, 39], [16, 48, 28, 43, 37, 33]]);
  })],
  ['ribbon-medaillon', 'Satin Medaillons', 'Round ribbon medallions with folded side tabs and a contrasting paired crescent center', 440, (c, a) => repeat(c, () => {
    oval(c, 0, 0, 28); for (const d of [-1, 1]) line(c, [[d * 25, -11], [d * 49, -20], [d * 43, 0], [d * 49, 20], [d * 25, 11]]);
    c.strokeStyle = a; curve(c, [-10, -14], [[-22, -7, -22, 7, -10, 14]]); curve(c, [10, -14], [[22, -7, 22, 7, 10, 14]]); c.fillStyle = a; oval(c, 0, 0, 4, 4, 0, true);
  })],
  ['pearl-diamonds', 'Pearl Ribbon Diamonds', 'Airy pearl diamond necklaces with separate folded ribbon ties at their lower tips', 440, (c, a) => repeat(c, () => {
    for (let i = 0; i < 4; i++) for (let j = 0; j < 7; j++) { const t = j / 7, q = i * Math.PI / 2; c.save(); c.rotate(q); oval(c, t * 31, -42 + t * 42, 2.3, 2.3, 0, true); c.restore(); }
    c.fillStyle = a; line(c, [[-5, 39], [-15, 57], [-2, 52], [7, 57], [5, 39]], true);
  })],
  ['ribbon-windows', 'Ruffled Ribbon Windows', 'Tall softly scalloped ribbon windows with inset horizontal satin bridges and tiny heart drops', 440, (c, a) => repeat(c, () => {
    for (const d of [-1, 1]) curve(c, [d * 24, -40], [[d * 43, -29, d * 16, -13, d * 27, 0], [d * 43, 15, d * 16, 29, d * 24, 40]]);
    curve(c, [-24, -40], [[-10, -48, 10, -48, 24, -40]]); curve(c, [-24, 40], [[-10, 48, 10, 48, 24, 40]]);
    c.strokeStyle = a; line(c, [[-16, -12], [16, -12]]); line(c, [[-16, 12], [16, 12]]); c.fillStyle = a; heart(c, 0, 0, 5, true);
  })],
];

export const coquettePatterns = motifs.map(([id, name, description, tileSize, render], index) => {
  const [background, patternColor, patternAccent, ink] = palettes[index % palettes.length];
  return { id: `coquette-${id}`, name, description, background, patternColor, patternAccent, ink, tileSize,
    draw(c, { color = patternColor, accent = patternAccent } = {}) {
      c.save(); c.fillStyle = color; c.strokeStyle = color; c.lineWidth = 2.5; c.lineCap = 'round'; c.lineJoin = 'round';
      // Copies preserve all ribbons and pearl threads that pass across tile edges.
      for (const x of [-240, 0, 240]) for (const y of [-240, 0, 240]) { c.save(); c.translate(x, y); render(c, accent); c.restore(); }
      c.restore();
    },
  };
});
