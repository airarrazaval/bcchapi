import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { hello } from '../src/index.ts';

describe('hello', () => {
  it('returns a greeting containing the given name', () => {
    assert.equal(hello('World'), 'Hello, World!');
  });

  it('returns a greeting with the exact format "Hello, <name>!"', () => {
    assert.equal(hello('Node'), 'Hello, Node!');
  });

  it('returns a greeting when name is an empty string', () => {
    assert.equal(hello(''), 'Hello, !');
  });
});
