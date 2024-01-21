import * as querystring from 'node:querystring';
import * as assert from 'node:assert/strict';
import {
  GetSeriesResponse,
  SearchSeriesResponse,
  Frequency,
  parseGetSeriesResponse,
  parseSearchSeriesResponse,
  ApiResponse,
} from './response';
import { isValidDate } from './helpers';

export type ClientConfig = {
  /**
   * Client username (registered email).
   */
  user: string;
  /**
   * Client password.
   */
  pass: string;
};

export type GetSeriesInput = {
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
};

export type SearchSeriesInput = {
  /**
   * Frequency for which you want to consult the catalog of available series.
   */
  frequency: Frequency;
};

export class Client {
  static apiURL = 'https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx';
  private username: string;
  private password: string;

  constructor(config: ClientConfig) {
    this.username = config.user;
    this.password = config.pass;
  }

  async request(params: Record<string, string>): Promise<ApiResponse> {
    const query = querystring.stringify({
      user: this.username,
      pass: this.password,
      ...params,
    });

    return (await fetch(`${Client.apiURL}?${query}`)).json() as Promise<ApiResponse>;
  }

  /**
   * Fetches the list of observed values for a given series.
   */
  async getSeries(input: GetSeriesInput): Promise<GetSeriesResponse> {
    const { series, since, until } = input;

    assert.ok(series && typeof series === 'string', 'series must be a non-empty string');

    const params: Record<string, string> = {
      timeseries: series,
      function: 'GetSeries',
    };

    if (since) {
      assert.ok(isValidDate(since), '"since" is not a valid date string or Date object');
      params.firstdate = typeof since === 'string' ? since : since.toISOString().slice(0, 10);
    }

    if (until) {
      assert.ok(isValidDate(until), '"until" is not a valid date string or Date object');
      params.lastdate = typeof until === 'string' ? until : until.toISOString().slice(0, 10);
    }

    if (params.firstdate && params.lastdate) {
      assert.ok(params.firstdate <= params.lastdate, 'invalid date range');
    }

    return this.request(params).then(parseGetSeriesResponse);
  }

  /**
   * Fetches the list of available series by frequency and their metadata.
   */
  async searchSeries(input: SearchSeriesInput): Promise<SearchSeriesResponse> {
    const { frequency } = input;
  
    assert.ok(frequency && typeof frequency === 'string', 'frequency must be a non-empty string');
    
    const params: Record<string, string> = {
      frequency,
      function: 'SearchSeries',
    };

    return this.request(params).then(parseSearchSeriesResponse);
  }
}