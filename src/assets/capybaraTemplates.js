import { withTemplateKeywords } from '../../shared/templateKeywords.js';

const designs = [
  ['teal-peace', 'Capybara Peace', 'A happy capybara flashes a peace sign on textured dark teal.', '#063d4b', '#fff8ed', '#154b57', 'teal, dark teal, tongue out, happy, peace sign'],
  ['navy-tilt', 'Capybara Head Tilt', 'A wide-eyed capybara tilts its head against navy blue paper.', '#233c70', '#fff8ed', '#263e64', 'navy, dark blue, head tilt, wide eyes, funny'],
  ['blue-peek', 'Capybara Peek', 'A curious capybara peeks from the lower right on dusty blue.', '#477ab0', '#fff8ed', '#244b70', 'blue, dusty blue, peeking, corner, curious'],
  ['daisy-yellow', 'Capybara Daisy Day', 'A goofy capybara among tiny white daisies on butter yellow.', '#fff1ab', '#493522', '#fff8d9', 'yellow, butter yellow, white, daisies, flowers, floral'],
  ['strawberry-hood', 'Capybara Strawberry Hood', 'A deadpan capybara in a red strawberry hood on cornflower blue.', '#347dd0', '#fff8ed', '#204d7d', 'blue, red, green, strawberry, fruit, hood, costume'],
];

export const capybaraTemplates = designs.map(([suffix, name, description, background, ink, surface, keywords]) => {
  const id = `capybara-${suffix}`;
  const image = `/wallpapers/scenic/${id}/mobile.png`;
  return withTemplateKeywords({
    id, name, description, collection: 'capybara', family: 'capybara-doodles', mobileOnly: true,
    createdAt: '2026-10-18T09:36:54Z',
    keywords: `capybara, capy, animal, cute, kawaii, funny, cartoon, hand drawn, doodle, gouache, textured paper, tan, brown, mobile wallpaper, ${keywords}`,
    image, deviceImages: { mobile: image }, background, ink, muted: ink, surface, line: `${ink}55`,
    containerStyle: 'solid', containerShape: 'rounded', containerFill: true,
    schedulePosition: 'center', verticalPosition: -35, particleStyle: 'none',
  });
});
