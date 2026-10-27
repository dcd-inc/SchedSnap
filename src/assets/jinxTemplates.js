// Approved reference-inspired backgrounds; the shared renderer adds the schedule.
const designs = [
  ['cream-mischief', 'Cream Mischief', 'Ivory paper, pink graffiti, and Jinx leaning over an industrial ledge.', '#f1e9dc', '#342437', '#fff8ed', 'cream, ivory, paper, pink, purple, blue hair, character, ledge, smiley, monkey doodle'],
  ['electric-afterhours', 'Electric Afterhours', 'Midnight blue spray paint, cyan stars, and a magenta monkey doodle.', '#020d25', '#e9faff', '#07172e', 'midnight, navy, cobalt, cyan, magenta, dark, neon, spray paint, stars, halftone, smoke, monkey doodle'],
  ['pink-riot', 'Pink Riot', 'Blush paper collage, torn black posters, and Jinx with blue braids.', '#f7e5df', '#3d2339', '#fff2ed', 'blush, pink, paper, collage, torn posters, black, cyan, blue braids, character, smiley, stars'],
  ['blue-hour', 'Blue Hour', 'A dark Jinx portrait with cyan hair and magenta graffiti on charcoal blue.', '#07101d', '#e9faff', '#101d30', 'charcoal, midnight, dark, blue, cyan, magenta, portrait, character, rim lighting, stars, smiley'],
];

export const jinxTemplates = designs.map(([slug, name, description, background, ink, surface, keywords]) => ({
  id: `jinx-${slug}`, name: `Jinx — ${name}`, description,
  collection: 'arcane', family: 'reference-minimal', mobileOnly: true,
  createdAt: '2026-10-27T04:00:00.000Z',
  keywords: `Arcane, Jinx, League of Legends, LoL, Zaun, graffiti, wallpaper, mobile, ${name}, ${keywords}`,
  background, ink, muted: ink, surface, line: `${ink}44`,
  containerStyle: 'solid', containerShape: 'rounded', containerRadius: 10,
  containerOpacity: 90, containerFill: true, containerBorder: false,
  particleStyle: 'none', artworkFooter: false, showScheduleTitle: true,
  fontFamily: 'DM Sans Variable',
  image: `/wallpapers/scenic/jinx-${slug}/mobile.png`,
  deviceImages: { mobile: `/wallpapers/scenic/jinx-${slug}/mobile.png` },
}));
