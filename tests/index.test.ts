import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Client, ApiError, HttpError, SERIES, mean, parseObservationDate } from '../src/index.ts';

describe('bcch root exports', () => {
  it('exports Client', () => {
    assert.equal(typeof Client, 'function');
  });

  it('exports ApiError', () => {
    const err = new ApiError('msg', 1, 'desc');
    assert.ok(err instanceof Error);
    assert.ok(err instanceof ApiError);
  });

  it('exports HttpError', () => {
    const err = new HttpError('msg', 500);
    assert.ok(err instanceof Error);
    assert.ok(err instanceof HttpError);
  });

  it('exports SERIES with expected groups', () => {
    assert.equal(typeof SERIES, 'object');
    assert.ok('EXCHANGE_RATE' in SERIES);
    assert.ok('PRICES' in SERIES);
    assert.ok('INTEREST_RATES' in SERIES);
  });

  it('exports mean from utils', () => {
    assert.equal(typeof mean, 'function');
  });

  it('exports parseObservationDate from utils', () => {
    const d = parseObservationDate('01-01-2024');
    assert.equal(d.getUTCFullYear(), 2024);
  });
});
