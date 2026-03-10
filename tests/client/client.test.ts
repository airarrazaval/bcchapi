import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ApiError, Client, HttpError } from '../../src/client/index.ts';
import type { Cache } from '../../src/cache/index.ts';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE_URL = 'https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx';

function makeFetch(body: unknown, status = 200): typeof globalThis.fetch {
  return async () =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
}

function makeCredentials() {
  return { user: 'user@example.com', pass: 's3cr3t' };
}

const SERIES_ID = 'F022.TPM.TIN.D001.NO.Z.D';

const MOCK_GET_SERIES_RESPONSE = {
  Codigo: 0,
  Descripcion: 'Success',
  Series: {
    descripEsp: 'Tasa de Política Monetaria (porcentaje)',
    descripIng: 'Monetary policy rate (MPR) (percentage)',
    seriesId: SERIES_ID,
    Obs: [
      { indexDateString: '01-01-2020', value: '1.75', statusCode: 'OK' },
      { indexDateString: '02-01-2020', value: '', statusCode: 'NO_OBS' },
    ],
  },
  SeriesInfos: null,
};

const MOCK_SEARCH_SERIES_RESPONSE = {
  Codigo: 0,
  Descripcion: 'Success',
  Series: null,
  SeriesInfos: [
    {
      seriesId: SERIES_ID,
      frequencyCode: 'DAILY',
      spanishTitle: 'Tasa de Política Monetaria',
      englishTitle: 'Monetary policy rate',
      firstObservation: '01-01-2002',
      lastObservation: '10-03-2026',
      updatedAt: '10-03-2026',
      createdAt: '01-01-2002',
    },
  ],
};

// ---------------------------------------------------------------------------
// ApiError
// ---------------------------------------------------------------------------

describe('ApiError', () => {
  it('is an instance of Error', () => {
    const err = new ApiError('failed', 101, 'Series not found');
    assert.ok(err instanceof Error);
  });

  it('is an instance of ApiError', () => {
    const err = new ApiError('failed', 101, 'Series not found');
    assert.ok(err instanceof ApiError);
  });

  it('exposes codigo and descripcion', () => {
    const err = new ApiError('failed', 42, 'Bad input');
    assert.equal(err.codigo, 42);
    assert.equal(err.descripcion, 'Bad input');
  });

  it('has the correct message', () => {
    const err = new ApiError('API call failed', 101, 'Series not found');
    assert.equal(err.message, 'API call failed');
  });
});

// ---------------------------------------------------------------------------
// HttpError
// ---------------------------------------------------------------------------

describe('HttpError', () => {
  it('is an instance of Error', () => {
    const err = new HttpError('HTTP error', 404);
    assert.ok(err instanceof Error);
  });

  it('is an instance of HttpError', () => {
    const err = new HttpError('HTTP error', 404);
    assert.ok(err instanceof HttpError);
  });

  it('exposes status', () => {
    const err = new HttpError('Not Found', 404);
    assert.equal(err.status, 404);
  });

  it('has the correct message', () => {
    const err = new HttpError('Not Found', 404);
    assert.equal(err.message, 'Not Found');
  });
});

// ---------------------------------------------------------------------------
// Client — getSeries
// ---------------------------------------------------------------------------

