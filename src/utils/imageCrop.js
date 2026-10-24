const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function getCropView(box, matchSelection = false) {
  if (matchSelection) {
    const width = box.right - box.left, height = box.bottom - box.top;
    const scale = Math.min(1.02, 1 / width, 1 / height);
    const viewWidth = width * scale, viewHeight = height * scale;
    const left = clamp((box.left + box.right - viewWidth) / 2, 0, 1 - viewWidth);
    const top = clamp((box.top + box.bottom - viewHeight) / 2, 0, 1 - viewHeight);
    return { left, top, right: left + viewWidth, bottom: top + viewHeight };
  }
  // Leave room around the selection so the handles remain easy to grab.
  // Equal normalized spans preserve the original preview aspect ratio while zooming.
  const span = Math.min(1, Math.max(box.right - box.left, box.bottom - box.top) * 1.02);
  const left = clamp((box.left + box.right - span) / 2, 0, 1 - span);
  const top = clamp((box.top + box.bottom - span) / 2, 0, 1 - span);
  return { left, top, right: left + span, bottom: top + span };
}

export function aspectCrop(sourceRatio, targetRatio) {
  const ratio = targetRatio / sourceRatio;
  const width = Math.min(1, ratio);
  const height = Math.min(1, 1 / ratio);
  return { left: (1 - width) / 2, top: (1 - height) / 2, right: (1 + width) / 2, bottom: (1 + height) / 2 };
}

export function resizeCrop(box, corner, dx, dy, ratio) {
  if (ratio) {
    const west = corner.includes('w'), north = corner.includes('n');
    const anchorX = west ? box.right : box.left, anchorY = north ? box.bottom : box.top;
    const maxHeight = Math.min((west ? anchorX : 1 - anchorX) / ratio, north ? anchorY : 1 - anchorY);
    const delta = ((west ? -dx : dx) * ratio + (north ? -dy : dy)) / (ratio * ratio + 1);
    const height = clamp(box.bottom - box.top + delta, Math.min(maxHeight, Math.max(0.02, 0.02 / ratio)), maxHeight);
    const width = height * ratio;
    return { left: west ? anchorX - width : anchorX, right: west ? anchorX : anchorX + width,
      top: north ? anchorY - height : anchorY, bottom: north ? anchorY : anchorY + height };
  }
  return {
    left: corner.includes('w') ? clamp(box.left + dx, 0, box.right - 0.05) : box.left,
    right: corner.includes('e') ? clamp(box.right + dx, box.left + 0.05, 1) : box.right,
    top: corner.includes('n') ? clamp(box.top + dy, 0, box.bottom - 0.05) : box.top,
    bottom: corner.includes('s') ? clamp(box.bottom + dy, box.top + 0.05, 1) : box.bottom,
  };
}

export function moveCrop(box, dx, dy) {
  dx = clamp(dx, -box.left, 1 - box.right);
  dy = clamp(dy, -box.top, 1 - box.bottom);
  return { left: box.left + dx, right: box.right + dx, top: box.top + dy, bottom: box.bottom + dy };
}
