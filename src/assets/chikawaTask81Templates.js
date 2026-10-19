// Task 81's 12 Chiikawa wallpapers, kept under unique IDs for the four supplied references.
const devices = ['mobile', 'tablet', 'laptop'];
const createdAt = '2026-10-14T03:08:39.000Z';

const designs = [
  ['chikawa-task81-ref1-bluebell-watercolor', 'Bluebell Watercolor', 'Hachiware peeks from a dense blue and white hydrangea garden.', 'chikawa-reference-1', '#eaf2fb'],
  ['chikawa-task81-ref1-cobalt-screenprint', 'Cobalt Bloom', 'A crisp blue screenprint of hydrangeas with Hachiware nestled low.', 'chikawa-reference-1', '#e6f0fb'],
  ['chikawa-task81-ref1-petal-collage', 'Petal Paper Collage', 'Layered blue paper blossoms frame a small Hachiware friend.', 'chikawa-reference-1', '#f4f5f0'],
  ['chikawa-task81-ref2-sakura-watercolor', 'Sakura Swing', 'The Chiikawa trio ride swings beneath pink cherry blossoms.', 'chikawa-reference-2', '#fff2f5'],
  ['chikawa-task81-ref2-sakura-cel', 'Sakura Swing Cel', 'A clean cel-art take on the trio swinging under cherry blossoms.', 'chikawa-reference-2', '#f8e9f1'],
  ['chikawa-task81-ref2-sakura-paper', 'Sakura Swing Paper', 'A textured paper-cut version of the blossom swing scene.', 'chikawa-reference-2', '#f4eef6'],
  ['chikawa-task81-ref3-strawberry-picnic', 'Strawberry Picnic', 'Chiikawa shares strawberries at a red gingham scrapbook picnic.', 'chikawa-reference-3', '#fff2df'],
  ['chikawa-task81-ref3-strawberry-market', 'Strawberry Market', 'A handmade paper scrapbook of Chiikawa and a strawberry stall.', 'chikawa-reference-3', '#fff3e4'],
  ['chikawa-task81-ref3-paper-boat', 'Strawberry Paper Boat', 'Chiikawa sails a tiny paper boat through a red gingham scrapbook.', 'chikawa-reference-3', '#fff2df'],
  ['chikawa-task81-ref4-gingham-picnic', 'Gingham Picnic', 'Chiikawa and Hachiware share a tiny picnic on blue gingham.', 'chikawa-reference-4', '#fffdf8'],
  ['chikawa-task81-ref4-gingham-stickerbook', 'Gingham Stickerbook', 'Sticker-style Chiikawa friends decorate a dotted ivory field.', 'chikawa-reference-4', '#fffdf8'],
  ['chikawa-task81-ref4-gingham-patchwork', 'Gingham Patchwork', 'Embroidered Chiikawa and Hachiware patches on dotted cloth.', 'chikawa-reference-4', '#f8f6ef'],
];

export const chikawaTask81Templates = designs.map(([id, name, description, family, background]) => {
  const deviceImages = Object.fromEntries(devices.map(device => [device, `/wallpapers/scenic/${id}/${device}.png`]));
  return {
    id, name, description, family, background, collection: 'chikawa', createdAt,
    ink: '#493b3a', muted: '#695452', surface: '#ffffff', line: 'rgba(73, 59, 58, 0.20)',
    containerStyle: 'solid', containerFill: true, containerShape: 'rounded', particleStyle: 'none', verticalPosition: -35,
    image: deviceImages.mobile, deviceImages,
  };
});
