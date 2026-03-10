import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { MemoryCache } from '../../src/cache/index.ts';
import type { Cache } from '../../src/cache/index.ts';

describe('Cache interface', () => {
  it('MemoryCache satisfies the Cache interface', () => {
    const cache: Cache = new MemoryCache();
    assert.ok(typeof cache.get === 'function');
    assert.ok(typeof cache.set === 'function');
  });
});

describe('MemoryCache', () => {
  describe('get / set', () => {
    it('returns undefined for a missing key', () => {
      const cache = new MemoryCache();
      assert.equal(cache.get('missing'), undefined);
    });

    it('returns the stored value for a known key', () => {
      const cache = new MemoryCache();
      cache.set('key', 'value');
      assert.equal(cache.get('key'), 'value');
    });

    it('stores and retrieves objects', () => {
      const cache = new MemoryCache();
      const obj = { seriesId: 'F073.UFF.PRE.Z.D', observations: [] };
      cache.set('key', obj);
      assert.deepEqual(cache.get('key'), obj);
    });

    it('overwrites an existing entry', () => {
      const cache = new MemoryCache();
      cache.set('key', 'first');
      cache.set('key', 'second');
      assert.equal(cache.get('key'), 'second');
    });

    it('stores multiple keys independently', () => {
      const cache = new MemoryCache();
      cache.set('a', 1);
      cache.set('b', 2);
      assert.equal(cache.get('a'), 1);
      assert.equal(cache.get('b'), 2);
    });
  });

  describe('TTL — per-entry', () => {
    it('returns the value before TTL expires', () => {
      const cache = new MemoryCache();
      cache.set('key', 'value', 60_000);
      assert.equal(cache.get('key'), 'value');
    });

    it('returns undefined after per-entry TTL expires', async () => {
      const cache = new MemoryCache();
      cache.set('key', 'value', 10);
      await new Promise((resolve) => setTimeout(resolve, 20));
      assert.equal(cache.get('key'), undefined);
    });

    it('evicts expired entry lazily on get', async () => {
      const cache = new MemoryCache();
      cache.set('key', 'value', 10);
      await new Promise((resolve) => setTimeout(resolve, 20));
      // First get evicts
      assert.equal(cache.get('key'), undefined);
      // Second get still returns undefined (not re-stored)
      assert.equal(cache.get('key'), undefined);
    });
  });

  describe('TTL — defaultTtlMs', () => {
    it('applies defaultTtlMs when no per-entry TTL is given', async () => {
      const cache = new MemoryCache({ defaultTtlMs: 10 });
      cache.set('key', 'value');
      await new Promise((resolve) => setTimeout(resolve, 20));
      assert.equal(cache.get('key'), undefined);
    });

    it('per-entry ttlMs overrides defaultTtlMs', async () => {
      const cache = new MemoryCache({ defaultTtlMs: 10 });
      cache.set('key', 'value', 60_000);
      await new Promise((resolve) => setTimeout(resolve, 20));
      assert.equal(cache.get('key'), 'value');
    });

    it('entries never expire when no TTL is configured', () => {
      const cache = new MemoryCache();
      cache.set('key', 'value');
      assert.equal(cache.get('key'), 'value');
    });
  });
});
