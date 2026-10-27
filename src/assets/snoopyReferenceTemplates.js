// Reference-led black pen artwork; Canvas supplies the editable timetable.
const designs = [
  ['snoopy-lazy-afternoon', 'Lazy Afternoon', 'Snoopy rests on his back beside a little handkerchief, in loose black pen on white.', 'Snoopy, Peanuts, resting, nap, handkerchief'],
  ['snoopy-daisy-pause', 'Daisy Pause', 'A quiet Snoopy and a single daisy, with delicate grass and sketchy ink contours.', 'Snoopy, Peanuts, daisy, flower, grass'],
  ['snoopy-cassette-days', 'Cassette Days', 'Snoopy listens through headphones beside Woodstock and a tiny cassette player.', 'Snoopy, Peanuts, Woodstock, headphones, cassette, music'],
];

export const snoopyReferenceTemplates = designs.map(([id, name, description, keywords]) => ({
  id, name, description, keywords, collection: 'snoopy', family: 'reference-minimal',
  createdAt: '2026-10-23T23:14:46.000Z',
  background: '#ffffff', ink: '#252b32', muted: '#49515b', line: '#a8b3c1', surface: '#ffffff',
  particleStyle: 'none', schedulePosition: 'left',
  containerStyle: 'glass', containerShape: 'rounded', containerFill: true,
  image: `/wallpapers/scenic/${id}/mobile.png`,
  deviceImages: Object.fromEntries(['mobile', 'tablet', 'laptop'].map(device => [device, `/wallpapers/scenic/${id}/${device}.png`])),
}));
