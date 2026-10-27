import { adventureTimeTemplates } from './characterReferenceTemplates.js';
import { littleFriendsTemplates } from './littleFriendsTemplates.js';
import { generativePatternTemplates } from './generativePatterns.js';
import { chikawaTemplates } from './chikawaTemplates.js';
import { chikawaReferenceTemplates } from './chikawaReferenceTemplates.js';
import { weBareBearsTemplates } from './weBareBearsTemplates.js';
import { sanrioTemplates } from './sanrioTemplates.js';
import { domoTemplates } from './domoTemplates.js';
import { snoopyTemplates } from './snoopyTemplates.js';
import { meepTemplates } from './meepTemplates.js';
import { ghibliTemplates } from './ghibliTemplates.js';
import { genshinTemplates } from './genshinTemplates.js';
import { genshinBackgroundTemplates } from './genshinBackgroundTemplates.js';
import { genshinChibiTemplates } from './genshinChibiTemplates.js';
import { hunterTemplates } from './hunterTemplates.js';
import { capybaraTemplates } from './capybaraTemplates.js';
import { animeTemplates } from './animeTemplates.js';
import { narutoTemplates } from './narutoTemplates.js';
import { arcaneTemplates } from './arcaneTemplates.js';
import { collageTemplates } from './collageTemplates.js';
import { withTemplateKeywords } from '../../shared/templateKeywords.js';


export { mobileResolution, deviceResolutions, tabletLandscapeResolution, templateSchedule, mascotTemplateSchedule, dayColumnsPreviewSchedule, galleryScheduleFor } from './wallpaperPresets.js';

// Artwork and palette presets contain no student or course information.
// Legacy heading/rows values remain as preset metadata; Canvas uses one shared layout.
export const wallpaperTemplates = [
  ...adventureTimeTemplates,
  ...ghibliTemplates,
  ...weBareBearsTemplates,
  ...meepTemplates,
  ...domoTemplates,
  ...snoopyTemplates,
  ...genshinTemplates,
  ...genshinBackgroundTemplates,
  ...genshinChibiTemplates,
  ...hunterTemplates,
  ...capybaraTemplates,
  ...animeTemplates,
  ...narutoTemplates,
  ...arcaneTemplates,
  ...collageTemplates,

  ...sanrioTemplates,
  ...chikawaReferenceTemplates,
  ...chikawaTemplates.filter(template => !chikawaReferenceTemplates.some(reviewed => reviewed.id === template.id)),
  ...littleFriendsTemplates,
  ...generativePatternTemplates,
].map(withTemplateKeywords);
