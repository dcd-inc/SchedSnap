// Original dessert, hobby, and fantasy illustrations on seamless 240-unit tiles.
const TAU = Math.PI * 2;
const line = (c, pts, fill = false) => {
  c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
  if (fill) { c.closePath(); c.fill(); } else c.stroke();
};
const oval = (c, x, y, rx, ry = rx, angle = 0, fill = false) => {
  c.beginPath(); c.ellipse(x, y, rx, ry, angle, 0, TAU); fill ? c.fill() : c.stroke();
};
const curve = (c, start, ...parts) => {
  c.beginPath(); c.moveTo(...start); parts.forEach(p => c.bezierCurveTo(...p)); c.stroke();
};
const box = (c, x, y, w, h, r = 4, fill = false) => {
  c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r);
  c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r); c.lineTo(x, y + r);
  c.quadraticCurveTo(x, y, x + r, y); fill ? c.fill() : c.stroke();
};
const spark = (c, x, y, size = 7) => line(c, [[x, y - size], [x + size * .3, y - size * .3], [x + size, y], [x + size * .3, y + size * .3], [x, y + size], [x - size * .3, y + size * .3], [x - size, y], [x - size * .3, y - size * .3]], true);
const palettes = [
  ['#fbefe1', '#b88d67', '#d7a06f', '#513c2b'],
  ['#f7e9ef', '#b88a9e', '#aaad86', '#573b49'],
  ['#eaf1ee', '#80a295', '#c2a46b', '#354d44'],
  ['#eeedf8', '#9b90ba', '#c3a180', '#443b59'],
  ['#fbf2dc', '#bea269', '#a6b4a1', '#54482f'],
  ['#edf2f8', '#8babc2', '#c6a1a8', '#384e61'],
];

