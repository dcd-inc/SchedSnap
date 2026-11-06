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
    <section className="landing-contribute" aria-labelledby="landing-contribute-title">
      <div className="page-wrap landing-contribute-inner">
        <div>
          <h2 id="landing-contribute-title">Want to contribute to the community?</h2>
          <p>Send in a wallpaper design you made. If it’s approved, we’ll feature it in the Community collection with your name credited.</p>
          <div className="community-guide-actions">
            <Link className="button-secondary" to={COMMUNITY_GUIDE_PATH}>Learn more</Link>
            <Link className="button-primary" to={SUBMIT_DESIGN_PATH}>Share design <ArrowRight size={18} aria-hidden="true" /></Link>
          </div>
        </div>
        <img className="landing-contribute-visual" src="/images/community-guide/community-upload.webp" alt="" width="960" height="640" loading="lazy" decoding="async" />
      </div>
    </section>
    <Faq /></>;
}
