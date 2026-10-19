// Original romantic botanical illustrations, repeating on a 240-unit tile.
const TAU = Math.PI * 2;
const oval = (c, x, y, rx, ry = rx, angle = 0) => { c.beginPath(); c.ellipse(x, y, rx, ry, angle, 0, TAU); c.fill(); };
const line = (c, points, fill = false) => { c.beginPath(); points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); if (fill) { c.closePath(); c.fill(); } else c.stroke(); };
const bend = (c, points, fill = false) => { c.beginPath(); c.moveTo(...points[0]); points.slice(1).forEach(p => c.bezierCurveTo(...p)); fill ? c.fill() : c.stroke(); };
const leaf = (c, x, y, w, h, angle = 0) => { c.save(); c.translate(x, y); c.rotate(angle); bend(c, [[0, -h], [w, -h / 2, w, h / 2, 0, h], [-w, h / 2, -w, -h / 2, 0, -h]], true); c.restore(); };
const petals = (c, count, ring, rx, ry, phase = 0) => { for (let i = 0; i < count; i++) { const t = i * TAU / count + phase; oval(c, Math.cos(t) * ring, Math.sin(t) * ring, rx, ry, t); } };
const dots = (c, count, radius, size, phase = 0) => { for (let i = 0; i < count; i++) { const t = i * TAU / count + phase; oval(c, Math.cos(t) * radius, Math.sin(t) * radius, size); } };
const arc = (c, r, a, b) => { c.beginPath(); c.arc(0, 0, r, a, b); c.stroke(); };
function stem(c, a, height = 43) { c.strokeStyle = a; bend(c, [[0, 0], [7, 14, -9, 27, 0, height]]); c.fillStyle = a; leaf(c, -11, 22, 8, 16, -.8); }
function repeat(c, draw) {
  for (const [x, y, angle] of [[52, 57, -.18], [176, 177, .2]]) for (const dx of [-240, 0, 240]) for (const dy of [-240, 0, 240]) {
    c.save(); c.translate(x + dx, y + dy); c.rotate(angle); draw(); c.restore();
  }
}
const palettes = [
  ['#fff0f2', '#c77992', '#879c7d', '#58313f'],
  ['#f8e9f1', '#a65f89', '#a28cb0', '#512d45'],
  ['#f4edf9', '#a17db8', '#bb8799', '#493255'],
  ['#fff1e9', '#cb8d85', '#8d9b72', '#593c36'],
  ['#f6e8ec', '#a95d79', '#c493a4', '#542d3d'],
  ['#fcefe7', '#c59175', '#a47ea3', '#533b33'],
  ['#f1eef8', '#9176aa', '#b28b79', '#41334e'],
];
const motifs = [
  ['rosebud', 'Rosebud Love Letters', 'Girly romantic furled rosebuds with pointed sepals and slender leafy stems', 390, (c, p, a) => {
    stem(c, a); c.fillStyle = p; oval(c, 0, -17, 20, 26, -.15); c.strokeStyle = a; c.lineWidth = 3; bend(c, [[-16, -29], [16, -20, 11, -6, -9, 1]]); c.fillStyle = a; line(c, [[-22, -4], [0, 10], [22, -4], [10, 13], [0, 17], [-10, 13]], true);
  }],
  ['peony', 'Peony Pillow', 'Romantic peonies with broad ruffled outer petals and folded inner cups', 420, (c, p, a) => {
    c.fillStyle = a; leaf(c, -28, 28, 12, 23, -.9); leaf(c, 27, 25, 10, 21, .8); c.fillStyle = p; petals(c, 9, 18, 23, 17, .2); c.strokeStyle = a; c.lineWidth = 2.6; for (let i = 0; i < 5; i++) { c.save(); c.rotate(i * 1.2); bend(c, [[-17, 6], [-18, -22, 16, -19, 15, 8]]); c.restore(); }
  }],
  ['orchid', 'Orchid Rendezvous', 'Orchid sprays with winglike side petals and a deep ornamental lip', 410, (c, p, a) => {
    oval(c, 0, -23, 12, 26); oval(c, -23, -7, 27, 15, -.4); oval(c, 23, -7, 27, 15, .4); oval(c, -18, 21, 12, 25, .7); oval(c, 18, 21, 12, 25, -.7); c.fillStyle = a; bend(c, [[-13, 4], [-27, 26, -4, 40, 0, 25], [4, 40, 27, 26, 13, 4]], true); oval(c, 0, -3, 7, 9);
  }],
  ['magnolia', 'Magnolia Mornings', 'Large silky magnolia petals unfolding from little woody twigs', 420, (c, p, a) => {
    c.strokeStyle = a; c.lineWidth = 5; line(c, [[-26, 47], [1, 15], [31, 8]]); c.fillStyle = a; leaf(c, 25, 24, 10, 21, .8); c.fillStyle = p; leaf(c, -21, -6, 17, 31, -.7); leaf(c, 21, -6, 17, 31, .7); leaf(c, 0, -15, 17, 34); c.strokeStyle = a; bend(c, [[-14, 2], [0, 14, 11, 4, 15, -10]]);
  }],
  ['camellia', 'Camellia Cameos', 'Romantic asymmetric camellia branches with side-facing layered cups, closed buds and broad glossy leaves', 440, (c, p, a) => {
    c.strokeStyle = a; c.lineWidth = 4; bend(c, [[-31, 46], [-19, 24, 5, 10, 26, -30]]); line(c, [[-10, 25], [-32, -4]]); line(c, [[10, -1], [35, 10]]);
    c.fillStyle = a; leaf(c, -32, 3, 13, 23, -.75); leaf(c, 26, 23, 14, 23, .95); leaf(c, 10, -30, 9, 18, -.6);
    c.save(); c.translate(11, -10); c.rotate(.65); c.fillStyle = p;
    bend(c, [[-24, -7], [-34, 10, -19, 26, 0, 25], [19, 26, 34, 10, 24, -7], [16, 6, -16, 6, -24, -7]], true);
    oval(c, -14, -8, 15, 9, -.3); oval(c, 13, -9, 15, 9, .3); oval(c, 0, -12, 14, 8);
    c.strokeStyle = a; c.lineWidth = 2.8; bend(c, [[-19, 8], [-7, 20, 13, 18, 21, 7]]); c.fillStyle = a; oval(c, 0, -11, 10, 3); c.restore();
    c.fillStyle = p; oval(c, -33, -13, 11, 17, -.35); c.fillStyle = a; line(c, [[-44, -7], [-33, 1], [-22, -9], [-28, 5], [-38, 4]], true);
  }],
  ['sakura', 'Sakura Postcards', 'Notched cherry blossoms arranged along a diagonal spring branch', 410, (c, p, a) => {
    c.strokeStyle = a; c.lineWidth = 4; line(c, [[-38, 41], [26, -35]]); for (const [x, y, s] of [[-18, 15, .7], [12, -13, 1]]) { c.save(); c.translate(x, y); c.scale(s, s); for (let i = 0; i < 5; i++) { c.save(); c.rotate(i * TAU / 5); c.fillStyle = p; bend(c, [[0, 0], [-23, -8, -23, -27, -6, -29], [-4, -28, -3, -23, 0, -23], [3, -23, 4, -28, 6, -29], [23, -27, 23, -8, 0, 0]], true); c.restore(); } c.fillStyle = a; dots(c, 5, 6, 2.5); c.restore(); }
  }],
  ['calla', 'Calla Silk', 'Sculptural calla lily funnels wrapped around long contrasting spadices', 400, (c, p, a) => {
    stem(c, a, 49); c.fillStyle = p; bend(c, [[-11, 12], [-45, -10, -28, -44, 20, -37], [38, -31, 15, -7, -11, 12]], true); c.strokeStyle = a; c.lineWidth = 5; line(c, [[-5, 1], [10, -29]]); c.strokeStyle = p; c.lineWidth = 3; bend(c, [[-11, 12], [8, 15, 20, 0, 20, -18]]);
  }],
  ['hibiscus', 'Hibiscus Holiday', 'Broad tropical hibiscus blooms with dramatically long curved stamens', 420, (c, p, a) => {
    petals(c, 5, 17, 26, 21, .3); c.strokeStyle = a; c.lineWidth = 4; bend(c, [[0, 0], [14, 2, 29, 17, 32, 36]]); c.fillStyle = a; for (let i = 0; i < 5; i++) oval(c, 27 + i * 3, 26 + i * 3, 3); oval(c, 35, 40, 5);
  }],
  ['sweet-pea', 'Sweet Pea Secrets', 'Paired fluttering sweet-pea blossoms with curled climbing tendrils', 410, (c, p, a) => {
    c.strokeStyle = a; bend(c, [[-4, 45], [10, 14, -10, -15, 5, -39]]); bend(c, [[3, 20], [39, -8, 35, 31, 20, 23], [5, 14, 24, 1, 28, 11]]); for (const [x, y, s] of [[-14, -7, 1], [13, -30, .7]]) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = p; oval(c, 0, -9, 23, 17, -.3); oval(c, -12, 8, 15, 9, -.4); oval(c, 12, 8, 15, 9, .4); c.fillStyle = a; oval(c, 0, 7, 6, 9); c.restore(); }
  }],
  ['bleeding-heart', 'Heartstring Garden', 'Romantic arching branches of dangling heart-shaped bleeding-heart flowers', 420, (c, p, a) => {
    c.strokeStyle = a; bend(c, [[-42, 30], [-28, -45, 28, -40, 42, -9]]); for (const [x, y] of [[-28, -5], [-3, -17], [25, -9]]) { c.strokeStyle = a; line(c, [[x, y - 10], [x, y]]); c.fillStyle = p; bend(c, [[x, y + 25], [x - 31, y + 3, x - 13, y - 12, x, y + 1], [x + 13, y - 12, x + 31, y + 3, x, y + 25]], true); c.fillStyle = a; oval(c, x, y + 29, 3.5, 8); }
  }],
  ['fuchsia', 'Fuchsia Earrings', 'Hanging fuchsia flowers with reflexed sepals and layered bell skirts', 420, (c, p, a) => {
    c.strokeStyle = a; bend(c, [[-28, -40], [18, -42, 5, -17, 0, -18]]); c.fillStyle = p; bend(c, [[-10, -15], [-16, 1, -25, 9, -23, 20], [-8, 33, 8, 33, 23, 20], [25, 9, 16, 1, 10, -15]], true); c.fillStyle = a; line(c, [[0, -23], [-36, -6], [-12, -9], [-9, 4], [0, -14], [9, 4], [12, -9], [36, -6]], true); c.strokeStyle = a; for (const x of [-8, 0, 8]) { line(c, [[x, 21], [x + 4, 43]]); oval(c, x + 4, 43, 3); }
  }],
  ['foxglove', 'Foxglove Fairytale', 'Tall tapering spires of spotted bell-shaped foxglove blossoms', 430, (c, p, a) => {
    c.strokeStyle = a; line(c, [[0, 49], [0, -46]]); c.fillStyle = a; leaf(c, -15, 35, 9, 23, -.6); for (let i = 0; i < 5; i++) { const d = i % 2 ? 1 : -1, y = 15 - i * 13, s = 1 - i * .12; c.save(); c.translate(d * 11, y); c.scale(s, s); c.fillStyle = p; bend(c, [[-8, -12], [-15, -6, -15, 12, -10, 16], [0, 24, 18, 13, 12, 1], [6, -9, 3, -16, -8, -12]], true); c.fillStyle = a; oval(c, -4, 10, 2.5); oval(c, 4, 7, 2); c.restore(); }
  }],
  ['wisteria', 'Wisteria Whispers', 'Long pendant wisteria racemes suspended below a leafy arch', 430, (c, p, a) => {
    c.strokeStyle = a; bend(c, [[-43, -30], [-10, -44, 16, -26, 43, -35]]); c.fillStyle = a; leaf(c, -30, -24, 7, 13, -.8); leaf(c, 27, -29, 7, 13, .8); for (const [x, top, length] of [[-19, -23, 5], [6, -22, 7], [29, -17, 4]]) { for (let i = 0; i < length; i++) { c.fillStyle = i % 3 ? p : a; oval(c, x - 3, top + i * 9, 7 - i * .5, 5, -.3); oval(c, x + 3, top + i * 9 + 3, 7 - i * .5, 5, .3); } }
  }],
  ['delphinium', 'Delphinium Diary', 'Upright branching flower spires with backward-pointing spurs', 420, (c, p, a) => {
    c.strokeStyle = a; line(c, [[0, 48], [0, -45]]); for (let i = 0; i < 6; i++) { const d = i % 2 ? 1 : -1, x = d * (15 - i), y = 25 - i * 13; c.strokeStyle = a; line(c, [[0, y + 8], [x, y]]); c.fillStyle = p; oval(c, x, y, 12 - i * .7, 9 - i * .4); line(c, [[x - d * 4, y], [x + d * 21, y - 10], [x + d * 9, y + 4]], true); c.fillStyle = a; oval(c, x, y, 3); }
  }],
  ['hollyhock', 'Hollyhock House', 'Stacked open hollyhock cups with large pleated leaves at the base', 430, (c, p, a) => {
    c.strokeStyle = a; line(c, [[0, 49], [0, -43]]); c.fillStyle = a; leaf(c, -16, 35, 16, 18, -.9); leaf(c, 16, 32, 16, 18, .9); for (const [x, y, s] of [[-13, 15, 1], [13, -13, .8], [-7, -36, .55]]) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = p; petals(c, 5, 8, 15, 11); c.fillStyle = a; oval(c, 0, 0, 6); c.restore(); }
  }],
  ['gladiolus', 'Gladiolus Grace', 'One-sided gladiolus sprays with trumpet blooms and sword leaves', 430, (c, p, a) => {
    c.strokeStyle = a; line(c, [[-7, 50], [8, -45]]); c.fillStyle = a; line(c, [[-7, 47], [-35, -12], [-19, 42]], true); for (let i = 0; i < 4; i++) { const y = 22 - i * 19; c.fillStyle = p; bend(c, [[-2, y], [22, y - 4, 17, y - 20, 35, y - 16], [45, y - 8, 31, y + 15, -2, y]], true); c.fillStyle = a; oval(c, 22, y - 1, 6, 3, -.5); }
  }],
  ['paradise', 'Paradise Plumes', 'Bird-of-paradise flowers with folded boat bracts and upright bright petals', 430, (c, p, a) => {
    c.strokeStyle = a; c.lineWidth = 4; line(c, [[-10, 47], [4, 3]]); c.fillStyle = a; line(c, [[-35, 1], [42, -6], [16, 14], [-12, 11]], true); c.fillStyle = p; for (const [x, y] of [[-8, -39], [7, -48], [22, -34]]) line(c, [[1, 4], [x, y], [x + 10, y + 13]], true); c.fillStyle = a; leaf(c, -23, 29, 12, 22, -.7);
  }],
  ['protea', 'Protea Promise', 'Crowned protea cups with pointed outer bracts and a dense velvet center', 420, (c, p, a) => {
    stem(c, a); for (let i = -3; i <= 3; i++) { c.fillStyle = i % 2 ? a : p; line(c, [[i * 4, 12], [i * 12, -25 - (3 - Math.abs(i)) * 6], [i * 7 + 10, 7]], true); } c.fillStyle = p; oval(c, 0, 5, 26, 15); c.strokeStyle = a; for (let x = -16; x <= 16; x += 5) line(c, [[x, 8], [x, -9]]);
  }],
  ['ranunculus', 'Ranunculus Ruffles', 'Tightly layered concentric ranunculus cups with offset petal seams', 400, (c, p, a) => {
    c.fillStyle = a; leaf(c, -28, 30, 10, 20, -.7); c.fillStyle = p; oval(c, 0, 0, 36); c.strokeStyle = a; c.lineWidth = 2.8; for (let r = 9; r <= 30; r += 7) { arc(c, r, r / 10, r / 10 + 5.3); c.save(); c.rotate(r / 7); line(c, [[r - 6, 0], [r, 0]]); c.restore(); }
  }],
  ['chrysanthemum', 'Chrysanthemum Chiffon', 'Fine curled chrysanthemum ribbon petals circling a contrasting center', 420, (c, p, a) => {
    c.strokeStyle = p; c.lineWidth = 4; for (let i = 0; i < 20; i++) { c.save(); c.rotate(i * TAU / 20); bend(c, [[7, 0], [19, -6, 44, -8, 39, 4], [35, 11, 28, 4, 32, 1]]); c.restore(); } c.fillStyle = a; oval(c, 0, 0, 10); dots(c, 7, 15, 2.5);
  }],
  ['dahlia', 'Dahlia Debut', 'Sculpted dahlias built from concentric pointed folded petals', 430, (c, p, a) => {
    for (let ring = 3; ring >= 1; ring--) for (let i = 0; i < 10; i++) { c.save(); c.rotate(i * TAU / 10 + ring * .24); c.fillStyle = ring % 2 ? p : a; line(c, [[ring * 6, -5], [ring * 15, 0], [ring * 6, 5], [ring * 3, 0]], true); c.restore(); } c.fillStyle = a; oval(c, 0, 0, 5);
  }],
  ['passionflower', 'Passionflower Poetry', 'Starry passionflowers with a fringed corona and five sculpted central anthers', 430, (c, p, a) => {
    for (let i = 0; i < 10; i++) { c.save(); c.rotate(i * TAU / 10); leaf(c, 24, 0, 8, 17, Math.PI / 2); c.restore(); } c.strokeStyle = a; for (let i = 0; i < 24; i++) { const t = i * TAU / 24; line(c, [[Math.cos(t) * 10, Math.sin(t) * 10], [Math.cos(t) * 28, Math.sin(t) * 28]]); } c.fillStyle = a; petals(c, 5, 9, 6, 3); oval(c, 0, 0, 5);
  }],
  ['clematis', 'Clematis Climb', 'Six-pointed clematis blossoms on climbing angular vine fragments', 420, (c, p, a) => {
    c.strokeStyle = a; line(c, [[-36, 43], [-20, 19], [13, 37], [35, 12]]); c.fillStyle = a; leaf(c, 29, 29, 8, 15, .8); c.fillStyle = p; for (let i = 0; i < 6; i++) { c.save(); c.rotate(i * TAU / 6); leaf(c, 0, -20, 14, 25); c.restore(); } c.fillStyle = a; dots(c, 12, 9, 2.7);
  }],
  ['lily', 'Stargazer Letters', 'Six reflexed lily petals with a long anther spray and spotted throats', 430, (c, p, a) => {
    for (let i = 0; i < 6; i++) { c.save(); c.rotate(i * TAU / 6); bend(c, [[0, 2], [-16, -12, -20, -35, 4, -44], [-2, -25, 18, -18, 0, 2]], true); c.restore(); } c.strokeStyle = a; for (const x of [-17, -6, 6, 17]) { line(c, [[0, 0], [x, 23]]); c.fillStyle = a; oval(c, x, 23, 5, 2.7, .5); } dots(c, 6, 13, 2);
  }],
  ['freesia', 'Freesia Friendship', 'Bent freesia stems bearing an orderly row of upward-open funnels', 420, (c, p, a) => {
    c.strokeStyle = a; bend(c, [[-18, 48], [-5, 14, -6, -20, 34, -21]]); for (let i = 0; i < 4; i++) { const x = -12 + i * 16, y = -8 - Math.sin(i) * 11; c.fillStyle = p; bend(c, [[x, y + 14], [x - 15, y - 2, x - 13, y - 15, x, y - 8], [x + 13, y - 15, x + 15, y - 2, x, y + 14]], true); c.fillStyle = a; oval(c, x, y - 4, 5, 3); } c.fillStyle = a; leaf(c, -25, 24, 7, 24, -.4);
  }],
  ['snowdrop', 'Snowdrop Sighs', 'Bowed snowdrop stems with three drooping slender white-style petals', 400, (c, p, a) => {
    c.strokeStyle = a; bend(c, [[0, 47], [10, 8, 21, -44, -7, -37], [-24, -34, -19, -21, -17, -15]]); c.fillStyle = a; leaf(c, 11, 26, 6, 25, .4); oval(c, -17, -14, 6, 8); c.fillStyle = p; for (const d of [-1, 0, 1]) oval(c, -17 + d * 9, 5, 6, 23, -d * .25);
  }],
  ['mimosa', 'Mimosa Meringue', 'Powder-puff mimosa clusters paired with a ladder of tiny leaflets', 410, (c, p, a) => {
    c.strokeStyle = a; line(c, [[-22, 43], [9, -28]]); c.fillStyle = a; for (let i = 0; i < 6; i++) { oval(c, -16 + i * 4, 25 - i * 8, 7, 2.5, -.8); oval(c, -3 + i * 3, 26 - i * 8, 7, 2.5, -.3); } for (const [x, y] of [[-17, -17], [6, -34], [27, -18], [17, 3]]) { c.fillStyle = p; oval(c, x, y, 11); c.strokeStyle = p; for (let i = 0; i < 12; i++) { const t = i * TAU / 12; line(c, [[x + Math.cos(t) * 9, y + Math.sin(t) * 9], [x + Math.cos(t) * 15, y + Math.sin(t) * 15]]); } }
  }],
  ['dogwood', 'Dogwood Daybook', 'Four broad notched dogwood bracts enclosing textured berry-like flower centers', 400, (c, p, a) => {
    for (let i = 0; i < 4; i++) { c.save(); c.rotate(i * TAU / 4); bend(c, [[0, 0], [-28, -5, -33, -37, -9, -41], [-4, -34, 4, -34, 9, -41], [33, -37, 28, -5, 0, 0]], true); c.restore(); } c.fillStyle = a; oval(c, 0, 0, 10); dots(c, 8, 6, 2.8);
  }],
  ['hellebore', 'Hellebore Hush', 'Nodding hellebore blooms with nested nectary cups and divided leaves', 410, (c, p, a) => {
    c.fillStyle = a; for (let i = -1; i <= 1; i++) leaf(c, -23 + i * 8, 31, 6, 17, -.7 + i * .4); c.fillStyle = p; petals(c, 5, 14, 21, 16, -.3); c.strokeStyle = a; for (let i = 0; i < 7; i++) { c.save(); c.rotate(i * TAU / 7); bend(c, [[6, -4], [19, -4, 19, 5, 7, 4]]); c.restore(); } c.fillStyle = a; oval(c, 0, 0, 5);
  }],
  ['ylang', 'Ylang Ylang Evenings', 'Long twisted ylang-ylang petals curling from an off-center flower heart', 420, (c, p, a) => {
    for (let i = 0; i < 6; i++) { c.save(); c.rotate(i * TAU / 6); bend(c, [[0, 0], [10, -13, 1, -31, 13, -43], [-6, -39, -11, -17, 0, 0]], true); c.restore(); } c.fillStyle = a; oval(c, 0, 0, 8); leaf(c, 31, 31, 13, 21, -.7);
  }],
  ['frangipani', 'Frangipani Flirt', 'Five rounded overlapping frangipani petals with curved inner color folds', 400, (c, p, a) => {
    for (let i = 0; i < 5; i++) { c.save(); c.rotate(i * TAU / 5); c.fillStyle = p; bend(c, [[0, 0], [-34, -7, -30, -37, -5, -37], [20, -36, 18, -12, 0, 0]], true); c.fillStyle = a; bend(c, [[0, 0], [-17, -8, -9, -27, -4, -30], [-7, -13, 6, -8, 0, 0]], true); c.restore(); }
  }],
  ['amaryllis', 'Amaryllis Affair', 'Paired wide amaryllis trumpets rising on one thick graceful stalk', 440, (c, p, a) => {
    c.strokeStyle = a; c.lineWidth = 5; line(c, [[0, 49], [0, -7]]); for (const d of [-1, 1]) { c.save(); c.translate(d * 13, -11); c.rotate(d * .7); c.fillStyle = p; bend(c, [[0, 19], [-33, -1, -28, -30, -10, -25], [0, -45, 10, -25, 13, -24], [32, -31, 33, -1, 0, 19]], true); c.strokeStyle = a; c.lineWidth = 3; line(c, [[0, 14], [0, -19]]); c.fillStyle = a; oval(c, 0, -18, 5, 3); c.restore(); }
  }],
  ['scabiosa', 'Pincushion Posies', 'Fringed scabiosa blooms with a domed dotted center and fine stalk', 420, (c, p, a) => {
    stem(c, a, 48); c.fillStyle = p; petals(c, 12, 24, 12, 7); oval(c, 0, 0, 23, 19); c.fillStyle = a; for (let row = -2; row <= 2; row++) for (let col = -2; col <= 2; col++) if (row * row + col * col <= 5) oval(c, col * 7 + (row % 2 ? 2 : 0), row * 6, 2.4);
  }],
  ['astilbe', 'Astilbe Blush', 'Feathery tapered astilbe plumes composed of tiny clustered florets', 420, (c, p, a) => {
    c.strokeStyle = a; line(c, [[0, 49], [0, -47]]); c.fillStyle = a; leaf(c, -17, 32, 10, 20, -.8); leaf(c, 16, 38, 10, 20, .8); for (let row = 0; row < 9; row++) { const w = 24 - row * 2.5, y = 15 - row * 7; c.fillStyle = row % 3 ? p : a; for (let x = -w; x <= w; x += 6) oval(c, x, y + Math.abs(x) * .25, 3.8); }
  }],
  ['allium', 'Allium Adoration', 'Spherical allium heads built from radiating miniature star-shaped florets', 430, (c, p, a) => {
    c.strokeStyle = a; line(c, [[0, 15], [0, 49]]); for (const [count, radius] of [[13, 29], [7, 15], [1, 0]]) for (let i = 0; i < count; i++) { const t = i * TAU / count; c.save(); c.translate(Math.cos(t) * radius, Math.sin(t) * radius); c.fillStyle = p; for (let j = 0; j < 5; j++) { const q = j * TAU / 5; line(c, [[0, 0], [Math.cos(q) * 7, Math.sin(q) * 7], [Math.cos(q + .35) * 2, Math.sin(q + .35) * 2]], true); } c.fillStyle = a; oval(c, 0, 0, 2.5); c.restore(); }
  }],
];

export const romancePatterns = motifs.map(([id, name, description, tileSize, render], i) => {
  const [background, patternColor, patternAccent, ink] = palettes[i % palettes.length];
  return { id: `romance-${id}`, name, description, tileSize, background, patternColor, patternAccent, ink,
    draw(c, { color = patternColor, accent = patternAccent } = {}) {
      c.save(); c.strokeStyle = color; c.fillStyle = color; c.lineWidth = 2.8; c.lineJoin = 'round'; c.lineCap = 'round';
      repeat(c, () => render(c, color, accent)); c.restore();
    },
  };
});
