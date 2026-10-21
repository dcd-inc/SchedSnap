import { cloudinaryAssetUrl } from './cloudinaryAssets.js';

const images = new Map();
const fonts = new Map();
let fontStyles;

function mascotBounds(image) {
  const canvas = document.createElement('canvas');
  canvas.width = image.width; canvas.height = image.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return undefined;
  ctx.drawImage(image, 0, 0);
  const pixels = ctx.getImageData(0, 0, image.width, image.height).data;
  let left = image.width, top = image.height, right = -1, bottom = -1;
  for (let y = 0; y < image.height; y++) for (let x = 0; x < image.width; x++) {
    if (pixels[(y * image.width + x) * 4 + 3] > 32) {
      left = Math.min(left, x); top = Math.min(top, y);
      right = Math.max(right, x); bottom = Math.max(bottom, y);
    }
  }
  canvas.width = 0; canvas.height = 0;
  return right >= left ? { x: left, y: top, width: right - left + 1, height: bottom - top + 1 } : undefined;
}

export async function prepareWallpaperAssets(template, resolution) {
  const sourcePath = template.deviceImages?.[resolution?.id || 'mobile'] || template.image;
  // Pixel previews stay lossless and use nearest-neighbor Canvas rendering.
  // Keep unapproved Hunter revisions local during development.
  const imagePath = import.meta.env?.DEV && template.collection === 'hunter-x-hunter'
    ? sourcePath : cloudinaryAssetUrl(sourcePath, resolution, { lossless: !!template.pixelArt });
  // Only the selected font must be ready before measuring canvas text.
  const family = template.fontFamily || 'DM Sans Variable';
  if (family !== 'DM Sans Variable' && typeof window !== 'undefined') {
    fontStyles ??= import('../wallpaper-fonts.css').catch(error => { fontStyles = undefined; throw error; });
    await fontStyles;
  }
  if (!fonts.has(family)) fonts.set(family, Promise.all([400, 500, 600, 650, 700, 750].map(weight =>
    document.fonts.load(`${weight} 100px "${family}"`),
  )).catch(error => { fonts.delete(family); throw error; }));
  await fonts.get(family);
  if (!imagePath) return undefined;
  if (!images.has(imagePath)) images.set(imagePath, new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      try {
        if (template.layout === 'mascot') image.mascotBounds = mascotBounds(image);
        resolve(image);
      } catch { images.delete(imagePath); reject(new Error('The mascot artwork could not load. Retry or choose another template.')); }
    };
    image.onerror = () => { images.delete(imagePath); reject(new Error('The template artwork could not load. Retry or choose another template.')); };
    image.src = imagePath;
  }));
  return images.get(imagePath);
}
