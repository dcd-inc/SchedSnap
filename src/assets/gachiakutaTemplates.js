// Generated designs explicitly approved by the user, including the November 2 reference set.
const designs = [
  [
    "cleaners-in-ochre",
    "Cleaners in Ochre",
    "#d8a70c",
    "#29251f",
    "Rudo, Enjin, Zanka, Riyo, Cleaners, ensemble, ochre, mustard, yellow, taupe, white graffiti, print grain"
  ],
  [
    "rudo-gilded-ink",
    "Rudo Gilded Ink",
    "#171310",
    "#fff0d6",
    "Rudo, red eyes, white hair, black gloves, ivory coat, orange lining, chains, antique gold, black paper, hatching"
  ],
  [
    "zanka-blue-thread",
    "Zanka Blue Thread",
    "#cbc9c4",
    "#203c48",
    "Zanka, blue tassels, staff, gray coat, teal, petrol blue, pale gray, contour doodles, crosshatching"
  ],
  [
    "enjin-crimson-collar",
    "Enjin Crimson Collar",
    "#171111",
    "#f7e6d0",
    "Enjin, blond hair, umbrella, crimson shirt, gray utility coat, black, red, rough ink"
  ],
  [
    "rudo-chainflare",
    "Rudo Chainflare",
    "#610c0c",
    "#fff1df",
    "Rudo, crouching, chains, scrap, red eyes, oxblood, charcoal, scarlet, dark, action"
  ],
  [
    "cleaners-golden-mural",
    "Cleaners Golden Mural",
    "#c69c4c",
    "#332819",
    "Rudo, Enjin, Zanka, Riyo, Cleaners, mural, amber, golden plaster, concrete, industrial masks, warm"
  ],
  [
    "zanka-cobalt-cut",
    "Zanka Cobalt Cut",
    "#111315",
    "#eaf0ef",
    "Zanka, profile, staff, blue earrings, cobalt, black, gray, angular graffiti, screenprint"
  ],
  [
    "rudo-scarlet-cut",
    "Rudo Scarlet Cut",
    "#c4c2bb",
    "#242323",
    "Rudo, profile, glove, white hair, yellow armband, pale gray, scarlet, black brushstrokes, grain"
  ],
  [
    "enjin-yellow-signal",
    "Enjin Yellow Signal",
    "#e4b51a",
    "#27251e",
    "Enjin, profile, blond hair, umbrella, wrist wrap, yellow, mustard, black graffiti, stippled print"
  ],
  [
    "red-eye-salvage",
    "Red Eye Salvage",
    "#eeeae1",
    "#252525",
    "Rudo, full body, red eye, salvage, debris, black and white, monochrome, crimson, ink shards, manga"
  ],
  ['violet-armored-coat', 'Violet Armored Coat', '#181516', '#f3e9dc', 'violet, purple, black, armored coat, swept hair, stitched leather, ribbons, dark, ink, crosshatching'],
  ['ember-ribbon', 'Ember Ribbon', '#ded2c2', '#302820', 'orange, ember, black hair, orange eyes, ribbons, boots, cream paper, warm, textured manga'],
  ['violet-dreadlocks', 'Violet Dreadlocks', '#181219', '#f1e7d7', 'purple, violet, dreadlocks, gold hair bands, hood, grin, rings, cream sleeves, dark, hatching'],
  ['ivory-blue-wanderer', 'Ivory Blue Wanderer', '#cccac5', '#253346', 'ivory, blue, cobalt, gray, pale hair, long coat, tie, wrapped forearms, ink wash'],
  ['crimson-respirator', 'Crimson Respirator', '#300c10', '#fff0df', 'crimson, red, black, respirator, mask, silver hair, red eyes, hoses, canister, worn tool, industrial'],
  ['antique-gold-gauntlet', 'Antique Gold Gauntlet', '#18130e', '#f6e9ce', 'gold, olive, black, ivory hat, elderly man, beard, armored glove, gauntlet, purple lining'],
  ['teal-fur-collar', 'Teal Fur Collar', '#21434b', '#fff0dc', 'teal, petrol blue, gray green hair, cream coat, fur collar, violet quilted sleeves, profile, hardware clips'],
  ['graffiti-red-eye', 'Graffiti Red Eye', '#d9a04d', '#32271e', 'Rudo, red eye, graphic eye patch, white hair, ochre, yellow, graffiti, collage, stickers, creatures, halftone'],
  ['crimson-motion', 'Crimson Motion', '#b92125', '#fff0d9', 'Rudo, crimson, red, cream, ochre, charcoal, silver hair, gloved hand, leap, action, motion, ink wash'],
  ['turquoise-beast', 'Turquoise Beast', '#171b1a', '#f5ead8', 'turquoise, teal, coral, red, ivory, masked fighter, amber eyes, white hair, spiked mantle, fur, claws, crouching']
];

export const gachiakutaTemplates = designs.map(([slug, name, background, ink, keywords]) => ({
  id: `gachiakuta-${slug}`, name,
  description: `Textured manga artwork for ${name}, with open space for a schedule.`,
  collection: 'gachiakuta', family: 'reference-minimal', mobileOnly: true,
  keywords: `Gachiakuta, manga, anime, mobile, wallpaper, ${name}, ${keywords}`,
  background, ink, muted: ink, surface: background, line: `${ink}44`,
  containerStyle: 'solid', containerShape: 'pill', containerRadius: 50,
  containerOpacity: 92, containerFill: true, containerBorder: false,
  particleStyle: 'none', artworkFooter: false, showTitle: true, showScheduleTitle: true,
  fontFamily: 'DM Sans Variable',
  image: `/wallpapers/scenic/gachiakuta-${slug}/mobile.png`,
  deviceImages: { mobile: `/wallpapers/scenic/gachiakuta-${slug}/mobile.png` },
}));
