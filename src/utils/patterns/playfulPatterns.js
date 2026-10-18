// Original Canvas motifs; coordinates are a seamless 240-unit tile.
const TAU = Math.PI * 2;
const line = (c, points, close = false, fill = false) => {
  c.beginPath(); c.moveTo(...points[0]);
  points.slice(1).forEach(p => c.lineTo(...p));
  if (close) c.closePath();
  if (fill) c.fill(); else c.stroke();
};
const oval = (c, x, y, rx, ry = rx, angle = 0, fill = true) => {
  c.beginPath(); c.ellipse(x, y, rx, ry, angle, 0, TAU);
  if (fill) c.fill(); else c.stroke();
};
const curve = (c, points) => {
  c.beginPath(); c.moveTo(...points[0]);
  points.slice(1).forEach(p => c.bezierCurveTo(...p)); c.stroke();
};
const star = (c, points, inner, outer) => {
  line(c, Array.from({ length: points * 2 }, (_, i) => {
    const a = i * Math.PI / points - Math.PI / 2, r = i % 2 ? inner : outer;
    return [Math.cos(a) * r, Math.sin(a) * r];
  }), true, true);
};
const heart = (c, size) => {
  c.beginPath(); c.moveTo(0, size);
  c.bezierCurveTo(-size * 2, 0, -size, -size * 1.5, 0, -size * .5);
  c.bezierCurveTo(size, -size * 1.5, size * 2, 0, 0, size); c.fill();
};
const flower = (c, count, radius, petal) => {
  for (let i = 0; i < count; i++) {
    const a = i * TAU / count;
    oval(c, Math.cos(a) * radius, Math.sin(a) * radius, petal, petal * .62, a);
  }
};
// Each placement is wrapped in both directions so edge-crossing artwork repeats cleanly.
const repeat = (c, placements, draw) => {
  placements.forEach(([x, y, angle = 0, scale = 1], index) => {
    for (const dx of [-240, 0, 240]) for (const dy of [-240, 0, 240]) {
      c.save(); c.translate(x + dx, y + dy); c.rotate(angle); c.scale(scale, scale);
      draw(c, index); c.restore();
    }
  });
};
const scatter = [[28, 34, -.25], [151, 20, .3], [92, 112, -.15], [213, 137, .4], [32, 211, .2], [157, 220, -.4]];
const sparse = [[38, 45, -.15], [167, 76, .25], [95, 183, -.3], [224, 216, .2]];
const regular = [[30, 30], [150, 30], [90, 150], [210, 150]];
const make = (id, name, description, palette, tileSize, motif) => ({
  id: `play-${id}`, name, description,
  background: palette[0], patternColor: palette[1], patternAccent: palette[2], ink: palette[3], tileSize,
  draw(c, { color, accent, seed = 0 }) {
    c.save(); c.strokeStyle = color; c.fillStyle = color;
    c.lineWidth = 2.4; c.lineCap = 'round'; c.lineJoin = 'round';
    motif(c, color, accent, seed); c.restore();
  },
});

