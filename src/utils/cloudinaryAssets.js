import manifest from '../assets/cloudinaryManifest.js';
import { cloudinaryImageUrl } from './cloudinaryImageUrl.js';

export function cloudinaryAssetUrl(path, resolution, { lossless = false } = {}) {
  const asset = manifest[path] || (typeof path === 'string' && /^https:\/\/res\.cloudinary\.com\/[a-z0-9_-]+\/image\/upload\//i.test(path) ? { url: path } : undefined);
  if (!asset) return path;
  return cloudinaryImageUrl(asset, resolution, { lossless });
}
