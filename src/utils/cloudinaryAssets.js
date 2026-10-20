import manifest from '../assets/cloudinaryManifest.js';

export function cloudinaryAssetUrl(path, resolution, { lossless = false } = {}) {
  const asset = manifest[path] || (typeof path === 'string' && /^https:\/\/res\.cloudinary\.com\/[a-z0-9_-]+\/image\/upload\//i.test(path) ? { url: path } : undefined);
  if (!asset) return path;
  const width = Math.max(1, Math.ceil(resolution?.width || asset.width));
  const height = Math.max(1, Math.ceil(resolution?.height || asset.height));
  const preview = width < 1080 && height < 2400;
  // Fit within the target dimensions without cropping or stretching artwork.
  // Keep exports and pixel art lossless; previews of other artwork can use smaller formats.
  const transformation = Number.isFinite(width) && Number.isFinite(height)
    ? `c_limit,w_${width},h_${height}/${preview && !lossless ? 'f_auto,q_auto:good' : 'f_png'}` : 'f_png';
  return asset.url.replace('/image/upload/', `/image/upload/${transformation}/`);
}
