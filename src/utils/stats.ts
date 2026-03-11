import { parseValue } from './transform.js';
import type { Observation } from '../client/types.js';

function validNumbers(observations: Observation[]): number[] {
  const result: number[] = [];
  for (const obs of observations) {
    const n = parseValue(obs.value);
    if (n !== null) {
      result.push(n);
    }
  }
  return result;
}

/**
 * Calculates the arithmetic mean of valid observation values, ignoring gaps.
 *
 * @param observations - Array of observations.
 * @returns The arithmetic mean.
 * @throws {Error} When there are no valid (non-null) values.
 *
 * @example
 * ```ts
 * mean(data.observations); // 1.78
 * ```
 */
export function mean(observations: Observation[]): number {
  const values = validNumbers(observations);
  if (values.length === 0) {
    throw new Error('No valid observations to compute mean');
  }
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Calculates the sample standard deviation of valid observation values,
 * ignoring gaps.
 *
 * Uses Bessel's correction (divides by `n - 1`).
 *
 * @param observations - Array of observations.
 * @returns The sample standard deviation.
 * @throws {Error} When fewer than two valid values are present.
 *
 * @example
 * ```ts
 * stdDev(data.observations); // 0.035
 * ```
 */
export function stdDev(observations: Observation[]): number {
  const values = validNumbers(observations);
  if (values.length < 2) {
    throw new Error('stdDev requires at least two valid observations');
  }
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/**
 * Returns the minimum valid observation value, ignoring gaps.
 *
 * @param observations - Array of observations.
 * @returns The minimum value.
 * @throws {Error} When there are no valid values.
 *
 * @example
 * ```ts
 * min(data.observations); // 0.5
 * ```
 */
export function min(observations: Observation[]): number {
  const values = validNumbers(observations);
  if (values.length === 0) {
    throw new Error('No valid observations to compute min');
  }
  let result = values[0]!;
  for (let i = 1; i < values.length; i++) {
    if (values[i]! < result) result = values[i]!;
  }
  return result;
}

/**
 * Returns the maximum valid observation value, ignoring gaps.
 *
 * @param observations - Array of observations.
 * @returns The maximum value.
 * @throws {Error} When there are no valid values.
 *
 * @example
 * ```ts
 * max(data.observations); // 8.25
 * ```
 */
export function max(observations: Observation[]): number {
  const values = validNumbers(observations);
  if (values.length === 0) {
    throw new Error('No valid observations to compute max');
  }
  let result = values[0]!;
  for (let i = 1; i < values.length; i++) {
    if (values[i]! > result) result = values[i]!;
  }
  return result;
}

/**
 * Calculates period-over-period fractional change for each observation.
 *
 * The result at index `i` is `value[i] / value[i-1] - 1`.
 * Returns `null` for the first position, and for any position where the
 * current or previous value is `null`.
 *
 * @param observations - Array of observations in chronological order.
 * @returns Array of fractional changes, same length as input, `null` for gaps.
 *
 * @example
 * ```ts
 * // values: 100, 105, null, 110
 * periodVariation(obs); // [null, 0.05, null, null]
 * ```
 */
export function periodVariation(observations: Observation[]): Array<number | null> {
  const values = observations.map((obs) => parseValue(obs.value));
  return values.map((current, i) => {
    if (i === 0) return null;
    const previous = values[i - 1] ?? null;
    if (current === null || previous === null || previous === 0) return null;
    return current / previous - 1;
  });
}

/**
 * Calculates year-over-year fractional change using a fixed period offset.
 *
 * The result at index `i` is `value[i] / value[i - periodsPerYear] - 1`.
 * Returns `null` for the first `periodsPerYear` positions, and for any
 * position where the current or base value is `null`.
 *
 * @param observations - Array of observations in chronological order.
 * @param periodsPerYear - Number of periods per year (e.g. `12` for monthly,
 *   `4` for quarterly, `252` for daily trading days).
 * @returns Array of fractional changes, same length as input.
 * @throws {Error} When `periodsPerYear` is not a positive integer.
 *
 * @example
 * ```ts
 * // Monthly CPI, 12-month change
 * annualVariation(cpi.observations, 12);
 * ```
 */
export function annualVariation(
  observations: Observation[],
  periodsPerYear: number,
): Array<number | null> {
  if (!Number.isInteger(periodsPerYear) || periodsPerYear < 1) {
    throw new Error(`periodsPerYear must be a positive integer, got: ${periodsPerYear}`);
  }

  const values = observations.map((obs) => parseValue(obs.value));
  return values.map((current, i) => {
    if (i < periodsPerYear) return null;
    const base = values[i - periodsPerYear] ?? null;
    if (current === null || base === null || base === 0) return null;
    return current / base - 1;
  });
}

/**
 * Calculates a rolling (moving) average over a fixed window of observations.
 *
 * Returns `null` for positions before the window is full, and for any window
 * that contains at least one gap value.
 *
 * @param observations - Array of observations in chronological order.
 * @param window - Number of periods in the rolling window.
 * @returns Array of rolling means, same length as input.
 * @throws {Error} When `window` is not a positive integer.
 *
 * @example
 * ```ts
 * // 3-month moving average
 * rollingMean(data.observations, 3);
 * ```
 */
export function rollingMean(observations: Observation[], window: number): Array<number | null> {
  if (!Number.isInteger(window) || window < 1) {
    throw new Error(`window must be a positive integer, got: ${window}`);
  }

  const values = observations.map((obs) => parseValue(obs.value));
  return values.map((_, i) => {
    if (i < window - 1) return null;
    const slice = values.slice(i - window + 1, i + 1);
    if (slice.some((v) => v === null)) return null;
    const sum = (slice as number[]).reduce((acc, v) => acc + v, 0);
    return sum / window;
  });
}
