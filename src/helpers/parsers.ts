import reverseDate from './reverse-date';
import {
  ErrorCodes,
  InvalidFrequencyError,
  InvalidCredentialsError,
  InvalidSeriesError,
  WebServiceError,
} from '../errors';
import { ApiResponse, ErrorResponse, GetSeriesResponse, SearchSeriesResponse } from '../types';

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
    data: (response.Series.Obs || []).map((obs) => ({
      date: reverseDate(obs.indexDateString),
      value: parseFloat(obs.value),
    })),
  };
}

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

  return response.SeriesInfos.map((series) => ({
    seriesId: series.seriesId,
    frequency: series.frequencyCode,
    title: series.englishTitle,
    firstObservedAt: reverseDate(series.firstObservation),
    lastObservedAt: reverseDate(series.lastObservation),
    updatedAt: reverseDate(series.updatedAt),
    createdAt: reverseDate(series.createdAt),
  }));
}
