import { Search, X } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { useSearchPlaceholder } from '../lib/useWallpaperSearch.js';

const suggestedSearches = ['Sanrio', 'Snoopy', 'Genshin', 'We Bare Bears', 'Chiikawa', 'Studio Ghibli', 'Domo', 'Patterns'];

export default function WallpaperSearch({ value, onChange }) {
  const placeholder = useSearchPlaceholder(value);
  return <WallpaperSearchField value={value} onChange={onChange} placeholder={placeholder} iconLeft />;
}

export function WallpaperSearchField({ value, onChange, placeholder, label = 'Search designs or categories', iconLeft = false }) {
  const [open, setOpen] = useState(false);
  const input = useRef(null);
  const suggestionsId = useId();
  const suggestions = suggestedSearches.filter(term => !value.trim() || term.toLowerCase().includes(value.trim().toLowerCase()));
  const showSuggestions = open && suggestions.length > 0;
  return <div className={`wallpaper-search-wrap${iconLeft ? ' wallpaper-search-left' : ''}`} role="search" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); input.current?.focus(); setOpen(false); } }}>
    <input
      ref={input}
      type="search"
      className="wallpaper-search-input"
      placeholder={placeholder}
      aria-label={label}
      value={value}
      onFocus={() => setOpen(true)}
      onChange={event => { onChange(event.target.value); setOpen(true); }}
      aria-controls={showSuggestions ? suggestionsId : undefined}
    />
    {value && <button type="button" className="wallpaper-search-clear" aria-label="Clear search" onClick={() => onChange('')}>
      <X size={14} aria-hidden="true" />
    </button>}
    <Search className="wallpaper-search-icon" size={16} aria-hidden="true" />
    {showSuggestions && <div id={suggestionsId} className="wallpaper-search-suggestions" role="group" aria-label="Suggested searches">
      <p>Popular designs</p>
      <div>{suggestions.map(term => <button key={term} type="button" onClick={() => { onChange(term); input.current?.focus(); setOpen(false); }}><Search size={14} aria-hidden="true" />{term}</button>)}</div>
    </div>}
  </div>;
}
