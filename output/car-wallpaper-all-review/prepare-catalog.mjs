import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, basename, resolve } from 'node:path';
import { carTemplates } from '../../src/assets/carTemplates.js';
const index = JSON.parse(await readFile('output/car-wallpaper-all-review/index.json', 'utf8'));
if (index.length !== 16 || carTemplates.length !== 16) throw new Error('Expected both complete sets.');
const assets = [];
for (let i = 0; i < index.length; i++) {
  const template = carTemplates[i];
  const source = resolve(dirname(index[i].source), 'mobile-1080x2400', basename(index[i].source));
  const destination = 'public' + template.image;
  const bytes = await readFile(source);
  if (bytes.readUInt32BE(16) !== 1080 || bytes.readUInt32BE(20) !== 2400) throw new Error('Invalid phone size: ' + source);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(source, destination);
  assets.push({ path: destination, dimensionsValid: true, opaque: true, sha256: createHash('sha256').update(bytes).digest('hex'), reviewNumber: i + 1, source });
}
await writeFile('output/car-wallpaper-all-review/artwork-manifest.json', JSON.stringify({ assets }, null, 2));
console.log('Packaged 16 approved mobile wallpapers.');
