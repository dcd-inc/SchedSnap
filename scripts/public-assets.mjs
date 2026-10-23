import { SOCIAL_IMAGE_PATH } from '../shared/seo.js';

// Public paths are relative to public/, with forward slashes.
export function isPublicDeploymentAsset(path) {
  return !/^(?:wallpapers(?:\/|$)|images\/(?:mascots|pixel-mascots|goofy-mascots|doodle-mascots)\/masters(?:\/|$))/.test(path)
    && !/^images\/collections\/(?:catalog-mobile|refreshed)\/.+\.png$/.test(path)
    && (path === SOCIAL_IMAGE_PATH.slice(1) || !/^images\/hero\/hero-phones-.+\.png$/.test(path))
    && path !== 'images/maker/maker-capybara-static.png';
}
