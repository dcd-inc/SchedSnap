import { withTemplateKeywords } from '../../shared/templateKeywords.js';

const designs = [
  ['teal-peace', 'Capybara Peace', 'A happy capybara flashes a peace sign on textured dark teal.', '#063d4b', '#fff8ed', '#154b57', 'teal, dark teal, tongue out, happy, peace sign'],
  ['navy-tilt', 'Capybara Head Tilt', 'A wide-eyed capybara tilts its head against navy blue paper.', '#233c70', '#fff8ed', '#263e64', 'navy, dark blue, head tilt, wide eyes, funny'],
  ['blue-peek', 'Capybara Peek', 'A curious capybara peeks from the lower right on dusty blue.', '#477ab0', '#fff8ed', '#244b70', 'blue, dusty blue, peeking, corner, curious'],
  ['daisy-yellow', 'Capybara Daisy Day', 'A goofy capybara among tiny white daisies on butter yellow.', '#fff1ab', '#493522', '#fff8d9', 'yellow, butter yellow, white, daisies, flowers, floral'],
  ['strawberry-hood', 'Capybara Strawberry Hood', 'A deadpan capybara in a red strawberry hood on cornflower blue.', '#347dd0', '#fff8ed', '#204d7d', 'blue, red, green, strawberry, fruit, hood, costume'],
];

