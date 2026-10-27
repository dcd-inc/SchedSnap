// Both approved mobile sets: original compositions and reference-based edits.
const designs = [
  ['blush-hibiscus', 'Porsche · Blush Hibiscus', 'A pink sports car and delicate hibiscus on blush pink.', '#f8dfe5', '#482d38', '#fff3f5', 'Porsche, 911, pink, blush, hibiscus, flowers, floral, pastel', 'original'],
  ['oxblood-hibiscus', 'Porsche · Oxblood Hibiscus', 'A burgundy sports car with red hibiscus on deep oxblood.', '#500b20', '#fff1ed', '#35101c', 'Porsche, 911, burgundy, oxblood, red, hibiscus, flowers, floral', 'original'],
  ['crimson-gt3', 'Porsche · Crimson GT3', 'A dark cherry GT3-style rear quarter and wing on textured crimson.', '#8c101b', '#fff3ed', '#4c1019', 'Porsche, 911, GT3, cherry, crimson, red, rear wing, paper texture', 'original'],
  ['scarlet-hibiscus', 'Ferrari · Scarlet Hibiscus', 'A scarlet supercar with red hibiscus on warm ivory.', '#fff0d8', '#392b24', '#fff9ed', 'Ferrari, supercar, red, scarlet, ivory, cream, hibiscus, flowers, floral', 'original'],
  ['champagne-lily', 'Porsche · Champagne Lily', 'A champagne sports car and white lily on warm cream.', '#f8f0e3', '#433b30', '#fffaf1', 'Porsche, 911, champagne, beige, cream, white, lily, flowers, floral', 'original'],
  ['ice-blue-lily', 'Porsche · Ice Blue Lily', 'A pearl white sports car with blue wheels beneath a blue lily.', '#dcecff', '#233e62', '#f3f8ff', 'Porsche, 911, blue, white, powder blue, lily, flowers, floral, blue wheels', 'original'],
  ['carbon-shadow', 'McLaren · Carbon Shadow', 'A black supercar with silver rim lighting and carbon fiber detail.', '#111214', '#f6f4ef', '#24262b', 'McLaren, black, charcoal, silver, carbon fiber, supercar, dark, cinematic', 'original'],
  ['graphite-rain', 'Porsche · Graphite Rain', 'Rain droplets and silver reflections on a graphite sports car.', '#101113', '#f6f4ef', '#24262b', 'Porsche, 911, GT3 RS, graphite, black, silver, rain, droplets, dark', 'original'],
  ['pink-type', 'Porsche · Pink Lettering', 'The pink rear-quarter reference with oversized taupe Porsche lettering.', '#fbedef', '#50313b', '#fff6f7', 'Porsche, 911, pink, blush, taupe, typography, serif, cursive, rear wing', 'reference'],
  ['burgundy-type', 'Porsche · Burgundy Lettering', 'A burgundy widebody car below layered black and white Porsche type.', '#650519', '#fff6ef', '#39101e', 'Porsche, 911, burgundy, oxblood, red, typography, script, widebody, classic', 'reference'],
  ['crimson-type', 'Porsche · Crimson Lettering', 'A cherry GT3 rear quarter with black lettering on textured crimson.', '#94121a', '#fff3ed', '#4c1019', 'Porsche, 911, GT3, crimson, red, black, typography, cursive, rear wing', 'reference'],
  ['scarlet-ivory-type', 'Ferrari · Ivory Lettering', 'A red Ferrari reference with layered Porsche lettering and a satin bow.', '#fff0d6', '#392b24', '#fff9ed', 'Ferrari, Porsche lettering, supercar, scarlet, red, ivory, cream, typography, bow', 'reference'],
  ['champagne-type', 'Porsche · Champagne Lettering', 'A champagne rear quarter with taupe Porsche lettering on cream.', '#fbf5eb', '#433b30', '#fffaf1', 'Porsche, 911, champagne, beige, cream, taupe, typography, serif, rear wing', 'reference'],
  ['blue-type', 'Porsche · Blue Lettering', 'A white sports car with blue wheels and navy lettering on powder blue.', '#dcecff', '#233e62', '#f3f8ff', 'Porsche, 911, blue, white, navy, powder blue, typography, blue wheels', 'reference'],
  ['black-mclaren-type', 'McLaren · Carbon Lettering', 'The black McLaren reference with vertical type and textured carbon.', '#131514', '#f6f4ef', '#252827', 'McLaren, black, charcoal, gray, grey, carbon fiber, typography, monochrome, dark', 'reference'],
  ['black-porsche-type', 'Porsche · Silver Signature', 'A graphite Porsche rear quarter with silver crest and large gray script.', '#101010', '#f6f4ef', '#252525', 'Porsche, 911, GT3 RS, black, graphite, silver, gray, grey, crest, script, monochrome', 'reference'],
];

export const carTemplates = designs.map(([slug, name, description, background, ink, surface, keywords, family]) => {
  const id = `cars-${slug}`;
  const image = `/wallpapers/scenic/${id}/mobile.png`;
  return {
    id, name, description, collection: 'cars', family, mobileOnly: true,
    createdAt: '2026-10-27T10:54:28.177Z',
    keywords: `cars, car, automotive, sports car, mobile, phone wallpaper, ${keywords}`,
    background, ink, muted: ink, surface, line: `${ink}55`,
    containerStyle: 'glass', containerShape: 'pill', containerFill: true,
    containerBorder: false, containerOpacity: 88, particleStyle: 'none',
    schedulePosition: 'center', showTitle: true, showScheduleTitle: true,
    image, deviceImages: { mobile: image },
  };
});