const motifs = [
  ['custard-pudding', 'Custard Cuddle', 'Rounded caramel puddings on oval saucers with little spoon companions.', 370, (c, a) => {
    oval(c, 0, 24, 32, 6); line(c, [[-23, 17], [-16, -20], [16, -20], [23, 17]]); curve(c, [-23, 17], [-13, 24, 13, 24, 23, 17]);
    c.fillStyle = a; oval(c, 0, -19, 16, 5, 0, true); c.strokeStyle = a; line(c, [[35, 3], [35, 22]]); oval(c, 35, -3, 4, 7);
  }],
  ['macaron-box', 'Macaron Daydream', 'Plump almond macarons with ruffled filling and offset crumb pairs.', 350, (c, a) => {
    curve(c, [-27, -3], [-27, -32, 27, -32, 27, -3]); curve(c, [-27, 6], [-25, 29, 25, 29, 27, 6]);
    line(c, [[-27, -3], [27, -3]]); line(c, [[-27, 6], [27, 6]]); c.strokeStyle = a; c.lineWidth = 5;
    curve(c, [-26, 1], [-17, -4, -12, 7, -3, 1], [6, -5, 12, 7, 26, 1]); c.fillStyle = a; oval(c, 33, 23, 3, 3, 0, true);
  }],
  ['iced-doughnuts', 'Doughnut Daze', 'Soft round doughnuts with wavy icing rings and bright sprinkle strokes.', 360, (c, a) => {
    oval(c, 0, 0, 29, 27); oval(c, 0, 0, 8); c.strokeStyle = a;
    curve(c, [-24, -7], [-14, -25, 13, -28, 24, -6], [33, 7, 14, 20, 6, 18], [-4, 12, -18, 31, -25, 10], [-28, 3, -26, -3, -24, -7]);
    [[-12, -14], [13, -12], [16, 10], [-12, 13]].forEach(([x, y]) => line(c, [[x - 2, y - 2], [x + 3, y + 1]]));
  }],
  ['gelato-cones', 'Gelato Stroll', 'Single-scoop gelato cones with waffle seams and melting scallops.', 390, (c, a) => {
    line(c, [[-18, -1], [0, 35], [18, -1], [-18, -1]]); c.strokeStyle = a;
    curve(c, [-19, -1], [-35, -13, -19, -39, 0, -34], [19, -39, 35, -13, 19, -1], [12, 8, 9, -1, 0, 3], [-8, 10, -10, -1, -19, -1]);
    line(c, [[-11, 5], [9, 19]]); line(c, [[11, 5], [-4, 25]]);
  }],
  ['ramen-evening', 'Ramen Evening', 'Cozy ramen bowls with chopsticks, noodle loops, and a colored egg topping.', 400, (c, a) => {
    oval(c, 0, 0, 32, 8); curve(c, [-32, 1], [-27, 40, 27, 40, 32, 1]); line(c, [[-15, 30], [15, 30]]);
    line(c, [[-20, -15], [26, -31]]); line(c, [[-17, -9], [30, -25]]); c.strokeStyle = a;
    curve(c, [-23, 1], [-15, -10, -10, 11, -3, 0], [0, -5, 5, -3, 8, 1]); c.fillStyle = a; oval(c, 17, -1, 6, 4, -.2, true);
  }],
  ['onigiri-picnic', 'Onigiri Picnic', 'Rounded triangular rice snacks with broad seaweed wraps and sesame accents.', 350, (c, a) => {
    c.beginPath(); c.moveTo(-28, 19); c.quadraticCurveTo(-35, 19, -30, 9); c.lineTo(-7, -28); c.quadraticCurveTo(0, -37, 7, -28); c.lineTo(30, 9); c.quadraticCurveTo(35, 19, 28, 19); c.closePath(); c.stroke();
    c.fillStyle = a; box(c, -10, 2, 20, 21, 3, true); c.strokeStyle = a; line(c, [[-14, -8], [-11, -10]]); line(c, [[10, -13], [13, -10]]);
  }],
  ['sushi-rolls', 'Sushi Sunday', 'Cut sushi rolls with curved nori walls and three contrasting filling pieces.', 350, (c, a) => {
    oval(c, 0, -8, 26, 17); curve(c, [-26, -8], [-29, 25, 29, 25, 26, -8]); c.fillStyle = a;
    oval(c, -8, -8, 6, 5, .2, true); oval(c, 7, -11, 6, 4, -.3, true); oval(c, 4, 0, 5, 3, .2, true); c.strokeStyle = a; curve(c, [-19, 5], [-10, 14, 10, 14, 19, 5]);
  }],
  ['peach-soda', 'Peach Soda Pop', 'Rounded soda cans with ring pulls, fruit labels, and ascending bubble clusters.', 390, (c, a) => {
    box(c, -19, -29, 38, 58, 9); oval(c, 0, -27, 13, 4); c.strokeStyle = a; oval(c, 0, -27, 4, 2);
    c.fillStyle = a; oval(c, -4, 4, 8, 11, .2, true); oval(c, 5, 4, 8, 11, -.2, true); c.strokeStyle = a; oval(c, 29, -11, 4); oval(c, 35, -24, 2.5);
  }],
  ['chocolate-tablets', 'Chocolate Squares', 'Rounded chocolate bars divided into raised contrasting cocoa squares.', 360, (c, a) => {
    box(c, -24, -32, 48, 64, 4); c.strokeStyle = a;
    for (const x of [-18, 3]) for (const y of [-25, -6, 13]) { box(c, x, y, 15, 13, 2); line(c, [[x + 4, y + 4], [x + 10, y + 4]]); }
  }],
  ['jam-pantry', 'Jam Pantry', 'Small preserves jars with fabric lid covers, berry labels, and stitched hems.', 380, (c, a) => {
    box(c, -21, -17, 42, 47, 8); line(c, [[-27, -14], [-24, -30], [24, -30], [27, -14], [18, -18], [10, -13], [0, -18], [-10, -13], [-18, -18], [-27, -14]]);
    c.strokeStyle = a; box(c, -14, -4, 28, 22, 4); c.fillStyle = a; oval(c, 0, 6, 6, 7, 0, true); line(c, [[-17, -24], [17, -24]]);
  }],
  ['parfait-glasses', 'Parfait Hour', 'Tall fluted dessert glasses with layered cream, fruit, and wafer sticks.', 400, (c, a) => {
    line(c, [[-23, -18], [-12, 27], [12, 27], [23, -18]]); line(c, [[-12, 27], [12, 27]]); line(c, [[0, 27], [0, 35]]); line(c, [[-12, 35], [12, 35]]);
    curve(c, [-23, -18], [-14, -30, -3, -26, 0, -35], [6, -24, 15, -29, 23, -18]); line(c, [[11, -26], [19, -43]]);
    c.strokeStyle = a; line(c, [[-18, -5], [18, -5]]); line(c, [[-15, 9], [15, 9]]); c.fillStyle = a; oval(c, -9, -18, 4, 3, 0, true);
  }],
  ['storybook-castles', 'Storybook Castles', 'Small rounded fairy-tale castles with conical roofs and colored arched doors.', 410, (c, a) => {
    line(c, [[-30, 29], [-30, -11], [-14, -11], [-14, 0], [14, 0], [14, -11], [30, -11], [30, 29], [-30, 29]]);
    line(c, [[-35, -11], [-22, -32], [-9, -11], [-35, -11]]); line(c, [[9, -11], [22, -32], [35, -11], [9, -11]]);
    c.fillStyle = a; box(c, -8, 11, 16, 18, 8, true); box(c, -25, -2, 6, 10, 3, true); box(c, 19, -2, 6, 10, 3, true);
  }],
  ['treasure-trunks', 'Treasure Trunks', 'Curved treasure chests with broad metal bands, clasps, and loose coin pairs.', 390, (c, a) => {
    box(c, -31, -7, 62, 34, 5); curve(c, [-31, -7], [-31, -40, 31, -40, 31, -7]); line(c, [[-31, -7], [31, -7]]);
    c.strokeStyle = a; line(c, [[-19, -25], [-19, 25]]); line(c, [[19, -25], [19, 25]]); c.fillStyle = a; box(c, -5, -11, 10, 17, 2, true); oval(c, 36, 29, 5, 3, 0, true);
  }],
  ['snow-globe', 'Snow Globe Wishes', 'Domed keepsake globes with tiny mountain scenes and floating snow specks.', 410, (c, a) => {
    c.beginPath(); c.arc(0, -6, 29, .69, Math.PI * 2 + .69); c.stroke(); box(c, -27, 17, 54, 14, 5);
    c.strokeStyle = a; line(c, [[-20, 10], [-8, -12], [0, 0], [9, -18], [21, 10]]); c.fillStyle = a; [[-18, -13], [4, -26], [19, -5]].forEach(([x, y]) => oval(c, x, y, 2.5, 2.5, 0, true));
  }],
  ['potion-pantry', 'Potion Pantry', 'Pear-shaped magical potion flasks with cork stoppers and shimmering liquid.', 400, (c, a) => {
    c.beginPath(); c.moveTo(-9, -26); c.lineTo(-9, -12); c.bezierCurveTo(-9, -2, -28, 1, -28, 16); c.bezierCurveTo(-28, 42, 28, 42, 28, 16); c.bezierCurveTo(28, 1, 9, -2, 9, -12); c.lineTo(9, -26); c.closePath(); c.stroke();
    c.fillStyle = a; box(c, -11, -35, 22, 10, 3, true); c.strokeStyle = a; curve(c, [-23, 15], [-7, 4, 8, 26, 23, 15]); spark(c, 0, 24, 6); oval(c, 35, -5, 3);
  }],
  ['magic-wands', 'Pocket Magic', 'Diamond-tipped magic wands with curling trails and scattered glints.', 380, (c, a) => {
    c.lineWidth = 5; line(c, [[-21, 29], [8, -8]]); line(c, [[12, -31], [26, -17], [12, -3], [-2, -17], [12, -31]]);
    c.strokeStyle = a; c.lineWidth = 2.8; curve(c, [-28, -8], [-42, -35, -5, -41, -13, -18]); c.fillStyle = a; spark(c, 31, 18, 9); spark(c, -11, -30, 5);
  }],
  ['tiny-crowns', 'Velvet Crowns', 'Soft pointed crowns with round tip beads and contrasting gem medallions.', 360, (c, a) => {
    line(c, [[-29, -13], [-22, 24], [22, 24], [29, -13], [12, -1], [0, -25], [-12, -1], [-29, -13]]); line(c, [[-23, 15], [23, 15]]);
    c.fillStyle = a; [[-29, -15], [0, -27], [29, -15]].forEach(([x, y]) => oval(c, x, y, 4, 4, 0, true)); line(c, [[0, -3], [6, 4], [0, 11], [-6, 4]], true);
  }],
  ['crystal-futures', 'Crystal Futures', 'Round crystal balls on curved stands with crescent reflections and colored mist.', 390, (c, a) => {
    oval(c, 0, -7, 27); curve(c, [-23, 12], [-23, 31, 23, 31, 23, 12]); line(c, [[-17, 28], [-23, 35], [23, 35], [17, 28]]);
    c.strokeStyle = a; curve(c, [-16, 0], [-9, -15, 8, 6, 15, -10]); curve(c, [-17, -18], [-16, -25, -10, -29, -3, -29]); c.fillStyle = a; spark(c, 7, 5, 7);
  }],
  ['sewing-machines', 'Sewing Sunday', 'Rounded miniature sewing machines with colored handwheels and fabric swatches.', 400, (c, a) => {
    line(c, [[-32, 25], [-32, 15], [8, 15], [8, -16], [-14, -16], [-14, -3], [-24, -3], [-24, -25], [23, -25], [30, -17], [30, 25], [-32, 25]]);
    line(c, [[-18, -3], [-18, 10]]); c.strokeStyle = a; oval(c, 18, -10, 7); line(c, [[7, -25], [7, -33]]); c.fillStyle = a; box(c, -29, 10, 25, 5, 2, true);
  }],
  ['yarn-nest', 'Yarn Nest', 'Round balls of yarn with curved winding bands and long loose tails.', 370, (c, a) => {
    oval(c, -3, -3, 26); curve(c, [-25, -15], [-14, -13, 4, 9, 8, 21]); curve(c, [-28, -3], [-18, -1, -3, 16, -1, 23]);
    c.strokeStyle = a; curve(c, [-12, -27], [-11, -12, 7, -5, 23, -3]); curve(c, [-1, -29], [1, -16, 14, -13, 21, -12]); curve(c, [14, 18], [43, 30, 40, -2, 29, 9], [19, 21, 43, 30, 42, 37]);
  }],
  ['ferris-fair', 'Ferris Fair', 'Small fairground wheels with suspended rounded gondolas and tripod supports.', 430, (c, a) => {
    oval(c, 0, -6, 28); line(c, [[0, -6], [-20, 35]]); line(c, [[0, -6], [20, 35]]); line(c, [[-24, 35], [24, 35]]);
    c.strokeStyle = a; for (let i = 0; i < 6; i++) { const t = i * TAU / 6, x = Math.cos(t) * 28, y = Math.sin(t) * 28 - 6; line(c, [[0, -6], [x, y]]); box(c, x - 5, y + 1, 10, 8, 3); }
  }],
  ['puzzle-pieces', 'Puzzle Pieces', 'Rounded jigsaw pieces with playful tabs and inset colored companion squares.', 360, (c, a) => {
    c.beginPath(); c.moveTo(-24, -24); c.lineTo(-6, -24); c.bezierCurveTo(-16, -43, 16, -43, 6, -24); c.lineTo(24, -24); c.lineTo(24, -6); c.bezierCurveTo(5, -16, 5, 16, 24, 6); c.lineTo(24, 24); c.lineTo(6, 24); c.bezierCurveTo(16, 5, -16, 5, -6, 24); c.lineTo(-24, 24); c.closePath(); c.stroke();
    c.fillStyle = a; box(c, -15, -15, 14, 14, 4, true); c.strokeStyle = a; line(c, [[-16, 8], [-10, 8]]);
  }],
  ['ballet-ribbons', 'Ballet Ribbons', 'Paired soft ballet slippers with crossed satin straps and flowing ankle ribbons.', 420, (c, a) => {
    oval(c, -13, 6, 10, 27, -.25); oval(c, 13, 6, 10, 27, .25); c.strokeStyle = a;
    line(c, [[-23, -4], [-9, 13]]); line(c, [[-7, -6], [-20, 15]]); line(c, [[7, -6], [20, 15]]); line(c, [[23, -4], [9, 13]]);
    curve(c, [-17, -20], [-35, -48, -1, -39, 0, -28]); curve(c, [17, -20], [35, -48, 1, -39, 0, -28]);
  }],
  ['tambourine-tunes', 'Tambourine Tunes', 'Round tambourines with paired metal jingles and a colored curved drumhead.', 370, (c, a) => {
    oval(c, 0, 0, 29); oval(c, 0, 0, 23); c.fillStyle = a;
    for (let i = 0; i < 5; i++) { const t = i * TAU / 5; oval(c, Math.cos(t) * 27, Math.sin(t) * 27, 6, 3, t, true); }
    c.strokeStyle = a; curve(c, [-13, 8], [-4, -1, 4, 19, 14, 3]);
  }],
  ['xylophone-play', 'Xylophone Play', 'Six graduated wooden music bars with contrasting pins and crossed mallets.', 410, (c, a) => {
    line(c, [[-31, -12], [31, -12]]); line(c, [[-31, 12], [31, 12]]);
    for (let i = 0; i < 6; i++) { const h = 51 - i * 5; box(c, -31 + i * 11, -h / 2, 8, h, 3); }
    c.fillStyle = a; for (let i = 0; i < 6; i++) oval(c, -27 + i * 11, -8, 2, 2, 0, true);
    c.strokeStyle = a; line(c, [[-18, 40], [15, 24]]); line(c, [[-14, 25], [20, 40]]); oval(c, 17, 23, 4); oval(c, -16, 24, 4);
  }],
  ['little-easels', 'Little Easels', 'Studio easels carrying quiet two-color landscape paintings and paint daubs.', 400, (c, a) => {
    line(c, [[-22, 36], [-5, -37]]); line(c, [[22, 36], [5, -37]]); line(c, [[-27, 20], [27, 20]]); box(c, -26, -28, 52, 45, 2);
    c.strokeStyle = a; curve(c, [-20, 9], [-8, -12, 0, 9, 20, -2]); c.fillStyle = a; oval(c, 10, -16, 5, 5, 0, true); oval(c, -31, 30, 4, 3, .3, true);
  }],
  ['picnic-hampers', 'Picnic Hampers', 'Lidded wicker picnic baskets with arched handles and hanging check cloths.', 400, (c, a) => {
    line(c, [[-30, -7], [-23, 27], [23, 27], [30, -7], [-30, -7]]); curve(c, [-19, -9], [-19, -43, 19, -43, 19, -9]); box(c, -32, -12, 64, 7, 3);
    c.strokeStyle = a; [-12, 0, 12].forEach(x => line(c, [[x, 2], [x * .75, 21]])); line(c, [[-24, 10], [0, 10]]); c.fillStyle = a; line(c, [[7, -5], [23, -5], [19, 17], [14, 12], [8, 17]], true);
  }],
  ['popcorn-party', 'Popcorn Party', 'Striped cinema popcorn cartons with clusters of fluffy rounded kernels.', 390, (c, a) => {
    line(c, [[-25, -9], [-18, 32], [18, 32], [25, -9], [-25, -9]]);
    curve(c, [-24, -10], [-40, -19, -20, -31, -14, -24], [-16, -43, 7, -43, 7, -28], [21, -42, 33, -23, 23, -18], [36, -12, 27, -5, 22, -9]);
    c.strokeStyle = a; c.lineWidth = 6; line(c, [[-12, -2], [-8, 25]]); line(c, [[2, -2], [2, 25]]); line(c, [[16, -2], [12, 25]]);
  }],
  ['bubble-tea', 'Bubble Tea Break', 'Dome-lidded tea cups with angled straws and big contrasting tapioca pearls.', 400, (c, a) => {
    line(c, [[-24, -16], [-17, 32], [17, 32], [24, -16], [-24, -16]]); curve(c, [-25, -18], [-25, -39, 25, -39, 25, -18]); line(c, [[3, -22], [12, -45]]);
    c.strokeStyle = a; line(c, [[-20, -4], [20, -4]]); c.fillStyle = a; [[-9, 22], [5, 23], [12, 12], [-3, 10], [-13, 11]].forEach(([x, y]) => oval(c, x, y, 4, 4, 0, true));
  }],
  ['pancake-stack', 'Pancake Stack', 'Fluffy stacked pancakes with melting syrup trails and a tilted butter pat.', 390, (c, a) => {
    oval(c, 0, -13, 29, 10); [-4, 6, 16].forEach(y => curve(c, [-29, y], [-24, y + 14, 24, y + 14, 29, y]));
    line(c, [[-29, -12], [-29, 16]]); line(c, [[29, -12], [29, 16]]); c.fillStyle = a; line(c, [[-10, -20], [4, -23], [12, -16], [-3, -12]], true);
    c.strokeStyle = a; curve(c, [-17, -8], [-13, -5, -14, 9, -7, 8], [-1, 7, -7, -3, 3, -4], [9, -4, 7, 13, 14, 12], [20, 11, 12, 0, 24, -7]);
  }],
];

export const daydreamPatterns = motifs.map(([id, name, description, tileSize, motif], index) => {
  const [background, patternColor, patternAccent, ink] = palettes[index % palettes.length];
  return {
    id: `dream-${id}`, name, description, background, patternColor, patternAccent, ink, tileSize,
    draw(c, { color = patternColor, accent = patternAccent } = {}) {
      c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
      for (const [x, y, tilt] of [[35, 40, -.12], [163, 77, .15], [93, 174, .1], [226, 213, -.16]]) {
        for (const dx of [-240, 0, 240]) for (const dy of [-240, 0, 240]) {
          c.save(); c.translate(x + dx, y + dy); c.rotate(tilt);
          c.lineWidth = 2.8; c.strokeStyle = color; c.fillStyle = color;
          motif(c, accent); c.restore();
        }
      }
      c.restore();
    },
  };
});
