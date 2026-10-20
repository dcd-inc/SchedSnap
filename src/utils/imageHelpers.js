import { MAX_IMAGE_BYTES, MAX_SOURCE_BYTES, imageMimeTypes } from '../../shared/uploadLimits.js';

export async function prepareImage(file) {
  if (!imageMimeTypes.includes(file.type)) throw new Error('Choose a JPG, PNG, or WebP image.');
  if (file.size > MAX_SOURCE_BYTES) throw new Error('Choose an image smaller than 10 MB.');
  let bitmap;
  try { bitmap = await createImageBitmap(file); }
  catch { throw new Error('This image could not be opened. Export it as JPG or PNG and try again.'); }
  try {
    if (bitmap.width * bitmap.height > 40_000_000) throw new Error('This image is too large to process. Try a smaller copy.');
    const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    // Keep screenshot text lossless when it fits; re-encoding still strips file metadata.
    const formats = file.type === 'image/png' && file.size <= MAX_IMAGE_BYTES
      ? [['image/png'], ['image/jpeg', 0.92], ['image/jpeg', 0.82], ['image/jpeg', 0.68]]
      : [['image/jpeg', 0.92], ['image/jpeg', 0.82], ['image/jpeg', 0.68]];
    for (const [mimeType, quality] of formats) {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, mimeType, quality));
      if (!blob) throw new Error('This image could not be prepared. Try another image.');
      if (blob.size > MAX_IMAGE_BYTES) continue;
      const preview = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('This image could not be prepared. Try another image.'));
        reader.readAsDataURL(blob);
      });
      return { image: preview.split(',')[1], mimeType: blob.type, preview, name: file.name };
    }
    throw new Error('This image is still too large after compression. Try a smaller copy.');
  } finally { bitmap.close(); }
}
