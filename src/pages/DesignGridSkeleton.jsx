import GalleryCardSkeleton from '../components/GalleryCardSkeleton.jsx';
import './designCards.css';

export default function DesignGridSkeleton({ label = 'Loading designs', device = 'mobile' }) {
  return <div role="status">
    <span className="sr-only">{label}</span>
    <div className={`admin-design-grid admin-grid-${device}`} aria-hidden="true">
      {Array.from({ length: 8 }, (_, index) => <GalleryCardSkeleton key={index} device={device} />)}
    </div>
  </div>;
}
