import useMobileSheetDismiss from '../../lib/useMobileSheetDismiss.js';
import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { aspectCrop, getCropView, moveCrop, resizeCrop } from '../../utils/imageCrop.js';
import './imageCropDialog.css';

const fullImage = { left: 0, top: 0, right: 1, bottom: 1 };
const corners = { nw: 'top left', ne: 'top right', sw: 'bottom left', se: 'bottom right' };

export default function ImageCropDialog({ source, busy, error, onClose, onConfirm, background = false, aspectRatio }) {
  const dialog = useRef(null);
  useMobileSheetDismiss(dialog, onClose, busy);
  const stage = useRef(null);
  const drag = useRef(null);
  const initialBox = aspectRatio ? aspectCrop(source.width / source.height, aspectRatio) : fullImage;
  const lockedRatio = aspectRatio ? aspectRatio / (source.width / source.height) : undefined;
  const [box, setBox] = useState(initialBox);
  const [view, setView] = useState(() => aspectRatio ? getCropView(initialBox, true) : fullImage);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const viewWidth = view.right - view.left;
  const viewHeight = view.bottom - view.top;
  const ratio = aspectRatio || source.width / source.height;
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  const finishDrag = () => {
    if (!drag.current) return;
    setView(getCropView(drag.current.next, !!aspectRatio));
    drag.current = null;
  };
  return <dialog ref={dialog} className="class-edit-dialog image-crop-dialog" aria-labelledby="crop-title" aria-describedby="crop-help" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
    <header><h2 id="crop-title">{background ? 'Crop background' : 'Crop your timetable'}</h2><button type="button" className="icon-button" aria-label="Cancel crop" disabled={busy} onClick={onClose}><X size={20} aria-hidden="true" /></button></header>
    <ul id="crop-help" className="crop-help">{background ? <><li>Drag to position.</li><li>Drag corners to resize.</li></> : <><li>Drag to reposition. Drag corners to resize.</li><li>Keep all classes, headings, and day labels.</li></>}</ul>
    <div className="crop-workspace">
      <div ref={stage} className="crop-stage" style={{ aspectRatio: ratio, width: aspectRatio ? `min(100%, ${54 * ratio}dvh, calc((100dvh - 340px) * ${ratio}))` : `min(100%, ${48 * ratio}dvh)` }}>
        <div className="crop-image-layer"><img src={source.url} alt={background ? 'Background to crop' : 'Schedule to crop'} draggable={false} style={{ width: `${100 / viewWidth}%`, height: `${100 / viewHeight}%`, left: `${-view.left / viewWidth * 100}%`, top: `${-view.top / viewHeight * 100}%` }} onLoad={() => setLoaded(true)} onError={() => { setLoaded(false); setLoadError(true); }} /></div>
        {loaded && <div className="crop-selection" role="group" tabIndex={0} aria-label="Move crop with arrow keys" style={{ left: `${(box.left - view.left) / viewWidth * 100}%`, top: `${(box.top - view.top) / viewHeight * 100}%`, width: `${(box.right - box.left) / viewWidth * 100}%`, height: `${(box.bottom - box.top) / viewHeight * 100}%` }}
          onKeyDown={event => {
            if (event.target !== event.currentTarget || busy || !event.key.startsWith('Arrow')) return;
            event.preventDefault();
            const step = event.shiftKey ? 0.05 : 0.01;
            const next = moveCrop(box, (event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0) * viewWidth, (event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0) * viewHeight);
            setBox(next);
            if (aspectRatio) setView(getCropView(next, true));
          }}
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
            start.next = start.corner ? resizeCrop(start.box, start.corner, dx, dy, lockedRatio) : moveCrop(start.box, aspectRatio ? -dx : dx, aspectRatio ? -dy : dy);
            setBox(start.next);
            if (aspectRatio && !start.corner) setView(getCropView(start.next, true));
          }} onPointerUp={event => { if (drag.current?.pointerId === event.pointerId) finishDrag(); }} onPointerCancel={finishDrag} onLostPointerCapture={finishDrag}>
          {Object.entries(corners).map(([corner, label]) => <button key={corner} type="button" data-corner={corner} className={`crop-handle crop-${corner}`} aria-label={`Resize ${label} crop corner with arrow keys`} disabled={busy}
            onKeyDown={event => {
              if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
              event.preventDefault();
              const step = event.shiftKey ? 0.05 : 0.01;
              setBox(current => resizeCrop(current, corner, (event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0) * viewWidth, (event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0) * viewHeight, lockedRatio));
            }} onKeyUp={event => { if (event.key.startsWith('Arrow')) setView(getCropView(box, !!aspectRatio)); }} />)}
        </div>}
      </div>
    </div>
    {(error || loadError) && <p role="alert" className="import-inline-error">{error || 'This image could not be displayed. Cancel and choose another image.'}</p>}
    <div className="crop-actions"><button type="button" className="button-secondary" disabled={busy} onClick={() => { setBox(initialBox); setView(aspectRatio ? getCropView(initialBox, true) : fullImage); }}>Reset</button><div><button type="button" className="button-secondary" disabled={busy} onClick={onClose}>Cancel</button><button type="button" className="button-primary" disabled={busy || !loaded} onClick={() => onConfirm({ x: box.left, y: box.top, width: box.right - box.left, height: box.bottom - box.top })}>{busy ? 'Preparing…' : 'Use crop'}</button></div></div>
  </dialog>;
}
