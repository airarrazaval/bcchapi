# BCCHAPI

[Statistical Data Base API](https://si3.bcentral.cl/Siete/es/Siete/API) client of the Central Bank of Chile.

The Central Bank of Chile provides a web service that allows searching and extracting economic information contained in its Statistical Data Base (BDE). The records are displayed in a format useful for developers and analysts who wish to automate their query processes.

The API currently supports only to functions: `GetSeries` (default) used for retrieveng historical data on a specific series, and `SearchSeries` used for searching series by frequency code (ie: daily, monthly, quearterly or yearly).

For further information on how to use the API directly, please refer to the [official documentation](https://si3.bcentral.cl/estadisticas/Principal1/Web_Services/doc_en.htm).

## Installation

```
npm i -S bcchapi
```

## Usage

```javascript
// ESM
import Client from 'bcchapi';

// CommonJS
const Client = require('bcchapi');
```

### Authentication

To authenticate the API calls you first need to register at the [Statistical Data Base Website](https://si3.bcentral.cl/Siete/es/Siete/API) of the Central Bank of Chile, login and activate your credentials.

```js
const client = new Client({
  user: 'jdoe@example.com',
  pass: 'secret',
});
```


### GetSeries

Allows you to retrieve historic data series.

#### Parameters

|name|type|required|description|example
|---|---|---|---|---|
|series|`string`|Yes|The series identifier|`'F072.EUR.USD.N.O.D'`
|since|`string` or `Date`| No | The starting date of the series| `'2020-12-01'`
|until|`string` or `Date`| No | The ending date of the series| `'2020-12-02'`

> **NOTE**: The API does not implements pagination, so if you need to retrieve a large amount of data, you should use the `since` and `until` parameters to split the request into smaller chunks.

#### Example

```js
const series = await client.getSeries({
  series: 'F072.EUR.USD.N.O.D',
  since: '2020-12-01',
  until: '2020-12-02',
});

console.log(series);
```

*Output*
```js
{
  seriesId: 'F072.EUR.USD.N.O.D',
  description: 'Euro per US dollar',
  data: [
    { date: '2020-12-01', value: 0.8373 },
    { date: '2020-12-02', value: 0.8304 }
  ]
}
```

### SearchSeries

Allows you to search for series by their frequency code (ie: daily, weekly, monthly, yearly).

#### Parameters

|name|type|required|description|example
|---|---|---|---|---|
|frequency|`string`|Yes|The frequency code to search (`DAILY`, `MONTHLY`, `QUARTERLY`, `ANNUAL`)|`'DAILY'`

#### Example

```js
import { Frequency } from 'bcchapi';

const result = await client.searchSeries({ frequency: Frequency.DAILY });

console.log(result);
```

*Output*
```js
[
  ...
  {
    seriesId: 'F021.AHP.STO.N.CLP.0.D',
    frequency: 'DAILY',
    title: 'Time savings deposits, including those for housing',
    firstObservedAt: '2011-01-03',
    lastObservedAt: '2023-12-29',
    updatedAt: '2024-01-08',
    createdAt: '2024-01-08'
  },
  {
    seriesId: 'F021.BMO.STO.N.CLP.0.D',
    frequency: 'DAILY',
    title: 'Monetary base ',
    firstObservedAt: '2011-01-03',
    lastObservedAt: '2023-12-29',
    updatedAt: '2024-01-08',
    createdAt: '2024-01-08'
  },
  ...
]
```

