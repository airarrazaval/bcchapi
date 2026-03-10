import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  annualVariation,
  max,
  mean,
  min,
  periodVariation,
  rollingMean,
  stdDev,
} from '../../src/utils/index.ts';
import type { Observation } from '../../src/client/index.ts';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function obs(indexDateString: string, value: string, statusCode = 'OK'): Observation {
  return { indexDateString, value, statusCode };
}

// Simple sequence: 1, 2, 3, 4, 5
const SIMPLE: Observation[] = [
  obs('01-01-2024', '1'),
  obs('02-01-2024', '2'),
  obs('03-01-2024', '3'),
  obs('04-01-2024', '4'),
  obs('05-01-2024', '5'),
];

// Sequence with gaps
const WITH_GAPS: Observation[] = [
  obs('01-01-2024', '2'),
  obs('02-01-2024', '', 'NO_OBS'),
  obs('03-01-2024', '4'),
  obs('04-01-2024', '', 'NO_OBS'),
  obs('05-01-2024', '6'),
];

// ---------------------------------------------------------------------------
// mean
// ---------------------------------------------------------------------------

describe('mean', () => {
  it('calculates the arithmetic mean of valid observations', () => {
    assert.equal(mean(SIMPLE), 3);
  });

  it('ignores null (gap) values', () => {
    // valid values: 2, 4, 6 → mean = 4
    assert.equal(mean(WITH_GAPS), 4);
  });

  it('throws when there are no valid values', () => {
    assert.throws(() => mean([obs('01-01-2024', '')]), /no valid/i);
  });

  it('throws on empty input', () => {
    assert.throws(() => mean([]), /no valid/i);
  });
});

// ---------------------------------------------------------------------------
// stdDev
// ---------------------------------------------------------------------------

describe('stdDev', () => {
  it('calculates sample standard deviation', () => {
    // values: 2, 4 → mean 3, sample variance = ((2-3)²+(4-3)²)/(2-1) = 2, stddev = √2
    const result = stdDev([obs('01-01-2024', '2'), obs('02-01-2024', '4')]);
    assert.ok(Math.abs(result - Math.sqrt(2)) < 1e-10);
  });

  it('ignores gap values', () => {
    // same as above but with a gap in between
    const result = stdDev([
      obs('01-01-2024', '2'),
      obs('02-01-2024', '', 'NO_OBS'),
      obs('03-01-2024', '4'),
    ]);
    assert.ok(Math.abs(result - Math.sqrt(2)) < 1e-10);
  });

  it('throws when fewer than two valid values', () => {
    assert.throws(() => stdDev([obs('01-01-2024', '5')]), /at least two/i);
  });

  it('throws on empty input', () => {
    assert.throws(() => stdDev([]), /at least two/i);
  });
});

// ---------------------------------------------------------------------------
// min / max
// ---------------------------------------------------------------------------

describe('min', () => {
  it('returns the minimum valid value', () => {
    assert.equal(min(SIMPLE), 1);
  });

  it('ignores gaps', () => {
    assert.equal(min(WITH_GAPS), 2);
  });

  it('throws when no valid values', () => {
    assert.throws(() => min([obs('01-01-2024', '')]), /no valid/i);
  });
});

describe('max', () => {
  it('returns the maximum valid value', () => {
    assert.equal(max(SIMPLE), 5);
  });

  it('ignores gaps', () => {
    assert.equal(max(WITH_GAPS), 6);
  });

  it('throws when no valid values', () => {
    assert.throws(() => max([obs('01-01-2024', '')]), /no valid/i);
  });
});

// ---------------------------------------------------------------------------
// periodVariation
// ---------------------------------------------------------------------------

describe('periodVariation', () => {
  it('calculates period-over-period fractional change', () => {
    // 1→2: +1.0 (100%), 2→3: +0.5 (50%), 3→4: +0.333..., 4→5: +0.25
    const result = periodVariation(SIMPLE);
    assert.equal(result.length, SIMPLE.length);
    assert.equal(result[0], null); // first has no predecessor
    assert.ok(Math.abs(result[1]! - 1.0) < 1e-10); // 2/1 - 1
    assert.ok(Math.abs(result[2]! - 0.5) < 1e-10); // 3/2 - 1
    assert.ok(Math.abs(result[3]! - (4 / 3 - 1)) < 1e-10);
    assert.ok(Math.abs(result[4]! - 0.25) < 1e-10); // 5/4 - 1
  });

  it('returns null when current or previous value is null', () => {
    const result = periodVariation(WITH_GAPS);
    assert.equal(result[0], null); // first position always null
    assert.equal(result[1], null); // gap at index 1
    assert.equal(result[2], null); // previous (index 1) was null
    assert.equal(result[3], null); // gap at index 3
    assert.equal(result[4], null); // previous (index 3) was null
  });

  it('returns array of same length as input', () => {
    assert.equal(periodVariation(SIMPLE).length, SIMPLE.length);
  });

  it('returns [null] for single-element input', () => {
    assert.deepEqual(periodVariation([obs('01-01-2024', '1')]), [null]);
  });

  it('returns empty array for empty input', () => {
    assert.deepEqual(periodVariation([]), []);
  });
});

