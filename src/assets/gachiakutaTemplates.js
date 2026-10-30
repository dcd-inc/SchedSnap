// Ten generated designs explicitly approved by the user.
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
  ]
];

export const gachiakutaTemplates = designs.map(([slug, name, background, ink, keywords]) => ({
  id: `gachiakuta-${slug}`, name,
  description: `Textured manga artwork for ${name}, with open space for a schedule.`,
  collection: 'gachiakuta', family: 'reference-minimal', mobileOnly: true,
  keywords: `Gachiakuta, manga, anime, mobile, wallpaper, ${name}, ${keywords}`,
  background, ink, muted: ink, surface: background, line: `${ink}44`,
  containerStyle: 'solid', containerShape: 'rounded', containerRadius: 10,
  containerOpacity: 92, containerFill: true, containerBorder: false,
  particleStyle: 'none', artworkFooter: false, showScheduleTitle: true,
  fontFamily: 'DM Sans Variable',
  image: `/wallpapers/scenic/gachiakuta-${slug}/mobile.png`,
  deviceImages: { mobile: `/wallpapers/scenic/gachiakuta-${slug}/mobile.png` },
}));
