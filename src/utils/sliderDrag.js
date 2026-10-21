export function sliderDragValue({ startValue, deltaX, deltaY, width, min, max, step, threshold, active = false }) {
  if (!active && (Math.abs(deltaX) <= threshold || Math.abs(deltaY) >= Math.abs(deltaX))) return undefined;
  const distance = Math.sign(deltaX) * Math.max(0, Math.abs(deltaX) - threshold);
  const raw = startValue + distance / Math.max(1, width - 20) * (max - min) * 0.5;
  const snapped = min + Math.round((raw - min) / step) * step;
  return Math.max(min, Math.min(max, Number(snapped.toFixed(8))));
}

export function sliderStops(min, max, step) {
  return [...new Set([0, 0.25, 0.5, 0.75, 1].map(fraction => {
    const snapped = min + Math.round((max - min) * fraction / step) * step;
    return Math.min(max, Number(snapped.toFixed(8)));
  }))];
}
