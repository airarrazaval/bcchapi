export function reverseDate(date: string): string {
  return date.split('-').reverse().join('-');
}

export function isValidDate(date: unknown): boolean {
  if (typeof date === 'string') {
    return !isNaN(Date.parse(date));
  }
  if (date instanceof Date) {
    return !isNaN(date.getTime());
  }
  return false;
}