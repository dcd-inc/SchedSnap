// Four reference compositions, independently drawn for each device aspect ratio.
const designs = [
  ['naruto-leaf-ink-lineup', 'Leaf Ink Lineup', 'Young Hidden Leaf friends and Akamaru in a fine black-ink profile lineup.', 'Naruto, Sasuke, Neji, Shikamaru, Akamaru, Choji', '#f4f3f8'],
  ['naruto-retrieval-squad', 'Retrieval Squad', 'Naruto, Neji, Shikamaru, Rock Lee and Choji in a diagonal manga ensemble.', 'Naruto, Neji, Shikamaru, Rock Lee, Choji', '#ffffff'],
  ['naruto-sasuke-quiet-ink', 'Sasuke Quiet Ink', 'Sasuke in a plain black T-shirt, with spare pen contours and a quiet white field.', 'Sasuke Uchiha, black T-shirt, portrait', '#ffffff'],
  ['naruto-kakashi-obito', 'Back to Back', 'Young Kakashi and Obito stand back to back in monochrome pen and ink.', 'Kakashi Hatake, Obito Uchiha, goggles, mask', '#ffffff'],
];

export const narutoTemplates = designs.map(([id, name, description, keywords, background]) => ({
  id, name, description, collection: 'naruto', family: 'reference-minimal',
  createdAt: '2026-10-22T09:45:00.000Z',
  keywords: `Naruto, anime, manga, black, white, monochrome, hand drawn, ink, ${keywords}`,
  background, ink: '#202020', muted: '#4b4b4b', surface: '#ffffff', line: '#a5a5a5',
  containerStyle: 'glass', containerShape: 'pill', containerFill: true,
  particleStyle: 'none', schedulePosition: 'left',
  image: `/wallpapers/scenic/${id}/mobile.png`,
  deviceImages: Object.fromEntries(['mobile', 'tablet', 'laptop'].map(device => [device, `/wallpapers/scenic/${id}/${device}.png`])),
}));

