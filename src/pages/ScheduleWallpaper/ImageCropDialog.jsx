import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { getCropView, moveCrop, resizeCrop } from '../../utils/imageCrop.js';
import './imageCropDialog.css';

const fullImage = { left: 0, top: 0, right: 1, bottom: 1 };
const corners = { nw: 'top left', ne: 'top right', sw: 'bottom left', se: 'bottom right' };

export default function ImageCropDialog({ source, busy, error, onClose, onConfirm }) {
  const dialog = useRef(null);
  const stage = useRef(null);
  const drag = useRef(null);
  const [box, setBox] = useState(fullImage);
  const [view, setView] = useState(fullImage);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const viewWidth = view.right - view.left;
  const viewHeight = view.bottom - view.top;
  const ratio = source.width / source.height;
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  const finishDrag = () => {
    if (!drag.current) return;
    setView(getCropView(drag.current.next));
    drag.current = null;
  };
  return <dialog ref={dialog} className="class-edit-dialog image-crop-dialog" aria-labelledby="crop-title" aria-describedby="crop-help" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
    <header><h2 id="crop-title">Crop your timetable</h2><button type="button" className="icon-button" aria-label="Cancel crop" disabled={busy} onClick={onClose}><X size={20} aria-hidden="true" /></button></header>
    <ul id="crop-help" className="crop-help"><li>Drag corners to crop. Release to zoom.</li><li>Keep all classes, headings, and day labels.</li></ul>
    <div className="crop-workspace">
      <div ref={stage} className="crop-stage" style={{ aspectRatio: ratio, width: `min(100%, ${48 * ratio}dvh)` }}>
        <div className="crop-image-layer"><img src={source.url} alt="Schedule to crop" draggable={false} style={{ width: `${100 / viewWidth}%`, height: `${100 / viewHeight}%`, left: `${-view.left / viewWidth * 100}%`, top: `${-view.top / viewHeight * 100}%` }} onLoad={() => setLoaded(true)} onError={() => { setLoaded(false); setLoadError(true); }} /></div>
        {loaded && <div className="crop-selection" style={{ left: `${(box.left - view.left) / viewWidth * 100}%`, top: `${(box.top - view.top) / viewHeight * 100}%`, width: `${(box.right - box.left) / viewWidth * 100}%`, height: `${(box.bottom - box.top) / viewHeight * 100}%` }}
          onPointerDown={event => {
            if (busy || event.button !== 0 || drag.current) return;
            event.preventDefault();
            const corner = event.target.dataset.corner;
            const bounds = stage.current.getBoundingClientRect();
            drag.current = { corner, box, next: box, x: event.clientX, y: event.clientY, bounds, viewWidth, viewHeight, pointerId: event.pointerId };
            event.currentTarget.setPointerCapture(event.pointerId);
          }} onPointerMove={event => {
            const start = drag.current;
            if (!start || busy || start.pointerId !== event.pointerId) return;
            const dx = (event.clientX - start.x) / start.bounds.width * start.viewWidth;
            const dy = (event.clientY - start.y) / start.bounds.height * start.viewHeight;
            start.next = start.corner ? resizeCrop(start.box, start.corner, dx, dy) : moveCrop(start.box, dx, dy);
            setBox(start.next);
          }} onPointerUp={event => { if (drag.current?.pointerId === event.pointerId) finishDrag(); }} onPointerCancel={finishDrag} onLostPointerCapture={finishDrag}>
          {Object.entries(corners).map(([corner, label]) => <button key={corner} type="button" data-corner={corner} className={`crop-handle crop-${corner}`} aria-label={`Resize ${label} crop corner with arrow keys`} disabled={busy}
            onKeyDown={event => {
              if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
              event.preventDefault();
              const step = event.shiftKey ? 0.05 : 0.01;
              setBox(current => resizeCrop(current, corner, (event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0) * viewWidth, (event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0) * viewHeight));
            }} onKeyUp={event => { if (event.key.startsWith('Arrow')) setView(getCropView(box)); }} />)}
        </div>}
      </div>
    </div>
    {(error || loadError) && <p role="alert" className="import-inline-error">{error || 'This image could not be displayed. Cancel and choose another image.'}</p>}
    <div className="crop-actions"><button type="button" className="button-secondary" disabled={busy} onClick={() => { setBox(fullImage); setView(fullImage); }}>Reset</button><div><button type="button" className="button-secondary" disabled={busy} onClick={onClose}>Cancel</button><button type="button" className="button-primary" disabled={busy || !loaded} onClick={() => onConfirm({ x: box.left, y: box.top, width: box.right - box.left, height: box.bottom - box.top })}>{busy ? 'Preparing…' : 'Use crop'}</button></div></div>
  </dialog>;
}
