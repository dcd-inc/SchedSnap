import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, Laptop, Smartphone, Tablet } from 'lucide-react';
import MobileSheet from './MobileSheet.jsx';

const devices = [
  ['mobile', 'Mobile', Smartphone],
  ['tablet', 'Tablet', Tablet],
  ['laptop', 'Laptop', Laptop],
];

export default function DevicePicker({ value = 'mobile', onChange, label = 'Device', options = devices, className = '', disabled = false, previewFonts = false }) {
  const pickerRef = useRef(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const closeSheet = useCallback(() => setSheetOpen(false), []);
  const selected = options.find(([id]) => id === value) || options[0];
  const SelectedIcon = selected[2];
  useEffect(() => {
    const dismiss = event => {
      if (!pickerRef.current?.contains(event.target)) pickerRef.current?.removeAttribute('open');
    };
    const close = event => {
      if (event.key === 'Escape' && pickerRef.current?.open) {
        pickerRef.current.removeAttribute('open');
        pickerRef.current.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', close);
    };
  }, []);
  return <details inert={disabled} ref={pickerRef} className={`device-picker ${className}`} onToggle={event => {
    if (!event.currentTarget.open) return;
    const bounds = event.currentTarget.querySelector('summary').getBoundingClientRect();
    event.currentTarget.style.setProperty('--picker-menu-top', `${bounds.bottom + 6}px`);
    event.currentTarget.style.setProperty('--picker-menu-left', `${Math.max(12, Math.min(bounds.left, window.innerWidth - 222))}px`);
  }}>
    <summary aria-disabled={disabled || undefined} aria-label={`${label}: ${selected[1]}`} onClick={event => { if (window.matchMedia('(max-width: 640px)').matches) { event.preventDefault(); setSheetOpen(true); } }}><SelectedIcon aria-hidden="true" /><span style={previewFonts ? { fontFamily: `"${selected[0]}"` } : undefined}>{selected[1]}</span><ChevronDown className="device-picker-chevron" aria-hidden="true" /></summary>
    <div className="device-picker-menu" role="menu" aria-label={label}>
      {options.map(([id, name, Icon]) => <button type="button" role="menuitem" key={id} aria-pressed={value === id} onClick={(event) => { onChange(id); event.currentTarget.closest('details').open = false; }}><Icon aria-hidden="true" /><span style={previewFonts ? { fontFamily: `"${id}"` } : undefined}>{name}</span></button>)}
    </div>
    {sheetOpen && <MobileSheet title={label} onClose={closeSheet}><div className="mobile-sheet-options">{options.map(([id, name, Icon]) => <button type="button" key={id} aria-pressed={value === id} onClick={() => { onChange(id); closeSheet(); }}><Icon aria-hidden="true" /><span style={previewFonts ? { fontFamily: `"${id}"` } : undefined}>{name}</span></button>)}</div></MobileSheet>}
  </details>;
}