// ---------------------------------------------------------------------------
// annualVariation
// ---------------------------------------------------------------------------

describe('annualVariation', () => {
  it('calculates year-over-year fractional change with periodsPerYear offset', () => {
    // 12 monthly obs: values 1..12, periodsPerYear=12
    // obs[12] / obs[0] - 1 = 13/1 - 1 = 12; but we only have 12 items (indices 0-11)
    // So indices 0-11: first 12 have null, from index 12 onward we'd have values
    // With 5 items and periodsPerYear=5: obs[5] doesn't exist, all null except...
    // Let's use periodsPerYear=2 with 4 items: values 2,4,6,8
    // result[0]=null, result[1]=null, result[2]=6/2-1=2.0, result[3]=8/4-1=1.0
    const data = [
      obs('01-01-2024', '2'),
      obs('02-01-2024', '4'),
      obs('03-01-2024', '6'),
      obs('04-01-2024', '8'),
    ];
    const result = annualVariation(data, 2);
    assert.equal(result[0], null);
    assert.equal(result[1], null);
    assert.ok(Math.abs(result[2]! - 2.0) < 1e-10); // 6/2 - 1
    assert.ok(Math.abs(result[3]! - 1.0) < 1e-10); // 8/4 - 1
  });

  it('returns null when the period-offset value is null', () => {
    const data = [obs('01-01-2024', '', 'NO_OBS'), obs('02-01-2024', '4'), obs('03-01-2024', '6')];
    const result = annualVariation(data, 1);
    // result[0] = null (no offset)
    // result[1] = 4/null - 1 → null (base is null)
    // result[2] = 6/4 - 1 = 0.5
    assert.equal(result[0], null);
    assert.equal(result[1], null);
    assert.ok(Math.abs(result[2]! - 0.5) < 1e-10);
  });

  it('returns array of same length as input', () => {
    assert.equal(annualVariation(SIMPLE, 12).length, SIMPLE.length);
  });

  it('returns empty array for empty input', () => {
    assert.deepEqual(annualVariation([], 12), []);
  });

  it('throws when periodsPerYear is not a positive integer', () => {
    assert.throws(() => annualVariation(SIMPLE, 0), /periodsPerYear/i);
    assert.throws(() => annualVariation(SIMPLE, -1), /periodsPerYear/i);
    assert.throws(() => annualVariation(SIMPLE, 1.5), /periodsPerYear/i);
  });
});

// ---------------------------------------------------------------------------
// rollingMean
// ---------------------------------------------------------------------------

describe('rollingMean', () => {
  it('calculates rolling mean with full windows', () => {
    // values 1,2,3,4,5 with window=3
    // [null, null, (1+2+3)/3=2, (2+3+4)/3=3, (3+4+5)/3=4]
    const result = rollingMean(SIMPLE, 3);
    assert.equal(result[0], null);
    assert.equal(result[1], null);
    assert.ok(Math.abs(result[2]! - 2) < 1e-10);
    assert.ok(Math.abs(result[3]! - 3) < 1e-10);
    assert.ok(Math.abs(result[4]! - 4) < 1e-10);
  });

  it('returns null for window positions containing gaps', () => {
    // values 2, null, 4, null, 6 with window=2
    const result = rollingMean(WITH_GAPS, 2);
    assert.equal(result[0], null); // not enough window
    assert.equal(result[1], null); // gap
    assert.equal(result[2], null); // window includes gap at index 1
    assert.equal(result[3], null); // gap
    assert.equal(result[4], null); // window includes gap at index 3
  });

  it('returns array of same length as input', () => {
    assert.equal(rollingMean(SIMPLE, 2).length, SIMPLE.length);
  });

  it('returns empty array for empty input', () => {
    assert.deepEqual(rollingMean([], 3), []);
  });

  it('throws when window is not a positive integer', () => {
    assert.throws(() => rollingMean(SIMPLE, 0), /window/i);
    assert.throws(() => rollingMean(SIMPLE, -1), /window/i);
    assert.throws(() => rollingMean(SIMPLE, 1.5), /window/i);
  });

  it('window of 1 returns the parsed values directly', () => {
    const result = rollingMean(SIMPLE, 1);
    assert.deepEqual(result, [1, 2, 3, 4, 5]);
  });
});
