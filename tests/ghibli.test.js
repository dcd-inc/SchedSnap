import test from 'node:test';
import assert from 'node:assert/strict';
import { ghibliTemplates } from '../src/assets/ghibliTemplates.js';
import { templateSchema } from '../shared/templateSchema.js';
import { matchesGalleryCategory } from '../src/config/collections.js';
import manifest from '../src/assets/cloudinaryManifest.js';




test('ten available Ghibli designs have unique templates and three uploaded device compositions each', () => {
  assert.equal(ghibliTemplates.length,10);
  assert.equal(new Set(ghibliTemplates.map(t=>t.id)).size,10);
  const paths=[];
  for(const t of ghibliTemplates){
    const template=templateSchema.parse({...t,status:'published'});
    assert.equal(matchesGalleryCategory(template,'ghibli'),true);
    assert.equal(matchesGalleryCategory(template,'scenic'),false);
    assert.equal(template.image,template.deviceImages.mobile);
    for(const [device,[width,height]]of Object.entries({mobile:[1080,2400],tablet:[1600,2560],laptop:[1920,1080]})){
      const path=template.deviceImages[device],asset=manifest[path];
      paths.push(path);assert.ok(asset,`Uploaded artwork missing: ${path}`);
      assert.equal(asset.width,width);assert.equal(asset.height,height);
      assert.equal(templateSchema.safeParse({...template,image:manifest[template.image].url,deviceImages:Object.fromEntries(Object.entries(template.deviceImages).map(([d,p])=>[d,manifest[p].url]))}).success,true);
    }
  }
  assert.equal(new Set(paths).size,30);
});
