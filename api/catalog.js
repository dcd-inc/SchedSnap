import { hunterTemplates } from '../src/assets/hunterTemplates.js';
import { cloudConfigured, createCatalogStore, seedCatalog } from '../server/catalogStore.js';
import { withTemplateKeywords } from '../shared/templateKeywords.js';
import { withBuiltInPatterns } from '../shared/patternCatalog.js';
const plainPlacements = new Map(hunterTemplates.filter(t => t.id.startsWith('hxh-plain-')).map(t => [t.id, t.verticalPosition]));
const legacyPlainPositions = { 'hxh-plain-pakunoda': -100, 'hxh-plain-machi': -90, 'hxh-plain-ging': -90, 'hxh-plain-uvogin': -80, 'hxh-plain-illumi': -80, 'hxh-plain-nobunaga': -75, 'hxh-plain-hisoka': -75 };
function currentPlacement(template) {
  // Upgrade the shipped placement even when the catalog still contains its original preset.
  if (plainPlacements.has(template.id) && template.verticalPosition === (legacyPlainPositions[template.id] ?? -70)) return { ...template, verticalPosition: plainPlacements.get(template.id) };
  return template;
}
export function createPublicCatalogHandler({ env = process.env, store = createCatalogStore(env), previewTemplates = [] } = {}) {
  return async (request, response) => {
    if (request.method !== 'GET') return response.status(405).json({ error: { message: 'Method not allowed.' } });
    response.setHeader('Cache-Control', 'no-store');
    try {
      const catalog = cloudConfigured(env) ? await store.read() : seedCatalog();
      // Development can preview new local artwork without publishing to the
      // shared catalog. Remote records, including hidden ones, take precedence.
      const ids = new Set(catalog.templates.map(t => t.id));
      const additions = previewTemplates.filter(t => {
        if (ids.has(t.id)) return false;
        ids.add(t.id);
        return true;
      }).map(t => ({ ...t, status: 'published' }));
      return response.status(200).json({ templates: withBuiltInPatterns([...additions, ...catalog.templates]).filter(t => t.status === 'published' && t.id !== 'adventure-bmo').map(currentPlacement).map(withTemplateKeywords).map(t => Object.fromEntries(Object.entries(t).filter(([key]) => key !== 'status'))) });
    } catch {
      response.setHeader('Cache-Control', 'no-store');
      return response.status(503).json({ error: { message: 'Design library temporarily unavailable.' } });
    }
  };
}
export default createPublicCatalogHandler();