describe('Client.getSeries', () => {
  it('returns parsed SeriesData on success', async () => {
    const client = new Client({
      ...makeCredentials(),
      fetch: makeFetch(MOCK_GET_SERIES_RESPONSE),
    });

    const data = await client.getSeries(SERIES_ID);

    assert.equal(data.seriesId, SERIES_ID);
    assert.equal(data.descripEsp, 'Tasa de Política Monetaria (porcentaje)');
    assert.equal(data.descripIng, 'Monetary policy rate (MPR) (percentage)');
    assert.equal(data.observations.length, 2);
  });

  it('maps observations correctly', async () => {
    const client = new Client({
      ...makeCredentials(),
      fetch: makeFetch(MOCK_GET_SERIES_RESPONSE),
    });

    const data = await client.getSeries(SERIES_ID);

    assert.deepEqual(data.observations[0], {
      indexDateString: '01-01-2020',
      value: '1.75',
      statusCode: 'OK',
    });
    assert.deepEqual(data.observations[1], {
      indexDateString: '02-01-2020',
      value: '',
      statusCode: 'NO_OBS',
    });
  });

  it('includes user, pass, function, and timeseries in the request URL', async () => {
    let capturedUrl = '';
    const captureFetch: typeof globalThis.fetch = async (input) => {
      capturedUrl = input.toString();
      return new Response(JSON.stringify(MOCK_GET_SERIES_RESPONSE));
    };

    const client = new Client({ ...makeCredentials(), fetch: captureFetch });
    await client.getSeries(SERIES_ID);

    const url = new URL(capturedUrl);
    assert.equal(url.origin + url.pathname, BASE_URL);
    assert.equal(url.searchParams.get('user'), 'user@example.com');
    assert.equal(url.searchParams.get('pass'), 's3cr3t');
    assert.equal(url.searchParams.get('function'), 'GetSeries');
    assert.equal(url.searchParams.get('timeseries'), SERIES_ID);
  });

  it('includes firstdate in the request URL when provided', async () => {
    let capturedUrl = '';
    const captureFetch: typeof globalThis.fetch = async (input) => {
      capturedUrl = input.toString();
      return new Response(JSON.stringify(MOCK_GET_SERIES_RESPONSE));
    };

    const client = new Client({ ...makeCredentials(), fetch: captureFetch });
    await client.getSeries(SERIES_ID, { firstdate: '2020-01-01' });

    const url = new URL(capturedUrl);
    assert.equal(url.searchParams.get('firstdate'), '2020-01-01');
    assert.equal(url.searchParams.has('lastdate'), false);
  });

  it('includes lastdate in the request URL when provided', async () => {
    let capturedUrl = '';
    const captureFetch: typeof globalThis.fetch = async (input) => {
      capturedUrl = input.toString();
      return new Response(JSON.stringify(MOCK_GET_SERIES_RESPONSE));
    };

    const client = new Client({ ...makeCredentials(), fetch: captureFetch });
    await client.getSeries(SERIES_ID, { lastdate: '2020-12-31' });

    const url = new URL(capturedUrl);
    assert.equal(url.searchParams.has('firstdate'), false);
    assert.equal(url.searchParams.get('lastdate'), '2020-12-31');
  });

  it('includes both firstdate and lastdate when both are provided', async () => {
    let capturedUrl = '';
    const captureFetch: typeof globalThis.fetch = async (input) => {
      capturedUrl = input.toString();
      return new Response(JSON.stringify(MOCK_GET_SERIES_RESPONSE));
    };

    const client = new Client({ ...makeCredentials(), fetch: captureFetch });
    await client.getSeries(SERIES_ID, {
      firstdate: '2020-01-01',
      lastdate: '2020-12-31',
    });

    const url = new URL(capturedUrl);
    assert.equal(url.searchParams.get('firstdate'), '2020-01-01');
    assert.equal(url.searchParams.get('lastdate'), '2020-12-31');
  });

  it('throws ApiError when Codigo is non-zero', async () => {
    const client = new Client({
      ...makeCredentials(),
      fetch: makeFetch({
        Codigo: 101,
        Descripcion: 'Series not found',
        Series: null,
        SeriesInfos: null,
      }),
    });

    await assert.rejects(
      () => client.getSeries(SERIES_ID),
      (err: unknown) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.codigo, 101);
        assert.equal(err.descripcion, 'Series not found');
        return true;
      },
    );
  });

  it('throws HttpError on a non-ok HTTP response', async () => {
    const client = new Client({
      ...makeCredentials(),
      fetch: makeFetch('Not Found', 404),
    });

    await assert.rejects(
      () => client.getSeries(SERIES_ID),
      (err: unknown) => {
        assert.ok(err instanceof HttpError);
        assert.equal(err.status, 404);
        return true;
      },
    );
  });

  it('throws Error with cause on network failure', async () => {
    const networkError = new Error('Network failure');
    const client = new Client({
      ...makeCredentials(),
      fetch: async () => {
        throw networkError;
      },
    });

    await assert.rejects(
      () => client.getSeries(SERIES_ID),
      (err: unknown) => {
        assert.ok(err instanceof Error);
        assert.equal((err as NodeJS.ErrnoException).cause, networkError);
        return true;
      },
    );
  });
});

// ---------------------------------------------------------------------------
// Client — searchSeries
// ---------------------------------------------------------------------------

