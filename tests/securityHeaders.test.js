import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Vercel applies the three security headers to every route', async () => {
  const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  const global = config.headers.find(rule => rule.source === '/(.*)');
  assert.ok(global, 'Security headers must cover pages, assets, and API routes');
  const headers = Object.fromEntries(global.headers.map(({ key, value }) => [key, value]));
  assert.equal(headers['X-Content-Type-Options'], 'nosniff');
  assert.equal(headers['X-Frame-Options'], 'SAMEORIGIN');
  const directives = Object.fromEntries(headers['Content-Security-Policy'].split(';').map(part => {
    const [name, ...values] = part.trim().split(/\s+/);
    return [name, values.join(' ')];
  }));
  assert.equal(directives['base-uri'], "'self'");
  assert.equal(directives['object-src'], "'none'");
  assert.equal(directives['frame-ancestors'], "'self'");
  // Keep existing scripts, styles, images, API calls, and analytics embeds unrestricted.
  for (const name of ['default-src', 'script-src', 'style-src', 'img-src', 'connect-src', 'frame-src', 'worker-src']) {
    assert.equal(directives[name], undefined);
  }
});
