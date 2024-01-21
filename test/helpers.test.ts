import { describe, it, expect } from 'vitest';
import { reverseDate, isValidDate } from '../src/helpers';

describe('helpers: reverseDate', () => {
  it('should reverse correctly a date in DD-MM-YYYY format', () => {
    const date = '01-02-2020';
    const reversed = reverseDate(date);

    expect(reversed).toBe('2020-02-01');
  });
});

describe('helpers: isValidDate', () => {
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