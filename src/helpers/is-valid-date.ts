export default function isValidDate(date: unknown): boolean {
  if (typeof date === 'string') {
    return !Number.isNaN(Date.parse(date));
  }
  if (date instanceof Date) {
    return !Number.isNaN(date.getTime());
  }
  return false;
}
