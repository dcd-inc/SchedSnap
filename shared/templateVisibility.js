export const templateDevices = ['mobile', 'tablet', 'laptop'];
export const deviceLabels = { mobile: 'Mobile', tablet: 'Tablet', laptop: 'Laptop' };

const laptopOnlyDesigns = new Set([
  'naruto-sasuke-quiet-ink', 'naruto-kakashi-obito', 'naruto-resolute-ink',
  'naruto-sasuke-shadow', 'naruto-itachi-stillness', 'naruto-fourth-hokage',
]);

export function availableTemplateDevices(template) {
  if (laptopOnlyDesigns.has(template.id)) return ['laptop'];
  if (template.mobileOnly) return ['mobile'];
  // Patterns and character cutouts are rendered for every device from one source.
  if (template.deviceImages && template.layout !== 'mascot' && !template.pattern) {
    return templateDevices.filter(device => Boolean(template.deviceImages[device]));
  }
  return templateDevices;
}

export function visibleTemplateDevices(template) {
  if (template.status && template.status !== 'published') return [];
  return availableTemplateDevices(template).filter(device => !template.hiddenDevices?.includes(device));
}

export function templateDeviceStatus(template, device) {
  if (!availableTemplateDevices(template).includes(device)) return 'unavailable';
  if (template.status === 'draft') return 'draft';
  return visibleTemplateDevices(template).includes(device) ? 'published' : 'hidden';
}

export function matchesTemplateDeviceStatus(template, device, status) {
  const deviceStatus = templateDeviceStatus(template, device);
  return deviceStatus !== 'unavailable' && (status === 'all' || deviceStatus === status);
}
