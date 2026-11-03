import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractPathValue } from '../src/index.js';

test('extracts a simple nested value', () => {
  const root = { a: { b: { c: 42 } } };
  const result = extractPathValue('a.b.c', root);
  assert.deepEqual(result, { value: 42, exists: true });
});

test('extracts an array element by index', () => {
  const root = { items: [{ name: 'first' }, { name: 'second' }] };
  const result = extractPathValue('items[1].name', root);
  assert.deepEqual(result, { value: 'second', exists: true });
});

test('extracts a value from a root array', () => {
  const root = [10, 20, 30];
  const result = extractPathValue('[2]', root);
  assert.deepEqual(result, { value: 30, exists: true });
});

test('returns exists false for a missing property', () => {
  const root = { a: { b: 1 } };
  const result = extractPathValue('a.c', root);
  assert.deepEqual(result, { value: undefined, exists: false });
});

test('returns exists false for an out-of-bounds index', () => {
  const root = { items: [1, 2] };
  const result = extractPathValue('items[5]', root);
  assert.deepEqual(result, { value: undefined, exists: false });
});

test('returns exists false when an intermediate value is null', () => {
  const root = { a: null };
  const result = extractPathValue('a.b', root);
  assert.deepEqual(result, { value: undefined, exists: false });
});

test('returns exists false when an intermediate value is undefined', () => {
  const root = { a: undefined };
  const result = extractPathValue('a.b', root);
  assert.deepEqual(result, { value: undefined, exists: false });
});

test('returns exists false for an empty path', () => {
  const root = { a: 1 };
  const result = extractPathValue('', root);
  assert.deepEqual(result, { value: undefined, exists: false });
});

test('handles bracket notation on an object property', () => {
  const root = { a: { b: 7 } };
  const result = extractPathValue('a[b]', root);
  // Bracket notation without a dot is treated as a single key "b" on the object.
  assert.deepEqual(result, { value: 7, exists: true });
});

test('handles a path with adjacent brackets', () => {
  const root = { a: [[1, 2], [3, 4]] };
  const result = extractPathValue('a[1][0]', root);
  assert.deepEqual(result, { value: 3, exists: true });
});

test('handles a path with a trailing dot', () => {
  const root = { a: { b: 1 } };
  const result = extractPathValue('a.b.', root);
  // Trailing dot is ignored; the path resolves to a.b.
  assert.deepEqual(result, { value: 1, exists: true });
});

test('handles a path with a leading dot', () => {
  const root = { a: 1 };
  const result = extractPathValue('.a', root);
  // Leading dot is ignored; the path resolves to a.
  assert.deepEqual(result, { value: 1, exists: true });
});

test('returns exists false when traversing a primitive', () => {
  const root = { a: 5 };
  const result = extractPathValue('a.b', root);
  assert.deepEqual(result, { value: undefined, exists: false });
});

test('returns exists false when root is null', () => {
  const result = extractPathValue('a', null);
  assert.deepEqual(result, { value: undefined, exists: false });
});

test('returns exists false when root is undefined', () => {
  const result = extractPathValue('a', undefined);
  assert.deepEqual(result, { value: undefined, exists: false });
});

test('returns exists true for a property with value undefined', () => {
  const root = { a: undefined };
  const result = extractPathValue('a', root);
  assert.deepEqual(result, { value: undefined, exists: true });
});

test('returns exists true for a property with value null', () => {
  const root = { a: null };
  const result = extractPathValue('a', root);
  assert.deepEqual(result, { value: null, exists: true });
});
