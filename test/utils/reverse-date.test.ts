import { describe, it, expect } from 'vitest';
import { reverseDate } from '../../src/utils';

describe('reverseDate', () => {
  it('should reverse correctly a date in DD-MM-YYYY format', () => {
    const date = '01-02-2020';
    const reversed = reverseDate(date);

    expect(reversed).toBe('2020-02-01');
  });
});
