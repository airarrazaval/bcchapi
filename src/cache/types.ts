/**
 * A minimal cache interface for storing and retrieving API responses.
 *
 * Implement this interface to plug in any caching backend (in-memory, Redis,
 * SQLite, etc.) into {@link https://github.com/airarrazaval/bcchapi | Client}.
 *
 * @example
 * ```ts
 * import type { Cache } from 'bcchapi/cache';
 * import { createClient } from 'redis';
 *
 * const redis = await createClient().connect();
 *
 * const redisCache: Cache = {
 *   get: async (key) => {
 *     const raw = await redis.get(key);
 *     return raw === null ? undefined : JSON.parse(raw);
 *   },
 *   set: async (key, value, ttlMs) => {
 *     const opts = ttlMs !== undefined ? { PX: ttlMs } : {};
 *     await redis.set(key, JSON.stringify(value), opts);
 *   },
 * };
 * ```
 */
export interface Cache {
  /**
   * Returns the cached value for `key`, or `undefined` on a miss.
   *
   * @param key - Cache key.
   * @returns The stored value, or `undefined` if the key is absent or expired.
   */
  get(key: string): unknown;

  /**
   * Stores `value` under `key` with an optional time-to-live.
   *
   * @param key - Cache key.
   * @param value - Value to store.
   * @param ttlMs - Optional time-to-live in milliseconds. Implementations may
   *   ignore this if TTL is managed externally (e.g. Redis `EXPIRE`).
   */
  set(key: string, value: unknown, ttlMs?: number): void;
}
