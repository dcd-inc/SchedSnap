import { Laptop, Smartphone, Tablet } from 'lucide-react';
import { deviceLabels } from '../../shared/templateVisibility.js';

const icons = { mobile: Smartphone, tablet: Tablet, laptop: Laptop };

export default function DesignCardDevices({ devices }) {
  if (!devices.length) return <span className="design-card-devices">Hidden</span>;
  return <span className="design-card-devices">
    {devices.map(device => {
      const Icon = icons[device];
      return <span key={device} title={deviceLabels[device]}>
        <span className="sr-only">{deviceLabels[device]}</span>
        <Icon size={16} aria-hidden="true" />
      </span>;
    })}
  </span>;
}
