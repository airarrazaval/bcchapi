/**
 * Returns a personalised greeting for the given name.
 *
 * @param name - The name to greet.
 * @returns A greeting string in the form `"Hello, <name>!"`.
 *
 * @example
 * ```ts
 * hello('World'); // "Hello, World!"
 * ```
 */
export function hello(name: string): string {
  return `Hello, ${name}!`;
}
