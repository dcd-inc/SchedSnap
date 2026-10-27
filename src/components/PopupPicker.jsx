import { useId, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import './popupPicker.css';

export default function PopupPicker({ value, onChange, label, options, disabled = false, previewFonts = false }) {
  const id = useId();
  const trigger = useRef(null);
  const menu = useRef(null);
  const selected = options.find(([key]) => key === value) || options[0];
  const SelectedIcon = selected[2];
  const open = event => {
    event.preventDefault();
    if (menu.current.matches(':popover-open')) { menu.current.hidePopover(); return; }
    const bounds = trigger.current.getBoundingClientRect();
    Object.assign(menu.current.style, { width: 'max-content', maxWidth: `${Math.min(180, window.innerWidth - 24)}px`, maxHeight: '320px' });
    menu.current.showPopover();
    const measured = menu.current.getBoundingClientRect();
    const width = measured.width;
    const below = window.innerHeight - bounds.bottom - 18;
    const above = bounds.top - 18;
    const upward = below < measured.height && above > below;
    const height = Math.max(44, Math.min(measured.height, upward ? above : below));
    Object.assign(menu.current.style, {
      width: `${width}px`, maxHeight: `${height}px`,
      left: `${Math.max(12, Math.min(bounds.right - width, window.innerWidth - width - 12))}px`,
      top: `${upward ? bounds.top - height - 6 : bounds.bottom + 6}px`,
    });
    if (previewFonts) void import('../wallpaper-fonts.css').catch(() => {});
  };
  return <div className="popup-picker">
    <button ref={trigger} type="button" className="popup-picker-trigger" popoverTarget={id} aria-label={`${label}: ${selected[1]}`} disabled={disabled} onClick={open}><SelectedIcon aria-hidden="true" /><span style={previewFonts ? { fontFamily: `"${selected[0]}"` } : undefined}>{selected[1]}</span><ChevronDown aria-hidden="true" /></button>
    <div ref={menu} id={id} popover="auto" className="popup-picker-menu" role="group" aria-label={label} onKeyDown={event => {
      const items = [...event.currentTarget.querySelectorAll('button')];
      const index = items.indexOf(document.activeElement);
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); items[(index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus(); }
      if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); items[event.key === 'Home' ? 0 : items.length - 1]?.focus(); }
    }}>
      {options.map(([key, name, Icon]) => <button key={key} type="button" aria-pressed={value === key} onClick={() => { onChange(key); menu.current.hidePopover(); trigger.current.focus(); }}><Icon aria-hidden="true" /><span style={previewFonts ? { fontFamily: `"${key}"` } : undefined}>{name}</span></button>)}
    </div>
  </div>;
}
