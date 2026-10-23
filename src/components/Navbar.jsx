import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Link, useLocation } from 'react-router';
import BrandMark from './BrandMark.jsx';
import MakerBanner from './MakerBanner.jsx';
import SocialLinks from './SocialLinks.jsx';

function subscribeToScroll(onChange) {
  window.addEventListener('scroll', onChange, { passive: true });
  return () => window.removeEventListener('scroll', onChange);
}
const hasScrolled = () => window.scrollY > 8;

function updateMenuReveal(button, menu) {
  const bounds = button.getBoundingClientRect();
  const x = bounds.left + bounds.width / 2;
  const y = bounds.top + bounds.height / 2;
  const radius = Math.ceil(Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))) + 2;
  menu.style.setProperty('--menu-origin-x', `${x}px`);
  menu.style.setProperty('--menu-origin-y', `${y}px`);
  menu.style.setProperty('--menu-radius', `${radius}px`);
}

function scrollToLandingTarget(id) {
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
  if (id === 'top') { window.scrollTo({ top: 0, behavior }); return; }
  const section = document.getElementById(id);
  section?.scrollIntoView({ behavior, block: 'start' });
  if (section) { section.setAttribute('tabindex', '-1'); section.focus({ preventScroll: true }); }
}

export default function Navbar() {
  const isHome = useLocation().pathname === '/';
  const scrolled = useSyncExternalStore(subscribeToScroll, hasScrolled, () => false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const toggleRef = useRef(null);
  const pendingTargetRef = useRef(null);
  useEffect(() => {
    if (!menuOpen) return;
    const updateReveal = () => updateMenuReveal(toggleRef.current, menuRef.current);
    window.addEventListener('resize', updateReveal);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOutside = event => { if (!menuRef.current?.contains(event.target)) setMenuOpen(false); };
    const closeEscape = event => {
      if (event.key === 'Escape') { setMenuOpen(false); toggleRef.current?.focus(); }
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('resize', updateReveal);
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeEscape);
    };
  }, [menuOpen]);
  useEffect(() => {
    if (menuOpen || pendingTargetRef.current === null) return;
    const target = pendingTargetRef.current;
    pendingTargetRef.current = null;
    // The menu effect restores scrolling before this effect navigates to the section.
    scrollToLandingTarget(target);
  }, [menuOpen]);
  const navigateTo = useCallback(id => {
    if (menuOpen) {
      pendingTargetRef.current = id;
      setMenuOpen(false);
    } else scrollToLandingTarget(id);
  }, [menuOpen]);
  function handleSectionClick(event) {
    event.preventDefault();
    navigateTo(event.currentTarget.hash.slice(1));
  }
  const sectionLinks = [['how-it-works', 'How it works'], ['collections', 'Collections'], ['designs', 'Designs'], ['faq', 'FAQs']].map(([id, label]) => <a key={id} href={`#${id}`} onClick={handleSectionClick}>{label}</a>);
  return (
    <header className={`site-header${menuOpen ? ' mobile-menu-open' : ''}${isHome ? ` site-header-home${!scrolled ? ' is-at-top' : ''}` : ''}`}>
      <div className="page-wrap site-header-inner">
        <Link to="/" className="site-brand" onClick={event => {
          setMenuOpen(false);
          if (isHome) {
            event.preventDefault();
            navigateTo('top');
          }
        }}>
          <BrandMark /> SchedSnap
        </Link>
        {isHome && <nav className="landing-nav" aria-label="Main navigation">
          {sectionLinks}
        </nav>}
        {isHome && <div className="mobile-navigation" ref={menuRef} onBlur={event => {
          if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false);
        }}>
          <button ref={toggleRef} type="button" className="mobile-nav-toggle" aria-expanded={menuOpen} aria-controls="mobile-section-nav" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} onClick={() => {
            if (!menuOpen) updateMenuReveal(toggleRef.current, menuRef.current);
            setMenuOpen(open => !open);
          }}>
            <span className="menu-toggle-lines" aria-hidden="true"><span /><span /></span>
          </button>
          <div id="mobile-section-nav" className="mobile-nav-panel" data-open={menuOpen} inert={!menuOpen}>
            <nav className="mobile-section-links" aria-label="Mobile navigation">{sectionLinks}</nav>
            <div className="mobile-menu-footer"><p className="mobile-social-label">Find us on</p><SocialLinks /><MakerBanner /></div>
          </div>
        </div>}
      </div>
    </header>
  );
}
