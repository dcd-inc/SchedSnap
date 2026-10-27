import { sliderStops } from '../utils/sliderDrag.js';
import './fineSlider.css';

export default function FineSlider({ value, min, max, step = 1, stops, onValueChange, ...props }) {
  const quickValues = stops || sliderStops(Number(min), Number(max), Number(step));
  const progress = Math.max(0, Math.min(100, (Number(value) - Number(min)) / (Number(max) - Number(min)) * 100));
  return <div className="fine-slider" style={{ '--slider-progress': `${progress}%` }}>
    <div className="fine-slider-rail" aria-hidden="true"><span /></div>
    <input {...props} type="range" value={value} min={min} max={max} step={step} onChange={event => onValueChange(Number(event.target.value))} />
    <div className="fine-slider-stops" role="group" aria-label="Quick slider values">
      {quickValues.map(stop => <button key={stop} type="button" className="fine-slider-stop" style={{ left: `${(stop - Number(min)) / (Number(max) - Number(min)) * 100}%` }} data-filled={Number(value) >= stop} aria-label={`Set to ${stop}`} title={`Set to ${stop}`} aria-controls={props.id} aria-pressed={Number(value) === stop} disabled={props.disabled} onClick={() => onValueChange(stop)}><span className="fine-slider-dot" aria-hidden="true" /><span className="fine-slider-number" aria-hidden="true">{stop}</span></button>)}
    </div>
  </div>;
}
