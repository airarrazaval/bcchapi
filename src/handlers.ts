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
import { reverseDate } from './utils';

/**
 * Parses the GetSeries function API response.
 */
export function handleGetSeriesResponse<T extends ApiResponse>(response: T): GetSeriesResponse {
  if (response.Codigo !== 0) {
    switch (response.Codigo) {
      case ErrorCodes.InvalidCredentials:
        throw new InvalidCredentialsError(response as ApiResponse as ErrorResponse);
      case ErrorCodes.InvalidSeries:
        throw new InvalidSeriesError(response as ApiResponse as ErrorResponse);
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
export function handleSearchSeriesResponse<T extends ApiResponse>(
  response: T,
): SearchSeriesResponse {
  if (response.Codigo !== 0) {
    switch (response.Codigo) {
      case ErrorCodes.InvalidCredentials:
        throw new InvalidCredentialsError(response as ApiResponse as ErrorResponse);
      case ErrorCodes.InvalidFrequency:
        throw new InvalidFrequencyError(response as ApiResponse as ErrorResponse);
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
