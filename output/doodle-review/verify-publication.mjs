import assert from 'node:assert/strict';
import { existsSync, writeFileSync } from 'node:fs';
import { createCatalogStore } from '../../server/catalogStore.js';
import { doodleTemplates } from '../../src/assets/doodleTemplates.js';
import manifest from '../../src/assets/cloudinaryManifest.js';
for (const file of ['.env.local', '.env']) if (existsSync(file)) process.loadEnvFile(file);
const catalog = await createCatalogStore(process.env).read(true);
const verified = [];
for (const design of doodleTemplates) {
  const matches = catalog.templates.filter(t => t.id === design.id);
  assert.equal(matches.length, 1);
  const saved = matches[0];
  assert.equal(saved.collection, 'doodle');
  assert.equal(saved.status, 'published');
  assert.equal(saved.name, design.name);
  assert.ok(saved.keywords.includes('doodle'));
  assert.equal(saved.image, manifest[design.image].url);
  const response = await fetch(saved.image, { method: 'HEAD', signal: AbortSignal.timeout(15000) });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /image\/png/);
  assert.equal(response.headers.get('access-control-allow-origin'), '*');
  verified.push({ id: saved.id, name: saved.name, keywords: saved.keywords, url: saved.image, publishedAt: saved.publishedAt });
}
assert.ok(catalog.categories.some(c => c.id === 'doodle' && c.name === 'Doodle'));
writeFileSync(new URL('published.json', import.meta.url), JSON.stringify({ revision: catalog.revision, verifiedAt: new Date().toISOString(), designs: verified }, null, 2));
console.log(`Verified ${verified.length} published Doodle designs and all ${verified.length} Cloudinary image URLs (HTTP 200, PNG, CORS).`);
