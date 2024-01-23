import {
  ErrorCodes,
  InvalidFrequencyError,
  InvalidCredentialsError,
  InvalidSeriesError,
  WebServiceError,
} from './errors';
import {
  ApiResponse,
  SeriesObservation,
  SeriesMetadata,
  ErrorResponse,
  GetSeriesResponse,
  SearchSeriesResponse,
} from './types';

/**
 * Determines wether a given value can be parsed to a valid date.
 */
export function isValidDate(date: unknown): boolean {
  if (typeof date === 'string') {
    return !Number.isNaN(Date.parse(date));
  }
  if (date instanceof Date) {
    return !Number.isNaN(date.getTime());
  }
  return false;
}

/**
 * Reverses a date string from DD-MM-YYYY to YYYY-MM-DD format.
 */
export function reverseDate(date: string): string {
  return date.split('-').reverse().join('-');
}

/**
 * Parses the GetSeries function API response.
 */
export function parseGetSeriesResponse<T extends ApiResponse>(response: T): GetSeriesResponse {
  if (response.Codigo !== 0) {
    switch (response.Codigo) {
      case ErrorCodes.InvalidCredentials:
        throw new InvalidCredentialsError();
      case ErrorCodes.InvalidSeries:
        throw new InvalidSeriesError();
      default:
        throw new WebServiceError(response as ApiResponse as ErrorResponse);
    }
  }

  return {
    seriesId: response.Series.seriesId || '',
    description: response.Series.descripIng || '',
    data: (response.Series.Obs || []).map((obs: SeriesObservation) => ({
      date: reverseDate(obs.indexDateString),
      value: parseFloat(obs.value),
    })),
  };
}

/**
 * Parses the SearchSeries function API response.
 */
export function parseSearchSeriesResponse<T extends ApiResponse>(
  response: T,
): SearchSeriesResponse {
  if (response.Codigo !== 0) {
    switch (response.Codigo) {
      case ErrorCodes.InvalidCredentials:
        throw new InvalidCredentialsError();
      case ErrorCodes.InvalidFrequency:
        throw new InvalidFrequencyError();
      default:
        throw new WebServiceError(response as ApiResponse as ErrorResponse);
    }
  }

  return response.SeriesInfos.map((series: SeriesMetadata) => ({
    seriesId: series.seriesId,
    frequency: series.frequencyCode,
    title: series.englishTitle,
    firstObservedAt: reverseDate(series.firstObservation),
    lastObservedAt: reverseDate(series.lastObservation),
    updatedAt: reverseDate(series.updatedAt),
    createdAt: reverseDate(series.createdAt),
  }));
}
