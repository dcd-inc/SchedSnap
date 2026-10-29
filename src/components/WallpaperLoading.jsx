import GalleryCardSkeleton from './GalleryCardSkeleton.jsx';
import { useSearchParams } from 'react-router';
import { ChevronDown, LayoutGrid, LayoutTemplate } from 'lucide-react';
import DevicePicker from './DevicePicker.jsx';
import SortPicker from './SortPicker.jsx';
import { stylePickerOptions } from './wallpaperOptionIcons.js';
import { galleryCategories } from '../config/collections.js';
import './collectionFilters.css';

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
        <div className="gallery-quick-filters gallery-filter-skeleton" inert>
          <DevicePicker value={device} disabled />
          <SortPicker value={search.get('sort') || 'likes'} />
          <details className="device-picker"><summary><LayoutTemplate /><span>{{ stacked: 'Stacked days', timeline: 'Day groups', 'day-cards': 'Day cards', 'grouped-list': 'Grouped list', 'day-columns': 'Day columns', weekly: 'Weekly timetable' }[search.get('layout')] || 'Stacked days'}</span><ChevronDown className="device-picker-chevron" /></summary></details>
          <DevicePicker value={search.get('style') || 'glass'} options={stylePickerOptions} disabled />
        </div>
        <div className="collection-filters gallery-filter-skeleton">
          <div className="collection-filter-strip">
            {galleryCategories.map(category => <span key={category.id} className={`collection-chip wallpaper-skeleton${category.id === 'all' ? ' collection-chip-all' : ''}`}><span className="collection-chip-art">{category.id === 'all' && <LayoutGrid size={18} />}</span><span className="collection-chip-name">{category.name}</span></span>)}
          </div>
        </div>
      </div>
      <div className={`template-grid template-grid-${device}`}>
        {Array.from({ length: 10 }, (_, index) => <GalleryCardSkeleton key={index} device={device} />)}
      </div>
    </div>
  </section>;
}
