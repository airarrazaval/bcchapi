/**
 * Determines wether a given value can be parsed to a valid date.
 */
export function isValidDate(date: unknown): boolean {
  if (typeof date === 'string') {
    // Validate format YYYY-MM-DD
    const isISOString = date.match(/^\d{4}-\d{2}-\d{2}$/);

    if (!isISOString) {
      return false;
    }

    // Validate parsed date timestamp
    const timestamp = Date.parse(date);

    return !Number.isNaN(timestamp);
  } else if (date instanceof Date) {
    // Validate date object
    return !Number.isNaN(date.getTime());
  }
  // Is invalid date
  return false;
}

/**
 * Reverses a date string from DD-MM-YYYY to YYYY-MM-DD format.
 */
export function reverseDate(date: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  if (!/^\d{2}-\d{2}-\d{4}$/.test(date)) {
    throw new Error('Invalid date format. Expected DD-MM-YYYY');
  }
  return date.split('-').reverse().join('-');
}
