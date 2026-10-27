const laptopOnlyDesigns = new Set([
  'naruto-sasuke-quiet-ink',
  'naruto-kakashi-obito',
  'naruto-resolute-ink',
  'naruto-sasuke-shadow',
  'naruto-itachi-stillness',
  'naruto-fourth-hokage',
]);

export function supportsTemplateDevice(template, device) {
  if (laptopOnlyDesigns.has(template.id)) return device === 'laptop';
  return !template.mobileOnly || device === 'mobile';
}
