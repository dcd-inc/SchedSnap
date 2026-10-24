export function cloudinaryImageUrl(asset, resolution, { lossless = false } = {}) {
  const width = Math.max(1, Math.ceil(resolution?.width || asset.width));
  const height = Math.max(1, Math.ceil(resolution?.height || asset.height));
  const preview = width < 1080 && height < 2400;
  // Fit without cropping; exports and pixel artwork remain lossless.
  const transformation = Number.isFinite(width) && Number.isFinite(height)
    ? `c_limit,w_${width},h_${height}/${preview && !lossless ? 'f_auto,q_auto:good' : 'f_png'}` : 'f_png';
  return asset.url.replace('/image/upload/', `/image/upload/${transformation}/`);
}