const newDesigns = [
  ["skeptical", "Capybara Skeptical", "A skeptical capybara rests its cheek on one paw against textured blue.", "#347dd0", "#fff8ed", "#204d7d", "blue, cornflower blue, skeptical, unimpressed, bored, cheek, half lidded eyes", "2026-10-19T14:12:59Z"],
  ["shrug", "Capybara Shrug", "A wide-eyed capybara shrugs with both paws on textured blue.", "#347dd0", "#fff8ed", "#204d7d", "blue, cornflower blue, shrug, confused, puzzled, hands up, wide eyes", "2026-10-19T14:12:59Z"],
  ["smug", "Capybara Smug", "A smug capybara smiles with its paws on its hips.", "#347dd0", "#fff8ed", "#204d7d", "blue, cornflower blue, smug, confident, sly smile, hands on hips", "2026-10-19T14:12:59Z"],
  ["starry-flowers", "Capybara Starry Flowers", "A smiling capybara with star eyes holds daisies beneath a pink heart.", "#347dd0", "#fff8ed", "#204d7d", "blue, cornflower blue, star eyes, stars, daisies, flowers, pink heart, yellow", "2026-10-19T14:12:59Z"],
  ["business-suit", "Capybara Business Suit", "A puzzled capybara shrugs in a black business suit and tie.", "#347dd0", "#fff8ed", "#204d7d", "blue, cornflower blue, business suit, black suit, white shirt, tie, office, shrug", "2026-10-19T14:12:59Z"],
  ["paper-chaos", "Capybara Paper Chaos", "A startled capybara raises its paws amid flying sheets of paper.", "#347dd0", "#fff8ed", "#204d7d", "blue, cornflower blue, paper chaos, flying papers, documents, study, school, stressed", "2026-10-19T14:12:59Z"],
  ["big-laugh", "Capybara Big Laugh", "A capybara laughs with closed eyes and its paws on its hips.", "#347dd0", "#fff8ed", "#204d7d", "blue, cornflower blue, laugh, laughing, happy, eyes closed, open mouth", "2026-10-19T14:12:59Z"],
  ["teary-eyes", "Capybara Teary Eyes", "A worried capybara sheds tiny tears with its paws near its chest.", "#347dd0", "#fff8ed", "#204d7d", "blue, cornflower blue, tears, crying, sad, worried, teary eyes", "2026-10-19T14:12:59Z"],
  ["shy-giggle", "Capybara Shy Giggle", "A bashful capybara hides a giggle behind its paws.", "#347dd0", "#fff8ed", "#204d7d", "blue, cornflower blue, shy, giggle, bashful, paws over mouth", "2026-10-19T14:12:59Z"],
  ["lily-bouquet", "Capybara Lily Bouquet", "A blushing capybara holds lily-of-the-valley flowers and flashes a peace sign.", "#347dd0", "#fff8ed", "#204d7d", "blue, cornflower blue, lily of the valley, bouquet, flowers, green leaves, peace sign, blush", "2026-10-19T14:12:59Z"],
  ["heart-eyes", "Capybara Heart Eyes", "A lovestruck capybara has pink heart eyes, rosy cheeks and puckered lips.", "#347dd0", "#fff8ed", "#204d7d", "blue, cornflower blue, heart eyes, pink hearts, love, kiss, blush", "2026-10-19T14:12:59Z"],
  ["avocado-hood", "Capybara Avocado Hood", "A wide-eyed capybara wears a green avocado hood.", "#347dd0", "#fff8ed", "#204d7d", "blue, cornflower blue, avocado, avocado hood, fruit costume, green, yellow", "2026-10-19T14:12:59Z"],
  ["watermelon-hood", "Capybara Watermelon Hood", "A capybara wears a red watermelon hood edged in striped green rind.", "#347dd0", "#fff8ed", "#204d7d", "blue, cornflower blue, watermelon, watermelon hood, red, green, black seeds, fruit costume", "2026-10-19T14:12:59Z"],
  ["starfruit-hood", "Capybara Starfruit Hood", "A capybara wears a yellow starfruit hood with a green edge.", "#347dd0", "#fff8ed", "#204d7d", "blue, cornflower blue, starfruit, yellow star, green, fruit hood, carambola", "2026-10-19T14:12:59Z"],
  ["cherry-hood", "Capybara Cherry Hood", "A capybara wears a cherry-red hood topped with a green stem and leaf.", "#347dd0", "#fff8ed", "#204d7d", "blue, cornflower blue, cherry, red, green stem, leaf, fruit hood", "2026-10-19T14:12:59Z"],
  ["lion-dance", "Capybara Lion Dance", "A capybara wears a festive lion-dance hat and holds a golden carp.", "#347dd0", "#fff8ed", "#204d7d", "blue, cornflower blue, lion dance, tiger hat, golden carp, goldfish, lunar new year, red, gold", "2026-10-19T14:12:59Z"],
  ["watermelon-snack", "Capybara Watermelon Snack", "A delighted capybara holds a watermelon slice with its tongue out.", "#347dd0", "#fff8ed", "#204d7d", "blue, cornflower blue, watermelon snack, watermelon slice, eating, fruit, summer, red, green", "2026-10-19T14:12:59Z"],
  ["melon-hood", "Capybara Melon Hood", "A capybara wears a pale green melon hood with a netted rind pattern.", "#347dd0", "#fff8ed", "#204d7d", "blue, cornflower blue, melon, green, netted rind, cantaloupe, fruit hood", "2026-10-19T14:12:59Z"],
  ["pink-pear-hood", "Capybara Pink Pear Hood", "A capybara wears a pink rose-apple fruit hood with a green stem.", "#347dd0", "#fff8ed", "#204d7d", "blue, cornflower blue, pink pear, rose apple, wax apple, pink fruit hood, green stem", "2026-10-19T14:12:59Z"],
  ["moonlit-roses", "Capybara Moonlit Roses", "A capybara in a cream scarf holds red roses beneath a crescent moon.", "#347dd0", "#fff8ed", "#204d7d", "blue, cornflower blue, moon, crescent, star, roses, red flowers, cream scarf, romantic", "2026-10-19T14:12:59Z"],
  ["bubble-tea-love", "Capybara Bubble Tea Love", "A winking capybara sips pink bubble tea beneath little hearts.", "#347dd0", "#fff8ed", "#204d7d", "blue, cornflower blue, bubble tea, boba, pink drink, straw, wink, hearts", "2026-10-19T14:12:59Z"],
  ["delivery-hoodie", "Capybara Delivery Hoodie", "A surprised capybara wears a green Grab delivery jacket with reflective stripes.", "#347dd0", "#fff8ed", "#204d7d", "blue, cornflower blue, delivery, courier, green hoodie, jacket, Grab, Vietnam flag, surprised", "2026-10-19T14:12:59Z"],
];

export const capybaraTemplates = [...designs, ...newDesigns].map(([suffix, name, description, background, ink, surface, keywords, createdAt]) => {
  const id = `capybara-${suffix}`;
  const image = `/wallpapers/scenic/${id}/mobile.png`;
  return withTemplateKeywords({
    id, name, description, collection: 'capybara', family: 'capybara-doodles', mobileOnly: true,
    createdAt: createdAt || '2026-10-18T09:36:54Z',
    keywords: `capybara, capy, animal, cute, kawaii, funny, cartoon, hand drawn, doodle, gouache, textured paper, tan, brown, mobile wallpaper, ${keywords}`,
    image, deviceImages: { mobile: image }, background, ink, muted: ink, surface, line: `${ink}55`,
    containerStyle: 'solid', containerShape: 'rounded', containerFill: true,
    schedulePosition: 'center', verticalPosition: -35, particleStyle: 'none',
  });
});