describe('Client.searchSeries', () => {
  it('returns an array of SeriesInfo on success', async () => {
    const client = new Client({
      ...makeCredentials(),
      fetch: makeFetch(MOCK_SEARCH_SERIES_RESPONSE),
    });

    const infos = await client.searchSeries('DAILY');

    assert.equal(infos.length, 1);
    assert.deepEqual(infos[0], {
      seriesId: SERIES_ID,
      frequencyCode: 'DAILY',
      spanishTitle: 'Tasa de Política Monetaria',
      englishTitle: 'Monetary policy rate',
      firstObservation: '01-01-2002',
      lastObservation: '10-03-2026',
      updatedAt: '10-03-2026',
      createdAt: '01-01-2002',
    });
  });

  it('includes user, pass, function, and frequency in the request URL', async () => {
    let capturedUrl = '';
    const captureFetch: typeof globalThis.fetch = async (input) => {
      capturedUrl = input.toString();
      return new Response(JSON.stringify(MOCK_SEARCH_SERIES_RESPONSE));
    };

    const client = new Client({ ...makeCredentials(), fetch: captureFetch });
    await client.searchSeries('MONTHLY');

    const url = new URL(capturedUrl);
    assert.equal(url.origin + url.pathname, BASE_URL);
    assert.equal(url.searchParams.get('function'), 'SearchSeries');
    assert.equal(url.searchParams.get('frequency'), 'MONTHLY');
    assert.equal(url.searchParams.get('user'), 'user@example.com');
    assert.equal(url.searchParams.get('pass'), 's3cr3t');
  });

  it('throws ApiError when Codigo is non-zero', async () => {
    const client = new Client({
      ...makeCredentials(),
      fetch: makeFetch({
        Codigo: 99,
        Descripcion: 'Invalid frequency',
        Series: null,
        SeriesInfos: null,
      }),
    });

    await assert.rejects(
      () => client.searchSeries('DAILY'),
      (err: unknown) => {
        assert.ok(err instanceof ApiError);
        assert.equal(err.codigo, 99);
        return true;
      },
    );
  });

  it('throws HttpError on a non-ok HTTP response', async () => {
    const client = new Client({
      ...makeCredentials(),
      fetch: makeFetch('Internal Server Error', 500),
    });

    await assert.rejects(
      () => client.searchSeries('DAILY'),
      (err: unknown) => {
        assert.ok(err instanceof HttpError);
        assert.equal(err.status, 500);
        return true;
      },
    );
  });

  it('throws Error with cause on network failure', async () => {
    const networkError = new Error('DNS failure');
    const client = new Client({
      ...makeCredentials(),
      fetch: async () => {
        throw networkError;
      },
    });

    await assert.rejects(
      () => client.searchSeries('QUARTERLY'),
      (err: unknown) => {
        assert.ok(err instanceof Error);
        assert.equal((err as NodeJS.ErrnoException).cause, networkError);
        return true;
      },
    );
  });
});

// ---------------------------------------------------------------------------
// Client — caching (getSeries)
// ---------------------------------------------------------------------------

function makeCache(): Cache & { store: Map<string, unknown> } {
  const store = new Map<string, unknown>();
  return {
    store,
    get: (key) => store.get(key),
    set: (key, value) => {
      store.set(key, value);
    },
  };
}

