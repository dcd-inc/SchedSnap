// Five designs explicitly selected by the user; later previews are excluded.
const designs = [
  ['golden-visor', 'Golden Visor', 'A brushed gold Bumblebee helmet reflects a blue Cybertron skyline.', '#101b50', '#edf6ff', '#172851', 'Bumblebee, gold, yellow, blue, violet, visor, reflection, Cybertron, metal, cinematic, dark'],
  ['stellar-frontline', 'Stellar Frontline', 'Optimus Prime and fellow robots beneath a painted cobalt starfield.', '#163d85', '#f0f6ff', '#1c3463', 'Optimus Prime, Bumblebee, Megatron, Shockwave, Starscream, ensemble, cobalt, blue, purple, stars, painted'],
  ['scarlet-command', 'Scarlet Command', 'Optimus Prime and Megatron with graphic red and cream rays on navy.', '#101c3e', '#fff5d5', '#172647', 'Optimus Prime, Megatron, red, scarlet, navy, cream, vehicles, truck, screenprint, halftone, graphic'],
  ['sunlit-vanguard', 'Sunlit Vanguard', 'Optimus Prime and Bumblebee beneath a pale blue Cybertron sky.', '#a8c7eb', '#23364f', '#edf5ff', 'Optimus Prime, Bumblebee, powder blue, cyan, red, gold, sky, skyline, Cybertron, painted, light'],
  ['steel-and-scarlet', 'Steel and Scarlet', 'An angular Megatron portrait in cream and navy against scarlet paper.', '#e6233d', '#fff4db', '#622539', 'Megatron, silver, steel, red, scarlet, cream, navy, portrait, screenprint, halftone, paper, graphic'],
];

export const transformersTemplates = designs.map(([slug, name, description, background, ink, surface, keywords]) => ({
  id: `transformers-${slug}`, name, description,
  collection: 'transformers', family: 'reference-minimal', mobileOnly: true,
  keywords: `Transformers, robots, mobile, wallpaper, ${name}, ${keywords}`,
  background, ink, muted: ink, surface, line: `${ink}44`,
  containerStyle: 'solid', containerShape: 'rounded', containerRadius: 10,
  containerOpacity: 92, containerFill: true, containerBorder: false,
  particleStyle: 'none', artworkFooter: false, showScheduleTitle: true,
  fontFamily: 'DM Sans Variable',
  image: `/wallpapers/scenic/transformers-${slug}/mobile.png`,
  deviceImages: { mobile: `/wallpapers/scenic/transformers-${slug}/mobile.png` },
}));
