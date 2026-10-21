export function classSuggestions(values, query) {
  const needle = (query || '').trim().toLocaleLowerCase();
  if (!needle) return [];
  const seen = new Set();
  return values.filter(value => {
    const normalized = value?.trim().toLocaleLowerCase();
    if (!normalized || normalized === needle || !(normalized.startsWith(needle) || normalized.split(/\s+/).some(word => word.startsWith(needle))) || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  }).slice(0, 5).map(value => value.trim());
}
