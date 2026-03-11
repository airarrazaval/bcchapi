import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatQueryDate, parseObservationDate } from '../../src/utils/index.ts';

describe('parseObservationDate', () => {
  it('parses a valid DD-MM-YYYY string into a Date', () => {
    const date = parseObservationDate('15-06-2023');
    assert.equal(date.getUTCFullYear(), 2023);
    assert.equal(date.getUTCMonth(), 5); // 0-indexed
    assert.equal(date.getUTCDate(), 15);
  });

  it('parses 01-01-2000 correctly', () => {
    const date = parseObservationDate('01-01-2000');
    assert.equal(date.getUTCFullYear(), 2000);
    assert.equal(date.getUTCMonth(), 0);
    assert.equal(date.getUTCDate(), 1);
  });

  it('parses 31-12-1999 correctly', () => {
    const date = parseObservationDate('31-12-1999');
    assert.equal(date.getUTCFullYear(), 1999);
    assert.equal(date.getUTCMonth(), 11);
    assert.equal(date.getUTCDate(), 31);
  });

  it('returns a Date in UTC (no timezone shift)', () => {
    const date = parseObservationDate('01-03-2024');
    assert.equal(date.getUTCFullYear(), 2024);
    assert.equal(date.getUTCMonth(), 2);
    assert.equal(date.getUTCDate(), 1);
  });

  it('throws on an empty string', () => {
    assert.throws(() => parseObservationDate(''), /invalid date/i);
  });

  it('throws on a wrong-format string (YYYY-MM-DD)', () => {
    assert.throws(() => parseObservationDate('2023-06-15'), /invalid date/i);
  });

  it('throws when there are not exactly three parts', () => {
    assert.throws(() => parseObservationDate('15-06'), /invalid date/i);
    assert.throws(() => parseObservationDate('15-06-2023-extra'), /invalid date/i);
  });

  it('throws when the date parts are out of range', () => {
    assert.throws(() => parseObservationDate('99-99-2023'), /invalid date/i);
  });
});

describe('formatQueryDate', () => {
  it('formats a Date to YYYY-MM-DD', () => {
    const date = new Date(Date.UTC(2024, 0, 15)); // 15 Jan 2024
    assert.equal(formatQueryDate(date), '2024-01-15');
  });

  it('zero-pads month and day', () => {
    const date = new Date(Date.UTC(2023, 2, 5)); // 5 Mar 2023
    assert.equal(formatQueryDate(date), '2023-03-05');
  });

  it('round-trips with parseObservationDate', () => {
    const original = '20-11-2022';
    const date = parseObservationDate(original);
    assert.equal(formatQueryDate(date), '2022-11-20');
  });
});
