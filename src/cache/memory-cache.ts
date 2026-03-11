import type { Cache } from './types.js';

interface Entry {
  value: unknown;
  expiresAt: number | null;
}

/**
 * Options for {@link MemoryCache}.
 */
export interface MemoryCacheOptions {
  /**
   * Default time-to-live in milliseconds applied to every `set` call that
   * does not provide its own `ttlMs`.
   *
   * When omitted, entries never expire unless a per-entry `ttlMs` is passed
   * to `set`.
   *
   * @defaultValue `undefined` (no expiry)
   */
  defaultTtlMs?: number;
}

/**
 * In-memory {@link Cache} implementation backed by a `Map`.
 *
 * Expired entries are evicted lazily on `get` — no background timers are
 * created. Suitable for single-process use; does not persist across restarts.
 *
 * @example
 * ```ts
 * import { Client } from 'bcchapi/client';
 * import { MemoryCache } from 'bcchapi/cache';
 *
 * const client = new Client({
 *   user: 'me@example.com',
 *   pass: 'secret',
 *   cache: new MemoryCache({ defaultTtlMs: 60 * 60 * 1000 }), // 1 hour
 * });
 * ```
 */
export class MemoryCache implements Cache {
  private readonly store = new Map<string, Entry>();
  private readonly defaultTtlMs: number | undefined;

  constructor(options?: MemoryCacheOptions) {
    this.defaultTtlMs = options?.defaultTtlMs;
  }

  get(key: string): unknown {
    const entry = this.store.get(key);
    if (entry === undefined) {
      return undefined;
    }
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: unknown, ttlMs?: number): void {
    const effectiveTtl = ttlMs ?? this.defaultTtlMs;
    const expiresAt = effectiveTtl !== undefined ? Date.now() + effectiveTtl : null;
    this.store.set(key, { value, expiresAt });
  }

  clear(): void {
    this.store.clear();
  }
}
