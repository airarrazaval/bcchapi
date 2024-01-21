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

type NullSeries = {
  [key in keyof SeriesHistory]: null;
};

interface SeriesMetadata {
  /**
   * Series identifier.
   */
  seriesId: string;
  /**
   * Series frequency.
   */
  frequencyCode: string;
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
  Series: SeriesHistory | NullSeries;
  /**
   * Series metadata information.
   */
  SeriesInfos: SeriesMetadata[];
}

export interface ErrorResponse extends ApiResponse {
  Series: NullSeries;
  SeriesInfos: never[];
}

export interface GetSeriesResponse {
  seriesId: string;
  description: string;
  data: ReadonlyArray<{ date: string; value: number }>;
}

export type SearchSeriesResponse = ReadonlyArray<{
  seriesId: string;
  frequency: string;
  title: string;
  firstObservedAt: string;
  lastObservedAt: string;
  updatedAt: string;
  createdAt: string;
}>;
