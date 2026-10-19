import { geometricPatterns } from '../utils/patterns/geometricPatterns.js';
import { organicPatterns } from '../utils/patterns/organicPatterns.js';
import { playfulPatterns } from '../utils/patterns/playfulPatterns.js';
import { architecturalPatterns } from '../utils/patterns/architecturalPatterns.js';
import { botanicalPatterns } from '../utils/patterns/botanicalPatterns.js';
import { keepsakePatterns } from '../utils/patterns/keepsakePatterns.js';
import { atelierPatterns } from '../utils/patterns/atelierPatterns.js';
import { storybookPatterns } from '../utils/patterns/storybookPatterns.js';
import { daydreamPatterns } from '../utils/patterns/daydreamPatterns.js';
import { coquettePatterns } from '../utils/patterns/coquettePatterns.js';
import { romancePatterns } from '../utils/patterns/romancePatterns.js';
import { vanityPatterns } from '../utils/patterns/vanityPatterns.js';
import { withTemplateKeywords } from '../../shared/templateKeywords.js';

export const generativePatterns = [...geometricPatterns, ...organicPatterns, ...playfulPatterns, ...architecturalPatterns, ...botanicalPatterns, ...keepsakePatterns, ...atelierPatterns, ...storybookPatterns, ...daydreamPatterns, ...coquettePatterns, ...romancePatterns, ...vanityPatterns];
export const generativePatternIds = generativePatterns.map(pattern => pattern.id);
export const generativePatternMap = new Map(generativePatterns.map(pattern => [pattern.id, pattern]));

// Original geometry inspired by the directions explored with fffuel, not its exports.
export const generativePatternTemplates = generativePatterns.map((pattern, index) => ({
  id: `print-${pattern.id}`, name: pattern.name, description: pattern.description,
  keywords: `${index >= 300 ? 'girly, feminine, ' : ''}${[...new Set(`${pattern.name} ${pattern.description}`.toLowerCase().match(/[a-z]+/g))].filter(word => word.length > 2 && !['the', 'and', 'with', 'like', 'from', 'without', 'across', 'into'].includes(word)).join(', ')}`,
  collection: 'pattern', family: 'generative-prints', pattern: pattern.id,
  background: pattern.background, patternColor: pattern.patternColor,
  patternAccent: pattern.patternAccent, ink: pattern.ink, muted: pattern.ink,
  surface: '#ffffff', line: `${pattern.ink}45`, containerFill: true,
  containerStyle: 'solid', containerOpacity: 96, patternScale: 100,
  patternOpacity: 75, createdAt: index >= 300 ? '2026-10-19T14:04:02.000Z' : index >= 200 ? '2026-10-19T13:55:37.000Z' : index >= 100 ? '2026-10-18T10:15:03.000Z' : '2026-10-18T09:45:00.000Z',
})).map(withTemplateKeywords);
