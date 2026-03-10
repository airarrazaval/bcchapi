import { ApiError, HttpError } from './errors.js';
import type {
  Cache,
  ClientOptions,
  Frequency,
  GetSeriesOptions,
  Observation,
  SeriesData,
  SeriesInfo,
} from './types.js';

const API_URL = 'https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx';

// Raw shapes returned by the wire — not part of the public API.
interface RawObservation {
  indexDateString: string;
  value: string;
  statusCode: string;
}

interface RawGetSeriesResponse {
  Codigo: number;
  Descripcion: string;
  Series: {
    descripEsp: string;
    descripIng: string;
    seriesId: string;
    Obs: RawObservation[];
  } | null;
  SeriesInfos: null;
}

interface RawSeriesInfo {
  seriesId: string;
  frequencyCode: string;
  spanishTitle: string;
  englishTitle: string;
  firstObservation: string;
  lastObservation: string;
  updatedAt: string;
  createdAt: string;
}

interface RawSearchSeriesResponse {
  Codigo: number;
  Descripcion: string;
  Series: null;
  SeriesInfos: RawSeriesInfo[] | null;
}

/**
 * HTTP client for the Banco Central de Chile REST API.
 *
 * @example
 * ```ts
 * import { Client } from 'bcch/client';
 *
 * const client = new Client({ user: 'me@example.com', pass: 'secret' });
 * const data = await client.getSeries('F022.TPM.TIN.D001.NO.Z.D', {
 *   firstdate: '2024-01-01',
 * });
 * console.log(data.observations);
 * ```
 */
export class Client {
  private readonly user: string;
  private readonly pass: string;
  private readonly fetch: typeof globalThis.fetch;
  private readonly cache: Cache | undefined;
  private readonly cacheTtlMs: number | undefined;

  constructor(options: ClientOptions) {
    this.user = options.user;
    this.pass = options.pass;
    this.fetch = options.fetch ?? globalThis.fetch;
    this.cache = options.cache;
    this.cacheTtlMs = options.cacheTtlMs;
  }

  /**
   * Fetches observations for a single time series.
   *
   * @param seriesId - BCCH series identifier (e.g. `'F022.TPM.TIN.D001.NO.Z.D'`).
   *   Values from the `SERIES` constants in `bcch/series` are accepted directly.
   * @param options - Optional date range filter.
   * @returns Parsed series data including all observations in the requested range.
   * @throws {ApiError} When the API returns a non-zero `Codigo`.
   * @throws {HttpError} When the API returns a non-ok HTTP status.
   * @throws {Error} When a network failure occurs; original error is set as `cause`.
   *
   * @example
   * ```ts
   * const data = await client.getSeries('F073.UFF.PRE.Z.D', {
   *   firstdate: '2024-01-01',
   *   lastdate: '2024-12-31',
   * });
   * ```
   */
  async getSeries(seriesId: string, options?: GetSeriesOptions): Promise<SeriesData> {
    const cacheKey = `getSeries:${seriesId}:${options?.firstdate ?? ''}:${options?.lastdate ?? ''}`;

    if (this.cache !== undefined) {
      const cached = this.cache.get(cacheKey);
      if (cached !== undefined) {
        return cached as SeriesData;
      }
    }

    const params = this.baseParams();
    params.set('function', 'GetSeries');
    params.set('timeseries', seriesId);
    if (options?.firstdate !== undefined) {
      params.set('firstdate', options.firstdate);
    }
    if (options?.lastdate !== undefined) {
      params.set('lastdate', options.lastdate);
    }

    const raw = await this.request<RawGetSeriesResponse>(params);

    if (raw.Codigo !== 0 || raw.Series === null) {
      throw new ApiError(`BCCH API error: ${raw.Descripcion}`, raw.Codigo, raw.Descripcion);
    }

    const observations: Observation[] = raw.Series.Obs.map((obs) => ({
      indexDateString: obs.indexDateString,
      value: obs.value,
      statusCode: obs.statusCode,
    }));

    const result: SeriesData = {
      seriesId: raw.Series.seriesId,
      descripEsp: raw.Series.descripEsp,
      descripIng: raw.Series.descripIng,
      observations,
    };

    this.cache?.set(cacheKey, result, this.cacheTtlMs);
    return result;
  }

  /**
   * Searches for available series filtered by observation frequency.
   *
   * @param frequency - One of `'DAILY'`, `'MONTHLY'`, `'QUARTERLY'`, or `'ANNUAL'`.
   * @returns Array of series metadata matching the given frequency.
   * @throws {ApiError} When the API returns a non-zero `Codigo`.
   * @throws {HttpError} When the API returns a non-ok HTTP status.
   * @throws {Error} When a network failure occurs; original error is set as `cause`.
   *
   * @example
   * ```ts
   * const monthlySeries = await client.searchSeries('MONTHLY');
   * console.log(monthlySeries.map(s => s.englishTitle));
   * ```
   */
  async searchSeries(frequency: Frequency): Promise<SeriesInfo[]> {
    const cacheKey = `searchSeries:${frequency}`;

    if (this.cache !== undefined) {
      const cached = this.cache.get(cacheKey);
      if (cached !== undefined) {
        return cached as SeriesInfo[];
      }
    }

    const params = this.baseParams();
    params.set('function', 'SearchSeries');
    params.set('frequency', frequency);

    const raw = await this.request<RawSearchSeriesResponse>(params);

    if (raw.Codigo !== 0) {
      throw new ApiError(`BCCH API error: ${raw.Descripcion}`, raw.Codigo, raw.Descripcion);
    }

    const result: SeriesInfo[] = (raw.SeriesInfos ?? []).map((info) => ({
      seriesId: info.seriesId,
      frequencyCode: info.frequencyCode,
      spanishTitle: info.spanishTitle,
      englishTitle: info.englishTitle,
      firstObservation: info.firstObservation,
      lastObservation: info.lastObservation,
      updatedAt: info.updatedAt,
      createdAt: info.createdAt,
    }));

    this.cache?.set(cacheKey, result, this.cacheTtlMs);
    return result;
  }

  private baseParams(): URLSearchParams {
    const params = new URLSearchParams();
    params.set('user', this.user);
    params.set('pass', this.pass);
    return params;
  }

  private async request<T>(params: URLSearchParams): Promise<T> {
    const url = `${API_URL}?${params.toString()}`;
    let response: Response;

    try {
      response = await this.fetch(url);
    } catch (err) {
      throw new Error('BCCH request failed', { cause: err });
    }

    if (!response.ok) {
      throw new HttpError(`HTTP error ${response.status}`, response.status);
    }

    return response.json() as Promise<T>;
  }
}
