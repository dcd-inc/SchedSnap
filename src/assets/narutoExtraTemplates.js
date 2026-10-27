// Additional reference-led compositions, generated separately for each device.
const designs = [
  ['naruto-resolute-ink', 'Resolute Ink', 'Naruto in a black zip jacket, with a focused downward glance and fine manga hatching.', 'Naruto Uzumaki, jacket, portrait', '#f3f3f3'],
  ['naruto-sasuke-shadow', 'Sasuke Shadow', 'Sasuke rests a hand on his sword, beside a lightly hatched silhouette.', 'Sasuke Uchiha, sword, rope belt, shadow', '#ffffff'],
  ['naruto-itachi-stillness', 'Itachi Stillness', 'Itachi looks up from a high black cloak collar in a quiet manga portrait.', 'Itachi Uchiha, Akatsuki, headband, necklace', '#ffffff'],
  ['naruto-fourth-hokage', 'Fourth Hokage', 'Minato’s flowing cloak carries its original vertical kanji, fine screentone and black flame hem.', 'Minato Namikaze, Fourth Hokage, cloak, flames, kanji', '#ffffff'],
];

export const narutoExtraTemplates = designs.map(([id, name, description, keywords, background]) => ({
  id, name, description, collection: 'naruto', family: 'reference-minimal',
  createdAt: '2026-10-23T23:25:57.000Z',
  keywords: `Naruto, anime, manga, black, white, monochrome, hand drawn, ink, ${keywords}`,
  background, ink: '#202020', muted: '#4b4b4b', surface: '#ffffff', line: '#a5a5a5',
  containerStyle: 'glass', containerShape: 'pill', containerFill: true,
  particleStyle: 'none', schedulePosition: id === 'naruto-resolute-ink' ? 'right' : 'left',
  ...(id === 'naruto-fourth-hokage' ? { artworkFooter: true } : {}),
  image: `/wallpapers/scenic/${id}/mobile.png`,
  deviceImages: Object.fromEntries(['mobile', 'tablet', 'laptop'].map(device => [device, `/wallpapers/scenic/${id}/${device}.png`])),
}));

