import { deviceResolutions, tabletLandscapeResolution } from '../assets/wallpaperPresets.js';
import { sampleSchedule } from '../assets/sampleSchedule.js';
import { WallpaperCanvas } from './ScheduleWallpaper/CanvasPreview.jsx';

export default function AdminDesignArtwork({ template, device, previewLayout, status, statusClass, actionLabel, id, disabled, onOpen }) {
  const dimensions = device === 'tablet' && template.orientation === 'landscape' ? tabletLandscapeResolution : deviceResolutions[device];
  const width = device === 'laptop' ? 480 : 270;
  const resolution = { id: device, width, height: Math.round(width * dimensions.height / dimensions.width) };
  return <div className="admin-design-artwork">
    <button type="button" id={id} className={`admin-design-preview admin-art-${device}`} aria-label={actionLabel} disabled={disabled} onClick={onOpen}>
      <WallpaperCanvas lazy showLoadingSkeleton={false} schedule={sampleSchedule} template={{ ...template, device, scheduleLayout: previewLayout }}
        resolution={resolution} className="block w-full h-auto" label={`${template.name} preview`} />
    </button>
    <span className={`admin-status ${statusClass}`}>{status}</span>
  </div>;
}
