import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Eye, X } from 'lucide-react';
import './mobileSheet.css';

export default function MobileSheet({ title, onClose, preview, onPreview, children }) {
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
  return createPortal(<dialog ref={dialog} className={`mobile-control-sheet${preview ? ' mobile-appearance-editor' : ''}`} aria-labelledby={titleId} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <header><h2 id={titleId}>{title}</h2>{preview ? <button type="button" className="button-primary appearance-save" onClick={onClose}>Save</button> : <button type="button" className="icon-button" aria-label={`Close ${title}`} onClick={onClose}><X size={20} aria-hidden="true" /></button>}</header>
    {preview && <div className="mobile-editor-preview">{preview}<div className="editor-preview-zoom"><button type="button" aria-label="View enlarged wallpaper" onClick={onPreview}><Eye size={18} aria-hidden="true" /></button></div></div>}
    <div className="mobile-sheet-content">{children}</div>
    {!preview && <button type="button" className="button-primary mobile-sheet-done" onClick={onClose}>Done</button>}
  </dialog>, document.body);
}
