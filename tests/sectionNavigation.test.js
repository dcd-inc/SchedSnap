import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
const effect = source.slice(source.indexOf('  useEffect(() => {'), source.indexOf('  return (<CatalogProvider>'));

test('section navigation scrolls and focuses each homepage destination', () => {
  for (const id of ['how-it-works', 'collections', 'faq', 'designs', 'main']) {
    let scrolled = false, focused = false;
    runInNewContext(effect, {
      pathname: '/', hash: `#${id}`, useEffect: fn => fn(),
      document: { getElementById: value => {
        assert.equal(value, id);
        return { scrollIntoView() { scrolled = true; }, setAttribute() {}, focus() { focused = true; } };
      } },
      window: { scrollTo() { assert.fail('A valid section must not fall back to the top'); } },
    });
    assert.ok(scrolled && focused, id);
  }
});

test('plain Home and missing sections fall back to the top', () => {
  for (const hash of ['', '#missing']) {
    let scrolled = false;
    runInNewContext(effect, {
      pathname: '/', hash, useEffect: fn => fn(),
      document: { getElementById: () => null },
      window: { scrollTo() { scrolled = true; } },
    });
    assert.ok(scrolled);
  }
});
