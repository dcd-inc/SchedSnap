import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Link, useLocation } from 'react-router';
import { ChevronDown, Images, LogOut } from 'lucide-react';
import BrandMark from './BrandMark.jsx';
import MakerBanner from './MakerBanner.jsx';
import SocialLinks from './SocialLinks.jsx';
import { CREATOR_PATH, SUBMIT_DESIGN_PATH } from '../../shared/seo.js';
import CreatorAvatar from '../pages/Creator/CreatorAvatar.jsx';

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
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const showHomeLink = pathname !== CREATOR_PATH && pathname !== `${CREATOR_PATH}/`;
  const scrolled = useSyncExternalStore(subscribeToScroll, hasScrolled, () => false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [creatorAccount, setCreatorAccount] = useState(null);
  const [creatorAvatar, setCreatorAvatar] = useState(null);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState('');
  const profile = useRef(null);
  useEffect(() => {
    let active = true;
    let subscription;
    import('../lib/creatorAuth.js').then(({ googleAvatarUrl, supabase }) => {
      if (!active || !supabase) return;
      subscription = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) setCreatorAvatar(null);
        setCreatorAccount(session ? { auth: supabase.auth, id: session.user.id, token: session.access_token, photo: googleAvatarUrl(session.user) } : null);
      }).data.subscription;
    }).catch(() => {});
    return () => { active = false; subscription?.unsubscribe(); };
  }, []);

  const creatorId = creatorAccount?.id;
  const creatorToken = creatorAccount?.token;
  const loadedCreatorAvatar = creatorAvatar?.id === creatorId ? creatorAvatar : null;
  useEffect(() => {
    if (!creatorId || !creatorToken) return;
    const controller = new AbortController();
    fetch('/api/creator-submissions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${creatorToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'profile' }),
      signal: controller.signal,
    }).then(async response => {
      if (!response.ok) throw new Error('Could not load creator profile.');
      const { avatar } = await response.json();
      if (!controller.signal.aborted) setCreatorAvatar({ id: creatorId, avatar });
    }).catch(() => {
      if (!controller.signal.aborted) setCreatorAvatar(current => current?.id === creatorId ? current : { id: creatorId, failed: true });
    });
    return () => controller.abort();
  }, [creatorId, creatorToken]);

  useEffect(() => {
    if (!creatorAccount) return;
    const dismiss = event => {
      if (profile.current?.open && !profile.current.contains(event.target)) profile.current.open = false;
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [creatorAccount]);

  async function signOut() {
    setSigningOut(true);
    setSignOutError('');
    try {
      const { error } = await creatorAccount.auth.signOut({ scope: 'local' });
      if (error) throw error;
    } catch { setSignOutError('Could not sign out. Try again.'); }
    finally { setSigningOut(false); }
  }
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
  const sectionLinks = [['how-it-works', 'How it works'], ['collections', 'Collections'], ['community', 'Community'], ['faq', 'FAQs']].map(([id, label]) => <Link key={id} to={isHome ? `#${id}` : `/#${id}`} onClick={isHome ? handleSectionClick : () => setMenuOpen(false)}>{label}</Link>);
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
        {(isHome || showHomeLink) && <nav className="landing-nav" aria-label="Main navigation">
          {isHome ? sectionLinks : <Link to="/">Home</Link>}
        </nav>}
        {creatorAccount && <div className="site-account">
          <details ref={profile} className="site-profile" onBlur={event => {
            if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false;
          }} onKeyDown={event => {
            if (event.key !== 'Escape' || !event.currentTarget.open) return;
            event.currentTarget.open = false;
            event.currentTarget.querySelector('summary')?.focus();
          }}>
            <summary aria-label="Creator profile" aria-busy={!loadedCreatorAvatar}>
              <CreatorAvatar loading={!loadedCreatorAvatar} avatar={loadedCreatorAvatar?.avatar} googlePhoto={loadedCreatorAvatar?.failed ? null : creatorAccount.photo} />
              <ChevronDown size={14} aria-hidden="true" />
            </summary>
            <div className="site-profile-menu">
              <Link to={SUBMIT_DESIGN_PATH}><Images size={16} aria-hidden="true" />My designs</Link>
              <button type="button" onClick={signOut} disabled={signingOut}><LogOut size={16} aria-hidden="true" />{signingOut ? 'Signing out…' : 'Sign out'}</button>
              {signOutError && <p role="alert">{signOutError}</p>}
            </div>
          </details>
        </div>}
        <div className="mobile-navigation" ref={menuRef} onBlur={event => {
          if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false);
        }}>
          <button ref={toggleRef} type="button" className="mobile-nav-toggle" aria-expanded={menuOpen} aria-controls="mobile-section-nav" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} onClick={() => {
            if (!menuOpen) updateMenuReveal(toggleRef.current, menuRef.current);
            setMenuOpen(open => !open);
          }}>
            <span className="menu-toggle-lines" aria-hidden="true"><span /><span /></span>
          </button>
          <div id="mobile-section-nav" className="mobile-nav-panel" data-open={menuOpen} inert={!menuOpen}>
            <nav className="mobile-section-links" aria-label="Mobile navigation">
              {showHomeLink && <Link to="/" onClick={event => { setMenuOpen(false); if (isHome) { event.preventDefault(); navigateTo('top'); } }}>Home</Link>}
              {sectionLinks}
            </nav>
            <div className="mobile-menu-footer"><p className="mobile-social-label">Find us on</p><SocialLinks /><MakerBanner /></div>
          </div>
        </div>
      </div>
    </header>
  );
}
