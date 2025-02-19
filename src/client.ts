import * as assert from 'node:assert/strict';
import { GetSeriesResponse, SearchSeriesResponse, ApiResponse } from './types';
import { handleGetSeriesResponse, handleSearchSeriesResponse } from './handlers';
import { isValidDate } from './utils';

export interface ClientConfig {
  /**
   * Client username (registered email).
   */
  user: string;
  /**
   * Client password.
   */
  pass: string;
}

export enum Frequency {
  Daily = 'DAILY',
  Monthly = 'MONTHLY',
  Quarterly = 'QUARTERLY',
  Annual = 'ANNUAL',
}

export class Client {
  static apiURL = 'https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx';

  private username: string;
  private password: string;

  constructor(config: ClientConfig) {
    this.username = config.user;
    this.password = config.pass;
  }

  async request<T extends ApiResponse>(query: Record<string, string>): Promise<T> {
    const queryString = new URLSearchParams({
      user: this.username,
      pass: this.password,
      ...query,
    }).toString();

    return (await fetch(`${Client.apiURL}?${queryString}`)).json() as Promise<T>;
  }

  /**
   * Fetches the list of observed values for a given series.
   */
  async getSeries(params: {
    /**
     * Series identifier.
     */
    series: string;
    /**
     * First date of the range to fetch.
     */
    since?: string | Date;
    /**
     * Last date of the range to fetch.
     */
    until?: string | Date;
  }): Promise<GetSeriesResponse> {
    const { series, since, until } = params;

    assert.ok(series && typeof series === 'string', 'series must be a non-empty string');

    const query: Record<string, string> = {
      timeseries: series,
      function: 'GetSeries',
    };

    if (since) {
      assert.ok(isValidDate(since), '"since" is not a valid date string or Date object');
      query.firstdate = typeof since === 'string' ? since : since.toISOString().slice(0, 10);
    }

    if (until) {
      assert.ok(isValidDate(until), '"until" is not a valid date string or Date object');
      query.lastdate = typeof until === 'string' ? until : until.toISOString().slice(0, 10);
    }

    if (query.firstdate && query.lastdate) {
      assert.ok(query.firstdate <= query.lastdate, 'invalid date range');
    }

    return this.request(query).then(handleGetSeriesResponse);
  }

  /**
   * Fetches the list of available series by frequency and their metadata.
   */
  async searchSeries(params: {
    /**
     * Frequency for which you want to consult the catalog of available series.
     */
    frequency: Frequency;
  }): Promise<SearchSeriesResponse> {
    const { frequency } = params;

    assert.ok(frequency && typeof frequency === 'string', 'frequency must be a non-empty string');

    const query: Record<string, string> = {
      frequency,
      function: 'SearchSeries',
    };

    return this.request(query).then(handleSearchSeriesResponse);
  }
}
