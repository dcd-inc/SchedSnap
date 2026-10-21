export default function WallpaperLoading() {
  return <section className="page-wrap wallpaper-flow" aria-busy="true" aria-label="Loading wallpaper creator">
    <span role="status" className="sr-only">Loading wallpaper creator…</span>
    <div aria-hidden="true">
      <div className="tool-back"><div className="wallpaper-skeleton h-4 w-14 rounded" /></div>
      <header className="wallpaper-flow-header">
        <h1 className="wallpaper-skeleton rounded-lg"><span className="invisible">Choose a design</span></h1>
        <div className="wallpaper-flow-header-actions">
          <div className="wallpaper-search-wrap"><div className="wallpaper-skeleton h-11 w-full rounded-full" /></div>
        </div>
      </header>
      <div className="template-filters gallery-filter-row">
        <div className="gallery-skeleton-quick-filters">
          {[96, 124, 136].map(width => <div key={width} className="wallpaper-skeleton h-10 rounded-full" style={{ width }} />)}
        </div>
        <div className="category-filters gallery-skeleton-categories">
          {[80, 60, 64, 72].map(width => <div key={width} className="wallpaper-skeleton h-10 rounded-full" style={{ width }} />)}
        </div>
      </div>
      <div className="template-grid template-grid-mobile">
        {Array.from({ length: 10 }, (_, index) => <div key={index}>
          <div className="gallery-card-skeleton wallpaper-skeleton" />
          <div className="wallpaper-skeleton h-4 w-full rounded gallery-skeleton-caption" />
        </div>)}
      </div>
    </div>
  </section>;
}
