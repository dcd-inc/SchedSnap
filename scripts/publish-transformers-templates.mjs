/* global console */
import process from 'node:process';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';
import { transformersTemplates } from '../src/assets/transformersTemplates.js';
import manifest from '../src/assets/cloudinaryManifest.js';
import { galleryCategories } from '../src/config/collections.js';
import { createCatalogStore } from '../server/catalogStore.js';
import { templateSchema } from '../shared/templateSchema.js';

for (const file of ['.env.local', '.env']) if (existsSync(file)) process.loadEnvFile(file);
const store = createCatalogStore(process.env);
const catalog = await store.read(true);
const existing = new Set(catalog.templates.map(template => template.id));
const publishedAt = new Date().toISOString();
const additions = transformersTemplates.filter(template => !existing.has(template.id)).map(template => {
  const asset = manifest[template.image];
  if (!asset?.url || asset.cloud !== process.env.CLOUDINARY_CLOUD_NAME
    || asset.width !== 1080 || asset.height !== 2400) throw new Error(`Verified mobile upload missing: ${template.id}`);
  return templateSchema.parse({ ...template, image: asset.url, deviceImages: { mobile: asset.url }, status: 'published', publishedAt });
});
console.log(`Catalog revision: ${catalog.revision}; ${additions.length} Transformers additions, ${catalog.templates.length} existing records preserved.`);
if (process.argv.includes('--publish') && additions.length) {
  const index = process.argv.indexOf('--expect-revision');
  if (index < 0 || process.argv[index + 1] !== catalog.revision) throw new Error('Pass the reviewed revision with --expect-revision.');
  if (!isDeepStrictEqual(await store.read(true), catalog)) throw new Error('Catalog changed; review again.');
  await mkdir('output/transformers', { recursive: true });
  await writeFile(`output/transformers/catalog-before-${catalog.revision}.json`, JSON.stringify(catalog, null, 2) + '\n');
  // The store writes this shared category list; retain remotely added categories too.
  for (const category of catalog.categories || []) {
    if (!galleryCategories.some(item => item.id === category.id)) galleryCategories.push(category);
  }
  const proposed = { ...catalog, templates: [...additions, ...catalog.templates] };
  await store.write(proposed);
  const saved = await store.read(true);
  if (!isDeepStrictEqual(saved.templates, proposed.templates)
    || !isDeepStrictEqual(saved.categories, galleryCategories)) throw new Error('Publication verification failed.');
  console.log(`Verified ${additions.length} published Transformers designs; existing records and dates preserved.`);
}
