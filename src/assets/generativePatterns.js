import { geometricPatterns } from '../utils/patterns/geometricPatterns.js';
import { organicPatterns } from '../utils/patterns/organicPatterns.js';
import { playfulPatterns } from '../utils/patterns/playfulPatterns.js';
import { architecturalPatterns } from '../utils/patterns/architecturalPatterns.js';
import { botanicalPatterns } from '../utils/patterns/botanicalPatterns.js';
import { keepsakePatterns } from '../utils/patterns/keepsakePatterns.js';
import { withTemplateKeywords } from '../../shared/templateKeywords.js';

export const generativePatterns = [...geometricPatterns, ...organicPatterns, ...playfulPatterns, ...architecturalPatterns, ...botanicalPatterns, ...keepsakePatterns];
export const generativePatternIds = generativePatterns.map(pattern => pattern.id);
export const generativePatternMap = new Map(generativePatterns.map(pattern => [pattern.id, pattern]));

// Original geometry inspired by the directions explored with fffuel, not its exports.
export const generativePatternTemplates = generativePatterns.map((pattern, index) => ({
  id: `print-${pattern.id}`, name: pattern.name, description: pattern.description,
  keywords: [...new Set(`${pattern.name} ${pattern.description}`.toLowerCase().match(/[a-z]+/g))].filter(word => word.length > 2 && !['the', 'and', 'with', 'like', 'from', 'without', 'across', 'into'].includes(word)).join(', '),
  collection: 'pattern', family: 'generative-prints', pattern: pattern.id,
  background: pattern.background, patternColor: pattern.patternColor,
  patternAccent: pattern.patternAccent, ink: pattern.ink, muted: pattern.ink,
  surface: '#ffffff', line: `${pattern.ink}45`, containerFill: true,
  containerStyle: 'solid', containerOpacity: 96, patternScale: 100,
  patternOpacity: 75, createdAt: index >= 100 ? '2026-10-18T10:15:03.000Z' : '2026-10-18T09:45:00.000Z',
})).map(withTemplateKeywords);
