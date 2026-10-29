/* global console */
import process from 'node:process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { fruitTemplates } from '../src/assets/fruitTemplates.js';
import { carTemplates } from '../src/assets/carTemplates.js';
import { galleryCategories } from '../src/config/collections.js';
import manifest from '../src/assets/cloudinaryManifest.js';
import { createCatalogStore, cloudConfigured } from '../server/catalogStore.js';
import { templateSchema } from '../shared/templateSchema.js';
import { withTemplateKeywords } from '../shared/templateKeywords.js';
const approved = new Set([
  "/wallpapers/scenic/cars-sunset-snoopy-porsche/mobile.png",
  "/wallpapers/scenic/cars-turquoise-mercedes/mobile.png",
  "/wallpapers/scenic/cars-crimson-muscle-poster/mobile.png",
  "/wallpapers/scenic/cars-rx7-snoopy-city/mobile.png",
  "/wallpapers/scenic/cars-skyline-neon-type/mobile.png",
  "/wallpapers/scenic/cars-bmw-midnight-coupe/mobile.png",
  "/wallpapers/scenic/cars-porsche-ink-hood/mobile.png",
  "/wallpapers/scenic/cars-scarlet-sideways-coupe/mobile.png",
  "/wallpapers/scenic/cars-porsche-silver-studio/mobile.png",
  "/wallpapers/scenic/cars-porsche-weathered-olive/mobile.png",
  "/wallpapers/scenic/cars-skyline-crimson-rear/mobile.png",
  "/wallpapers/scenic/cars-tokyo-skyline-supra-collage/mobile.png",
  "/wallpapers/scenic/cars-skyline-engine-scrapbook/mobile.png",
  "/wallpapers/scenic/cars-gtr-crimson-rear-poster/mobile.png",
  "/wallpapers/scenic/cars-porsche-911-editorial-collage/mobile.png",
  "/wallpapers/scenic/cars-ivory-red-racing-poster/mobile.png",
  "/wallpapers/scenic/cars-supra-smoke-red/mobile.png",
  "/wallpapers/scenic/cars-supra-orange-editorial/mobile.png",
  "/wallpapers/scenic/cars-manga-drift-lineup/mobile.png",
  "/wallpapers/scenic/cars-skyline-blueprint-stripes/mobile.png",
  "/wallpapers/scenic/cars-formula-one-crimson-ink/mobile.png",
  "/wallpapers/scenic/cars-gtr-snoopy-wing/mobile.png",
  "/wallpapers/scenic/cars-supra-warm-garage/mobile.png"
]);
const minimalTemplates = [...fruitTemplates, ...carTemplates.filter(template => approved.has(template.image))];
if (fruitTemplates.length !== 37 || minimalTemplates.length !== 60) throw new Error('Expected 37 Fruits and 23 Cars designs.');
const root=fileURLToPath(new URL('..',import.meta.url));
for(const file of ['.env.local','.env'])if(existsSync(resolve(root,file)))process.loadEnvFile(resolve(root,file));
if(!cloudConfigured(process.env))throw new Error('Cloudinary is not configured.');
const store=createCatalogStore(process.env),catalog=await store.read(true);
if(catalog.revision==='seed')throw new Error('Refusing to replace an uninitialized catalog.');
const existing=new Set(catalog.templates.map(t=>t.id)),publishedAt=new Date().toISOString();
const onlyIndex=process.argv.indexOf('--only');
const onlyIds=onlyIndex<0?null:(process.argv[onlyIndex+1]||'').split(',');
if(onlyIds&&onlyIds.some(id=>!minimalTemplates.some(t=>t.id===id)))throw new Error('Unknown Fruits/Cars design ID.');
const additions=minimalTemplates.filter(t=>(!onlyIds||onlyIds.includes(t.id))&&!existing.has(t.id)).map(t=>{
 const deviceImages=Object.fromEntries(Object.entries(t.deviceImages).map(([device,path])=>{
  const asset=manifest[path];
  if(!asset?.url||asset.cloud!==process.env.CLOUDINARY_CLOUD_NAME)throw new Error(`Upload missing for ${path}.`);
  return [device,asset.url];
 }));
 return templateSchema.parse(withTemplateKeywords({...t,image:deviceImages.mobile,deviceImages,status:'published',publishedAt}));
});
console.log(`Catalog revision: ${catalog.revision}; ${additions.length} Fruits/Cars additions, ${catalog.templates.length} existing records preserved.`);
if(process.argv.includes('--publish')&&additions.length){
 const index=process.argv.indexOf('--expect-revision');
 if(index<0||process.argv[index+1]!==catalog.revision)throw new Error('Pass the reviewed revision with --expect-revision.');
 const fresh=await store.read(true);if(!isDeepStrictEqual(fresh,catalog))throw new Error('Catalog changed; review again.');
 for(const category of catalog.categories||[])if(!galleryCategories.some(c=>c.id===category.id))galleryCategories.push(category);
 const proposed={...catalog,templates:[...additions,...catalog.templates]};
 const { mkdir, writeFile } = await import('node:fs/promises');
 await mkdir(resolve(root, 'output/fruit-car-review'), { recursive: true });
 await writeFile(resolve(root, 'output/fruit-car-review/catalog-before-publication.json'), JSON.stringify(catalog, null, 2));
 await store.write(proposed);
 const saved=await store.read(true);if(!isDeepStrictEqual(saved.templates,proposed.templates))throw new Error('Post-publication verification failed.');
 console.log(`Published ${additions.length} Fruits/Cars designs; existing records and dates unchanged.`);
}
