import { useEffect, useRef, useState } from 'react';
import { Download, LoaderCircle, X } from 'lucide-react';
import useMobileSheetDismiss from '../../lib/useMobileSheetDismiss.js';
import { WallpaperCanvas } from './CanvasPreview.jsx';

export default function DownloadOptionsDialog({ template, schedule, resolution, onDownload, onClose, busy = false, error = '' }) {
  const dialog = useRef(null);
  const [selected, setSelected] = useState(null);
  useMobileSheetDismiss(dialog, onClose, busy);
  function startDownload(wallpaperOnly) {
    if (busy) return;
    setSelected(wallpaperOnly);
    onDownload(wallpaperOnly);
  }
  useEffect(() => {
    const node = dialog.current;
    const trigger = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    node.showModal();
    return () => { node.close(); document.body.style.overflow = overflow; if (trigger?.isConnected) trigger.focus(); };
  }, []);
  return <dialog ref={dialog} className="download-options-dialog" data-device={resolution.id} style={{ '--design-preview-ratio': resolution.width / resolution.height }} aria-labelledby="download-options-title" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }} onClick={event => { if (!busy && event.target === event.currentTarget) onClose(); }}>
    <header><h2 id="download-options-title">Download wallpaper</h2><button type="button" className="template-modal-control" aria-label="Close download options" disabled={busy} onClick={onClose}><X size={20} aria-hidden="true" /></button></header>
    <div className="download-version-preview"><WallpaperCanvas schedule={schedule} template={template} resolution={resolution} label="Wallpaper with schedule" /></div>
    {error && <p className="download-options-error" role="alert">{error} Try downloading again.</p>}
    <footer aria-busy={busy}>
      <button type="button" className="button-secondary" disabled={busy} onClick={() => startDownload(true)}>{busy && selected === true ? <><LoaderCircle size={18} className="download-spinner" aria-hidden="true" /><span role="status">Preparing…</span></> : 'Without schedule'}</button>
      <button type="button" className="button-primary" disabled={busy} onClick={() => startDownload(false)}>{busy && selected === false ? <><LoaderCircle size={18} className="download-spinner" aria-hidden="true" /><span role="status">Preparing…</span></> : <><Download size={18} aria-hidden="true" />With schedule</>}</button>
    </footer>
  </dialog>;
}
