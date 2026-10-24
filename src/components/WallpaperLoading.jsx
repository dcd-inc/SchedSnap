import GalleryCardSkeleton from './GalleryCardSkeleton.jsx';
import { useSearchParams } from 'react-router';

export default function WallpaperLoading() {
  const [search] = useSearchParams();
  const device = ['mobile', 'tablet', 'laptop'].includes(search.get('device')) ? search.get('device') : 'mobile';
  return <section className="page-wrap wallpaper-flow" aria-busy="true" aria-label="Loading wallpaper creator">
    <span role="status" className="sr-only">Loading wallpaper creator…</span>
    <div aria-hidden="true">
      <div className="tool-back"><div className="wallpaper-skeleton h-4 w-14 rounded" /></div>
      <header className="wallpaper-flow-header">
        <h1 className="wallpaper-skeleton rounded-lg"><span className="invisible">Choose a design</span></h1>
        <div className="wallpaper-flow-header-actions">
          <div className="wallpaper-search-wrap"><div className="wallpaper-skeleton w-full rounded-full" style={{ height: 46 }} /></div>
        </div>
      </header>
      <div className="template-filters gallery-filter-row">
        <div className="gallery-skeleton-quick-filters">
          {[120, 156, 164, 130].map((width, index) => <div key={index} className="wallpaper-skeleton rounded-full" style={{ width }} />)}
        </div>
        <div className="category-filters gallery-skeleton-categories">
          {[80, 60, 64, 72, 96, 88, 104, 76, 92, 84, 68, 100].map((width, index) => <div key={index} className={`wallpaper-skeleton h-10 rounded-full${index >= 4 ? ' gallery-skeleton-extra' : ''}`} style={{ width }} />)}
        </div>
      </div>
      <div className={`template-grid template-grid-${device}`}>
        {Array.from({ length: 10 }, (_, index) => <GalleryCardSkeleton key={index} device={device} />)}
      </div>
    </div>
  </section>;
}
