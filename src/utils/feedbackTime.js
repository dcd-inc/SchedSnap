const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

export function feedbackTime(value, now = Date.now()) {
  const elapsed = Math.max(0, now - new Date(value).getTime());
  if (!Number.isFinite(elapsed)) return 'Unknown date';
  if (elapsed < 60000) return 'Just now';
  for (const [unit, duration] of [['year', 31536000000], ['month', 2592000000], ['day', 86400000], ['hour', 3600000], ['minute', 60000]]) {
    if (elapsed >= duration) return relative.format(-Math.floor(elapsed / duration), unit);
  }
}
