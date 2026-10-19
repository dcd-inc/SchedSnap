// Original little storybook illustrations; every placement wraps on a 240-unit tile.
const TAU = Math.PI * 2;
const oval = (c, x, y, rx, ry = rx, angle = 0) => { c.beginPath(); c.ellipse(x, y, rx, ry, angle, 0, TAU); c.fill(); };
const line = (c, points, fill = false) => { c.beginPath(); points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); if (fill) { c.closePath(); c.fill(); } else c.stroke(); };
const bend = (c, points, fill = false) => { c.beginPath(); c.moveTo(...points[0]); points.slice(1).forEach(p => c.bezierCurveTo(...p)); fill ? c.fill() : c.stroke(); };
const leaf = (c, x, y, size = 12, angle = .6) => { c.save(); c.translate(x, y); c.rotate(angle); bend(c, [[0, -size], [size, -size / 2, size, size / 2, 0, size], [-size, size / 2, -size, -size / 2, 0, -size]], true); c.restore(); };
function face(c, x, y, ink, sleeping = false) {
  c.save(); c.fillStyle = ink; c.strokeStyle = ink; c.lineWidth = 1.8;
  if (sleeping) { bend(c, [[x - 11, y - 1], [x - 8, y + 3, x - 5, y + 3, x - 2, y - 1]]); bend(c, [[x + 2, y - 1], [x + 5, y + 3, x + 8, y + 3, x + 11, y - 1]]); }
  else { oval(c, x - 7, y, 1.7, 2.2); oval(c, x + 7, y, 1.7, 2.2); }
  bend(c, [[x - 3, y + 6], [x - 1, y + 9, x + 1, y + 9, x + 3, y + 6]]); c.restore();
}
function repeat(c, draw) {
  for (const [x, y, angle] of [[46, 56, -.12], [174, 177, .16]]) for (const dx of [-240, 0, 240]) for (const dy of [-240, 0, 240]) {
    c.save(); c.translate(x + dx, y + dy); c.rotate(angle); draw(); c.restore();
  }
}
const palettes = [
  ['#edf2f7', '#648eae', '#c59677', '#2e4355'],
  ['#faeee6', '#c58b64', '#81956b', '#513b2d'],
  ['#f0ebf7', '#9b7caf', '#d09b79', '#44324f'],
  ['#edf3e7', '#829c64', '#c88a77', '#35482d'],
  ['#faecef', '#bc8095', '#86a28e', '#533642'],
  ['#fbf2db', '#bf9a4f', '#79999d', '#4e4027'],
  ['#e9f3ef', '#60978a', '#bd9671', '#284b41'],
];
const motifs = [
  ['whale', 'Whale Hello', 'Plump smiling whales with little flippers and a two-drop waterspout', 380, (c, p, a, ink) => {
    oval(c, -5, 4, 34, 23); bend(c, [[22, 6], [34, -2, 36, -20, 48, -17], [45, 0, 40, 13, 22, 16]], true); c.fillStyle = a; oval(c, -6, 20, 9, 6, -.5); oval(c, -19, -30, 3, 7, -.4); oval(c, -9, -32, 3, 7, .4); face(c, -18, 3, ink);
  }],
  ['penguin', 'Penguin Pockets', 'Little round penguins with contrasting bibs, tiny feet and folded wings', 370, (c, p, a, ink, bg) => {
    oval(c, 0, 1, 26, 36); oval(c, -26, 9, 7, 20, .25); oval(c, 26, 9, 7, 20, -.25); c.fillStyle = bg; oval(c, 0, 10, 18, 24); c.fillStyle = a; oval(c, -12, 37, 9, 4); oval(c, 12, 37, 9, 4); line(c, [[-5, -6], [5, -6], [0, 1]], true); face(c, 0, -16, ink);
  }],
  ['puffin', 'Puffin Postcards', 'Round seabirds with oversized striped triangular beaks and side wings', 390, (c, p, a, ink, bg) => {
    oval(c, 0, 10, 24, 29); oval(c, 2, -15, 22, 21); c.fillStyle = bg; oval(c, 10, -16, 15, 15); c.fillStyle = a; line(c, [[21, -22], [45, -10], [21, -3]], true); c.strokeStyle = p; line(c, [[30, -18], [30, -6]]); c.fillStyle = a; oval(c, -7, 39, 13, 4); c.fillStyle = p; oval(c, -12, 12, 10, 22, -.2); c.fillStyle = ink; oval(c, 12, -20, 2);
  }],
  ['seal', 'Seal Pup Naps', 'Sleepy seal pups curled on their sides with whiskers and little tail flippers', 400, (c, p, a, ink) => {
    oval(c, 5, 12, 35, 19); oval(c, -23, -2, 21, 20); c.fillStyle = a; oval(c, 39, 18, 14, 6, -.4); oval(c, 40, 8, 12, 5, .5); oval(c, -7, 28, 13, 5, -.3); face(c, -24, -3, ink, true); c.strokeStyle = ink; line(c, [[-35, 5], [-47, 2]]); line(c, [[-34, 10], [-46, 13]]);
  }],
  ['fox', 'Fox Blanket', 'Sleeping foxes tucked into oversized curved tails with soft tipped ends', 400, (c, p, a, ink) => {
    oval(c, 0, 15, 34, 22); line(c, [[-28, -9], [-25, -34], [-7, -17]], true); line(c, [[7, -17], [25, -34], [28, -9]], true); oval(c, 0, -6, 27, 22); c.fillStyle = a; line(c, [[-24, -3], [0, 16], [24, -3], [0, 6]], true); face(c, 0, -5, ink, true); c.strokeStyle = p; c.lineWidth = 16; bend(c, [[28, 12], [50, 41, -29, 47, -32, 21]]); c.strokeStyle = a; c.lineWidth = 13; bend(c, [[-32, 21], [-38, 12, -33, 6, -25, 9]]);
  }],
  ['snail', 'Snail Mail Trail', 'Round spiral-shelled snails with cheerful eye stalks and dotted trails', 370, (c, p, a, ink) => {
    oval(c, -5, -2, 25); c.fillStyle = a; oval(c, 0, 25, 43, 8); oval(c, 29, 13, 12, 18); c.strokeStyle = a; c.beginPath(); for (let i = 0; i <= 80; i++) { const t = i / 80 * TAU * 2, r = 1 + i * .23; const x = -5 + Math.cos(t) * r, y = -2 + Math.sin(t) * r; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.strokeStyle = p; line(c, [[24, 1], [21, -11]]); line(c, [[34, 1], [38, -11]]); c.fillStyle = ink; oval(c, 21, -12, 2.3); oval(c, 38, -12, 2.3);
  }],
  ['ladybug', 'Ladybug Letters', 'Chubby spotted ladybirds with rounded wing cases and tiny antennae', 350, (c, p, a, ink) => {
    oval(c, 0, 5, 26, 31); c.fillStyle = a; oval(c, 0, -24, 14, 12); c.strokeStyle = a; line(c, [[0, -21], [0, 35]]); for (const [x, y] of [[-12, -4], [12, -4], [-14, 15], [14, 15]]) oval(c, x, y, 5); line(c, [[-7, -32], [-13, -41]]); line(c, [[7, -32], [13, -41]]); face(c, 0, -26, ink);
  }],
  ['bee', 'Bumblebee Break', 'Oval bumblebees with broad stripes, petal wings and happy little faces', 360, (c, p, a, ink) => {
    c.fillStyle = a; oval(c, -9, -22, 11, 20, -.5); oval(c, 12, -22, 11, 20, .5); c.fillStyle = p; oval(c, 0, 6, 34, 21); c.strokeStyle = a; c.lineWidth = 7; line(c, [[-12, -9], [-12, 21]]); line(c, [[1, -13], [1, 25]]); face(c, 21, 2, ink);
  }],
  ['dragonfly', 'Dragonfly Daydream', 'Long dragonflies with four slender wings and beaded tail tips', 390, (c, p, a, ink) => {
    for (const d of [-1, 1]) { oval(c, d * 24, -12, 27, 8, d * -.3); oval(c, d * 21, 8, 24, 7, d * .3); } c.fillStyle = a; oval(c, 0, 4, 5, 28); oval(c, 0, -23, 10, 8); for (let i = 0; i < 4; i++) oval(c, 0, 30 + i * 5, 4 - i * .6); c.fillStyle = ink; oval(c, -5, -25, 2); oval(c, 5, -25, 2);
  }],
  ['turtle', 'Turtle Teatime', 'Tiny sea turtles with broad flippers and faceted shell markings', 380, (c, p, a, ink) => {
    for (const d of [-1, 1]) { oval(c, d * 26, -8, 10, 19, -d * .7); oval(c, d * 22, 24, 7, 13, d * .7); } oval(c, 0, -37, 12, 13); c.fillStyle = a; oval(c, 0, 3, 27, 34); c.strokeStyle = p; line(c, [[0, -17], [13, -7], [13, 12], [0, 22], [-13, 12], [-13, -7], [0, -17]]); face(c, 0, -40, ink);
  }],
  ['frog', 'Frog Pond Club', 'Squat frogs with high round eyes and oversized folded back feet', 380, (c, p, a, ink) => {
    oval(c, 0, 8, 31, 27); oval(c, -18, -16, 13); oval(c, 18, -16, 13); c.fillStyle = a; oval(c, -30, 30, 18, 8, -.3); oval(c, 30, 30, 18, 8, .3); oval(c, 0, 18, 18, 13); c.fillStyle = ink; oval(c, -18, -18, 2.5); oval(c, 18, -18, 2.5); c.strokeStyle = ink; bend(c, [[-10, 0], [-5, 9, 5, 9, 10, 0]]);
  }],
  ['otter', 'Otter Float', 'Floating otters with tiny ears and paws holding a contrasting pebble', 400, (c, p, a, ink) => {
    oval(c, 0, 17, 23, 29); oval(c, -12, -26, 7); oval(c, 12, -26, 7); oval(c, 0, -14, 22, 20); c.fillStyle = a; oval(c, 0, 19, 15, 21); c.fillStyle = p; oval(c, -14, 11, 11, 6, .5); oval(c, 14, 11, 11, 6, -.5); c.fillStyle = a; oval(c, 0, 7, 8, 7); face(c, 0, -16, ink); c.fillStyle = p; oval(c, -14, 43, 9, 5); oval(c, 14, 43, 9, 5);
  }],
  ['squirrel', 'Squirrel Keeps Company', 'Seated squirrels with tall curling tails, pointed ears and little paws', 410, (c, p, a, ink) => {
    c.strokeStyle = p; c.lineWidth = 17; bend(c, [[12, 28], [59, 32, 50, -31, 29, -24], [9, -18, 19, 3, 35, -2]]); oval(c, -6, 15, 21, 27); line(c, [[-24, -13], [-24, -34], [-9, -23]], true); line(c, [[-2, -23], [11, -34], [14, -11]], true); oval(c, -6, -10, 21, 19); c.fillStyle = a; oval(c, -7, 21, 12, 17); oval(c, -10, 5, 10, 6); face(c, -7, -12, ink);
  }],
  ['hedgehog', 'Hedgehog Hush', 'Little loaf-shaped hedgehogs with a soft triangular spine fringe', 390, (c, p, a, ink) => {
    const pts = [[-37, 23]]; for (let i = 0; i <= 16; i++) { const t = Math.PI + i / 16 * Math.PI, r = i % 2 ? 39 : 32; pts.push([Math.cos(t) * r, 13 + Math.sin(t) * r]); } pts.push([37, 24]); line(c, pts, true); c.fillStyle = a; oval(c, 13, 12, 25, 18); oval(c, 37, 17, 9, 7); oval(c, -17, 32, 8, 4); c.fillStyle = ink; oval(c, 40, 14, 3); oval(c, 16, 6, 2.5);
  }],
  ['raccoon', 'Raccoon After Hours', 'Plush raccoons with eye masks and broad banded tails', 400, (c, p, a, ink) => {
    oval(c, 0, 17, 25, 25); oval(c, -17, -24, 10); oval(c, 17, -24, 10); oval(c, 0, -7, 28, 23); c.strokeStyle = a; c.lineWidth = 13; bend(c, [[19, 32], [47, 36, 48, 8, 30, 11]]); c.fillStyle = a; oval(c, -10, -7, 12, 8, -.2); oval(c, 10, -7, 12, 8, .2); c.strokeStyle = p; c.lineWidth = 5; line(c, [[41, 20], [49, 24]]); line(c, [[36, 32], [39, 40]]); face(c, 0, -8, ink);
  }],
  ['koala', 'Koala Cuddles', 'Round koalas with oversized ears and broad oval noses hugging branches', 390, (c, p, a, ink) => {
    oval(c, -28, -20, 17); oval(c, 28, -20, 17); oval(c, 0, -4, 30, 29); oval(c, 0, 31, 21, 18); c.fillStyle = a; oval(c, -28, -20, 11); oval(c, 28, -20, 11); oval(c, 0, -1, 8, 12); c.strokeStyle = a; c.lineWidth = 8; line(c, [[17, -42], [17, 48]]); c.fillStyle = p; oval(c, 18, 29, 14, 7, -.3); c.fillStyle = ink; oval(c, -13, -9, 2); oval(c, 13, -9, 2);
  }],
  ['sloth', 'Sloth Slowdown', 'Upside-down sleepy sloths hanging from gently sloping branches', 410, (c, p, a, ink) => {
    c.strokeStyle = a; c.lineWidth = 6; line(c, [[-46, -30], [45, -23]]); c.strokeStyle = p; c.lineWidth = 12; bend(c, [[-20, -28], [-34, 8, -18, 33, 7, 29], [33, 25, 29, 5, 30, -25]]); oval(c, 0, 17, 29, 25); c.fillStyle = a; oval(c, 0, 19, 21, 17); c.fillStyle = p; oval(c, -10, 15, 8, 5, -.4); oval(c, 10, 15, 8, 5, .4); face(c, 0, 15, ink, true);
  }],
  ['duck', 'Duckling Doodles', 'Plump swimming ducklings with tucked wings, short beaks and trailing wakes', 380, (c, p, a, ink) => {
    oval(c, 0, 15, 32, 21); oval(c, 20, -10, 20); line(c, [[-25, 12], [-42, 1], [-35, 24]], true); c.fillStyle = a; oval(c, -4, 16, 18, 11, -.2); oval(c, 41, -5, 10, 5); c.strokeStyle = a; line(c, [[-37, 44], [2, 44]]); c.fillStyle = ink; oval(c, 24, -15, 2.5);
  }],
  ['swan', 'Swan Sunday', 'Elegant swans with curled necks and layered swept-back wings', 420, (c, p, a, ink) => {
    oval(c, -3, 23, 36, 18); c.strokeStyle = p; c.lineWidth = 13; bend(c, [[23, 20], [47, -6, 31, -35, 15, -24], [4, -17, 13, -5, 23, -11]]); c.fillStyle = a; line(c, [[17, -11], [35, -8], [23, -3]], true); c.strokeStyle = a; c.lineWidth = 3; for (let i = 0; i < 3; i++) bend(c, [[-29, 17 + i * 6], [-6, 34, 10, 16, 13, 9 + i * 7]]); c.fillStyle = ink; oval(c, 16, -19, 2);
  }],
  ['octopus', 'Octopus Hugs', 'Soft octopuses with looped curling arms and contrasting cheek patches', 410, (c, p, a, ink) => {
    oval(c, 0, -10, 28, 27); c.strokeStyle = p; c.lineWidth = 9; for (let i = -2; i <= 2; i++) bend(c, [[i * 8, 9], [i * 15, 47, i * 23 + 14, 26, i * 18 + 4, 22]]); c.fillStyle = a; oval(c, -17, -4, 7, 4); oval(c, 17, -4, 7, 4); face(c, 0, -12, ink);
  }],
  ['crab', 'Crab Cabana', 'Smiling sideways crabs with broad claws and stalked little eyes', 400, (c, p, a, ink) => {
    oval(c, 0, 10, 28, 19); c.strokeStyle = p; c.lineWidth = 4; for (const d of [-1, 1]) { for (let i = 0; i < 3; i++) line(c, [[d * 20, 10 + i * 6], [d * 39, 13 + i * 8]]); line(c, [[d * 19, 0], [d * 37, -16]]); } c.fillStyle = a; for (const d of [-1, 1]) { oval(c, d * 37, -23, 12, 13); c.strokeStyle = p; line(c, [[d * 37, -36], [d * 37, -23]]); } c.strokeStyle = p; line(c, [[-12, -4], [-12, -18]]); line(c, [[12, -4], [12, -18]]); face(c, 0, 2, ink); c.fillStyle = ink; oval(c, -12, -18, 2); oval(c, 12, -18, 2);
  }],
  ['seahorse', 'Seahorse Secrets', 'Curly-tailed seahorses with long snouts and little dorsal fans', 400, (c, p, a, ink) => {
    c.strokeStyle = p; c.lineWidth = 12; bend(c, [[-4, -12], [24, 5, 4, 26, -9, 29], [-33, 34, -27, 50, -11, 44], [2, 38, -9, 30, -15, 37]]); oval(c, 1, -24, 17, 16); c.fillRect(8, -25, 28, 9); c.fillStyle = a; line(c, [[7, 0], [32, 7], [10, 22]], true); for (const y of [0, 9, 18]) oval(c, -5, y, 4, 3); c.fillStyle = ink; oval(c, 6, -29, 2.3);
  }],
  ['manta', 'Manta Moonlight', 'Wide rounded manta rays with curled wing tips and trailing tails', 420, (c, p, a, ink) => {
    bend(c, [[0, -21], [-17, -9, -41, -3, -49, 18], [-25, 32, -18, 22, 0, 24], [18, 22, 25, 32, 49, 18], [41, -3, 17, -9, 0, -21]], true); c.strokeStyle = p; c.lineWidth = 4; bend(c, [[0, 21], [-3, 39, 8, 49, 15, 43]]); c.fillStyle = a; oval(c, 0, 10, 14, 13); face(c, 0, -2, ink);
  }],
  ['axolotl', 'Axolotl Aquarium', 'Round axolotls with six frilly external gills and tiny waving feet', 410, (c, p, a, ink) => {
    c.strokeStyle = a; c.lineWidth = 7; for (const d of [-1, 1]) for (let i = -1; i <= 1; i++) line(c, [[d * 21, -9], [d * 38, -9 + i * 17]]); oval(c, 0, 21, 17, 24); oval(c, 0, -8, 29, 23); c.fillStyle = a; for (const d of [-1, 1]) { oval(c, d * 19, 29, 12, 5, -d * .5); oval(c, d * 15, 43, 9, 4); } face(c, 0, -10, ink);
  }],
  ['bat', 'Bat Bedtime', 'Tiny bats with scalloped open wings, pointed ears and sleepy faces', 410, (c, p, a, ink) => {
    for (const d of [-1, 1]) bend(c, [[d * 5, -8], [d * 15, -34, d * 35, -30, d * 47, -13], [d * 29, -16, d * 40, 17, d * 24, 7], [d * 19, -2, d * 16, 24, d * 5, 15]], true); c.fillStyle = a; oval(c, 0, 3, 14, 23); line(c, [[-13, -11], [-11, -32], [-1, -15]], true); line(c, [[1, -15], [11, -32], [13, -11]], true); face(c, 0, -4, ink, true);
  }],
  ['pear', 'Pear Picnic', 'Soft pear silhouettes with bent stems, small leaves and gentle seed freckles', 360, (c, p, a) => {
    bend(c, [[0, -33], [16, -36, 12, -8, 25, 4], [52, 43, -45, 48, -26, 8], [-12, -12, -15, -32, 0, -33]], true); c.strokeStyle = a; bend(c, [[0, -32], [-6, -45, 6, -44, 6, -49]]); c.fillStyle = a; leaf(c, 15, -35, 11, .8); oval(c, -13, 17, 3, 7, -.3); oval(c, 0, 25, 2.5);
  }],
  ['pomegranate', 'Pomegranate Pages', 'Crowned pomegranate halves packed with round jewel-like seed clusters', 380, (c, p, a, ink, bg) => {
    oval(c, 0, 5, 32, 34); line(c, [[-12, -24], [-15, -42], [-5, -35], [0, -45], [6, -35], [15, -42], [12, -24]], true); c.fillStyle = bg; oval(c, 0, 6, 25, 27); c.fillStyle = a; for (const [x, y] of [[0, -11], [-12, -3], [12, -3], [-13, 12], [0, 6], [13, 12], [0, 23]]) oval(c, x, y, 5, 6);
  }],
  ['dragonfruit', 'Dragonfruit Dream', 'Oval dragonfruit halves with curled outer scales and scattered dark seeds', 390, (c, p, a, ink, bg) => {
    for (const d of [-1, 1]) for (const y of [-24, -3, 18]) { c.fillStyle = a; line(c, [[d * 19, y - 7], [d * 40, y - 17], [d * 28, y + 12]], true); } c.fillStyle = p; oval(c, 0, 0, 29, 41); c.fillStyle = bg; oval(c, 0, 0, 22, 33); c.fillStyle = ink; for (const [x, y] of [[0, -23], [-10, -13], [11, -9], [-5, 0], [12, 12], [-12, 15], [1, 24]]) oval(c, x, y, 1.6, 2.8, .3);
  }],
  ['avocado', 'Avocado Afternoons', 'Cut avocados with round pits, narrow necks and a broad colored flesh inset', 380, (c, p, a, ink, bg) => {
    bend(c, [[0, -41], [18, -44, 14, -17, 29, 9], [48, 52, -48, 52, -29, 9], [-14, -17, -18, -44, 0, -41]], true); c.fillStyle = a; bend(c, [[0, -31], [11, -34, 8, -12, 20, 9], [34, 41, -34, 41, -20, 9], [-8, -12, -11, -34, 0, -31]], true); c.fillStyle = bg; oval(c, 0, 16, 13, 15); c.strokeStyle = ink; c.lineWidth = 2; bend(c, [[-4, 7], [-11, 12, -10, 20, -5, 24]]);
  }],
  ['fig', 'Fig Fieldnotes', 'Teardrop fig halves with radiating fine seed pockets and small top stems', 380, (c, p, a, ink, bg) => {
    bend(c, [[0, -37], [9, -18, 37, 1, 32, 25], [27, 49, -27, 49, -32, 25], [-37, 1, -9, -18, 0, -37]], true); c.fillStyle = a; bend(c, [[0, -21], [7, -8, 28, 8, 23, 25], [17, 39, -17, 39, -23, 25], [-28, 8, -7, -8, 0, -21]], true); c.strokeStyle = bg; c.lineWidth = 2.5; for (let i = -2; i <= 2; i++) line(c, [[0, 11], [i * 8, 27]]); c.strokeStyle = p; line(c, [[0, -35], [6, -46]]);
  }],
  ['persimmon', 'Persimmon Season', 'Squat rounded persimmons with four broad pointed calyx leaves', 370, (c, p, a) => {
    oval(c, 0, 10, 35, 29); c.fillStyle = a; for (let i = 0; i < 4; i++) { c.save(); c.translate(0, -16); c.rotate(i * TAU / 4 + .4); leaf(c, 0, -9, 16, 0); c.restore(); } c.strokeStyle = a; bend(c, [[-18, 13], [-12, 29, 12, 29, 18, 13]]);
  }],
  ['pineapple', 'Pineapple Party', 'Plump pineapples with tall pointed crowns and crisscross rind diamonds', 390, (c, p, a) => {
    oval(c, 0, 12, 27, 34); c.fillStyle = a; for (let i = -2; i <= 2; i++) line(c, [[0, -16], [i * 12, -47 + Math.abs(i) * 7], [i * 7 + 5, -12]], true); c.strokeStyle = a; c.lineWidth = 2.5; for (const y of [-6, 10, 26]) { line(c, [[-18, y - 8], [18, y + 12]]); line(c, [[18, y - 8], [-18, y + 12]]); }
  }],
  ['kiwi', 'Kiwi Sketchbook', 'Oval kiwi halves with ringed flesh, bright centers and radiating dark seeds', 360, (c, p, a, ink, bg) => {
    oval(c, 0, 0, 32, 39); c.fillStyle = a; oval(c, 0, 0, 26, 33); c.fillStyle = bg; oval(c, 0, 0, 9, 15); c.fillStyle = ink; for (let i = 0; i < 12; i++) { const t = i * TAU / 12; oval(c, Math.cos(t) * 16, Math.sin(t) * 22, 1.8, 3.2, t + Math.PI / 2); }
  }],
  ['banana', 'Banana Breaktime', 'Curved banana bunches with three layered soft fruits and short joined stems', 400, (c, p, a) => {
    for (let i = 0; i < 3; i++) { c.fillStyle = i === 1 ? a : p; c.save(); c.rotate((i - 1) * .2); bend(c, [[-20, -35], [-23, 0, 0, 25, 35, 13], [23, 46, -24, 35, -29, -3], [-31, -18, -27, -29, -20, -35]], true); c.restore(); } c.strokeStyle = a; c.lineWidth = 6; line(c, [[-23, -34], [-20, -45]]);
  }],
  ['peach', 'Peachy Pages', 'Heart-round peaches with a central crease, two leaves and a soft cheek-like highlight', 370, (c, p, a) => {
    bend(c, [[0, -23], [38, -45, 51, 13, 0, 42], [-51, 13, -38, -45, 0, -23]], true); c.strokeStyle = a; bend(c, [[0, -18], [16, -4, 13, 20, 0, 37]]); c.fillStyle = a; leaf(c, 11, -34, 14, 1); leaf(c, -11, -34, 10, -.8); oval(c, -17, 9, 7, 10, -.4);
  }],
];

export const storybookPatterns = motifs.map(([id, name, description, tileSize, render], i) => {
  const [background, patternColor, patternAccent, ink] = palettes[i % palettes.length];
  return { id: `story-${id}`, name, description, tileSize, background, patternColor, patternAccent, ink,
    draw(c, { color = patternColor, accent = patternAccent } = {}) {
      c.save(); c.strokeStyle = color; c.fillStyle = color; c.lineWidth = 2.8; c.lineJoin = 'round'; c.lineCap = 'round';
      repeat(c, () => render(c, color, accent, ink, background)); c.restore();
    },
  };
});