describe('Client.getSeries — caching', () => {
  it('stores the result in the cache on a miss', async () => {
    const cache = makeCache();
    const client = new Client({
      ...makeCredentials(),
      fetch: makeFetch(MOCK_GET_SERIES_RESPONSE),
      cache,
    });

    const data = await client.getSeries(SERIES_ID);
    assert.equal(cache.store.size, 1);
    assert.deepEqual(cache.store.get(`getSeries:${SERIES_ID}::`), data);
  });

  it('returns the cached value on a hit without making an HTTP call', async () => {
    const cache = makeCache();
    let fetchCalls = 0;
    const countingFetch: typeof globalThis.fetch = async () => {
      fetchCalls++;
      return new Response(JSON.stringify(MOCK_GET_SERIES_RESPONSE));
    };

    const client = new Client({ ...makeCredentials(), fetch: countingFetch, cache });

    await client.getSeries(SERIES_ID);
    assert.equal(fetchCalls, 1);

    await client.getSeries(SERIES_ID);
    assert.equal(fetchCalls, 1);
  });

  it('uses a cache key that includes firstdate and lastdate', async () => {
    const cache = makeCache();
    const client = new Client({
      ...makeCredentials(),
      fetch: makeFetch(MOCK_GET_SERIES_RESPONSE),
      cache,
    });

    await client.getSeries(SERIES_ID, { firstdate: '2024-01-01', lastdate: '2024-12-31' });
    assert.ok(cache.store.has(`getSeries:${SERIES_ID}:2024-01-01:2024-12-31`));
  });

  it('treats calls with different date ranges as separate cache entries', async () => {
    const cache = makeCache();
    const client = new Client({
      ...makeCredentials(),
      fetch: makeFetch(MOCK_GET_SERIES_RESPONSE),
      cache,
    });

    await client.getSeries(SERIES_ID, { firstdate: '2024-01-01' });
    await client.getSeries(SERIES_ID, { firstdate: '2023-01-01' });
    assert.equal(cache.store.size, 2);
  });

  it('passes cacheTtlMs to cache.set', async () => {
    const ttlsReceived: Array<number | undefined> = [];
    const cache: Cache = {
      get: () => undefined,
      set: (_key, _value, ttlMs) => {
        ttlsReceived.push(ttlMs);
      },
    };

    const client = new Client({
      ...makeCredentials(),
      fetch: makeFetch(MOCK_GET_SERIES_RESPONSE),
      cache,
      cacheTtlMs: 60_000,
    });

    await client.getSeries(SERIES_ID);
    assert.deepEqual(ttlsReceived, [60_000]);
  });

  it('does not cache errors — a subsequent call retries the HTTP request', async () => {
    const cache = makeCache();
    let fetchCalls = 0;
    const failThenSucceed: typeof globalThis.fetch = async () => {
      fetchCalls++;
      if (fetchCalls === 1) {
        return new Response('error', { status: 503 });
      }
      return new Response(JSON.stringify(MOCK_GET_SERIES_RESPONSE));
    };

    const client = new Client({ ...makeCredentials(), fetch: failThenSucceed, cache });

    await assert.rejects(() => client.getSeries(SERIES_ID));
    assert.equal(cache.store.size, 0);

    await client.getSeries(SERIES_ID);
    assert.equal(fetchCalls, 2);
  });
});

// ---------------------------------------------------------------------------
// Client — caching (searchSeries)
// ---------------------------------------------------------------------------

describe('Client.searchSeries — caching', () => {
  it('stores the result in the cache on a miss', async () => {
    const cache = makeCache();
    const client = new Client({
      ...makeCredentials(),
      fetch: makeFetch(MOCK_SEARCH_SERIES_RESPONSE),
      cache,
    });

    const infos = await client.searchSeries('DAILY');
    assert.equal(cache.store.size, 1);
    assert.deepEqual(cache.store.get('searchSeries:DAILY'), infos);
  });

  it('returns the cached value on a hit without making an HTTP call', async () => {
    const cache = makeCache();
    let fetchCalls = 0;
    const countingFetch: typeof globalThis.fetch = async () => {
      fetchCalls++;
      return new Response(JSON.stringify(MOCK_SEARCH_SERIES_RESPONSE));
    };

    const client = new Client({ ...makeCredentials(), fetch: countingFetch, cache });

    await client.searchSeries('MONTHLY');
    assert.equal(fetchCalls, 1);

    await client.searchSeries('MONTHLY');
    assert.equal(fetchCalls, 1);
  });

  it('treats different frequencies as separate cache entries', async () => {
    const cache = makeCache();
    const client = new Client({
      ...makeCredentials(),
      fetch: makeFetch(MOCK_SEARCH_SERIES_RESPONSE),
      cache,
    });

    await client.searchSeries('DAILY');
    await client.searchSeries('MONTHLY');
    assert.equal(cache.store.size, 2);
  });

  it('does not cache errors — a subsequent call retries the HTTP request', async () => {
    const cache = makeCache();
    let fetchCalls = 0;
    const failThenSucceed: typeof globalThis.fetch = async () => {
      fetchCalls++;
      if (fetchCalls === 1) {
        return new Response('error', { status: 503 });
      }
      return new Response(JSON.stringify(MOCK_SEARCH_SERIES_RESPONSE));
    };

    const client = new Client({ ...makeCredentials(), fetch: failThenSucceed, cache });

    await assert.rejects(() => client.searchSeries('DAILY'));
    assert.equal(cache.store.size, 0);

    await client.searchSeries('DAILY');
    assert.equal(fetchCalls, 2);
  });
});
