import { useSyncExternalStore } from 'react';
import CircularCarousel from './CircularCarousel/CircularCarousel.jsx';
import './wallpaperCarousel.css';

const items = [
  {
    "src": "/images/carousel/ghibli-tilted-stamps.webp",
    "title": "Ghibli",
    "alt": "Ghibli schedule wallpaper on a phone"
  },
  {
    "src": "/images/carousel/domo-tartan-sketch.webp",
    "title": "Domo",
    "alt": "Domo schedule wallpaper on a phone"
  },
  {
    "src": "/images/carousel/adventure-meadow-bugs.webp",
    "title": "Adventure Time",
    "alt": "Adventure Time schedule wallpaper on a phone"
  },
  {
    "src": "/images/carousel/chikawa-daisy-day.webp",
    "title": "Chiikawa",
    "alt": "Chiikawa schedule wallpaper on a phone"
  },
  {
    "src": "/images/carousel/capybara-moonlit-roses.webp",
    "title": "Capybara",
    "alt": "Capybara schedule wallpaper on a phone"
  },
  {
    "src": "/images/carousel/genshin-card-raiden-lightning.webp",
    "title": "Genshin",
    "alt": "Genshin schedule wallpaper on a phone"
  },
  {
    "src": "/images/carousel/sanrio-friends-gingham.webp",
    "title": "Sanrio",
    "alt": "Sanrio schedule wallpaper on a phone"
  },
  {
    "src": "/images/carousel/genshin-namecard-kinich.webp",
    "title": "Genshin",
    "alt": "Genshin schedule wallpaper on a phone"
  },
  {
    "src": "/images/carousel/hxh-killua-plain.webp",
    "title": "Hunter × Hunter",
    "alt": "Hunter × Hunter schedule wallpaper on a phone"
  },
  {
    "src": "/images/carousel/wbb-edge-peek-b.webp",
    "title": "We Bare Bears",
    "alt": "We Bare Bears schedule wallpaper on a phone"
  }
];

const mobileItems = items.slice(0, 7);

function subscribeToMobile(onChange) {
  const query = window.matchMedia('(max-width: 640px)');
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}
const isMobile = () => window.matchMedia('(max-width: 640px)').matches;

export default function WallpaperCarousel() {
  const mobile = useSyncExternalStore(subscribeToMobile, isMobile, () => false);
  return (
    <section id="collections" className="wallpaper-carousel-section" aria-labelledby="wallpaper-carousel-heading">
      <div className="page-wrap wallpaper-carousel-heading">
        <h2 id="wallpaper-carousel-heading">Popular collections.</h2>
      </div>
      <div className="page-wrap wallpaper-carousel-stage">
        <CircularCarousel items={mobile ? mobileItems : items} preset="orbit" intro="rise" cardWidth={220} fitWidth={mobile ? 1 : 0.94} aspectRatio={0.45} gap={mobile ? -25 : 25} curve={0} tilt={-10} perspective={1500} speed={14} parallax={0.3} stretch={0.5} depthFade={0.55} fadeColor="#ffffff" innerShade={0.6} cornerRadius={30} captions className="wallpaper-phone-carousel" />
      </div>
    </section>
  );
}
