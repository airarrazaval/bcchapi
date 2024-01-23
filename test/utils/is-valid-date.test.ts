import { describe, it, expect } from 'vitest';
import { isValidDate } from '../../src/utils';

describe('isValidDate', () => {
  it('should return true if the date is valid', () => {
    expect(isValidDate('2020-01-01')).toBe(true);
    expect(isValidDate(new Date())).toBe(true);
  });

  it('should return false if the date is invalid', () => {
    expect(isValidDate('invalid')).toBe(false);
    expect(isValidDate({})).toBe(false);
    expect(isValidDate(undefined)).toBe(false);
    expect(isValidDate(null)).toBe(false);
    expect(isValidDate(new Date('invalid'))).toBe(false);
  });
});
