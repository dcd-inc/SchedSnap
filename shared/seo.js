export const SITE_URL = 'https://schedsnap.chrbuilds.dev';
export const CREATOR_PATH = '/services/schedule-wallpaper';
export const SOCIAL_IMAGE_PATH = '/images/hero/hero-phones-refreshed.png';
export const SEO_PAGES = {
  '/guides/class-schedule-wallpaper': {
    lastModified: '2026-10-24',
    title: 'How to Make a Class Schedule Wallpaper — SchedSnap',
    description: 'Learn how to choose a wallpaper design, enter or import classes, check your timetable, and download a schedule wallpaper for your phone, tablet, or laptop.',
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

const guideSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Make a Class Schedule Wallpaper',
  description: SEO_PAGES['/guides/class-schedule-wallpaper'].description,
  url: `${SITE_URL}/guides/class-schedule-wallpaper`,
  totalTime: 'PT5M',
  tool: [{ '@type': 'HowToTool', name: 'SchedSnap' }],
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Choose your device and design',
      text: 'Open the creator and choose mobile, tablet, or laptop. Pick a design for your device, or upload your own wallpaper photo.',
      url: `${SITE_URL}/guides/class-schedule-wallpaper#step-1`,
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Add your classes',
      text: 'Enter your classes manually, or import an image of your timetable. Review AI-imported results before continuing.',
      url: `${SITE_URL}/guides/class-schedule-wallpaper#step-2`,
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Check days, times, and labels',
      text: 'Compare every class with your original timetable. Check the day, start and end times, and any room or subject labels.',
      url: `${SITE_URL}/guides/class-schedule-wallpaper#step-3`,
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: 'Preview and customize',
      text: 'Review the wallpaper preview and adjust the available appearance settings. Keep labels short enough to read on your device.',
      url: `${SITE_URL}/guides/class-schedule-wallpaper#step-4`,
    },
    {
      '@type': 'HowToStep',
      position: 5,
      name: 'Download and set your wallpaper',
      text: 'Download the finished PNG and set it as your lock screen, home screen, or desktop background.',
      url: `${SITE_URL}/guides/class-schedule-wallpaper#step-5`,
    },
  ],
};

export function getPageSchema(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/') return websiteSchema;
  if (path === '/guides/class-schedule-wallpaper') return guideSchema;
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
