export { Client, ApiError, HttpError } from './client/index.js';
export type {
  ClientOptions,
  Frequency,
  GetSeriesOptions,
  Observation,
  SeriesData,
  SeriesInfo,
} from './client/index.js';

export { SERIES } from './series/index.js';

export {
  parseObservationDate,
  formatQueryDate,
  filterValid,
  parseValue,
  toArrays,
  toMap,
  toNumbers,
  annualVariation,
  max,
  mean,
  min,
  periodVariation,
  rollingMean,
  stdDev,
} from './utils/index.js';
