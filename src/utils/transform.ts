import { parseObservationDate } from './dates.js';
import type { Observation } from '../client/types.js';

/**
 * Parses a raw observation value string to a number, or `null` for gaps.
 *
 * @param value - Raw value string from an {@link Observation}.
 * @returns The parsed number, or `null` when the string is empty or non-numeric.
 *
 * @example
 * ```ts
 * parseValue('1.75');  // 1.75
 * parseValue('');      // null
 * parseValue('N/A');   // null
 * ```
 */
export function parseValue(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') {
    return null;
  }
  const n = Number(trimmed);
  return isNaN(n) ? null : n;
}

/**
 * Filters an array of observations, returning only those with parseable values.
 *
 * An observation is considered valid when its `value` field is a non-empty,
 * numeric string (i.e. `parseValue` returns a number, not `null`).
 *
 * @param observations - Array of observations to filter.
 * @returns A new array containing only the valid observations.
 *
 * @example
 * ```ts
 * const valid = filterValid(data.observations);
 * ```
 */
export function filterValid(observations: Observation[]): Observation[] {
  return observations.filter((obs) => parseValue(obs.value) !== null);
}

/**
 * Converts an array of observations to an array of `number | null` values.
 *
 * Gaps (empty or non-numeric values) are represented as `null`, preserving
 * the positional alignment with the original observations array.
 *
 * @param observations - Array of observations to convert.
 * @returns Array of parsed values, `null` for gaps.
 *
 * @example
 * ```ts
 * toNumbers(data.observations); // [1.75, null, 1.80, ...]
 * ```
 */
export function toNumbers(observations: Observation[]): Array<number | null> {
  return observations.map((obs) => parseValue(obs.value));
}

/**
 * Converts an array of observations to a `Map` keyed by the observation date
 * string (`"DD-MM-YYYY"`).
 *
 * When duplicate dates exist, the last one wins. Values are `null` for gaps.
 *
 * @param observations - Array of observations to convert.
 * @returns Map from date string to `number | null`.
 *
 * @example
 * ```ts
 * const map = toMap(data.observations);
 * map.get('01-01-2024'); // 1.75
 * ```
 */
export function toMap(observations: Observation[]): Map<string, number | null> {
  const result = new Map<string, number | null>();
  for (const obs of observations) {
    result.set(obs.indexDateString, parseValue(obs.value));
  }
  return result;
}

/**
 * Converts an array of observations to parallel `dates` and `values` arrays
 * suitable for charting libraries.
 *
 * @param observations - Array of observations to convert.
 * @returns Object with `dates` (UTC `Date[]`) and `values` (`Array<number | null>`).
 *
 * @example
 * ```ts
 * const { dates, values } = toArrays(data.observations);
 * // pass to Chart.js, D3, etc.
 * ```
 */
export function toArrays(observations: Observation[]): {
  dates: Date[];
  values: Array<number | null>;
} {
  const dates: Date[] = [];
  const values: Array<number | null> = [];
  for (const obs of observations) {
    dates.push(parseObservationDate(obs.indexDateString));
    values.push(parseValue(obs.value));
  }
  return { dates, values };
}
