import { deviceResolutions } from '../assets/wallpaperPresets.js';

export default function GalleryCardSkeleton({ device = 'mobile' }) {
  const resolution = deviceResolutions[device];
  return <div className="template-card min-w-0" aria-hidden="true">
    <div className="gallery-card-skeleton wallpaper-skeleton" style={{ aspectRatio: `${resolution.width} / ${resolution.height}` }} />
    <div className="template-card-caption">
      <div className="template-card-details">
        <div className="gallery-skeleton-title"><span className="wallpaper-skeleton" /></div>
        <div className="gallery-skeleton-downloads"><span className="wallpaper-skeleton" /></div>
      </div>
      <div className="template-heart">
        <div className="gallery-skeleton-heart wallpaper-skeleton" />
        <span className="gallery-skeleton-count wallpaper-skeleton" />
      </div>
    </div>
  </div>;
}
