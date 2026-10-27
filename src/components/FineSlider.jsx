import { useEffect, useRef } from 'react';
import { sliderDragValue, sliderStops } from '../utils/sliderDrag.js';
import './fineSlider.css';

export default function FineSlider({ value, min, max, step = 1, stops, onValueChange, onDragStart, onDragEnd, ...props }) {
  const drag = useRef(null);
  const input = useRef(null);
  const dragged = useRef(false);
  const frame = useRef(null);
  const pending = useRef(null);
  useEffect(() => () => { if (frame.current !== null) cancelAnimationFrame(frame.current); }, []);
  const quickValues = stops || sliderStops(Number(min), Number(max), Number(step));
  const progress = Math.max(0, Math.min(100, (Number(value) - Number(min)) / (Number(max) - Number(min)) * 100));
  const commit = () => {
    frame.current = null;
    const next = pending.current;
    pending.current = null;
    if (next !== null) onValueChange(next);
  };
  const finish = () => {
    if (frame.current !== null) { cancelAnimationFrame(frame.current); commit(); }
    if (drag.current?.active) onDragEnd?.();
    drag.current = null;
  };
  const pointerEvents = {
    onPointerDown: event => {
      if (props.disabled || event.button !== 0 || drag.current) return;
      // Track taps must not jump the value; pointer changes use deliberate relative dragging.
      event.preventDefault();
      input.current.focus({ preventScroll: true });
      dragged.current = false;
      drag.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, startValue: Number(value), width: input.current.getBoundingClientRect().width, threshold: event.pointerType === 'mouse' ? 6 : 12, active: false };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove: event => {
      const current = drag.current;
      if (!current || current.pointerId !== event.pointerId) return;
      const next = sliderDragValue({ ...current, deltaX: event.clientX - current.startX, deltaY: event.clientY - current.startY, min: Number(min), max: Number(max), step: Number(step) });
      if (next === undefined || next === (pending.current ?? Number(value))) return;
      if (!current.active) { current.active = true; onDragStart?.(); }
      dragged.current = true;
      pending.current = next;
      if (frame.current === null) frame.current = requestAnimationFrame(commit);
    },
    onPointerUp: event => { if (drag.current?.pointerId === event.pointerId) finish(); },
    onPointerCancel: finish, onLostPointerCapture: finish,
  };
  return <div className="fine-slider" style={{ '--slider-progress': `${progress}%` }}>
    <div className="fine-slider-rail" aria-hidden="true"><span /></div>
    <input {...props} {...pointerEvents} ref={input} type="range" value={value} min={min} max={max} step={step} style={{ touchAction: 'pan-y' }}
    onChange={event => { if (!drag.current) onValueChange(Number(event.target.value)); }}
    onBlur={finish} onClick={event => event.preventDefault()} />
    <div className="fine-slider-stops" role="group" aria-label="Quick slider values">
      {quickValues.map(stop => <button {...pointerEvents} key={stop} type="button" className="fine-slider-stop" style={{ left: `${(stop - Number(min)) / (Number(max) - Number(min)) * 100}%` }} data-filled={Number(value) >= stop} aria-label={`Set to ${stop}`} title={`Set to ${stop}`} aria-controls={props.id} aria-pressed={Number(value) === stop} disabled={props.disabled} onClick={event => { if (!dragged.current || event.detail === 0) onValueChange(stop); dragged.current = false; }}><span className="fine-slider-dot" aria-hidden="true" /><span className="fine-slider-number" aria-hidden="true">{stop}</span></button>)}
    </div>
  </div>;
}
