export default function MakerBanner() {
  return (
    <div className="maker-banner">
      <div className="maker-content page-wrap">
        <div className="maker-mascot" aria-hidden="true">
          <picture><source type="image/avif" srcSet="/images/maker/maker-capybara-static-160.avif 160w, /images/maker/maker-capybara-static-320.avif 320w" sizes="(max-width: 800px) 112px, 160px" /><img src="/images/maker/maker-capybara-static-320.webp" alt="" width="320" height="320" loading="lazy" decoding="async" draggable="false" /></picture>
        </div>
        <p className="maker-message">Thanks for stopping by.</p>
      </div>
    </div>
  );
}
