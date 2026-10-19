// Original keepsake illustrations, repeated on a seamless 240-unit canvas tile.
const TAU = Math.PI * 2;
const line = (c, points, fill = false) => {
  c.beginPath(); points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
  if (fill) { c.closePath(); c.fill(); } else c.stroke();
};
const ellipse = (c, x, y, rx, ry = rx, rotation = 0, fill = false) => {
  c.beginPath(); c.ellipse(x, y, rx, ry, rotation, 0, TAU); fill ? c.fill() : c.stroke();
};
const arc = (c, x, y, r, start, end) => { c.beginPath(); c.arc(x, y, r, start, end); c.stroke(); };
const curve = (c, start, ...segments) => {
  c.beginPath(); c.moveTo(...start); segments.forEach(p => c.bezierCurveTo(...p)); c.stroke();
};
const box = (c, x, y, w, h, r = 4, fill = false) => {
  c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y);
  c.quadraticCurveTo(x + w, y, x + w, y + r); c.lineTo(x + w, y + h - r);
  c.quadraticCurveTo(x + w, y + h, x + w - r, y + h); c.lineTo(x + r, y + h);
  c.quadraticCurveTo(x, y + h, x, y + h - r); c.lineTo(x, y + r);
  c.quadraticCurveTo(x, y, x + r, y); fill ? c.fill() : c.stroke();
};
const palettes = [
  ['#f6ebdf', '#ad8066', '#c6a052', '#4e382e'],
  ['#eaf0e7', '#72917c', '#b0a06d', '#33493b'],
  ['#edf0f8', '#8093b6', '#bf91a1', '#34425c'],
  ['#f8e9ed', '#b58298', '#c5a675', '#533646'],
  ['#fbf0d9', '#ba9753', '#7eaaa2', '#524328'],
  ['#eeeaf5', '#9b85b3', '#bc9b7c', '#463953'],
];

