import { useEffect, useRef } from 'react';
import { Download, X } from 'lucide-react';
import useMobileSheetDismiss from '../../lib/useMobileSheetDismiss.js';
import { WallpaperCanvas } from './CanvasPreview.jsx';

export default function DownloadOptionsDialog({ template, schedule, resolution, onDownload, onClose }) {
  const dialog = useRef(null);
  useMobileSheetDismiss(dialog, onClose);
  useEffect(() => {
    const node = dialog.current;
    const trigger = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    node.showModal();
    return () => { node.close(); document.body.style.overflow = overflow; if (trigger?.isConnected) trigger.focus(); };
  }, []);
  return <dialog ref={dialog} className="download-options-dialog" data-device={resolution.id} style={{ '--design-preview-ratio': resolution.width / resolution.height }} aria-labelledby="download-options-title" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <header><h2 id="download-options-title">Download wallpaper</h2><button type="button" className="template-modal-control" aria-label="Close download options" onClick={onClose}><X size={20} aria-hidden="true" /></button></header>
    <div className="download-version-preview"><WallpaperCanvas schedule={schedule} template={template} resolution={resolution} label="Wallpaper with schedule" /></div>
    <footer>
      <button type="button" className="button-secondary" onClick={() => onDownload(true)}>Without schedule</button>
      <button type="button" className="button-primary" onClick={() => onDownload(false)}><Download size={18} aria-hidden="true" />With schedule</button>
    </footer>
  </dialog>;
}
