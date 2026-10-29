/* global console */
import process from 'node:process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { carTemplates } from '../src/assets/carTemplates.js';
import { galleryCategories } from '../src/config/collections.js';
import manifest from '../src/assets/cloudinaryManifest.js';
import { createCatalogStore, cloudConfigured } from '../server/catalogStore.js';
import { templateSchema } from '../shared/templateSchema.js';
import { withTemplateKeywords } from '../shared/templateKeywords.js';
const minimalTemplates = carTemplates;
const root=fileURLToPath(new URL('..',import.meta.url));
for(const file of ['.env.local','.env'])if(existsSync(resolve(root,file)))process.loadEnvFile(resolve(root,file));
if(!cloudConfigured(process.env))throw new Error('Cloudinary is not configured.');
const store=createCatalogStore(process.env),catalog=await store.read(true);
const existing=new Set(catalog.templates.map(t=>t.id)),publishedAt=new Date().toISOString();
const onlyIndex=process.argv.indexOf('--only');
const onlyIds=onlyIndex<0?null:(process.argv[onlyIndex+1]||'').split(',');
if(onlyIds&&onlyIds.some(id=>!minimalTemplates.some(t=>t.id===id)))throw new Error('Unknown Cars design ID.');
const additions=minimalTemplates.filter(t=>(!onlyIds||onlyIds.includes(t.id))&&!existing.has(t.id)).map(t=>{
 const deviceImages=Object.fromEntries(Object.entries(t.deviceImages).map(([device,path])=>{
  const asset=manifest[path];
  if(!asset?.url||asset.cloud!==process.env.CLOUDINARY_CLOUD_NAME||asset.width!==1080||asset.height!==2400)throw new Error(`Verified mobile upload missing for ${path}.`);
  return [device,asset.url];
 }));
 return templateSchema.parse(withTemplateKeywords({...t,image:deviceImages.mobile,deviceImages,status:'published',publishedAt}));
});
console.log(`Catalog revision: ${catalog.revision}; ${additions.length} Cars additions, ${catalog.templates.length} existing records preserved.`);
if(process.argv.includes('--publish')&&additions.length){
 const index=process.argv.indexOf('--expect-revision');
 if(index<0||process.argv[index+1]!==catalog.revision)throw new Error('Pass the reviewed revision with --expect-revision.');
 const fresh=await store.read(true);if(!isDeepStrictEqual(fresh,catalog))throw new Error('Catalog changed; review again.');
 for(const category of catalog.categories||[])if(!galleryCategories.some(c=>c.id===category.id))galleryCategories.push(category);
 const proposed={...catalog,templates:[...additions,...catalog.templates]};
 const { mkdir, writeFile } = await import('node:fs/promises');
 await mkdir(resolve(root, 'output/car-wallpaper-all-review'), { recursive: true });
 await writeFile(resolve(root, 'output/car-wallpaper-all-review/catalog-before-publication.json'), JSON.stringify(catalog, null, 2));
 await store.write(proposed);
 const saved=await store.read(true);if(!isDeepStrictEqual(saved.templates,proposed.templates))throw new Error('Post-publication verification failed.');
 console.log(`Published ${additions.length} Cars designs; existing records and dates unchanged.`);
}
if(!additions.length){
 const cars=catalog.templates.filter(t=>carTemplates.some(definition=>definition.id===t.id));
 if(cars.length!==carTemplates.length||!catalog.categories?.some(c=>c.id==='cars'))throw new Error('Cars catalog verification failed.');
 for(const car of cars){
  templateSchema.parse(car);
  if(car.status!=='published'||car.collection!=='cars'||!car.mobileOnly||!car.keywords?.includes('automotive'))throw new Error(`Incomplete published Cars record: ${car.id}`);
 }
 console.log(`Verified all ${carTemplates.length} published Cars records, keywords and Cars category.`);
}
