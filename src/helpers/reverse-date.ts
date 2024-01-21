export default function reverseDate(date: string): string {
  return date.split('-').reverse().join('-');
}
