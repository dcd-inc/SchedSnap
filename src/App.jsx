import { lazy, Suspense, useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import DeviceGallery from './pages/DeviceGallery.jsx';
import InAppBrowserBanner from './components/InAppBrowserBanner.jsx';
import { CatalogProvider } from './lib/catalog.jsx';
import PageSeo from './components/PageSeo.jsx';
import CookieBanner from './components/CookieBanner.jsx';
import AccountLoading from './components/AccountLoading.jsx';
import WallpaperLoading from './components/WallpaperLoading.jsx';
import { COMMUNITY_GUIDE_PATH, SUBMIT_DESIGN_PATH } from '../shared/seo.js';

const Creator = lazy(() => import('./pages/Creator/Creator.jsx'));
const ScheduleWallpaper = lazy(() => import('./pages/ScheduleWallpaper/Index.jsx'));
const Admin = lazy(() => import('./pages/Admin.jsx'));
const Legal = lazy(() => import('./pages/Legal.jsx'));
const CommunityDesignGuide = lazy(() => import('./pages/CommunityDesignGuide.jsx'));

export default function App() {
  const { pathname, hash } = useLocation();
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');
  const isCreatorPortal = pathname.replace(/\/+$/, '') === SUBMIT_DESIGN_PATH;

  useEffect(() => {
    const section = hash ? document.getElementById(hash.slice(1)) : null;
    if (section) {
      section.scrollIntoView({ behavior: 'instant', block: 'start' });
      section.setAttribute('tabindex', '-1');
      section.focus({ preventScroll: true });
    }
    else window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash]);

  return (<CatalogProvider>
    <PageSeo />
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="skip-link">Skip to content</a>
      {!isAdmin && <InAppBrowserBanner />}
      {!isAdmin && !isCreatorPortal && <Navbar />}
      <main id="main" className="flex-1" tabIndex={-1}>
        <Suspense fallback={isAdmin || isCreatorPortal ? <AccountLoading /> : pathname.startsWith('/services/schedule-wallpaper') ? <WallpaperLoading /> : <p className="page-wrap py-20" role="status">Loading page…</p>}>
          <Routes>
            <Route path={COMMUNITY_GUIDE_PATH} element={<CommunityDesignGuide />} />
            <Route path={SUBMIT_DESIGN_PATH} element={<Creator />} />
            <Route path="/admin/*" element={<Admin />} />
            <Route path="/terms" element={<Legal kind="terms" />} />
            <Route path="/privacy" element={<Legal kind="privacy" />} />
            <Route path="/cookies" element={<Legal kind="cookies" />} />
            <Route path="/" element={<Home />} />
            <Route path="/wallpapers/:device" element={<DeviceGallery />} />
            <Route path="/services/schedule-wallpaper/*" element={<ScheduleWallpaper />} />
            <Route path="*" element={
              <section className="page-wrap py-24">
                <h1 className="text-4xl font-semibold">Page not found</h1>
                <p className="mt-4 text-muted">Head back to SchedSnap to create your schedule wallpaper.</p>
                <Link to="/" className="button-primary mt-8">Back to SchedSnap</Link>
              </section>
            } />
          </Routes>
        </Suspense>
      </main>
      {!isAdmin && !isCreatorPortal && !pathname.startsWith('/services/schedule-wallpaper') && <Footer />}
      {!isAdmin && !isCreatorPortal && pathname !== '/cookies' && <CookieBanner />}
    </div>
  </CatalogProvider>);
}
