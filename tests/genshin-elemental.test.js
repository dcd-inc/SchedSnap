import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import cloudinaryManifest from '../src/assets/cloudinaryManifest.js';
import { genshinElementalTemplates } from '../src/assets/genshinElementalTemplates.js';
import { templateSchema } from '../shared/templateSchema.js';
import { galleryPreviewTemplate } from '../src/utils/wallpaperTheme.js';

test('eight elemental previews have exact device assets and retain lower schedule placement', () => {
  assert.equal(genshinElementalTemplates.length, 8);
  for (const template of genshinElementalTemplates) {
    templateSchema.parse(template);
    assert.equal(galleryPreviewTemplate(template).verticalPosition, 100);
    for (const [device, size] of Object.entries({ mobile: [1080, 2400], tablet: [1600, 2560], laptop: [1920, 1080] })) {
      const asset = cloudinaryManifest[template.deviceImages[device]];
      assert.match(asset.url, /^https:\/\/res\.cloudinary\.com\/.+\.png$/);
      assert.deepEqual([asset.width, asset.height], size);
      const local = new URL(`../public${template.deviceImages[device]}`, import.meta.url);
      if (!existsSync(local)) continue;
      const bytes = readFileSync(local);
      assert.deepEqual([bytes.readUInt32BE(16), bytes.readUInt32BE(20)], size);
    }
  }
});
