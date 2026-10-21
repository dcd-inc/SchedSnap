const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function getCropView(box) {
  // Leave room around the selection so the handles remain easy to grab.
  // Equal normalized spans preserve the original preview aspect ratio while zooming.
  const span = Math.min(1, Math.max(box.right - box.left, box.bottom - box.top) * 1.02);
  const left = clamp((box.left + box.right - span) / 2, 0, 1 - span);
  const top = clamp((box.top + box.bottom - span) / 2, 0, 1 - span);
  return { left, top, right: left + span, bottom: top + span };
}

export function resizeCrop(box, corner, dx, dy) {
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
