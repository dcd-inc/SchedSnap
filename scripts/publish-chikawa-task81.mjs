/* global FormData, Blob, console */
import process from 'node:process';
import { existsSync } from 'node:fs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { chikawaTask81Templates } from '../src/assets/chikawaTask81Templates.js';
import manifest from '../src/assets/cloudinaryManifest.js';
import { createCatalogStore } from '../server/catalogStore.js';
import { templateSchema } from '../shared/templateSchema.js';

for (const file of ['.env.local', '.env']) if (existsSync(file)) process.loadEnvFile(file);
const digest = value => createHash('sha256').update(value).digest('hex');
const inspection = JSON.parse(await readFile('output/chikawa-task81/manifest.json', 'utf8'));
if (inspection.assets.length !== 36 || inspection.assets.some(asset => !asset.likenessApproved)) throw new Error('Expected 36 reviewed task81 assets.');
const dimensions = { mobile: [1080, 2400], tablet: [1600, 2560], laptop: [1920, 1080] };
const reviewed = new Map(inspection.assets.map(asset => [asset.path, asset]));
const templates = chikawaTask81Templates.map(template => {
  const deviceImages = Object.fromEntries(Object.entries(template.deviceImages).map(([device, path]) => {
    const assetPath = `public${path}`;
    const entry = reviewed.get(assetPath);
    const uploaded = manifest[path];
    if (!entry || !uploaded || uploaded.cloud !== process.env.CLOUDINARY_CLOUD_NAME) throw new Error(`Missing reviewed Cloudinary mapping: ${path}`);
    return [device, uploaded.url];
  }));
  return { ...template, image: deviceImages.mobile, deviceImages };
});
await Promise.all(chikawaTask81Templates.flatMap(t => Object.entries(t.deviceImages).map(async ([device, path]) => {
  const asset = reviewed.get(`public${path}`);
  const bytes = await readFile(resolve('public', path.slice(1)));
  const [width, height] = dimensions[device];
  if (!asset?.opaque || !asset.dimensionsValid || !asset.likenessApproved || digest(bytes) !== asset.sha256
    || bytes.readUInt32BE(16) !== width || bytes.readUInt32BE(20) !== height) throw new Error(`Reviewed asset changed: ${path}`);
  if (manifest[path].width !== width || manifest[path].height !== height) throw new Error(`Uploaded dimensions differ: ${path}`);
  return [path, bytes];
})));
const store = createCatalogStore(process.env);
const before = await store.read(true);
const now = new Date().toISOString();
const desired = templates.map(definition => {
  const old = before.templates.find(t => t.id === definition.id);
  const deviceImages = definition.deviceImages;
  return templateSchema.parse({ ...old, ...definition, status: 'published', image: deviceImages.mobile, deviceImages,
    createdAt: old?.createdAt || definition.createdAt, publishedAt: old?.publishedAt || now });
});
const newIds = new Set(desired.map(t => t.id));
const preserved = before.templates.filter(t => !newIds.has(t.id));
const proposed = { ...before, templates: [...desired, ...preserved] };
const review = { reviewedAt: now, priorRevision: before.revision, designs: desired.map(t => t.id), uploadedAssetCount: 36,
  preservedCount: preserved.length, preservedDigest: digest(JSON.stringify(preserved)), total: proposed.templates.length };
await mkdir('output/chikawa-task81', { recursive: true });
await writeFile('output/chikawa-task81/publication-review.json', JSON.stringify(review, null, 2) + '\n');
if (JSON.stringify(await store.read(true)) !== JSON.stringify(before)) throw new Error('Catalog changed during review; rerun against the latest catalog.');
if (JSON.stringify(before.templates) !== JSON.stringify(proposed.templates)) await store.write(proposed);
const saved = await store.read(true);
const kept = saved.templates.filter(t => !newIds.has(t.id));
if (JSON.stringify(kept) !== JSON.stringify(preserved) || desired.some(t => saved.templates.filter(x => x.id === t.id).length !== 1
  || JSON.stringify(saved.templates.find(x => x.id === t.id)) !== JSON.stringify(t))) throw new Error('Catalog verification failed.');
const result = { ...review, revision: saved.revision, verifiedAt: new Date().toISOString(), publishedDesignCount: 12,
  uploadedAssetCount: 36, unaffectedRecordsPreserved: true };
await writeFile('output/chikawa-task81/publication-result.json', JSON.stringify(result, null, 2) + '\n');
console.log(`Verified ${desired.length} task81 Chiikawa designs with 36 uploaded assets; preserved ${preserved.length} other catalog records.`);
