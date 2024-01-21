import { describe, it, expect } from 'vitest';
import * as Errors from '../src/errors';
import {
  ApiResponse,
  parseGetSeriesResponse,
  parseSearchSeriesResponse,
} from '../src/response';
import fixtures from './fixtures';

describe('parseGetSeriesResponse', () => {
  it('should parse correctly a valid response', () => {
    const parsed = parseGetSeriesResponse(fixtures.response.getSeriesSuccess as unknown as ApiResponse);

    expect(parsed).toBeDefined();
    expect(parsed.seriesId).toBe(fixtures.response.getSeriesSuccess.Series.seriesId);
    expect(parsed.description).toBe(fixtures.response.getSeriesSuccess.Series.descripIng);
    expect(parsed.data).toHaveLength(fixtures.response.getSeriesSuccess.Series.Obs.length);
    
    for (let i = 0; i < parsed.data.length; i += 1) {
      expect(parsed.data[i].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(parsed.data[i].value.toFixed(2)).toBe(fixtures.response.getSeriesSuccess.Series.Obs[i].value);

      if (Number.isNaN(parsed.data[i].value)) {
        expect(fixtures.response.getSeriesSuccess.Series.Obs[i].statusCode).toBe('ND');
      }
    }
  });

  it('should throw an InvalidCredentialsError if the response code is -5', () => {
    expect(() => parseGetSeriesResponse(fixtures.response.credentialsInvalid as unknown as ApiResponse)).toThrow(Errors.InvalidCredentialsError);
  });

  it('should throw an InvalidSeriesError if the response code is -50', () => {
    expect(() => parseGetSeriesResponse(fixtures.response.getSeriesInvalid as unknown as ApiResponse)).toThrow(Errors.InvalidSeriesError);
  });

  it('should throw a ResponseError if the response code is unknown', () => {
    expect(() => parseGetSeriesResponse({} as ApiResponse)).toThrow(Errors.WebServiceError);
  });
});

describe('parseSearchSeriesResponse', () => {
  it('should parse correctly a valid response', () => {
    const parsed = parseSearchSeriesResponse(fixtures.response.searchSeriesSuccess as unknown as ApiResponse);

    expect(parsed).toBeInstanceOf(Array);
    expect(parsed).toHaveLength(fixtures.response.searchSeriesSuccess.SeriesInfos.length);

    for (let i = 0; i < parsed.length; i += 1) {
      expect(parsed[i].seriesId).toBe(fixtures.response.searchSeriesSuccess.SeriesInfos[i].seriesId);
      expect(parsed[i].frequency).toBe(fixtures.response.searchSeriesSuccess.SeriesInfos[i].frequencyCode);
      expect(parsed[i].title).toBe(fixtures.response.searchSeriesSuccess.SeriesInfos[i].englishTitle);
      expect(parsed[i].firstObservedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(parsed[i].lastObservedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(parsed[i].updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(parsed[i].createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('should throw an InvalidCredentialsError if the response code is -5', () => {
    expect(() => parseSearchSeriesResponse(fixtures.response.credentialsInvalid as unknown as ApiResponse)).toThrow(Errors.InvalidCredentialsError);
  });

  it('should throw an InvalidFrequencyError if the response code is -1', () => {
    expect(() => parseSearchSeriesResponse(fixtures.response.searchSeriesInvalid as unknown as ApiResponse)).toThrow(Errors.InvalidFrequencyError);
  });

  it('should throw a ResponseError if the response code is unknown', () => {
    expect(() => parseSearchSeriesResponse({} as ApiResponse)).toThrow(Errors.WebServiceError);
  });
});