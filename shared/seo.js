export const SITE_URL = 'https://schedsnap.chrbuilds.dev';
export const SUBMIT_DESIGN_PATH = '/submit-design';
export const COMMUNITY_GUIDE_PATH = '/guides/community-designs';
export const CREATOR_PATH = '/services/schedule-wallpaper';
export const SOCIAL_IMAGE_PATH = '/images/hero/hero-phones-refreshed.png';
export const SEO_PAGES = {
  [COMMUNITY_GUIDE_PATH]: {
    title: 'Get Your Design Featured — SchedSnap',
    description: 'Learn how to submit your own wallpaper design for the SchedSnap Community collection, what review looks like, and how your design is credited.',
  },
  '/': {
    lastModified: '2026-10-25',
    title: 'SchedSnap — Class Schedule Wallpaper Maker',
    description: 'SchedSnap is a class schedule wallpaper maker for students. Choose a design, add classes, and download a PNG for your phone, tablet, or laptop.',
  },
  [CREATOR_PATH]: {
    lastModified: '2026-10-23',
    title: 'Create a Class Schedule Wallpaper — SchedSnap',
    description: 'Choose a schedule wallpaper design, upload your timetable or enter classes manually, and customize a PNG for your phone, tablet, or laptop.',
  },
  '/terms': {
    title: 'Terms of Use — SchedSnap',
    description: 'Read the terms for using SchedSnap, importing class schedules with AI, and downloading schedule wallpapers.',
  },
  '/privacy': {
    title: 'Privacy Policy — SchedSnap',
    description: 'Learn how SchedSnap handles schedule images, class details, analytics, and wallpaper downloads.',
  },
  '/cookies': {
    title: 'Cookie Policy — SchedSnap',
    description: 'Learn how SchedSnap uses cookies and choose whether to accept or reject optional cookies. Change your cookie settings at any time.',
  },
};

export function getPageSeo(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (SEO_PAGES[path]) return { ...SEO_PAGES[path], canonical: `${SITE_URL}${path}`, index: true };
  if (path === SUBMIT_DESIGN_PATH) return {
    title: 'Submit a Design — SchedSnap',
    description: 'Share your wallpaper artwork and track your SchedSnap submissions.',
    canonical: null,
    index: false,
  };
  const editor = path.startsWith(`${CREATOR_PATH}/`);
  const admin = path === '/admin' || path.startsWith('/admin/');
  return {
    title: admin ? 'Administrator — SchedSnap' : editor ? 'Customize Your Schedule Wallpaper — SchedSnap' : 'Page not found — SchedSnap',
    description: editor ? SEO_PAGES[CREATOR_PATH].description : 'SchedSnap class schedule wallpaper maker.',
    canonical: editor ? `${SITE_URL}${CREATOR_PATH}` : null,
    index: false,
  };
}

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'SchedSnap',
  alternateName: 'Sched Snap',
  url: `${SITE_URL}/`,
  description: SEO_PAGES['/'].description,
  publisher: {
    '@type': 'Organization',
    name: '.dcd',
    url: 'https://github.com/dcd-inc',
  },
};

export function getPageSchema(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/') return websiteSchema;
  if (path !== CREATOR_PATH) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'SchedSnap',
    url: `${SITE_URL}${CREATOR_PATH}`,
    description: SEO_PAGES[CREATOR_PATH].description,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Any',
    isAccessibleForFree: true,
    creator: websiteSchema.publisher,
  };
}
