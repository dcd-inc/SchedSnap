/* global console */
import process from 'node:process';
import { existsSync, writeFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { narutoExtraTemplates } from '../src/assets/narutoExtraTemplates.js';
import manifest from '../src/assets/cloudinaryManifest.js';
import { galleryCategories } from '../src/config/collections.js';
import { createCatalogStore, cloudConfigured } from '../server/catalogStore.js';
import { templateSchema } from '../shared/templateSchema.js';

for (const file of ['.env.local', '.env']) if (existsSync(file)) process.loadEnvFile(file);
if (!cloudConfigured(process.env)) throw new Error('Cloudinary is not configured.');
const store = createCatalogStore(process.env);
const catalog = await store.read(true);
const changes = [];
const templates = catalog.templates.map(record => {
  const definition = narutoExtraTemplates.find(t => t.id === record.id);
  if (!definition) return record;
  const deviceImages = Object.fromEntries(Object.entries(definition.deviceImages).map(([device, path]) => {
    const asset = manifest[path];
    if (!asset?.url || asset.cloud !== process.env.CLOUDINARY_CLOUD_NAME) throw new Error(`Upload missing: ${path}`);
    return [device, asset.url];
  }));
  const next = { ...record, image: deviceImages.mobile, deviceImages, schedulePosition: definition.schedulePosition,
    ...(definition.artworkFooter === true ? { artworkFooter: true } : {}) };
  templateSchema.parse(next);
  if (!isDeepStrictEqual(record, next)) changes.push({ id: record.id,
    previous: { image: record.image, deviceImages: record.deviceImages, schedulePosition: record.schedulePosition, artworkFooter: record.artworkFooter },
    next: { image: next.image, deviceImages, schedulePosition: next.schedulePosition, artworkFooter: next.artworkFooter },
    createdAt: record.createdAt, publishedAt: record.publishedAt, status: record.status });
  return next;
});
for (const definition of narutoExtraTemplates) {
  if (catalog.templates.filter(t => t.id === definition.id).length !== 1) throw new Error(`Expected one existing record: ${definition.id}`);
}
const review = { revision: catalog.revision, totalRecords: templates.length, changes };
writeFileSync('output/naruto-edge-revision-review.json', JSON.stringify(review, null, 2) + '\n');
console.log(`Catalog revision: ${catalog.revision}; ${changes.length} artwork revisions; existing metadata and dates preserved.`);
if (process.argv.includes('--publish') && changes.length) {
  const index = process.argv.indexOf('--expect-revision');
  if (index < 0 || process.argv[index + 1] !== catalog.revision) throw new Error('Pass the reviewed revision with --expect-revision.');
  if (!isDeepStrictEqual(await store.read(true), catalog)) throw new Error('Catalog changed; review again.');
  for (const category of catalog.categories || []) if (!galleryCategories.some(c => c.id === category.id)) galleryCategories.push(category);
  await store.write({ ...catalog, templates });
  const saved = await store.read(true);
  if (!isDeepStrictEqual(saved.templates, templates)) throw new Error('Post-publication verification failed.');
  writeFileSync('output/naruto-edge-revision-result.json', JSON.stringify({ ...review, savedRevision: saved.revision, verifiedAt: new Date().toISOString() }, null, 2) + '\n');
  console.log(`Revised ${changes.length} Naruto designs; all records, visibility and dates preserved.`);
}
