import test from 'node:test';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { characterReferenceTemplates as characterTemplates } from '../src/assets/characterReferenceTemplates.js';
import { templateSchema } from '../shared/templateSchema.js';
import { matchesGalleryCategory } from '../src/config/collections.js';
import manifest from '../src/assets/cloudinaryManifest.js';




test('nine Domo and Adventure Time designs have unique templates and three uploaded device compositions each', () => {
  assert.equal(characterTemplates.length,9);
  assert.equal(new Set(characterTemplates.map(t=>t.id)).size,9);
  assert.ok(characterTemplates.every(t => t.id !== 'adventure-bmo'));
  const paths=[];
  const review=JSON.parse(readFileSync(new URL('../documentation/domo-adventure-assets.json', import.meta.url)));
  review.assets.push(...JSON.parse(readFileSync(new URL('../documentation/adventure-extra-assets.json',import.meta.url))).assets);
  assert.equal(review.assets.length,30);
  for(const t of characterTemplates){
    const template=templateSchema.parse({...t,status:'published'});
    assert.equal(matchesGalleryCategory(template,template.collection),true);
    assert.equal(matchesGalleryCategory(template,'scenic'),false);
    assert.equal(template.image,template.deviceImages.mobile);
    for(const [device,[width,height]]of Object.entries({mobile:[1080,2400],tablet:[1600,2560],laptop:[1920,1080]})){
      const path=template.deviceImages[device],asset=manifest[path];
      paths.push(path);assert.ok(asset,`Uploaded artwork missing: ${path}`);
      assert.equal(asset.width,width);assert.equal(asset.height,height);
      const inspected=review.assets.find(a=>a.path===`public${path}`);
      assert.ok(inspected?.opaque&&inspected.dimensionsValid&&inspected.visuallyReviewed);
      assert.equal(asset.publicId,`schedsnap${path.slice(0,-4)}-${inspected.sha256.slice(0,16)}`);
      assert.equal(templateSchema.safeParse({...template,image:manifest[template.image].url,deviceImages:Object.fromEntries(Object.entries(template.deviceImages).map(([d,p])=>[d,manifest[p].url]))}).success,true);
    }
  }
  assert.equal(new Set(paths).size,27);
});
