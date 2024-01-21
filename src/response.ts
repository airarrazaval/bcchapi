import {
  ErrorCodes,
  InvalidFrequencyError,
  InvalidCredentialsError,
  InvalidSeriesError,
  WebServiceError,
} from './errors';
import { reverseDate } from './helpers';

export enum Frequency {
  Daily = 'DAILY',
  Monthly = 'MONTHLY',
  Quarterly = 'QUARTERLY',
  Annual = 'ANNUAL',
}

interface SeriesValue {
  /**
   * Series observed date in DD-MM-YYYY format.
   */
  indexDateString: string;
  /**
   * Series observed value.
   */
  value: string;
  /**
   * Series observed value status code (ND = no data recorded).
   */
  statusCode: 'OK' | 'ND';
}

interface SeriesHistory {
  /**
   * Series identifier.
   */
  seriesId: string;
  /**
   * Series name in Spanish.
   */
  descripEsp: string;
  /**
   * Series name in English.
   */
  descripIng: string;
  /**
   * List of series observed values.
   */
  Obs: SeriesValue[];
}

interface SeriesMetadata {
  /**
   * Series identifier.
   */
  seriesId: string;
  /**
   * Series frequency (DAILY, MONTHLY, QUARTERLY, ANNUAL).
   */
  frequencyCode: Frequency;
  /**
   * Series name in Spanish.
   */
  spanishTitle: string;
  /**
   * Series name in English.
   */
  englishTitle: string;
  /**
   * Date of first observation in DD-MM-YYYY format.
   */
  firstObservation: string;
  /**
   * Date of last observation in DD-MM-YYYY format.
   */
  lastObservation: string;
  /**
   * Date of last update in DD-MM-YYYY format.
   */
  updatedAt: string;
  /**
   * Date of creation in DD-MM-YYYY format.
   */
  createdAt: string;
}

export interface ApiResponse {
  /**
   * Response status code.
   */
  Codigo: number;
  /**
   * Response status message.
   */
  Descripcion: string;

  /**
   * Series historic information.
   */
  Series: SeriesHistory | {
    [key in keyof SeriesHistory]: null;
  };
  /**
   * Series metadata information.
   */
  SeriesInfos: SeriesMetadata[];
}

export interface ErrorResponse extends ApiResponse {
  Series: {
    [key in keyof SeriesHistory]: null;
  };
  SeriesInfos: never[];
}

export type GetSeriesResponse = {
  seriesId: string;
  description: string;
  data: ReadonlyArray<{ date: string; value: number; }>;
}

export type SearchSeriesResponse = ReadonlyArray<{
  seriesId: string;
  frequency: Frequency;
  title: string;
  firstObservedAt: string;
  lastObservedAt: string;
  updatedAt: string;
  createdAt: string;
}>;

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

export function parseSearchSeriesResponse<T extends ApiResponse>(response: T): SearchSeriesResponse {
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
  console.log(response);

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