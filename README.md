# bcchapi

Node.js wrapper for the [Banco Central de Chile REST API](https://si3.bcentral.cl/siete). Features a fully typed HTTP client, curated series ID constants, and utility functions for transforming and analysing macroeconomic observations.

## Requirements

- Node.js >= 24.0.0

## Installation

```sh
npm install bcchapi
```

## Authentication

Register for free at [si3.bcentral.cl](https://si3.bcentral.cl/siete) to obtain API credentials (email + password).

## Usage

### Fetch a time series

```ts
import { Client } from 'bcchapi/client';
import { SERIES } from 'bcchapi/series';

const client = new Client({ user: 'me@example.com', pass: 'secret' });

const data = await client.getSeries(SERIES.PRICES.UF, {
  firstdate: '2024-01-01',
  lastdate: '2024-12-31',
});

console.log(data.descripIng); // "Unidad de Fomento (UF)"
console.log(data.observations); // [{ indexDateString, value, statusCode }, ...]
```

### Transform observations

```ts
import { toNumbers, toArrays, filterValid, fillForward, mean, rollingMean } from 'bcchapi/utils';

// Parse values to number | null (null for gaps)
const values = toNumbers(data.observations); // [37000.12, null, 37050.45, ...]

// Get parallel Date[] and (number | null)[] arrays
const { dates, values } = toArrays(data.observations);

// Filter out gap observations
const valid = filterValid(data.observations);

// Fill gaps by carrying the last valid value forward (e.g. weekends, holidays)
// Throws if the first observation has no valid value — ensure the start date
// falls on a trading day.
const filled = fillForward(data.observations);

// Summary statistics (gaps are ignored)
const avg = mean(data.observations);

// 3-period rolling mean
const rolling = rollingMean(data.observations, 3);
```

### Compute variations

```ts
import { periodVariation, annualVariation } from 'bcchapi/utils';

// Month-over-month change
const mom = periodVariation(cpi.observations);

// 12-month change for monthly series
const yoy = annualVariation(cpi.observations, 12);
```

### Search available series

```ts
const monthlySeries = await client.searchSeries('MONTHLY');
console.log(monthlySeries.map((s) => s.englishTitle));
```

### Enable caching

```ts
import { Client } from 'bcchapi/client';
import { MemoryCache } from 'bcchapi/cache';

const client = new Client({
  user: 'me@example.com',
  pass: 'secret',
  cache: new MemoryCache({ defaultTtlMs: 60 * 60 * 1000 }), // 1 hour
});

// Repeated calls with the same arguments hit the cache — no HTTP request
const data = await client.getSeries(SERIES.PRICES.UF);
```

Bring your own backend by implementing the `Cache` interface:

```ts
import type { Cache } from 'bcchapi/cache';

const redisCache: Cache = {
  get: (key) => {
    /* ... */
  },
  set: (key, value, ttlMs) => {
    /* ... */
  },
};

const client = new Client({ user, pass, cache: redisCache });
```

### Error handling

```ts
import { ApiError, HttpError } from 'bcchapi/client';

try {
  await client.getSeries('INVALID_ID');
} catch (err) {
  if (err instanceof ApiError) {
    // Non-zero Codigo in the API response body
    console.error(`API error ${err.codigo}: ${err.descripcion}`);
  } else if (err instanceof HttpError) {
    // Non-ok HTTP status
    console.error(`HTTP ${err.status}`);
  } else {
    // Network failure — original error available as err.cause
    throw err;
  }
}
```

## API

### `bcchapi/client`

#### `new Client(options)`

| Option       | Type           | Description                                                                       |
| ------------ | -------------- | --------------------------------------------------------------------------------- |
| `user`       | `string`       | BCCH account email                                                                |
| `pass`       | `string`       | BCCH account password                                                             |
| `fetch`      | `typeof fetch` | Custom fetch implementation (optional, useful for testing)                        |
| `cache`      | `Cache`        | Cache backend (optional) — any object satisfying the `Cache` interface            |
| `cacheTtlMs` | `number`       | TTL in milliseconds passed to `cache.set` on every successful response (optional) |

#### `client.getSeries(seriesId, options?)`

Fetches observations for a single time series.

| Parameter           | Type     | Description                                                |
| ------------------- | -------- | ---------------------------------------------------------- |
| `seriesId`          | `string` | BCCH series identifier                                     |
| `options.firstdate` | `string` | Start date `"YYYY-MM-DD"` (defaults to earliest available) |
| `options.lastdate`  | `string` | End date `"YYYY-MM-DD"` (defaults to most recent)          |

Returns `Promise<SeriesData>`.

#### `client.searchSeries(frequency)`

Returns metadata for all series with the given frequency. `frequency` is one of `'DAILY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL'`.

Returns `Promise<SeriesInfo[]>`.

### `bcchapi/cache`

#### `Cache` interface

Minimal interface for plugging in any cache backend:

```ts
interface Cache {
  get(key: string): unknown;
  set(key: string, value: unknown, ttlMs?: number): void;
}
```

#### `new MemoryCache(options?)`

Built-in in-memory cache. Entries are evicted lazily on `get` — no background timers.

| Option         | Type     | Description                                                      |
| -------------- | -------- | ---------------------------------------------------------------- |
| `defaultTtlMs` | `number` | Default TTL in milliseconds. Omit for entries that never expire. |

### `bcchapi/series`

`SERIES` is a nested `as const` object of curated series IDs grouped by domain:

| Group                      | Description                                          |
| -------------------------- | ---------------------------------------------------- |
| `SERIES.EXCHANGE_RATE`     | USD/CLP and major currency pairs                     |
| `SERIES.PRICES`            | UF, UTM, IVP, CPI and components                     |
| `SERIES.INTEREST_RATES`    | MPR, BCP/BCU sovereign bonds, PDBC rates             |
| `SERIES.MONEY`             | M1, M2, M3, bank loans by type                       |
| `SERIES.NATIONAL_ACCOUNTS` | Imacec and components                                |
| `SERIES.EXTERNAL_SECTOR`   | Current account, exports, imports, FDI               |
| `SERIES.EMPLOYMENT`        | Unemployment rate, labour force, employed/unemployed |
| `SERIES.PUBLIC_FINANCES`   | Government revenue, expenditure, fiscal balance      |
| `SERIES.CAPITAL_MARKET`    | IPSA, stock market capitalisation                    |

Use [si3.bcentral.cl](https://si3.bcentral.cl/siete) or `client.searchSeries()` to discover additional series IDs beyond the curated set.

### `bcchapi/utils`

#### Transform functions

| Function                           | Description                                                                                                          |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `parseValue(value)`                | Parses a value string to `number \| null` (`null` for empty or non-numeric)                                          |
| `filterValid(observations)`        | Returns only observations with parseable numeric values                                                              |
| `toNumbers(observations)`          | Maps observations to `Array<number \| null>`                                                                         |
| `toMap(observations)`              | Returns a `Map<string, number \| null>` keyed by `indexDateString`                                                   |
| `toArrays(observations)`           | Returns `{ dates: Date[], values: Array<number \| null> }`                                                           |
| `fillForward(observations)`        | Fills gap observations by carrying the last valid value forward. Throws if the first observation has no valid value. |
| `parseObservationDate(dateString)` | Parses `"DD-MM-YYYY"` to a UTC `Date`                                                                                |
| `formatQueryDate(date)`            | Formats a `Date` to `"YYYY-MM-DD"` for use in `getSeries` options                                                    |

#### Statistics functions

All stats functions operate on `Observation[]` and ignore gap values (empty or non-numeric).

| Function                                        | Description                                                              |
| ----------------------------------------------- | ------------------------------------------------------------------------ |
| `mean(observations)`                            | Arithmetic mean                                                          |
| `stdDev(observations)`                          | Sample standard deviation (Bessel's correction)                          |
| `min(observations)`                             | Minimum value                                                            |
| `max(observations)`                             | Maximum value                                                            |
| `periodVariation(observations)`                 | Period-over-period fractional change (`value[i] / value[i-1] - 1`)       |
| `annualVariation(observations, periodsPerYear)` | Year-over-year fractional change (`value[i] / value[i - n] - 1`)         |
| `rollingMean(observations, window)`             | Rolling mean over a fixed window; `null` if any value in window is a gap |

## Terms of Use

Use of the Banco Central de Chile API is subject to their [terms and conditions](https://si3.bcentral.cl/estadisticas/Principal1/Web_Services/index_BDE_TC.htm). Key points:

- **Registration required** — you must register and accept the terms at [si3.bcentral.cl](https://si3.bcentral.cl/siete) to obtain credentials.
- **Rate limit** — maximum 5 simultaneous requests per second per account. The API does not support bulk or parallel fetching.
- **Attribution** — any application or publication that uses data from this API must credit **Banco Central de Chile** as the original source.

This library does not redistribute any data. All data is fetched directly from the official API at runtime by the consuming application.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
