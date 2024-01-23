import { describe, it, expect } from 'vitest';
import * as Errors from '../../src/errors';
import { ApiResponse } from '../../src/types';
import { parseSearchSeriesResponse } from '../../src/utils';
import fixtures from '../fixtures';

describe('parseSearchSeriesResponse', () => {
  it('should parse correctly a valid response', () => {
    const parsed = parseSearchSeriesResponse(
      fixtures.response.searchSeriesSuccess as unknown as ApiResponse,
    );

    expect(parsed).toBeInstanceOf(Array);
    expect(parsed).toHaveLength(fixtures.response.searchSeriesSuccess.SeriesInfos.length);

    for (let i = 0; i < parsed.length; i += 1) {
      expect(parsed[i].seriesId).toBe(
        fixtures.response.searchSeriesSuccess.SeriesInfos[i].seriesId,
      );
      expect(parsed[i].frequency).toBe(
        fixtures.response.searchSeriesSuccess.SeriesInfos[i].frequencyCode,
      );
      expect(parsed[i].title).toBe(
        fixtures.response.searchSeriesSuccess.SeriesInfos[i].englishTitle,
      );
      expect(parsed[i].firstObservedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(parsed[i].lastObservedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(parsed[i].updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(parsed[i].createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('should throw an InvalidCredentialsError if the response code is -5', () => {
    expect(() =>
      parseSearchSeriesResponse(fixtures.response.credentialsInvalid as unknown as ApiResponse),
    ).toThrow(Errors.InvalidCredentialsError);
  });

  it('should throw an InvalidFrequencyError if the response code is -1', () => {
    expect(() =>
      parseSearchSeriesResponse(fixtures.response.searchSeriesInvalid as unknown as ApiResponse),
    ).toThrow(Errors.InvalidFrequencyError);
  });

  it('should throw a ResponseError if the response code is unknown', () => {
    expect(() => parseSearchSeriesResponse({} as ApiResponse)).toThrow(Errors.WebServiceError);
  });
});
