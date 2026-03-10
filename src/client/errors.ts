/**
 * Thrown when the BCCH API returns a non-zero `Codigo` in the response body.
 *
 * @example
 * ```ts
 * try {
 *   await client.getSeries('INVALID');
 * } catch (err) {
 *   if (err instanceof ApiError) {
 *     console.error(`API error ${err.codigo}: ${err.descripcion}`);
 *   }
 * }
 * ```
 */
export class ApiError extends Error {
  /** Non-zero `Codigo` value from the API response. */
  readonly codigo: number;

  /** `Descripcion` string from the API response. */
  readonly descripcion: string;

  constructor(message: string, codigo: number, descripcion: string) {
    super(message);
    this.name = 'ApiError';
    this.codigo = codigo;
    this.descripcion = descripcion;
  }
}

/**
 * Thrown when the BCCH API returns a non-ok HTTP status code.
 *
 * @example
 * ```ts
 * try {
 *   await client.getSeries('F022.TPM.TIN.D001.NO.Z.D');
 * } catch (err) {
 *   if (err instanceof HttpError) {
 *     console.error(`HTTP ${err.status}`);
 *   }
 * }
 * ```
 */
export class HttpError extends Error {
  /** HTTP status code. */
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}
