import test from 'node:test';
import assert from 'node:assert/strict';
import { classSuggestions } from '../src/utils/classSuggestions.js';
test('suggestions require typed matches and ignore blanks, duplicates and exact values', () => {
  const values = ['Mathematics', ' mathematics ', 'Math lab', null, '', 'English'];
  assert.deepEqual(classSuggestions(values, ''), []);
  assert.deepEqual(classSuggestions(values, ' MATH '), ['Mathematics', 'Math lab']);
  assert.deepEqual(classSuggestions(values, 'mathematics'), []);
  assert.deepEqual(classSuggestions(values, 'Science'), []);
});
test('suggestions are limited to five existing values', () => {
  assert.equal(classSuggestions(Array.from({ length: 9 }, (_, i) => `Room ${i}`), 'room').length, 5);
});

test('matches word starts rather than arbitrary letters within names', () => {
  const values = ['Introduction to Computing', 'Applied Physics', 'Purposeful Writing'];
  assert.deepEqual(classSuggestions(values, 'p'), ['Applied Physics', 'Purposeful Writing']);
  assert.deepEqual(classSuggestions(values, 'com'), ['Introduction to Computing']);
  assert.deepEqual(classSuggestions(values, 'put'), []);
});