export const playfulPatterns = [
  make('star-diary', 'Star Diary', 'Tiny five-point stars with orbiting pin dots.', ['#f8f0de', '#b77b49', '#dab887', '#4f382c'], 280, (c, color, accent) => {
    repeat(c, scatter, (c, i) => { c.fillStyle = i % 2 ? accent : color; star(c, 5, 4, 11); oval(c, 20, 14, 1.8); });
  }),
  make('ribbon-bows', 'Ribbon Bows', 'Loose hand-tied bows and trailing ribbons.', ['#fff0f1', '#bc7886', '#dfb5bc', '#593642'], 310, (c, color, accent) => {
    repeat(c, sparse, c => {
      curve(c, [[0, 0], [-34, -29, -30, 18, 0, 0], [30, -29, 34, 18, 0, 0]]);
      curve(c, [[-2, 1], [-10, 15, -8, 18, -14, 25]]); curve(c, [[2, 1], [10, 10, 6, 24, 17, 28]]);
      c.fillStyle = accent; oval(c, 0, 0, 3);
    });
  }),
  make('clover-club', 'Clover Club', 'Four-leaf clovers in an airy staggered garden.', ['#edf3e2', '#7f9a60', '#b9c99b', '#33432e'], 290, (c, color, accent) => {
    repeat(c, sparse, c => { c.fillStyle = color; for (let i = 0; i < 4; i++) { c.save(); c.rotate(i * Math.PI / 2); heart(c, 9); c.restore(); } c.strokeStyle = accent; curve(c, [[0, 3], [12, 12, 4, 23, 12, 29]]); });
  }),
  make('citrus-slices', 'Citrus Picnic', 'Outlined citrus wheels with alternating juice segments.', ['#fff5dc', '#d9a649', '#e8c57a', '#62471f'], 330, (c, color, accent) => {
    repeat(c, sparse, c => { c.strokeStyle = color; oval(c, 0, 0, 19, 19, 0, false); for (let i = 0; i < 7; i++) { c.save(); c.rotate(i * TAU / 7); c.fillStyle = i % 2 ? color : accent; c.beginPath(); c.moveTo(3, -1); c.arc(0, 0, 14, -.25, .48); c.closePath(); c.fill(); c.restore(); } });
  }),
  make('cherry-notes', 'Cherry Notes', 'Paired cherries with fine stems and a single leaf.', ['#fff0e8', '#bf7f7b', '#a9b18a', '#5b3d37'], 330, (c, color, accent) => {
    repeat(c, sparse, c => { c.strokeStyle = accent; curve(c, [[-12, 9], [-9, -7, 2, -8, 3, -22], [7, -13, 18, -6, 18, 11]]); c.fillStyle = color; oval(c, -12, 12, 8); oval(c, 18, 14, 8); c.fillStyle = accent; oval(c, 10, -20, 10, 4, -.4); });
  }),
  make('pearl-daisies', 'Pearl Daisies', 'Rounded six-petal blooms and scattered pollen dots.', ['#eef2f7', '#a2b4c8', '#d4b76f', '#354657'], 300, (c, color, accent) => {
    repeat(c, scatter, c => { c.fillStyle = color; flower(c, 6, 10, 7); c.fillStyle = accent; oval(c, 0, 0, 4); oval(c, 27, 19, 2); });
  }),
  make('postage-day', 'Postage Day', 'Mini envelopes, scalloped stamps, and postal cancellation arcs.', ['#f3eee4', '#aa9583', '#c9b9a8', '#4b4038'], 360, (c, color, accent) => {
    repeat(c, [[40, 45, -.2], [163, 150, .2]], c => { c.strokeStyle = color; c.strokeRect(-23, -15, 46, 30); line(c, [[-23, -15], [0, 3], [23, -15]]); line(c, [[-23, 15], [-7, 0]]); line(c, [[23, 15], [7, 0]]); });
    repeat(c, [[170, 38, .12], [47, 174, -.18]], c => { c.strokeStyle = accent; c.strokeRect(-12, -17, 24, 34); for (let y = -12; y < 18; y += 6) { oval(c, -15, y, 1); oval(c, 15, y, 1); } c.fillStyle = color; star(c, 4, 4, 9); });
  }),
  make('terrazzo-petal', 'Petal Terrazzo', 'Soft irregular stone chips with slender accent slivers.', ['#f6e9df', '#c49b90', '#b9b79c', '#594039'], 250, (c, color, accent) => {
    repeat(c, [...scatter, [215, 40, .8], [82, 52, .2], [143, 154, .6], [17, 126, .1]], (c, i) => { c.fillStyle = i % 3 ? color : accent; line(c, i % 2 ? [[-9, -8], [8, -5], [12, 6], [0, 10], [-11, 4]] : [[-4, -13], [5, -8], [2, 12], [-5, 7]], true, true); });
  }),
  make('party-sprinkles', 'Quiet Confetti', 'Short capsule sprinkles, crescents, and round confetti.', ['#f1ecfa', '#ab95c1', '#d7b4a0', '#4f3e61'], 280, (c, color, accent) => {
    repeat(c, [...scatter, [205, 56, .8], [67, 216, -.4], [138, 152, .6]], (c, i) => { c.strokeStyle = i % 2 ? color : accent; c.fillStyle = accent; c.lineWidth = 5; if (i % 3 === 0) oval(c, 0, 0, 3); else if (i % 3 === 1) line(c, [[-6, -4], [6, 4]]); else { c.beginPath(); c.arc(0, 0, 7, 0, Math.PI); c.stroke(); } });
  }),
  make('loop-letter', 'Ribbon Scribbles', 'Continuous airy figure-eight loops without lettering.', ['#f8efe7', '#bd9a84', '#dfbfa3', '#594336'], 310, (c, color, accent) => {
    repeat(c, sparse, c => { c.strokeStyle = color; curve(c, [[-21, 1], [-35, -27, 11, -24, 0, 0], [-12, 28, 36, 24, 21, -1]]); c.fillStyle = accent; oval(c, -24, 26, 2); });
  }),
  make('love-seeds', 'Love Seeds', 'Small tilted hearts paired with tiny seed marks.', ['#fae9e9', '#c58c95', '#dfb2a5', '#603841'], 290, (c, color, accent) => {
    repeat(c, scatter, (c, i) => { c.fillStyle = i % 2 ? accent : color; heart(c, 9); c.strokeStyle = color; line(c, [[20, -13], [22, -17]]); line(c, [[26, -9], [30, -10]]); });
  }),
  make('sunny-stamps', 'Sunny Stamps', 'Tiny rising suns with separate hand-drawn rays.', ['#fbf2dc', '#c5a25d', '#dfc890', '#57462b'], 340, (c, color, accent) => {
    repeat(c, sparse, c => { c.fillStyle = accent; c.beginPath(); c.arc(0, 4, 13, Math.PI, TAU); c.closePath(); c.fill(); c.strokeStyle = color; line(c, [[-18, 6], [18, 6]]); for (let i = 0; i < 7; i++) { const a = Math.PI + i * Math.PI / 6; line(c, [[Math.cos(a) * 19, 4 + Math.sin(a) * 19], [Math.cos(a) * 25, 4 + Math.sin(a) * 25]]); } });
  }),
  make('paper-planes', 'Paper Planes', 'Folded paper planes with looping flight trails.', ['#eaf3f3', '#88aeb2', '#bbd0ca', '#34565b'], 360, (c, color, accent) => {
    repeat(c, sparse, c => { c.strokeStyle = color; line(c, [[-17, -13], [23, 0], [-17, 13], [-9, 0], [-17, -13]], true); line(c, [[-9, 0], [23, 0]]); c.strokeStyle = accent; c.setLineDash([3, 5]); curve(c, [[-23, 0], [-54, -25, -56, 31, -30, 23]]); c.setLineDash([]); });
  }),
  make('tulip-paper', 'Tulip Paper', 'Simple cup-shaped tulips with curved botanical stems.', ['#f3efe4', '#b18f9c', '#9ead8c', '#4c443b'], 350, (c, color, accent) => {
    repeat(c, sparse, c => { c.strokeStyle = accent; curve(c, [[0, -2], [0, 10, -5, 19, 0, 30]]); c.fillStyle = accent; oval(c, 7, 13, 9, 3, -.7); c.fillStyle = color; c.beginPath(); c.moveTo(-13, -20); c.lineTo(-5, -14); c.lineTo(0, -23); c.lineTo(5, -14); c.lineTo(13, -20); c.bezierCurveTo(16, 7, -16, 7, -13, -20); c.fill(); });
  }),
  make('butterfly-pages', 'Butterfly Pages', 'Four softly scalloped butterfly wings and fine antennae.', ['#f2edf7', '#b29cc3', '#d6c0ca', '#51415e'], 350, (c, color, accent) => {
    repeat(c, sparse, c => { c.fillStyle = color; oval(c, -10, -7, 11, 8, .7); oval(c, 10, -7, 11, 8, -.7); c.fillStyle = accent; oval(c, -7, 6, 8, 6, -.5); oval(c, 7, 6, 8, 6, .5); c.strokeStyle = color; line(c, [[0, -9], [0, 12]]); line(c, [[0, -8], [-5, -18]]); line(c, [[0, -8], [5, -18]]); });
  }),
  make('garden-peas', 'Garden Peas', 'Open seed pods with a neat row of round peas.', ['#edf1e0', '#a3b681', '#c7cc9d', '#445332'], 320, (c, color, accent) => {
    repeat(c, sparse, c => { c.strokeStyle = color; c.beginPath(); c.moveTo(-25, 0); c.bezierCurveTo(-9, -19, 13, -18, 27, 0); c.bezierCurveTo(8, 18, -14, 18, -25, 0); c.stroke(); c.fillStyle = accent; [-14, 0, 14].forEach(x => oval(c, x, 0, 5)); });
  }),
  make('moon-trinkets', 'Moon Trinkets', 'Outlined crescent moons paired with diamond sparkles.', ['#eceef7', '#959fbd', '#c0b8cb', '#3a4261'], 310, (c, color, accent) => {
    repeat(c, sparse, c => { c.fillStyle = color; c.beginPath(); c.moveTo(6, -18); c.bezierCurveTo(-23, -18, -23, 18, 6, 18); c.bezierCurveTo(-6, 8, -6, -8, 6, -18); c.fill(); c.translate(25, -9); c.fillStyle = accent; star(c, 4, 3, 9); });
  }),
  make('cloud-nine', 'Cloud Nine', 'Puffy outlined clouds with delicate falling dash marks.', ['#eef5f8', '#9bbac8', '#c0d2dc', '#3e5664'], 360, (c, color, accent) => {
    repeat(c, sparse, c => { c.strokeStyle = color; c.beginPath(); c.moveTo(-20, 8); c.bezierCurveTo(-35, 7, -29, -12, -17, -9); c.bezierCurveTo(-18, -25, 6, -25, 9, -11); c.bezierCurveTo(25, -19, 34, 6, 18, 8); c.closePath(); c.stroke(); c.strokeStyle = accent; [-11, 1, 13].forEach((x, i) => line(c, [[x, 18 + i % 2 * 4], [x - 3, 24 + i % 2 * 4]])); });
  }),
  make('mushroom-mail', 'Mushroom Meadow', 'Rounded woodland mushroom caps and short grass tufts.', ['#f2eee1', '#b49b85', '#bcc2a2', '#514436'], 350, (c, color, accent) => {
    repeat(c, sparse, c => { c.fillStyle = accent; c.fillRect(-4, 0, 8, 20); c.fillStyle = color; c.beginPath(); c.arc(0, 0, 19, Math.PI, TAU); c.closePath(); c.fill(); c.strokeStyle = accent; line(c, [[24, 20], [21, 12]]); line(c, [[24, 20], [28, 11]]); });
  }),
  make('pencil-shavings', 'Pencil Shavings', 'Fan-shaped shavings with fine radial pencil edges.', ['#fff1e4', '#c49e82', '#dfc3a0', '#5e4532'], 300, (c, color, accent) => {
    repeat(c, scatter, c => { c.fillStyle = accent; c.beginPath(); c.moveTo(0, 12); c.arc(0, 12, 27, Math.PI * 1.18, Math.PI * 1.82); c.closePath(); c.fill(); c.strokeStyle = color; for (let i = 0; i < 6; i++) { const a = Math.PI * (1.18 + i * .64 / 5); line(c, [[Math.cos(a) * 10, 12 + Math.sin(a) * 10], [Math.cos(a) * 27, 12 + Math.sin(a) * 27]]); } });
  }),
  make('shell-keepsakes', 'Shell Keepsakes', 'Scalloped seashell fans with radiating ridges.', ['#f6eee9', '#bda496', '#d5c6b5', '#59473d'], 350, (c, color, accent) => {
    repeat(c, sparse, c => { c.strokeStyle = color; c.beginPath(); c.moveTo(0, 18); c.bezierCurveTo(-43, -4, -25, -30, -15, -15); c.bezierCurveTo(-19, -37, 4, -35, 0, -19); c.bezierCurveTo(11, -37, 30, -21, 16, -11); c.bezierCurveTo(39, -17, 34, 7, 0, 18); c.stroke(); c.strokeStyle = accent; [-14, 0, 14].forEach(x => line(c, [[0, 15], [x, -12]])); });
  }),
  make('lucky-horseshoe', 'Lucky Charms', 'Open horseshoe arches with small square nail marks.', ['#efece3', '#a39a83', '#c6bda6', '#4b4736'], 320, (c, color, accent) => {
    repeat(c, sparse, c => { c.strokeStyle = color; c.lineWidth = 7; c.beginPath(); c.arc(0, -3, 16, -.1, Math.PI + .1); c.stroke(); c.fillStyle = accent; [-14, 14].forEach(x => { c.fillRect(x - 2, -2, 4, 4); c.fillRect(x * .72 - 2, 6, 4, 4); }); });
  }),
  make('woven-flower', 'Woven Flower', 'Four interlocking outlined petals in a tidy decorative lattice.', ['#f4ece2', '#b99c82', '#d6bea1', '#574231'], 300, (c, color, accent) => {
    repeat(c, regular, c => { c.strokeStyle = color; for (let i = 0; i < 4; i++) { c.save(); c.rotate(i * Math.PI / 2); oval(c, 0, -11, 9, 17, 0, false); c.restore(); } c.fillStyle = accent; oval(c, 0, 0, 4); oval(c, 54, 54, 3); });
  }),
  make('pinwheel-picnic', 'Pinwheel Picnic', 'Four curved blades rotating around a quiet central pin.', ['#f7eddf', '#c4a277', '#d5b6a0', '#59462f'], 330, (c, color, accent) => {
    repeat(c, regular, c => { for (let i = 0; i < 4; i++) { c.save(); c.rotate(i * Math.PI / 2); c.fillStyle = i % 2 ? accent : color; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -26); c.bezierCurveTo(22, -26, 28, -9, 0, 0); c.fill(); c.restore(); } });
  }),
  make('gingham-blooms', 'Gingham Blooms', 'Open square frames alternating with little corner flowers.', ['#f3f1e5', '#a3ad8b', '#c5c8a8', '#48503a'], 370, (c, color, accent) => {
    repeat(c, regular, c => { c.strokeStyle = accent; c.strokeRect(-29, -29, 58, 58); c.fillStyle = color; flower(c, 4, 7, 7); });
  }),
  make('spool-thread', 'Spool & Thread', 'Thread spools with long loose curling tails.', ['#f1e9ee', '#b494ac', '#cbb7c5', '#554052'], 360, (c, color, accent) => {
    repeat(c, sparse, c => { c.strokeStyle = color; c.strokeRect(-11, -15, 22, 30); line(c, [[-16, -18], [16, -18]]); line(c, [[-16, 18], [16, 18]]); c.strokeStyle = accent; [-8, -2, 4, 10].forEach(y => line(c, [[-10, y], [10, y - 3]])); curve(c, [[12, 7], [44, -8, 43, 31, 25, 28], [9, 24, 39, 11, 45, 36]]); });
  }),
  make('scallop-tags', 'Scallop Tags', 'Tiny rounded gift labels, punched holes, and looping ties.', ['#f9eee5', '#c0a18b', '#dec4ad', '#5b4535'], 350, (c, color, accent) => {
    repeat(c, sparse, c => { c.strokeStyle = color; line(c, [[-19, -12], [12, -12], [23, 0], [12, 12], [-19, 12]], true); oval(c, 13, 0, 2.5, 2.5, 0, false); c.strokeStyle = accent; curve(c, [[14, 0], [40, -27, 43, 10, 27, 6], [16, 2, 35, -12, 45, -3]]); });
  }),
  make('berry-branches', 'Berry Branches', 'Fine branching stems, narrow leaves, and rounded berry clusters.', ['#edf0e6', '#99aa8c', '#bca49c', '#42513d'], 360, (c, color, accent) => {
    repeat(c, sparse, c => { c.strokeStyle = color; curve(c, [[-10, 26], [-3, 10, -7, -8, 3, -27]]); line(c, [[-4, 7], [13, -3]]); c.fillStyle = color; oval(c, -11, -8, 11, 4, .6); oval(c, 6, 12, 10, 4, -.65); c.fillStyle = accent; oval(c, 15, -6, 4); oval(c, 20, 0, 4); oval(c, 11, 1, 4); });
  }),
  make('retro-jacks', 'Retro Jacks', 'Six-arm jack shapes alternating with light open rings.', ['#f5ebdf', '#bf9e82', '#d8bba0', '#5c4433'], 280, (c, color, accent) => {
    repeat(c, scatter, (c, i) => { c.strokeStyle = i % 2 ? accent : color; if (i % 2) oval(c, 0, 0, 12, 12, 0, false); else { for (let j = 0; j < 3; j++) { c.save(); c.rotate(j * Math.PI / 3); line(c, [[-13, 0], [13, 0]]); c.fillStyle = color; oval(c, -13, 0, 3); oval(c, 13, 0, 3); c.restore(); } } });
  }),
  make('wish-dandelions', 'Wish Dandelions', 'Airborne parachute seeds drifting through open space.', ['#f0f0e5', '#a5ad91', '#c4c7aa', '#48513a'], 330, (c, color, accent) => {
    repeat(c, scatter, c => { c.strokeStyle = color; line(c, [[0, -4], [4, 23]]); for (let i = 0; i < 7; i++) { const a = Math.PI * (1.1 + i * .8 / 6); const x = Math.cos(a) * 16, y = Math.sin(a) * 16 - 4; line(c, [[0, -4], [x, y]]); c.fillStyle = accent; oval(c, x, y, 1.8); } c.fillStyle = color; oval(c, 4, 24, 2, 4, -.15); });
  }),
];
