import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import './mobileSheet.css';

export default function MobileSheet({ title, onClose, children }) {
  const dialog = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const node = dialog.current;
    const trigger = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    node.showModal();
    const resize = () => { if (!window.matchMedia('(max-width: 640px)').matches) onClose(); };
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      node.close();
      document.body.style.overflow = overflow;
      if (trigger?.isConnected) trigger.focus();
    };
  }, [onClose]);
  return createPortal(<dialog ref={dialog} className="mobile-control-sheet" aria-labelledby={titleId} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <header><h2 id={titleId}>{title}</h2><button type="button" className="icon-button" aria-label={`Close ${title}`} onClick={onClose}><X size={20} aria-hidden="true" /></button></header>
    <div className="mobile-sheet-content">{children}</div>
    <button type="button" className="button-primary mobile-sheet-done" onClick={onClose}>Done</button>
  </dialog>, document.body);
}
