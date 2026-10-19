// Original botanical drawings, wrapped on a 240-unit tile.
const TAU = Math.PI * 2;
const palettes = [
  ['#f2efde', '#718d59', '#b78a52', '#30432b'],
  ['#f7eae4', '#aa7564', '#778c65', '#513b31'],
  ['#e9f1ed', '#4e8e7c', '#b9935c', '#254b40'],
  ['#efebf6', '#8f70a8', '#6d9580', '#40334c'],
  ['#f8f0d6', '#a58335', '#638b91', '#4d4025'],
  ['#e8eff7', '#6089ae', '#a687ac', '#2c4358'],
  ['#f6e8ee', '#ad708a', '#81965a', '#523343'],
];
const line = (c, points, fill = false) => {
  c.beginPath(); points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
  if (fill) { c.closePath(); c.fill(); } else c.stroke();
};
const oval = (c, x, y, rx, ry = rx, angle = 0, fill = true) => {
  c.beginPath(); c.ellipse(x, y, rx, ry, angle, 0, TAU); fill ? c.fill() : c.stroke();
};
const leaf = (c, x, y, w, h, angle = 0) => {
  c.save(); c.translate(x, y); c.rotate(angle); c.beginPath(); c.moveTo(0, -h);
  c.bezierCurveTo(w, -h / 2, w, h / 2, 0, h); c.bezierCurveTo(-w, h / 2, -w, -h / 2, 0, -h); c.fill(); c.restore();
};
const bend = (c, points) => { c.beginPath(); c.moveTo(...points[0]); points.slice(1).forEach(p => c.bezierCurveTo(...p)); c.stroke(); };
const placements = [[55, 55, -.15], [178, 178, .15]];
function repeat(c, draw, positions = placements) {
  for (const [x, y, angle = 0] of positions) for (const dx of [-240, 0, 240]) for (const dy of [-240, 0, 240]) {
    c.save(); c.translate(x + dx, y + dy); c.rotate(angle); draw(c); c.restore();
  }
}
const motifs = [
  ['ginkgo', 'Ginkgo Letters', 'Notched ginkgo fan leaves with radiating golden veins', 310, (c, p, a) => repeat(c, () => {
    c.beginPath(); c.moveTo(0, 30); c.lineTo(-39, -12); c.bezierCurveTo(-34, -43, -9, -35, 0, -23); c.bezierCurveTo(9, -35, 34, -43, 39, -12); c.closePath(); c.fill();
    c.strokeStyle = a; for (const x of [-26, -13, 0, 13, 26]) line(c, [[0, 28], [x, -18 - Math.abs(x) / 4]]); line(c, [[0, 30], [0, 45]]);
  })],
  ['monstera', 'Monstera Cutouts', 'Large tropical split leaves with open side slits and center veins', 360, (c, p, a) => repeat(c, () => {
    c.beginPath(); c.moveTo(0, -41); c.bezierCurveTo(49, -42, 52, 14, 0, 44); c.bezierCurveTo(-52, 14, -49, -42, 0, -41); c.fill();
    c.strokeStyle = a; c.lineWidth = 5; line(c, [[0, -31], [0, 39]]); for (const d of [-1, 1]) for (const y of [-15, 4, 22]) line(c, [[d * 8, y], [d * 39, y - 15]]);
  })],
  ['acorn', 'Acorn Almanac', 'Woodland acorns with crosshatched caps and little curved stems', 300, (c, p, a) => repeat(c, () => {
    c.beginPath(); c.moveTo(-21, -6); c.bezierCurveTo(-22, 17, -12, 26, 0, 33); c.bezierCurveTo(12, 26, 22, 17, 21, -6); c.fill();
    c.fillStyle = a; oval(c, 0, -9, 27, 12); c.strokeStyle = a; bend(c, [[0, -19], [-4, -30, 8, -30, 8, -38]]); c.strokeStyle = p; for (let x = -15; x <= 15; x += 10) line(c, [[x - 4, -14], [x + 4, -5]]);
  })],
  ['pinecone', 'Pinecone Cabinet', 'Layered pinecone scales beneath a slender twig', 330, (c, p, a) => repeat(c, () => {
    c.strokeStyle = a; line(c, [[0, -32], [8, -46]]);
    for (let row = 0; row < 5; row++) for (let col = -1; col <= 1; col++) { c.fillStyle = (row + col) % 2 ? p : a; const x = col * (19 - row * 2), y = -22 + row * 13; c.beginPath(); c.moveTo(x - 12, y); c.quadraticCurveTo(x, y + 23, x + 12, y); c.quadraticCurveTo(x, y - 12, x - 12, y); c.fill(); }
  })],
  ['wheat', 'Wheatfield Notes', 'Full wheat ears with long fine awns', 300, (c, p, a) => repeat(c, () => {
    line(c, [[0, 45], [0, -40]]); for (let i = 0; i < 5; i++) for (const d of [-1, 1]) { c.fillStyle = i % 2 ? a : p; oval(c, d * 9, 13 - i * 11, 5, 11, d * .7); c.strokeStyle = a; line(c, [[d * 12, 7 - i * 11], [d * 24, -10 - i * 11]]); }
  })],
  ['bamboo', 'Bamboo Courtyard', 'Segmented bamboo canes and pointed side leaves', 280, (c, p, a) => {
    for (const x of [40, 160]) { c.fillStyle = p; for (let y = -60; y < 300; y += 60) c.fillRect(x - 7, y + 4, 14, 51); c.strokeStyle = a; for (let y = 0; y <= 240; y += 60) line(c, [[x - 12, y], [x + 12, y]]); }
    c.fillStyle = a; repeat(c, () => { for (let i = 0; i < 3; i++) leaf(c, 10 + i * 10, -i * 8, 4, 19, .8 + i * .3); }, [[49, 60], [169, 180]]);
  }],
  ['hydrangea', 'Hydrangea Haze', 'Rounded hydrangea clusters built from tiny four-petal florets', 350, (c, p, a) => repeat(c, () => {
    for (const [x, y] of [[0, 0], [-18, -12], [17, -13], [-15, 15], [16, 15], [0, -28]]) { c.fillStyle = p; for (let i = 0; i < 4; i++) oval(c, x + Math.cos(i * TAU / 4) * 5, y + Math.sin(i * TAU / 4) * 5, 6, 4, i * TAU / 4); c.fillStyle = a; oval(c, x, y, 3); }
    c.fillStyle = a; leaf(c, 21, 39, 12, 19, .8);
  })],
  ['poppy', 'Poppy Press', 'Broad overlapping poppy petals with seed-dark centers', 330, (c, p, a) => repeat(c, () => {
    for (let i = 0; i < 4; i++) oval(c, Math.cos(i * Math.PI / 2) * 13, Math.sin(i * Math.PI / 2) * 13, 22, 17, i * Math.PI / 2);
    c.fillStyle = a; oval(c, 0, 0, 11); c.strokeStyle = a; line(c, [[0, 31], [-5, 48]]); c.fillStyle = p; for (let i = 0; i < 7; i++) oval(c, Math.cos(i) * 6, Math.sin(i) * 6, 1.8);
  })],
  ['lavender', 'Lavender Bundles', 'Tied trios of lavender spikes with clustered buds', 340, (c, p, a) => repeat(c, () => {
    c.strokeStyle = a; for (const d of [-1, 0, 1]) { line(c, [[0, 44], [d * 20, -27]]); c.fillStyle = p; for (let i = 0; i < 5; i++) { const x = d * (11 + i * 2), y = 3 - i * 9; oval(c, x - 4, y, 5, 3, -.4); oval(c, x + 4, y - 4, 5, 3, .4); } } c.strokeStyle = a; line(c, [[-9, 28], [9, 28]]); line(c, [[-8, 34], [8, 34]]);
  })],
  ['eucalyptus', 'Silver Dollar Sprigs', 'Round eucalyptus leaves alternating along slender branches', 310, (c, p, a) => repeat(c, () => {
    bend(c, [[-5, 46], [8, 15, -5, -15, 9, -43]]); for (let i = 0; i < 5; i++) { c.fillStyle = i % 2 ? a : p; oval(c, i % 2 ? 13 : -10, 28 - i * 15, 12 - i * .8, 9 - i * .5, i % 2 ? -.4 : .4); }
  })],
  ['valley-bells', 'Little Valley Bells', 'Cute lily-of-the-valley sprigs with dangling scalloped bell blooms and broad leaves', 370, (c, p, a) => repeat(c, () => {
    c.strokeStyle = a; bend(c, [[-5, 46], [5, 13, 14, -24, 0, -42]]);
    c.fillStyle = a; leaf(c, -17, 17, 10, 32, -.4); leaf(c, 19, 23, 8, 26, .4);
    for (const [x, y] of [[-8, -30], [19, -17], [-8, -3]]) {
      c.strokeStyle = a; bend(c, [[6, y - 12], [x, y - 16, x, y - 8, x, y - 6]]);
      c.fillStyle = p; c.beginPath(); c.moveTo(x - 8, y - 6); c.quadraticCurveTo(x - 10, y + 2, x - 13, y + 7);
      c.quadraticCurveTo(x - 6, y + 15, x, y + 7); c.quadraticCurveTo(x + 6, y + 15, x + 13, y + 7);
      c.quadraticCurveTo(x + 10, y + 2, x + 8, y - 6); c.quadraticCurveTo(x, y - 13, x - 8, y - 6); c.fill();
    }
  })],
  ['maple', 'Maple Keepsakes', 'Five-lobed angular maple leaves and contrasting midribs', 320, (c, p, a) => repeat(c, () => {
    line(c, [[0, -42], [9, -22], [23, -31], [21, -9], [39, -15], [31, 5], [42, 10], [10, 25], [0, 32], [-10, 25], [-42, 10], [-31, 5], [-39, -15], [-21, -9], [-23, -31], [-9, -22]], true); c.strokeStyle = a; line(c, [[0, -28], [0, 46]]); line(c, [[0, 15], [-24, 1]]); line(c, [[0, 15], [24, 1]]);
  })],
  ['oak', 'Oak Library', 'Rounded oak lobes with long branching veins', 330, (c, p, a) => repeat(c, () => {
    c.beginPath(); c.moveTo(0, -42); for (const d of [1, -1]) { if (d === -1) c.lineTo(0, 36); c.bezierCurveTo(d * 22, d === 1 ? -48 : 40, d * 30, d === 1 ? -24 : 22, d * 18, d === 1 ? -19 : 15); c.bezierCurveTo(d * 47, -13, d * 36, 12, d * 21, 15); c.bezierCurveTo(d * 35, 31, d * 15, 42, 0, d === 1 ? 36 : -42); } c.fill(); c.strokeStyle = a; line(c, [[0, -28], [0, 48]]); for (const y of [-12, 7, 23]) for (const d of [-1, 1]) line(c, [[0, y + 6], [d * 18, y]]);
  })],
  ['palm', 'Palm Pavilion', 'Arching palm canopies above two fine trunks', 380, (c, p, a) => repeat(c, () => {
    c.strokeStyle = a; bend(c, [[-3, 48], [8, 17, 8, -6, 0, -17]]); bend(c, [[4, 48], [14, 16, 12, -6, 0, -17]]);
    for (const d of [-1, 1]) for (let i = 0; i < 3; i++) { c.fillStyle = i === 1 ? a : p; c.beginPath(); c.moveTo(0, -17); c.quadraticCurveTo(d * 29, -52 + i * 13, d * 47, -15 + i * 12); c.quadraticCurveTo(d * 23, -27 + i * 10, 0, -17); c.fill(); }
  })],
  ['saguaro', 'Saguaro Sunday', 'Branched desert cacti with rib lines and flower crowns', 350, (c, p, a) => repeat(c, () => {
    c.lineWidth = 15; c.lineCap = 'round'; line(c, [[0, 37], [0, -29]]); line(c, [[0, 8], [-24, 8], [-24, -14]]); line(c, [[0, -4], [24, -4], [24, -27]]); c.strokeStyle = a; c.lineWidth = 2.5; line(c, [[0, 32], [0, -29]]); line(c, [[-24, 6], [-24, -14]]); c.fillStyle = a; oval(c, 0, -39, 8, 5);
  })],
  ['succulent', 'Succulent Study', 'Fleshy rosettes of overlapping rounded succulent leaves', 350, (c, p, a) => repeat(c, () => {
    for (let ring = 2; ring > 0; ring--) for (let i = 0; i < 7; i++) { const t = i * TAU / 7 + ring * .4; c.fillStyle = ring === 2 ? p : a; oval(c, Math.cos(t) * ring * 10, Math.sin(t) * ring * 10, ring * 8, ring * 5, t); } c.fillStyle = p; oval(c, 0, 0, 5);
  })],
  ['agave', 'Agave Atelier', 'Sharp upright agave fans with folded accent blades', 340, (c, p, a) => repeat(c, () => {
    for (let i = -3; i <= 3; i++) { c.fillStyle = i % 2 ? a : p; line(c, [[0, 38], [i * 13, -37 + Math.abs(i) * 9], [i * 7 + 5, 11]], true); }
  })],
  ['morel', 'Morel Forager', 'Honeycombed morel mushroom caps on pale stout stalks', 330, (c, p, a) => repeat(c, () => {
    c.fillStyle = a; line(c, [[-9, 7], [9, 7], [12, 41], [-12, 41]], true); c.fillStyle = p; c.beginPath(); c.moveTo(0, -41); c.bezierCurveTo(23, -35, 31, 6, 20, 17); c.quadraticCurveTo(0, 26, -20, 17); c.bezierCurveTo(-31, 6, -23, -35, 0, -41); c.fill(); c.strokeStyle = a; for (let y = -22; y < 14; y += 12) for (const x of [-10, 5]) { c.save(); c.translate(x, y); line(c, [[0, -4], [5, 0], [2, 6], [-4, 3], [0, -4]]); c.restore(); }
  })],
  ['willow', 'Willow Curtains', 'Drooping willow branches with narrow hanging leaves', 370, (c, p, a) => repeat(c, () => {
    bend(c, [[-35, -35], [0, -50, 33, -30, 32, 6]]); for (let i = 0; i < 4; i++) { const x = -22 + i * 16; c.strokeStyle = a; bend(c, [[x, -34], [x + 4, -10, x - 8, 16, x - 8, 39]]); c.fillStyle = p; for (let j = 0; j < 3; j++) leaf(c, x - 3, -9 + j * 15, 3, 12, -.2); }
  })],
  ['alpine', 'Alpine Fieldbook', 'Snow-capped mountain silhouettes above tiny meadow ridges', 380, (c, p, a) => repeat(c, () => {
    line(c, [[-48, 33], [-7, -36], [37, 33]], true); c.fillStyle = a; line(c, [[-21, -12], [-7, -36], [9, -10], [-2, -17], [-10, -8]], true); c.strokeStyle = a; bend(c, [[-42, 46], [-10, 34, 20, 50, 46, 39]]);
  })],
  ['volcanic', 'Volcanic Islands', 'Flat-crater volcanoes with lava channels and floating ash', 380, (c, p, a) => repeat(c, () => {
    line(c, [[-46, 36], [-17, -22], [16, -22], [46, 36]], true); c.strokeStyle = a; c.lineWidth = 5; line(c, [[-6, -20], [-10, -2], [5, 11], [0, 32]]); c.fillStyle = a; oval(c, 0, -24, 18, 6); oval(c, -8, -39, 4); oval(c, 13, -48, 3);
  })],
  ['waterfall', 'Waterfall Windows', 'Stepped cliff faces and long falling water ribbons', 380, (c, p, a) => repeat(c, () => {
    line(c, [[-42, -34], [1, -34], [1, -12], [38, -12], [38, 35], [-42, 35]], true); c.strokeStyle = a; c.lineWidth = 5; for (const x of [-23, -11, 1]) line(c, [[x, -26], [x, 40]]); c.lineWidth = 2.8; oval(c, -10, 44, 34, 5, 0, false);
  })],
  ['iceberg', 'Iceberg Drifters', 'Faceted floating ice with reflected underwater keels', 360, (c, p, a) => repeat(c, () => {
    line(c, [[-40, 0], [-18, -26], [0, -17], [17, -39], [40, 0]], true); c.fillStyle = a; line(c, [[-34, 8], [34, 8], [10, 38], [-13, 24]], true); c.strokeStyle = a; line(c, [[-48, 4], [48, 4]]); c.strokeStyle = p; line(c, [[-21, 15], [7, 27], [22, 15]]);
  })],
  ['cotton', 'Cotton Morning', 'Soft cotton bolls gathered in angular open bracts', 340, (c, p, a) => repeat(c, () => {
    line(c, [[-30, 2], [-17, 27], [0, 17], [17, 27], [30, 2], [0, 10]], true); c.strokeStyle = p; line(c, [[0, 17], [0, 45]]); c.fillStyle = a; for (const [x, y] of [[-17, -6], [0, -20], [17, -6], [0, 4]]) oval(c, x, y, 16, 15);
  })],
  ['cattail', 'Cattail Marsh', 'Velvet reed heads and long blade-like marsh leaves', 330, (c, p, a) => repeat(c, () => {
    line(c, [[0, 47], [0, -43]]); c.lineWidth = 13; line(c, [[0, -25], [0, 2]]); c.fillStyle = a; c.beginPath(); c.moveTo(0, 46); c.quadraticCurveTo(-30, 8, -25, -15); c.quadraticCurveTo(-7, 10, 0, 46); c.fill(); c.beginPath(); c.moveTo(0, 46); c.quadraticCurveTo(5, 7, 26, -4); c.quadraticCurveTo(18, 29, 0, 46); c.fill();
  })],
  ['mangrove', 'Mangrove Tides', 'Splayed mangrove roots beneath compact leafy crowns', 370, (c, p, a) => repeat(c, () => {
    c.lineWidth = 4; for (const d of [-2, -1, 0, 1, 2]) line(c, [[0, -9], [d * 7, 13], [d * 18, 39]]); c.fillStyle = a; for (const [x, y, r] of [[-21, -23, 18], [0, -35, 22], [23, -23, 18]]) oval(c, x, y, r, r * .8); c.strokeStyle = a; line(c, [[-47, 46], [-18, 46]]); line(c, [[14, 46], [47, 46]]);
  })],
  ['baobab', 'Baobab Grove', 'Broad bottle trunks topped by branching flat crowns', 380, (c, p, a) => repeat(c, () => {
    line(c, [[-22, 43], [-13, -9], [-26, -25], [-7, -17], [0, -35], [7, -17], [26, -25], [13, -9], [22, 43]], true); c.fillStyle = a; oval(c, -24, -30, 19, 8); oval(c, 0, -40, 20, 8); oval(c, 24, -30, 19, 8);
  })],
  ['poplar', 'Poplar Promenade', 'Tall tapered poplar silhouettes and slender inner trunks', 340, (c, p, a) => repeat(c, () => {
    c.beginPath(); c.moveTo(0, -49); c.bezierCurveTo(8, -22, 38, 23, 0, 34); c.bezierCurveTo(-38, 23, -8, -22, 0, -49); c.fill(); c.strokeStyle = a; line(c, [[0, -30], [0, 48]]); for (const d of [-1, 1]) for (let y = -5; y < 25; y += 11) line(c, [[0, y + 8], [d * 12, y]]);
  })],
  ['birch', 'Birch Bark Studies', 'Broken bark markings on slender continuous birch trunks', 280, (c, p, a) => {
    for (const x of [42, 163]) { c.strokeStyle = p; bend(c, [[x - 16, 0], [x - 9, 80, x - 22, 160, x - 16, 240]]); bend(c, [[x + 16, 0], [x + 23, 80, x + 10, 160, x + 16, 240]]); c.strokeStyle = a; for (let y = 18; y < 240; y += 35) { line(c, [[x - 10, y], [x + 7, y - 2]]); line(c, [[x + 3, y + 12], [x + 13, y + 10]]); } }
  }],
  ['violet-pot', 'Pocket Violet Pots', 'Cute cozy windowsill pots with paired violet blooms and round leaves', 330, (c, p, a) => repeat(c, () => {
    c.fillStyle = a; line(c, [[-23, 12], [23, 12], [17, 43], [-17, 43]], true); c.fillRect(-26, 6, 52, 9);
    c.strokeStyle = a; for (const d of [-1, 1]) { line(c, [[0, 7], [d * 15, -24]]); c.fillStyle = p; for (let i = 0; i < 5; i++) { const t = i * TAU / 5; oval(c, d * 15 + Math.cos(t) * 7, -27 + Math.sin(t) * 7, 6, 5, t); } c.fillStyle = a; oval(c, d * 15, -27, 3); c.fillStyle = p; oval(c, d * 14, 0, 12, 6, -d * .3); }
  })],
  ['plane-seeds', 'Sycamore Satellites', 'Hanging sycamore seed balls with bristled outlines', 350, (c, p, a) => repeat(c, () => {
    c.strokeStyle = a; line(c, [[0, -42], [-17, -2]]); line(c, [[0, -42], [19, 18]]); for (const [x, y] of [[-17, 2], [19, 24]]) { c.fillStyle = p; oval(c, x, y, 15); for (let i = 0; i < 12; i++) { const t = i * TAU / 12; line(c, [[x + 13 * Math.cos(t), y + 13 * Math.sin(t)], [x + 20 * Math.cos(t), y + 20 * Math.sin(t)]]); } } c.fillStyle = a; oval(c, -20, -2, 4); oval(c, 16, 20, 4);
  })],
  ['anemone', 'Wood Anemone', 'Wide pointed blooms with a dense ring of contrasting stamens', 350, (c, p, a) => repeat(c, () => {
    for (let i = 0; i < 7; i++) { c.save(); c.rotate(i * TAU / 7); leaf(c, 0, -21, 13, 23); c.restore(); } c.fillStyle = a; oval(c, 0, 0, 11); for (let i = 0; i < 12; i++) oval(c, Math.cos(i * TAU / 12) * 16, Math.sin(i * TAU / 12) * 16, 2.5);
  })],
  ['iris', 'Iris Studio', 'Three upright iris standards over broad drooping falls', 370, (c, p, a) => repeat(c, () => {
    for (const d of [-1, 0, 1]) { c.fillStyle = p; leaf(c, d * 13, -19 + Math.abs(d) * 7, 9, 23, d * .5); c.fillStyle = a; oval(c, d * 20, 14 - Math.abs(d) * 4, 12, 21, -d * .6); } c.strokeStyle = p; line(c, [[0, 28], [0, 48]]);
  })],
  ['thistle', 'Thistle Folio', 'Spiny thistle cups topped by dense fine purple florets', 360, (c, p, a) => repeat(c, () => {
    line(c, [[0, 15], [0, 47]]); c.beginPath(); c.moveTo(-22, -5); c.quadraticCurveTo(-22, 28, 0, 22); c.quadraticCurveTo(22, 28, 22, -5); c.fill(); c.strokeStyle = a; for (let i = -3; i <= 3; i++) line(c, [[i * 5, 0], [i * 7, -21 - (3 - Math.abs(i)) * 5]]); c.strokeStyle = p; for (const d of [-1, 1]) line(c, [[0, 35], [d * 23, 20], [d * 18, 31], [d * 31, 26]]);
  })],
  ['helicopter-seeds', 'Maple Helicopters', 'Paired winged samaras with plump seed ends and delicate ribs', 340, (c, p, a) => repeat(c, () => {
    for (const d of [-1, 1]) { c.fillStyle = p; c.beginPath(); c.moveTo(d * 3, 13); c.bezierCurveTo(d * 10, -5, d * 18, -35, d * 45, -29); c.bezierCurveTo(d * 42, -9, d * 18, 15, d * 3, 13); c.fill(); c.strokeStyle = a; line(c, [[d * 7, 9], [d * 34, -22]]); c.fillStyle = a; oval(c, d * 8, 14, 7, 10, d * .5); }
  })],
];

export const botanicalPatterns = motifs.map(([id, name, description, tileSize, render], i) => {
  const [background, patternColor, patternAccent, ink] = palettes[i % palettes.length];
  return { id: `nature-${id}`, name, description, tileSize, background, patternColor, patternAccent, ink,
    draw(c, { color = patternColor, accent = patternAccent } = {}) {
      c.save(); c.fillStyle = color; c.strokeStyle = color; c.lineWidth = 2.8; c.lineJoin = 'round'; c.lineCap = 'round';
      render(c, color, accent); c.restore();
    },
  };
});
