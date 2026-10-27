import useMobileSheetDismiss from '../lib/useMobileSheetDismiss.js';
import { useEffect, useRef } from 'react';
import { Heart, X } from 'lucide-react';

export default function DownloadThanksDialog({ name, vote, pending, error, onHeart, onRetry, onClose }) {
  const dialog = useRef(null);
  useMobileSheetDismiss(dialog, onClose);
  const loved = !!vote?.liked;
  useEffect(() => {
    const node = dialog.current;
    const trigger = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    node.showModal();
    return () => { node.close(); document.body.style.overflow = overflow; if (trigger?.isConnected) trigger.focus(); };
  }, []);
  return <dialog ref={dialog} className="download-thanks-dialog" data-loved={loved} aria-labelledby="download-thanks-title" aria-describedby="download-thanks-description" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <button type="button" className="template-modal-control download-thanks-close" aria-label="Close thank-you message" onClick={onClose}><X size={20} aria-hidden="true" /></button>
    <span className="download-thanks-icon"><Heart size={26} fill={loved ? 'currentColor' : 'none'} aria-hidden="true" /></span>
    <h2 id="download-thanks-title">{loved ? 'Thanks for the love!' : 'Thanks for downloading!'}</h2>
    <p id="download-thanks-description" role="status">{loved ? 'Thank you for supporting SchedSnap. We hope this wallpaper brings a little joy to your day!' : <>Enjoy your {name} wallpaper. Do you love this design? Give it a heart to let us know.</>}</p>
    {loved && <div className="download-thanks-actions"><button type="button" className="button-primary" autoFocus onClick={onClose}>Done</button></div>}
    {error && <p className="download-heart-error" role="alert">{error} <button type="button" className="text-link" disabled={!!pending} onClick={onRetry}>Retry</button></p>}
    <div className="download-thanks-actions" hidden={loved}><button type="button" className="button-primary" disabled={!vote} onClick={onHeart}><Heart size={18} aria-hidden="true" />Yes, I love it</button><button type="button" className="button-secondary" onClick={onClose}>No thanks</button></div>
  </dialog>;
}
