import { CalendarArrowDown, CalendarArrowUp, Download, Heart } from 'lucide-react';
import DevicePicker from './DevicePicker.jsx';

const options = [
  ['likes', 'Most hearts', Heart],
  ['downloads', 'Most downloads', Download],
  ['newest', 'Newest', CalendarArrowDown],
  ['oldest', 'Oldest', CalendarArrowUp],
];

export default function SortPicker({ value, onChange }) {
  return <div className="gallery-sort-picker" style={{ display: 'contents' }}><DevicePicker value={value} onChange={onChange} label="Sort designs by" options={options} /></div>;
}
