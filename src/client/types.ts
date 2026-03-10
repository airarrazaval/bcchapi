import type { Cache } from '../cache/types.js';

/**
 * Credentials and configuration for {@link Client}.
 */
export interface ClientOptions {
  /** BCCH account email. */
  user: string;

  /** BCCH account password. */
  pass: string;

  /**
   * HTTP client used for all requests.
   *
   * Defaults to the global `fetch`. Inject a custom implementation in tests
   * to avoid real network calls.
   *
   * @defaultValue `globalThis.fetch`
   */
  fetch?: typeof globalThis.fetch;

  /**
   * Optional cache backend for storing API responses.
   *
   * Any object implementing the {@link Cache} interface is accepted — use
   * `MemoryCache` from `bcchapi/cache` for a zero-config in-memory option,
   * or provide your own adapter (Redis, SQLite, etc.).
   *
   * When omitted, every call makes a fresh HTTP request.
   *
   * @example
   * ```ts
   * import { MemoryCache } from 'bcchapi/cache';
   * const client = new Client({ user, pass, cache: new MemoryCache() });
   * ```
   */
  cache?: Cache;

  /**
   * Time-to-live in milliseconds passed to `cache.set` on every successful
   * response. Applies to both `getSeries` and `searchSeries`.
   *
   * When omitted, `cache.set` is called without a TTL argument and expiry is
   * determined by the cache implementation.
   */
  cacheTtlMs?: number;
}

export type { Cache } from '../cache/types.js';

/**
 * A single observation returned by the BCCH API.
 *
 * Dates are in the wire format `"DD-MM-YYYY"` as returned by the API.
 * Values are raw numeric strings; an empty string indicates a data gap.
 * Use {@link https://github.com/airarrazaval/bcch | bcch/utils} to parse
 * and transform observations.
 */
export interface Observation {
  /** Observation date in `"DD-MM-YYYY"` format. */
  indexDateString: string;

  /**
   * Numeric value as a string.
   *
   * An empty string (`""`) indicates a gap in the series (no observation
   * for that date). Use `parseValue` from `bcch/utils` to convert to a
   * `number | null`.
   */
  value: string;

  /** Observation status code (e.g. `"OK"`, `"NO_OBS"`). */
  statusCode: string;
}

/**
 * Time series data returned by {@link Client.getSeries}.
 */
export interface SeriesData {
  /** BCCH series identifier. */
  seriesId: string;

  /** Series description in Spanish. */
  descripEsp: string;

  /** Series description in English. */
  descripIng: string;

  /** Ordered array of observations, earliest first. */
  observations: Observation[];
}

/**
 * Date range filter for {@link Client.getSeries}.
 */
export interface GetSeriesOptions {
  /**
   * Start date in `"YYYY-MM-DD"` format.
   *
   * Defaults to the earliest available observation when omitted.
   */
  firstdate?: string;

  /**
   * End date in `"YYYY-MM-DD"` format.
   *
   * Defaults to the most recent available observation when omitted.
   */
  lastdate?: string;
}

/**
 * Metadata for a single series returned by {@link Client.searchSeries}.
 */
export interface SeriesInfo {
  /** BCCH series identifier. */
  seriesId: string;

  /** Frequency code (e.g. `"DAILY"`, `"MONTHLY"`). */
  frequencyCode: string;

  /** Series title in Spanish. */
  spanishTitle: string;

  /** Series title in English. */
  englishTitle: string;

  /** Date of the first available observation in `"DD-MM-YYYY"` format. */
  firstObservation: string;

  /** Date of the last available observation in `"DD-MM-YYYY"` format. */
  lastObservation: string;

  /** Date the series was last updated in `"DD-MM-YYYY"` format. */
  updatedAt: string;

  /** Date the series was created in `"DD-MM-YYYY"` format. */
  createdAt: string;
}

/**
 * Observation frequency accepted by {@link Client.searchSeries}.
 */
export type Frequency = 'DAILY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