const motifs = [
  ['open-books', 'Library Afternoons', 'Open books with curved page edges and contrasting ribbon bookmarks.', 330, (c, a) => {
    curve(c, [0, 20], [-10, 12, -23, 13, -30, 16]); line(c, [[-30, 16], [-30, -20]]);
    curve(c, [-30, -20], [-20, -24, -9, -21, 0, -16], [9, -21, 20, -24, 30, -20]);
    line(c, [[30, -20], [30, 16]]); curve(c, [30, 16], [20, 13, 10, 12, 0, 20]); line(c, [[0, -16], [0, 20]]);
    c.strokeStyle = a; [-10, -3, 4].forEach(y => curve(c, [-23, y], [-17, y - 2, -12, y - 1, -7, y + 1]));
    c.fillStyle = a; line(c, [[12, -20], [19, -21], [19, 5], [15, 1], [12, 5]], true);
  }],
  ['tea-service', 'Tea Service', 'Wide teacups, arched handles, slender saucers, and rising steam.', 340, (c, a) => {
    curve(c, [-23, -9], [-23, 23, 17, 25, 17, -9]); line(c, [[-23, -9], [17, -9]]);
    curve(c, [18, -6], [42, -13, 39, 16, 15, 12]); ellipse(c, -2, 24, 30, 4);
    c.strokeStyle = a; curve(c, [-9, -19], [-18, -28, 0, -30, -7, -39]); curve(c, [6, -18], [-3, -26, 13, -29, 6, -36]);
  }],
  ['headphone-hours', 'Headphone Hours', 'Cushioned headphones with a contrasting arched band and coiled cord.', 320, (c, a) => {
    arc(c, 0, -1, 26, Math.PI, TAU); box(c, -29, -4, 12, 25, 5); box(c, 17, -4, 12, 25, 5);
    c.strokeStyle = a; arc(c, 0, -1, 20, Math.PI, TAU); curve(c, [24, 23], [24, 43, -5, 35, -5, 24], [-5, 13, 13, 22, 4, 30]);
  }],
  ['cassette-mix', 'Mixtape Memory', 'Compact cassette tapes with two reels and contrasting label windows.', 310, (c, a) => {
    box(c, -33, -22, 66, 44, 6); ellipse(c, -15, -2, 8); ellipse(c, 15, -2, 8);
    line(c, [[-12, 11], [-18, 22], [18, 22], [12, 11], [-12, 11]]);
    c.fillStyle = a; box(c, -25, -15, 50, 5, 2, true); c.strokeStyle = a; line(c, [[-6, -2], [6, -2]]);
  }],
  ['vinyl-room', 'Vinyl Room', 'Grooved records with colored center labels and tiny sleeve corners.', 320, (c, a) => {
    [29, 24, 20].forEach(r => ellipse(c, 0, 0, r)); c.fillStyle = a; ellipse(c, 0, 0, 11, 11, 0, true);
    c.strokeStyle = a; line(c, [[-36, -18], [-36, -35], [-18, -35]]); c.fillStyle = c.strokeStyle; ellipse(c, 0, 0, 2, 2, 0, true);
  }],
  ['camera-roll', 'Camera Roll', 'Retro cameras with concentric lenses, viewfinders, and flash bars.', 340, (c, a) => {
    box(c, -34, -19, 68, 43, 5); line(c, [[-18, -20], [-13, -29], [10, -29], [15, -20]]); ellipse(c, 1, 2, 16); ellipse(c, 1, 2, 9);
    c.fillStyle = a; box(c, 21, -12, 7, 7, 1, true); box(c, -27, -12, 9, 4, 1, true); c.strokeStyle = a; arc(c, 1, 2, 21, .1, 1.1);
  }],
  ['key-ring', 'Key Ring', 'Old-fashioned skeleton keys with open bows and stepped teeth.', 300, (c, a) => {
    ellipse(c, -12, -17, 13); line(c, [[-5, -6], [20, 24], [28, 18], [22, 11], [17, 15], [12, 9]]);
    c.strokeStyle = a; ellipse(c, -12, -17, 6); arc(c, -24, -29, 11, 1.5, 5.9);
  }],
  ['milk-cartons', 'Milk Carton Morning', 'Cute little milk cartons with folded tops, rounded labels, and sleepy smiles.', 370, (c, a) => {
    line(c, [[-20, -15], [-11, -31], [12, -31], [22, -15], [22, 30], [-20, 30], [-20, -15], [22, -15]]);
    line(c, [[-11, -31], [12, -15], [12, 30]]); c.fillStyle = a; box(c, -14, -7, 19, 24, 5, true);
    c.fillStyle = c.strokeStyle; ellipse(c, -9, 0, 1.6, 1.6, 0, true); ellipse(c, 0, 0, 1.6, 1.6, 0, true); arc(c, -4, 5, 4, .2, 2.9);
  }],
  ['paintbrush-studio', 'Paintbrush Studio', 'Tapered artist brushes with broad bristles and floating paint swatches.', 330, (c, a) => {
    line(c, [[-4, 36], [-6, -6], [6, -6], [4, 36]], true);
    c.strokeRect(-8, -15, 16, 10); c.fillStyle = a; c.beginPath(); c.moveTo(-8, -16); c.bezierCurveTo(-19, -29, 1, -39, 5, -38); c.bezierCurveTo(3, -28, 17, -28, 8, -16); c.closePath(); c.fill();
    ellipse(c, 26, 16, 9, 5, -.4, true);
  }],
  ['camp-lantern', 'Camp Lantern', 'Camping lanterns with tall glass windows, wire handles, and small flames.', 350, (c, a) => {
    box(c, -20, -18, 40, 43, 7); line(c, [[-22, 27], [22, 27]]); line(c, [[-22, -20], [22, -20]]); arc(c, 0, -22, 13, Math.PI, TAU);
    line(c, [[-12, -16], [-12, 23]]); line(c, [[12, -16], [12, 23]]); c.fillStyle = a;
    c.beginPath(); c.moveTo(0, -12); c.bezierCurveTo(-20, 12, 15, 22, 6, 2); c.bezierCurveTo(3, 9, 0, -2, 0, -12); c.fill();
  }],
  ['cupcake-corner', 'Cupcake Corner', 'Cozy frosted cupcakes with fluted wrappers and round berry toppers.', 380, (c, a) => {
    line(c, [[-24, 2], [-18, 31], [18, 31], [24, 2], [-24, 2]]);
    curve(c, [-24, 2], [-37, -12, -18, -19, -14, -16], [-18, -37, 16, -38, 14, -16], [27, -22, 38, -3, 24, 2]);
    c.strokeStyle = a; [-10, 0, 10].forEach(x => line(c, [[x, 10], [x * .8, 24]])); c.fillStyle = a; ellipse(c, 0, -35, 5, 5, 0, true);
  }],
  ['sailing-day', 'Sailing Day', 'Two-sail dinghies above gently curved wake marks.', 350, (c, a) => {
    line(c, [[-32, 15], [-20, 29], [19, 29], [32, 15], [-32, 15]]); line(c, [[0, -34], [0, 14]]); line(c, [[-5, -27], [-29, 9], [-5, 9], [-5, -27]]);
    c.fillStyle = a; line(c, [[5, -21], [27, 9], [5, 9]], true); c.strokeStyle = a; curve(c, [-25, 36], [-10, 31, 9, 41, 26, 35]);
  }],
  ['melody-notes', 'Melody Notes', 'Paired musical notes and standalone accent beats.', 320, (c, a) => {
    ellipse(c, -18, 18, 10, 6, -.4, true); ellipse(c, 17, 11, 10, 6, -.4, true);
    line(c, [[-9, 16], [-9, -24], [26, -31], [26, 9]]); c.lineWidth = 7; line(c, [[-8, -21], [25, -28]]);
    c.fillStyle = a; ellipse(c, -30, -24, 4, 4, 0, true); ellipse(c, 35, 30, 5, 5, 0, true);
  }],
  ['sweet-wrappers', 'Sweet Wrappers', 'Twisted candy wrappers with contrasting striped centers.', 300, (c, a) => {
    ellipse(c, 0, 0, 19, 14); line(c, [[-18, -4], [-33, -14], [-29, 0], [-33, 14], [-18, 4]]); line(c, [[18, -4], [33, -14], [29, 0], [33, 14], [18, 4]]);
    c.strokeStyle = a; c.lineWidth = 5; line(c, [[-8, -10], [1, 11]]); line(c, [[4, -11], [12, 7]]);
  }],
  ['pretzel-break', 'Pretzel Break', 'Knotted bakery pretzels with little salt flecks.', 330, (c, a) => {
    c.lineWidth = 8; curve(c, [-17, 20], [-2, -1, 18, -26, 28, -13], [49, 14, -4, 36, -25, 9], [-46, -18, -12, -35, 1, -12], [9, 0, 15, 10, 22, 20]);
    c.strokeStyle = a; c.lineWidth = 3; [[-17, -14], [22, -9], [1, 20], [-25, 5]].forEach(([x, y]) => line(c, [[x, y], [x + 3, y + 2]]));
  }],
  ['sewing-scissors', 'Sewing Scissors', 'Open scissors with rounded handles and contrasting cutting blades.', 340, (c, a) => {
    ellipse(c, -12, 21, 10, 13, .4); ellipse(c, 13, 20, 10, 13, -.4); line(c, [[-8, 10], [18, -32], [4, 3]]); line(c, [[8, 10], [-18, -32], [-4, 3]]);
    c.fillStyle = a; ellipse(c, 0, 2, 4, 4, 0, true); c.strokeStyle = a; line(c, [[-4, -12], [-12, -27]]); line(c, [[4, -12], [12, -27]]);
  }],
  ['butter-toast', 'Butter Toast', 'Rounded toast slices with golden butter pats and tiny crumb companions.', 360, (c, a) => {
    c.beginPath(); c.moveTo(-24, 27); c.lineTo(-24, -7); c.bezierCurveTo(-40, -35, 40, -35, 24, -7); c.lineTo(24, 27); c.closePath(); c.stroke();
    c.strokeStyle = a; curve(c, [-17, 18], [-17, 6, -17, -7, -17, -11], [-26, -29, 26, -29, 17, -11], [17, -6, 17, 10, 17, 18]); c.fillStyle = a; box(c, -8, -5, 16, 13, 3, true); ellipse(c, 33, 19, 3, 3, 0, true); ellipse(c, 28, 30, 2.5, 2.5, 0, true);
  }],
  ['teapot-table', 'Teapot Table', 'Plump cafe teapots with looping handles, curving spouts, and colored lids.', 390, (c, a) => {
    ellipse(c, -2, 5, 25, 23); curve(c, [-23, -4], [-51, -27, -49, 29, -24, 19]); curve(c, [21, 1], [30, 2, 33, -13, 39, -15], [40, 6, 30, 18, 18, 20]);
    c.strokeStyle = a; arc(c, -2, -15, 17, Math.PI, TAU); c.fillStyle = a; ellipse(c, -2, -34, 5, 4, 0, true); ellipse(c, -2, 6, 9, 6, 0, true);
  }],
  ['alarm-clock', 'Slow Morning', 'Twin-bell alarm clocks with contrasting hands and little feet.', 340, (c, a) => {
    ellipse(c, 0, 2, 24); line(c, [[-15, 22], [-19, 32]]); line(c, [[15, 22], [19, 32]]); ellipse(c, -18, -25, 12, 6, -.5); ellipse(c, 18, -25, 12, 6, .5);
    c.strokeStyle = a; line(c, [[0, -13], [0, 2], [12, 8]]); line(c, [[-31, -23], [-37, -28]]); line(c, [[31, -23], [37, -28]]);
  }],
  ['satchel-stories', 'Satchel Stories', 'Rounded school satchels with buckled flaps and short carry handles.', 340, (c, a) => {
    box(c, -29, -19, 58, 48, 7); curve(c, [-11, -21], [-11, -36, 11, -36, 11, -21]); line(c, [[-29, -8], [0, 6], [29, -8]]);
    c.fillStyle = a; box(c, -5, -1, 10, 16, 2, true); c.strokeStyle = a; line(c, [[-20, 21], [20, 21]]);
  }],
  ['cinema-tickets', 'Cinema Tickets', 'Notched cinema tickets with perforations and colored admission bars.', 310, (c, a) => {
    c.beginPath(); c.moveTo(-34, -19); c.lineTo(34, -19); c.lineTo(34, -6); c.bezierCurveTo(24, -6, 24, 6, 34, 6); c.lineTo(34, 19); c.lineTo(-34, 19); c.lineTo(-34, 6); c.bezierCurveTo(-24, 6, -24, -6, -34, -6); c.closePath(); c.stroke();
    c.strokeStyle = a; [-12, -4, 4, 12].forEach(y => line(c, [[13, y], [13, y + 2]])); c.fillStyle = a; box(c, -22, -10, 23, 6, 2, true); box(c, -22, 3, 16, 6, 2, true);
  }],
  ['bright-ideas', 'Bright Ideas', 'Round lightbulbs with sculpted bases, filaments, and short rays.', 350, (c, a) => {
    c.beginPath(); c.moveTo(-10, 17); c.bezierCurveTo(-10, 4, -23, 2, -23, -15); c.bezierCurveTo(-23, -45, 23, -45, 23, -15); c.bezierCurveTo(23, 2, 10, 4, 10, 17); c.closePath(); c.stroke();
    line(c, [[-10, 24], [10, 24]]); line(c, [[-7, 31], [7, 31]]); c.strokeStyle = a; line(c, [[-3, 15], [-8, -8], [0, -2], [8, -8], [3, 15]]); line(c, [[-31, -18], [-38, -18]]); line(c, [[31, -18], [38, -18]]);
  }],
  ['message-bottles', 'Message Bottles', 'Corked glass bottles with rolled paper messages and little water marks.', 350, (c, a) => {
    c.beginPath(); c.moveTo(-8, -27); c.lineTo(-8, -13); c.bezierCurveTo(-8, -4, -21, -6, -21, 6); c.lineTo(-21, 27); c.quadraticCurveTo(-21, 33, -15, 33); c.lineTo(15, 33); c.quadraticCurveTo(21, 33, 21, 27); c.lineTo(21, 6); c.bezierCurveTo(21, -6, 8, -4, 8, -13); c.lineTo(8, -27); c.closePath(); c.stroke();
    c.fillStyle = a; box(c, -10, -34, 20, 8, 2, true); c.strokeStyle = a; box(c, -9, 2, 18, 23, 3); line(c, [[-4, 9], [4, 9]]); line(c, [[-4, 16], [4, 16]]);
  }],
  ['rainy-umbrellas', 'Rainy Umbrellas', 'Scalloped umbrella canopies with curved hook handles and alternate panels.', 350, (c, a) => {
    c.beginPath(); c.moveTo(-32, 0); c.bezierCurveTo(-28, -36, 28, -36, 32, 0); c.bezierCurveTo(23, -7, 18, -7, 11, 0); c.bezierCurveTo(3, -7, -3, -7, -11, 0); c.bezierCurveTo(-18, -7, -23, -7, -32, 0); c.stroke(); curve(c, [0, -29], [-13, -16, -11, -6, -11, 0]);
    c.strokeStyle = a; curve(c, [0, -29], [13, -16, 11, -6, 11, 0]); curve(c, [0, -2], [0, 12, 0, 16, 0, 24], [0, 39, 20, 36, 17, 23]);
  }],
  ['roller-rink', 'Roller Rink', 'Retro high-top roller skates with colored laces and four little wheels.', 360, (c, a) => {
    line(c, [[-25, -29], [-5, -29], [-2, -1], [25, 4], [30, 13], [30, 20], [-27, 20], [-25, -29]]); line(c, [[-28, 25], [30, 25]]); ellipse(c, -16, 33, 6); ellipse(c, 19, 33, 6);
    c.strokeStyle = a; [-21, -12, -3].forEach(y => line(c, [[-14, y], [-5, y - 2]])); line(c, [[-25, 13], [27, 13]]);
  }],
  ['balloon-journey', 'Balloon Journey', 'Segmented hot-air balloons with fine suspension ropes and small baskets.', 370, (c, a) => {
    c.beginPath(); c.moveTo(-10, 15); c.bezierCurveTo(-48, -17, -23, -45, 0, -39); c.bezierCurveTo(23, -45, 48, -17, 10, 15); c.closePath(); c.stroke();
    line(c, [[-10, 16], [-7, 28]]); line(c, [[10, 16], [7, 28]]); c.fillStyle = a; box(c, -11, 28, 22, 11, 2, true); c.strokeStyle = a;
    curve(c, [-4, -38], [-19, -19, -11, 2, -5, 14]); curve(c, [4, -38], [19, -19, 11, 2, 5, 14]);
  }],
  ['pocket-compass', 'Pocket Compass', 'Round navigation compasses with two-tone needles and cardinal tick marks.', 340, (c, a) => {
    ellipse(c, 0, 0, 28); ellipse(c, 0, -35, 5); line(c, [[-4, 4], [10, -18], [4, -4], [-10, 18], [-4, 4]]);
    c.fillStyle = a; line(c, [[-4, 4], [10, -18], [4, -4]], true); c.strokeStyle = a; [[0, -23, 0, -18], [0, 23, 0, 18], [-23, 0, -18, 0], [23, 0, 18, 0]].forEach(p => line(c, [p.slice(0, 2), p.slice(2)]));
  }],
  ['game-night', 'Game Night', 'Rounded game controllers with a cross pad and colored action buttons.', 340, (c, a) => {
    c.beginPath(); c.moveTo(-19, -18); c.bezierCurveTo(-31, -20, -41, 26, -28, 27); c.bezierCurveTo(-18, 30, -14, 11, -8, 12); c.lineTo(8, 12); c.bezierCurveTo(14, 11, 18, 30, 28, 27); c.bezierCurveTo(41, 26, 31, -20, 19, -18); c.closePath(); c.stroke();
    line(c, [[-24, -2], [-10, -2]]); line(c, [[-17, -9], [-17, 5]]); c.fillStyle = a; ellipse(c, 16, 1, 4, 4, 0, true); ellipse(c, 25, -7, 4, 4, 0, true);
  }],
  ['watering-can', 'Watering Can', 'Garden watering cans with broad handles, angled spouts, and falling droplets.', 360, (c, a) => {
    box(c, -22, -10, 38, 37, 5); curve(c, [-21, -5], [-50, -26, -46, 26, -23, 15]); line(c, [[16, 18], [33, -17], [40, -14], [17, 26]]); curve(c, [-13, -11], [-13, -31, 13, -31, 13, -11]);
    c.strokeStyle = a; line(c, [[30, -21], [43, -15]]); c.fillStyle = a; ellipse(c, 44, -6, 2.5, 4, .5, true); ellipse(c, 50, 5, 2.5, 4, .5, true); line(c, [[-14, 16], [7, 16]]);
  }],
  ['croissant-cafe', 'Croissant Cafe', 'Crescent pastries with layered folds and companion crumb clusters.', 330, (c, a) => {
    c.beginPath(); c.moveTo(-34, 14); c.bezierCurveTo(-24, -35, 24, -35, 34, 14); c.bezierCurveTo(20, 7, 17, 10, 12, 3); c.bezierCurveTo(7, -4, -7, -4, -12, 3); c.bezierCurveTo(-17, 10, -20, 7, -34, 14); c.stroke();
    c.strokeStyle = a; curve(c, [-16, -15], [-15, -7, -13, -3, -12, 3]); curve(c, [0, -23], [-5, -14, -3, -10, 0, -5]); curve(c, [16, -15], [15, -7, 13, -3, 12, 3]); c.fillStyle = a; ellipse(c, 15, 28, 3, 3, 0, true); ellipse(c, 24, 23, 2.5, 2.5, 0, true);
  }],
];

export const keepsakePatterns = motifs.map(([id, name, description, tileSize, motif], index) => {
  const [background, patternColor, patternAccent, ink] = palettes[index % palettes.length];
  return {
    id: `keepsake-${id}`, name, description, background, patternColor, patternAccent, ink, tileSize: Math.max(350, tileSize),
    draw(c, { color = patternColor, accent = patternAccent } = {}) {
      c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
      // Wrapping placements at every edge preserves repeat continuity across device ratios.
      for (const [x, y, angle] of [[33, 39, -.18], [160, 68, .16], [92, 171, .12], [224, 207, -.2]]) {
        for (const dx of [-240, 0, 240]) for (const dy of [-240, 0, 240]) {
          c.save(); c.translate(x + dx, y + dy); c.rotate(angle);
          c.strokeStyle = color; c.fillStyle = color; c.lineWidth = 2.8;
          motif(c, accent); c.restore();
        }
      }
      c.restore();
    },
  };
});
