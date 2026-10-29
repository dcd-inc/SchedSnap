import { visibleTemplateDevices } from '../../shared/templateVisibility.js';

export function supportsTemplateDevice(template, device) {
  return visibleTemplateDevices(template).includes(device);
}
