import ResponsiveDisclosure from '../../components/ResponsiveDisclosure.jsx';
import { scheduleLayout, scheduleLayoutOptions } from '../../utils/canvasHelpers.js';
import { LayoutTemplate } from 'lucide-react';

export default function ScheduleLayoutPicker({ template, onChange }) {
  const options = scheduleLayoutOptions(template.device);
  if (options.length < 2) return null;
  return <ResponsiveDisclosure title="Schedule layout" icon={LayoutTemplate} className="flow-customize schedule-layout-picker">
    <fieldset className="schedule-layout-fieldset">
    <legend className="sr-only">Schedule layout</legend>
    <div className="schedule-layout-options">
      {options.map(({ value, label, description }) => <label key={value} className="schedule-layout-option">
        <input type="radio" name="schedule-layout" value={value} checked={scheduleLayout(template) === value} onChange={() => onChange('scheduleLayout', value)} />
        <span className={`layout-miniature layout-miniature-${value}`} aria-hidden="true">{Array.from({ length: 5 }, (_, index) => <span key={index} />)}</span>
        <span className="layout-option-copy"><strong>{label}</strong><span>{description}</span></span>
      </label>)}
    </div>
    </fieldset>
  </ResponsiveDisclosure>;
}
