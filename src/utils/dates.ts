/**
 * Parses a date string in `"DD-MM-YYYY"` format (the BCCH API wire format)
 * into a UTC `Date`.
 *
 * @param dateString - Date in `"DD-MM-YYYY"` format.
 * @returns A `Date` set to midnight UTC on the given date.
 * @throws {Error} When `dateString` is empty, malformed, or out of range.
 *
 * @example
 * ```ts
 * const d = parseObservationDate('15-06-2023');
 * d.getUTCFullYear(); // 2023
 * d.getUTCMonth();    // 5 (June, 0-indexed)
 * d.getUTCDate();     // 15
 * ```
 */
export function parseObservationDate(dateString: string): Date {
  if (!dateString) {
    throw new Error(`Invalid date: "${dateString}"`);
  }

  const parts = dateString.split('-');
  if (parts.length !== 3) {
    throw new Error(`Invalid date: "${dateString}"`);
  }

  const [dayStr, monthStr, yearStr] = parts;
  const day = Number(dayStr);
  const month = Number(monthStr);
  const year = Number(yearStr);

  if (
    !Number.isInteger(day) ||
    !Number.isInteger(month) ||
    !Number.isInteger(year) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    throw new Error(`Invalid date: "${dateString}"`);
  }

  // Verify the date is real by constructing and checking for roll-over
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`Invalid date: "${dateString}"`);
  }

  return date;
}

/**
 * Formats a `Date` as a `"YYYY-MM-DD"` string for use in BCCH API query parameters.
 *
 * @param date - The date to format. Time components are ignored; UTC date is used.
 * @returns Date string in `"YYYY-MM-DD"` format.
 *
 * @example
 * ```ts
 * formatQueryDate(new Date(Date.UTC(2024, 0, 15))); // "2024-01-15"
 * ```
 */
export function formatQueryDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
