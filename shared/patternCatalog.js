import { patternTemplates } from '../src/assets/patternTemplates.js';
import { generativePatternTemplates } from '../src/assets/generativePatterns.js';

const retiredPatternIds = new Set(patternTemplates.map(template => template.id));

// Code-rendered prints need no uploaded artwork or remote catalog publication.
// Saved overrides, including hidden/draft records, always take precedence.
export function withBuiltInPatterns(templates) {
  const active = templates.filter(template => !retiredPatternIds.has(template.id));
  const ids = new Set(active.map(template => template.id));
  const additions = generativePatternTemplates.filter(template => !ids.has(template.id))
    .map(template => ({ ...template, status: 'published' }));
  return [...additions, ...active];
}
