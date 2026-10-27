// Seven explicitly approved portraits from the second Arcane preview batch.
const designs = [
  ['gilded-divide', 'Gilded Divide', 'Jinx, Vi, Caitlyn and Jayce beneath a brass Hextech ring on cream paper.', '#f7f3e9', '#263343', '#fffcf4', 'Jinx, Vi, Caitlyn, Jayce, Piltover, Hextech, ensemble, brass, gold, cream, blue, pink, poster'],
  ['sisters-in-ink', 'Sisters in Ink', 'Vi and Jinx back to back with pink and blue brushwork on ivory paper.', '#f8f1e3', '#352c37', '#fffbf2', 'Vi, Jinx, sisters, pink hair, blue braids, ivory, cream, pink, blue, brushwork, portrait'],
  ['piltover-blue', 'Piltover Blue', 'Caitlyn and Vi framed by aged brass architecture on pale steel blue.', '#cbdce9', '#233349', '#eef5fa', 'Caitlyn, Vi, Piltover, blue, brass, gold, architecture, skyline, portrait'],
  ['goggle-girl', 'Goggle Girl', 'Jinx adjusts brass goggles beside cyan graffiti on a dark petrol wall.', '#071e30', '#ecf8ff', '#10283c', 'Jinx, Zaun, goggles, brass, cyan, blue, purple, dark, graffiti, monkey doodle, stars, portrait'],
  ['chalk-mischief', 'Chalk Mischief', 'Jinx reaches forward beneath chalky hearts, spirals and stars on charcoal.', '#151b21', '#fff3f7', '#202832', 'Jinx, Zaun, chalk, graffiti, hearts, spirals, stars, charcoal, dark, cyan, pink, yellow, purple'],
  ['violet-tear', 'Violet Tear', 'Jinx peers through torn plum paper with cyan and magenta edge marks.', '#201628', '#fff0ff', '#30213a', 'Jinx, magenta eyes, blue hair, torn paper, plum, purple, dark, cyan, pink, nails, close up'],
  ['paper-peek', 'Paper Peek', 'Jinx and her painted nails peek through a torn opening in white paper.', '#f8f6ee', '#352b40', '#fffdf7', 'Jinx, magenta eyes, blue hair, torn paper, white, cream, cyan, pink, nails, close up, graffiti'],
];

export const arcaneTemplates = designs.map(([slug, name, description, background, ink, surface, keywords]) => ({
  id: `arcane-${slug}`, name: `Arcane — ${name}`, description,
  collection: 'arcane', family: 'reference-minimal', mobileOnly: true,
  createdAt: '2026-10-27T10:00:00.000Z',
  keywords: `Arcane, League of Legends, LoL, wallpaper, mobile, ${name}, ${keywords}`,
  background, ink, muted: ink, surface, line: `${ink}44`,
  containerStyle: 'solid', containerShape: 'rounded', containerRadius: 10,
  containerOpacity: 90, containerFill: true, containerBorder: false,
  particleStyle: 'none', artworkFooter: false, showScheduleTitle: true,
  fontFamily: 'DM Sans Variable',
  image: `/wallpapers/scenic/arcane-${slug}/mobile.png`,
  deviceImages: { mobile: `/wallpapers/scenic/arcane-${slug}/mobile.png` },
}));
