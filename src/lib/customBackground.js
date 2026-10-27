export const customBackgroundId = 'custom-background';
const storageKey = 'schedsnap-custom-background-v1';
const draftKey = 'schedsnap-background-draft-v1';

export function createCustomBackground(image, device = 'mobile') {
  if (!['mobile', 'tablet', 'laptop'].includes(device)) throw new Error('Choose a supported wallpaper device.');
  if (typeof image !== 'string' || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(image) || image.length > 4.2 * 1024 * 1024) {
    throw new Error('Choose a JPG, PNG, or WebP image smaller than 10 MB.');
  }
  return {
    id: customBackgroundId, name: 'Your own image', customBackground: true, device,
    image, background: '#ffffff', ink: '#0f172a', muted: '#0f172a',
    line: '#cbd5e1', surface: 'rgba(255,255,255,0.96)', containerStyle: 'glass',
  };
}

export function readCustomBackground(storage, key = storageKey) {
  try {
    const saved = storage.getItem(key);
    if (!saved) return null;
    if (saved.startsWith('data:')) return createCustomBackground(saved);
    const { image, device } = JSON.parse(saved);
    return createCustomBackground(image, device);
  } catch { return null; }
}

export function saveCustomBackground(storage, template, key = storageKey) {
  try { storage.setItem(key, JSON.stringify({ image: template.image, device: template.device })); return true; }
  catch { return false; }
}

export const readBackgroundDraft = storage => readCustomBackground(storage, draftKey);
export function readSavedBackgroundForDevice(storage, device, fallback = null) {
  return [readBackgroundDraft(storage), fallback].find(item => item?.device === device) || null;
}
export const saveBackgroundDraft = (storage, template) => saveCustomBackground(storage, template, draftKey);
export function clearBackgroundDraft(storage) {
  try { storage.removeItem(draftKey); } catch { /* Storage may be disabled. */ }
}
export function clearCustomBackground(storage) {
  try { storage.removeItem(storageKey); } catch { /* Storage may be disabled. */ }
}
