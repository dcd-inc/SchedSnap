import process from 'node:process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { flowerTemplates } from '../src/assets/flowerTemplates.js';
import { doodleTemplates } from '../src/assets/doodleTemplates.js';
import { graffitiTemplates } from '../src/assets/graffitiTemplates.js';
import { createCatalogStore, cloudConfigured } from '../server/catalogStore.js';
for (const file of ['.env.local', '.env']) if (existsSync(resolve(file))) process.loadEnvFile(resolve(file));
if (!cloudConfigured(process.env)) throw new Error('Cloudinary is not configured');
const store = createCatalogStore(process.env), catalog = await store.read(true);
if (catalog.revision === 'seed') throw new Error('Uninitialized catalog');
const defaults = new Map([...flowerTemplates, ...doodleTemplates, ...graffitiTemplates].map(t => [t.id, t]));
const old = { background: '#101010', ink: '#fff5df', muted: '#fff5df', surface: '#111111', line: '#fff5df55' };
let changed = 0, skipped = 0;
const templates = catalog.templates.map(t => {
 const preset = defaults.get(t.id);
 if (!preset) return t;
 if (!Object.entries(old).every(([key, value]) => t[key] === value)) { skipped++; return t; }
 changed++;
 return { ...t, ...Object.fromEntries(Object.keys(old).map(key => [key, preset[key]])) };
});
console.log(`Revision ${catalog.revision}: ${changed} updates, ${skipped} customized designs preserved.`);
if (process.argv.includes('--publish') && changed) {
 const index = process.argv.indexOf('--expect-revision');
 if (index < 0 || process.argv[index + 1] !== catalog.revision) throw new Error('Expected revision required');
 if (!isDeepStrictEqual(await store.read(true), catalog)) throw new Error('Catalog changed; retry after review');
 const proposed = { ...catalog, templates };
 await store.write(proposed);
 if (!isDeepStrictEqual((await store.read(true)).templates, templates)) throw new Error('Catalog readback mismatch');
 console.log(`Updated ${changed} designs; other records and dates preserved.`);
}
