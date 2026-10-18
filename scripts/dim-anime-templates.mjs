/* global console */
import process from 'node:process';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';
import { createCatalogStore } from '../server/catalogStore.js';
import { templateSchema } from '../shared/templateSchema.js';

for (const file of ['.env.local', '.env']) if (existsSync(file)) process.loadEnvFile(file);
const { assets } = JSON.parse(await readFile('documentation/anime-collection/prompts-and-sources.json', 'utf8'));
const ids = new Set(assets.map(asset => asset.id));
if (ids.size !== 15) throw new Error('Expected the original fifteen artwork IDs.');
const store = createCatalogStore(process.env);
const catalog = await store.read(true);
if (catalog.templates.filter(t => ids.has(t.id)).length !== 15) throw new Error('Original collection is incomplete.');
const templates = catalog.templates.map(template => {
  if (!ids.has(template.id)) return template;
  const next = { ...template, overlay: 'rgba(0,0,0,0.2)' };
  templateSchema.parse(next);
  return next;
});
const changed = templates.filter((t, i) => !isDeepStrictEqual(t, catalog.templates[i])).length;
console.log(`Catalog revision: ${catalog.revision}; ${changed} brightness updates, all other fields preserved.`);
if (process.argv.includes('--publish') && changed) {
  const index = process.argv.indexOf('--expect-revision');
  if (index < 0 || process.argv[index + 1] !== catalog.revision) throw new Error('Pass the reviewed catalog revision.');
  if (!isDeepStrictEqual(await store.read(true), catalog)) throw new Error('Catalog changed; review again.');
  await writeFile('output/anime-collection/catalog-before-dimming.json', JSON.stringify(catalog, null, 2) + '\n');
  await store.write({ ...catalog, templates });
  const saved = await store.read(true);
  if (!isDeepStrictEqual(saved.templates, templates)) throw new Error('Saved catalog does not match brightness updates.');
  console.log('Verified 15 original wallpapers at 80% background brightness; schedules and publication dates preserved.');
}
