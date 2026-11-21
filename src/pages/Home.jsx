import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { COMMUNITY_GUIDE_PATH, SUBMIT_DESIGN_PATH } from '../../shared/seo.js';
import Hero from '../components/Hero.jsx';
import DesignShowcase from '../components/DesignShowcase.jsx';
import LandingStats from '../components/LandingStats.jsx';
import HowItWorks from '../components/HowItWorks.jsx';
import Faq from '../components/Faq.jsx';
import WallpaperCarousel from '../components/WallpaperCarousel.jsx';
import '../landing.css';

export default function Home() {
  return <><Hero /><LandingStats /><HowItWorks /><WallpaperCarousel /><DesignShowcase />
    <section id="community" className="landing-contribute" aria-labelledby="landing-contribute-title">
      <div className="landing-contribute-inner">
        <picture className="landing-contribute-visual">
          <source media="(max-width: 767px)" srcSet="/images/community-guide/wallpaper-collage-mobile.webp" width="800" height="920" />
          <img src="/images/community-guide/wallpaper-collage.webp" alt="" width="1600" height="650" loading="lazy" decoding="async" />
        </picture>
        <div className="landing-contribute-copy">
          <h2 id="landing-contribute-title">Contribute to the community</h2>
          <p>Submit your wallpaper designs to help expand our shared collection.</p>
          <div className="community-guide-actions">
            <Link className="button-primary" to={SUBMIT_DESIGN_PATH}>Share design <ArrowRight size={18} aria-hidden="true" /></Link>
            <Link className="button-secondary" to={COMMUNITY_GUIDE_PATH}>Learn more</Link>
          </div>
        </div>
      </div>
    </section>
    <Faq /></>;
}
