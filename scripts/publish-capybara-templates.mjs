/* global console */
import process from 'node:process';
import { existsSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { capybaraTemplates } from '../src/assets/capybaraTemplates.js';
import manifest from '../src/assets/cloudinaryManifest.js';
import { createCatalogStore } from '../server/catalogStore.js';
import { templateSchema } from '../shared/templateSchema.js';

for (const file of ['.env.local', '.env']) if (existsSync(file)) process.loadEnvFile(file);
const store = createCatalogStore(process.env);
const catalog = await store.read(true);
const existing = new Set(catalog.templates.map(t => t.id));
const publishedAt = new Date().toISOString();
const additions = capybaraTemplates.filter(t => !existing.has(t.id)).map(t => {
  const asset = manifest[t.image];
  if (!asset?.url || asset.cloud !== process.env.CLOUDINARY_CLOUD_NAME
    || asset.width !== 1080 || asset.height !== 2400) throw new Error(`Verified mobile upload missing: ${t.id}`);
  return templateSchema.parse({ ...t, image: asset.url, deviceImages: { mobile: asset.url }, status: 'published', publishedAt });
});
console.log(`Catalog revision: ${catalog.revision}; ${additions.length} Capybara additions, ${catalog.templates.length} records preserved.`);
if (process.argv.includes('--publish') && additions.length) {
  const index = process.argv.indexOf('--expect-revision');
  if (index < 0 || process.argv[index + 1] !== catalog.revision) throw new Error('Pass the reviewed revision with --expect-revision.');
  if (!isDeepStrictEqual(await store.read(true), catalog)) throw new Error('Catalog changed; review again.');
  const proposed = { ...catalog, templates: [...additions, ...catalog.templates] };
  await store.write(proposed);
  const saved = await store.read(true);
  if (!isDeepStrictEqual(saved.templates, proposed.templates)) throw new Error('Publication verification failed.');
  console.log(`Verified ${additions.length} published Capybara designs; existing records and dates preserved.`);
}
