import { readFileSync, writeFileSync } from 'node:fs';
import current from '../../src/assets/cloudinaryManifest.js';
import latest from '../../.worktrees/wbb-publish/src/assets/cloudinaryManifest.js';
const root = '.worktrees/wbb-publish/';
function edit(path, from, to) {
  const source = readFileSync(root + path, 'utf8');
  if (!source.includes(from)) throw Error(`Missing integration point: ${path}`);
  writeFileSync(root + path, source.replace(from, to));
}
const entries = Object.entries(current).filter(([path]) => path.includes('/wbb-'));
if (entries.length !== 36) throw Error('Expected 36 WBB mappings');
writeFileSync(root + 'src/assets/cloudinaryManifest.js', 'export default ' + JSON.stringify({ ...latest, ...Object.fromEntries(entries) }, null, 2) + ';\n');
edit('src/assets/templates.js', 'export const wallpaperTemplates = [', "import { weBareBearsTemplates } from './weBareBearsTemplates.js';\n\nexport const wallpaperTemplates = [\n  ...weBareBearsTemplates,");
edit('src/config/collections.js', "  { id: 'sanrio', name: 'Sanrio' },", "  { id: 'sanrio', name: 'Sanrio' },\n  { id: 'we-bare-bears', name: 'We Bare Bears' },");
edit('shared/templateSchema.js', "'scenic', 'sanrio',", "'scenic', 'sanrio', 'we-bare-bears',");
edit('tests/collections.test.js', "'scenic', 'sanrio',", "'scenic', 'sanrio', 'we-bare-bears',");
edit('tests/wallpaper.test.js', '40 + patternTemplates.length', '52 + patternTemplates.length');
let publisher = readFileSync(root + 'scripts/publish-sanrio-templates.mjs', 'utf8')
  .replaceAll('sanrioTemplates', 'weBareBearsTemplates').replaceAll('sanrioTemplates.js', 'weBareBearsTemplates.js')
  .replaceAll('Sanrio', 'We Bare Bears').replaceAll('sanrio-', 'wbb-').replaceAll('output/sanrio', 'output/we-bare-bears');
publisher = publisher.replace('  const args = process.argv.slice(2);', `  const inspection = JSON.parse(await readFile(resolve(root, 'output/we-bare-bears/manifest.json'), 'utf8'));
  if (inspection.assets.length !== 36 || new Set(inspection.assets.map(a => a.path)).size !== 36) throw Error('Expected 36 reviewed images');
  for (const asset of inspection.assets) {
    if (!asset.visuallyReviewed || !asset.opaque || !asset.dimensionsValid || !/^public\\/wallpapers\\/scenic\\/wbb-[a-z-]+\\/(mobile|tablet|laptop)\\.png$/.test(asset.path)) throw Error('Unapproved artwork');
    const bytes = await readFile(resolve(root, asset.path));
    if (createHash('sha256').update(bytes).digest('hex') !== asset.sha256) throw Error('Artwork changed after review');
  }
  const args = process.argv.slice(2);`);
publisher = publisher.replace('  const catalog = await store.read(true);', `  const catalog = await store.read(true);
  for (const category of catalog.categories || []) if (!galleryCategories.some(c => c.id === category.id)) galleryCategories.push(category);`);
writeFileSync(root + 'scripts/publish-we-bare-bears.mjs', publisher);
