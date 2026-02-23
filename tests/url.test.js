import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeUrl } from '../lib/url-normalize.js';

test('normalizes bare domain to https', () => {
  assert.equal(normalizeUrl('example.com'), 'https://example.com/');
});

test('blocks localhost', () => {
  assert.throws(() => normalizeUrl('http://localhost:3000'));
});
