const createdAt = '2026-10-16T15:58:19Z';
const designs = [
  ['gon-manga', 'Gon · Manga', 'manga', '#282a21', 'Gon Freecss, red, orange, red orange, black, warm, glow, manga panels, collage, Nen'],
  ['killua-manga', 'Killua · Manga', 'manga', '#253248', 'Killua Zoldyck, blue, navy, white, black, cool, electric, lightning, glow, manga panels, collage'],
  ['kurapika-manga', 'Kurapika · Manga', 'manga', '#472730', 'Kurapika Kurta, red, crimson, gold, amber, black, blond, chain, glow, manga panels, collage'],
  ['leorio-manga', 'Leorio · Manga', 'manga', '#39332c', 'Leorio Paradinight, yellow, orange, yellow orange, amber, sepia, navy, black, warm, glasses, suit, glow, manga panels, collage'],
  ['hisoka-manga', 'Hisoka · Manga', 'manga', '#402337', 'Hisoka Morow, pink, rose, magenta, purple, black, glow, magician, playing card, manga panels, collage'],
  ['gon-plain', 'Gon · Green', 'plain', '#244c35', 'Gon Freecss, green, forest green, black, white, amber eyes, monochrome, manga portrait, minimalist, solid background'],
  ['killua-plain', 'Killua · Blue', 'plain', '#21445d', 'Killua Zoldyck, blue, slate blue, black, white, blue eyes, monochrome, manga portrait, minimalist, solid background'],
  ['kurapika-plain', 'Kurapika · Crimson', 'plain', '#741329', 'Kurapika Kurta, red, crimson, burgundy, black, white, scarlet eyes, monochrome, chain, manga portrait, minimalist, solid background'],
  ['hisoka-plain', 'Hisoka · Pink', 'plain', '#d92370', 'Hisoka Morow, pink, hot pink, black, white, golden eyes, amber eyes, monochrome, magician, manga portrait, minimalist, solid background'],
  ['gon-chibi', 'Gon · Chibi', 'chibi', '#52684b', 'Gon Freecss, green, sage, olive green, amber eyes, seated, cute, plain, textured'],
  ['killua-chibi', 'Killua · Chibi', 'chibi', '#7786a6', 'Killua Zoldyck, blue, slate blue, periwinkle, lavender, white hair, blue eyes, seated, cute, plain, textured'],
  ['kurapika-chibi', 'Kurapika · Chibi', 'chibi', '#814d50', 'Kurapika Kurta, red, burgundy, gold, antique gold, blond, chain, chains, seated, cute'],
  ['leorio-chibi', 'Leorio · Chibi', 'chibi', '#355b6b', 'Leorio Paradinight, teal, navy, blue, brown, glasses, sunglasses, attache case, attaché case, briefcase, suit, seated, cute'],
  ['phantom-troupe', 'Phantom Troupe', 'group', '#faf8f3', 'Phantom Troupe, Phantom gang, spider, Genei Ryodan, Chrollo, Machi, Shizuku, Nobunaga, Bonolenov, Uvogin, Phinks, Hisoka, Pakunoda, Franklin, Kortopi, Feitan, Shalnark, white, pink, coral, doodle, chibi, logo'],
  ['four-slash', 'Four Hunters · Slash', 'group', '#f4f1eb', 'Gon Freecss, Killua Zoldyck, Kurapika Kurta, Leorio Paradinight, black, white, gray, monochrome, grayscale, manga, diagonal, slash, panels, quartet'],
  ["plain-gon-killua", "Gon & Killua · Plain", "plain", "#355f95", "Gon Freecss, Killua Zoldyck, friendship, duo, smiling, seated, blue, white hair, black spiky hair, anime faithful, monochrome, colored eyes, plain background, minimalist", "2026-10-19T15:35:50Z", "#ffffff"],
  ["plain-chrollo", "Chrollo Lucilfer · Plain", "plain", "#63577c", "Phantom Troupe, Genei Ryodan, leader, Skill Hunter, book, forehead cross, purple, anime faithful, monochrome, colored eyes, plain background, minimalist, slicked back hair", "2026-10-19T15:35:50Z", "#ffffff"],
  ["plain-hisoka", "Hisoka Morow · Plain", "plain", "#876880", "Phantom Troupe, magician, Bungee Gum, playing card, star, teardrop, rose, pink, amber eyes, anime faithful, monochrome, colored eyes, plain background, minimalist", "2026-10-19T15:35:50Z", "#ffffff"],
  ["plain-machi", "Machi Komacine · Plain", "plain", "#906b79", "Phantom Troupe, Nen threads, ponytail, pink, blue eyes, anime faithful, monochrome, colored eyes, plain background, minimalist", "2026-10-19T15:35:50Z", "#ffffff"],
  ["plain-nobunaga", "Nobunaga Hazama · Plain", "plain", "#674d65", "Phantom Troupe, swordsman, katana, kimono, ponytail, plum, anime faithful, monochrome, colored eyes, plain background, minimalist", "2026-10-19T15:35:50Z", "#ffffff"],
  ["plain-feitan", "Feitan Portor · Plain", "plain", "#435876", "Phantom Troupe, skull collar, black hair, gold eyes, navy, slate blue, anime faithful, monochrome, colored eyes, plain background, minimalist, V shaped scarf, fringed scarf", "2026-10-19T15:35:50Z", "#ffffff"],
  ["plain-phinks", "Phinks Magcub · Plain", "plain", "#5d624d", "Phantom Troupe, tracksuit, slicked back hair, olive, green, anime faithful, monochrome, colored eyes, plain background, minimalist, white shoulder yoke, tracksuit", "2026-10-19T15:35:50Z", "#ffffff"],
  ["plain-franklin", "Franklin Bordeau · Plain", "plain", "#5d6667", "Phantom Troupe, stitches, earrings, Double Machine Gun, gray, teal, anime faithful, monochrome, colored eyes, plain background, minimalist, overalls, cheek scars, stitched mouth", "2026-10-19T15:35:50Z", "#ffffff"],
  ["plain-shalnark", "Shalnark · Plain", "plain", "#99ba9b", "Phantom Troupe, Black Voice, cellphone, antenna, green eyes, sage, anime faithful, monochrome, colored eyes, plain background, minimalist", "2026-10-19T15:35:50Z", "#090d15"],
  ["plain-shizuku", "Shizuku Murasaki · Plain", "plain", "#aaa6ca", "Phantom Troupe, glasses, bob, turtleneck, purple eyes, lavender, anime faithful, monochrome, colored eyes, plain background, minimalist, spiky nape, thick glasses", "2026-10-19T15:35:50Z", "#090d15"],
  ["plain-pakunoda", "Pakunoda · Plain", "plain", "#b3a69f", "Phantom Troupe, Memory Bomb, suit, blonde, blue eyes, taupe, anime faithful, monochrome, colored eyes, plain background, minimalist, chin length bob, center part", "2026-10-19T15:35:50Z", "#090d15"],
  ["plain-bonolenov", "Bonolenov Ndongo · Plain", "plain", "#b7a389", "Phantom Troupe, bandages, boxing gloves, Battle Cantabile, sand, beige, anime faithful, monochrome, colored eyes, plain background, minimalist, lean, red boxing gloves, visible eyes", "2026-10-19T15:35:50Z", "#090d15"],
  ["plain-uvogin", "Uvogin · Plain", "plain", "#8f6b5c", "Phantom Troupe, Big Bang Impact, wild hair, muscular, enhancer, anime faithful, monochrome, colored eyes, plain background, minimalist, white tank top", "2026-10-19T15:35:50Z", "#ffffff"],
  ["plain-kortopi", "Kortopi Tonofmeil · Plain", "plain", "#849089", "Phantom Troupe, Gallery Fake, long hair, one eye, anime faithful, monochrome, colored eyes, plain background, minimalist, shadow face, single eye", "2026-10-19T15:35:50Z", "#090d15"],
  ["plain-illumi", "Illumi Zoldyck · Plain", "plain", "#4e7b7b", "Phantom Troupe, assassin, needle, long black hair, Zoldyck family, anime faithful, monochrome, colored eyes, plain background, minimalist, emerald buttons, teal buttons", "2026-10-19T15:35:50Z", "#ffffff"],
  ["plain-ging", "Ging Freecss · Plain", "plain", "#878b68", "Gin Freecs, Gon father, hunter, cap, stubble, Double Star Hunter, anime faithful, monochrome, colored eyes, plain background, minimalist", "2026-10-19T15:35:50Z", "#090d15"],
];

