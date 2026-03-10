import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { filterValid, parseValue, toArrays, toMap, toNumbers } from '../../src/utils/index.ts';
import type { Observation } from '../../src/client/index.ts';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function obs(indexDateString: string, value: string, statusCode = 'OK'): Observation {
  return { indexDateString, value, statusCode };
}

const OBSERVATIONS: Observation[] = [
  obs('01-01-2024', '1.75'),
  obs('02-01-2024', '', 'NO_OBS'),
  obs('03-01-2024', '1.80'),
  obs('04-01-2024', 'N/A', 'ERR'),
  obs('05-01-2024', '1.85'),
];

// ---------------------------------------------------------------------------
// parseValue
// ---------------------------------------------------------------------------

describe('parseValue', () => {
  it('parses a numeric string to a number', () => {
    assert.equal(parseValue('1.75'), 1.75);
  });

  it('parses an integer string', () => {
    assert.equal(parseValue('42'), 42);
  });

  it('parses a negative number string', () => {
    assert.equal(parseValue('-3.14'), -3.14);
  });

  it('returns null for an empty string', () => {
    assert.equal(parseValue(''), null);
  });

  it('returns null for a non-numeric string', () => {
    assert.equal(parseValue('N/A'), null);
  });

  it('returns null for whitespace-only string', () => {
    assert.equal(parseValue('   '), null);
  });
});

// ---------------------------------------------------------------------------
// filterValid
// ---------------------------------------------------------------------------

describe('filterValid', () => {
  it('returns only observations with parseable numeric values', () => {
    // OBSERVATIONS: valid, gap (''), valid, non-numeric ('N/A'), valid → 3 valid
    const result = filterValid(OBSERVATIONS);
    assert.equal(result.length, 3);
    assert.equal(result[0]!.indexDateString, '01-01-2024');
    assert.equal(result[1]!.indexDateString, '03-01-2024');
    assert.equal(result[2]!.indexDateString, '05-01-2024');
  });

  it('returns empty array when all observations have empty values', () => {
    const all_gaps = [obs('01-01-2024', ''), obs('02-01-2024', '')];
    assert.deepEqual(filterValid(all_gaps), []);
  });

  it('returns all observations when none have empty values', () => {
    const valid = [obs('01-01-2024', '1.0'), obs('02-01-2024', '2.0')];
    assert.equal(filterValid(valid).length, 2);
  });

  it('does not mutate the input array', () => {
    const input = [obs('01-01-2024', '1.0'), obs('02-01-2024', '')];
    filterValid(input);
    assert.equal(input.length, 2);
  });
});

// ---------------------------------------------------------------------------
// toNumbers
// ---------------------------------------------------------------------------

describe('toNumbers', () => {
  it('converts values to numbers, nulls for empty or non-numeric', () => {
    const result = toNumbers(OBSERVATIONS);
    assert.deepEqual(result, [1.75, null, 1.8, null, 1.85]);
  });

  it('returns empty array for empty input', () => {
    assert.deepEqual(toNumbers([]), []);
  });
});

// ---------------------------------------------------------------------------
// toMap
// ---------------------------------------------------------------------------

describe('toMap', () => {
  it('returns a Map keyed by indexDateString', () => {
    const simple = [obs('01-01-2024', '1.75'), obs('02-01-2024', '')];
    const map = toMap(simple);
    assert.equal(map.size, 2);
    assert.equal(map.get('01-01-2024'), 1.75);
    assert.equal(map.get('02-01-2024'), null);
  });

  it('later duplicate dates overwrite earlier ones', () => {
    const dupes = [obs('01-01-2024', '1.0'), obs('01-01-2024', '2.0')];
    const map = toMap(dupes);
    assert.equal(map.size, 1);
    assert.equal(map.get('01-01-2024'), 2.0);
  });

  it('returns empty Map for empty input', () => {
    assert.equal(toMap([]).size, 0);
  });
});

// ---------------------------------------------------------------------------
// toArrays
// ---------------------------------------------------------------------------

describe('toArrays', () => {
  it('returns parallel dates and values arrays', () => {
    const input = [obs('01-01-2024', '1.75'), obs('02-01-2024', '')];
    const { dates, values } = toArrays(input);
    assert.equal(dates.length, 2);
    assert.equal(values.length, 2);
    assert.equal(dates[0]!.getUTCDate(), 1);
    assert.equal(dates[0]!.getUTCMonth(), 0);
    assert.equal(dates[0]!.getUTCFullYear(), 2024);
    assert.equal(values[0], 1.75);
    assert.equal(values[1], null);
  });

  it('returns empty arrays for empty input', () => {
    const { dates, values } = toArrays([]);
    assert.equal(dates.length, 0);
    assert.equal(values.length, 0);
  });
});