export const hunterTemplates = designs.map(([suffix, name, family, background, keywords, addedAt, foreground]) => {
  const id = `hxh-${suffix}`;
  const ink = foreground || (family === 'chibi' || family === 'group' ? '#25252d' : '#fff8ed');
  return {
    id, name, family, collection: 'hunter-x-hunter', mobileOnly: true, createdAt: addedAt || createdAt,
    description: `Hunter × Hunter ${family === 'group' ? 'group artwork' : `${family} portrait`} for mobile.`,
    keywords: `Hunter x Hunter, Hunter × Hunter, HxH, anime, ${family}, ${keywords}`,
    background, ink, muted: ink, line: `${ink}55`,
    surface: family === 'chibi' || family === 'group' ? '#fffdf5ed' : '#181925ed',
    containerStyle: 'solid', containerShape: 'rounded', containerFill: true,
    schedulePosition: 'center', particleStyle: 'none', showScheduleTitle: true,
    artworkFooter: false,
    ...(['plain', 'manga'].includes(family) ? {
      containerStyle: 'glass', containerShape: 'pill', fontScale: 0.9,
      surface: ({ 'gon-manga': '#3e221a', 'leorio-manga': '#49351f', 'hisoka-plain': '#7a1648' })[suffix] || background,
      containerOpacity: family === 'manga' ? 80 : 85,
      verticalPosition: family === 'manga' ? -20 : -30, showTitle: family === 'manga',
    } : {}),
    ...(family === 'chibi' ? {
      containerStyle: 'glass', containerShape: 'pill', fontScale: 0.9, containerOpacity: 85,
      surface: ({ 'gon-chibi': '#374c32', 'killua-chibi': '#25354b', 'kurapika-chibi': '#482c32', 'leorio-chibi': '#183b4b' })[suffix],
      ink: '#fff8ed', muted: '#fff8ed', line: '#fff8ed55',
      topMargin: 20, verticalPosition: 0, showTitle: false,
    } : {}),
    ...(id === 'hxh-gon-chibi' ? { headingInk: '#fff8ed' } : {}),
    ...(suffix.startsWith('plain-') ? {
      verticalPosition: ({ 'plain-pakunoda': -100, 'plain-machi': -90, 'plain-ging': -90,
        'plain-uvogin': -80, 'plain-illumi': -80, 'plain-nobunaga': -75, 'plain-hisoka': -75 })[suffix] ?? -70,
    } : {}),
    image: `/wallpapers/scenic/${id}/mobile.png`,
    deviceImages: { mobile: `/wallpapers/scenic/${id}/mobile.png` },
  };
});
