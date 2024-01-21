import { Frequency } from '../../src/client';
import reverseDate from '../../src/helpers/reverse-date';
import fixtures from '../fixtures';

export default (input: string | URL | Request) => {
  const params = new URL(input.toString()).searchParams;
  const func = params.get('function') || 'GetSeries';

  if (params.get('user') !== 'test' || params.get('pass') !== 'test') {
    return Promise.resolve({
      json: () => Promise.resolve(fixtures.response.credentialsInvalid),
    } as Response);
  }

  if (func === 'GetSeries') {
    if (fixtures.response.getSeriesSuccess.Series.seriesId !== params.get('timeseries')) {
      return Promise.resolve({
        json: () => Promise.resolve(fixtures.response.getSeriesInvalid),
      } as Response);
    }

    const firstDate = params.get('firstdate');
    const lastDate = params.get('lastdate');
    const obs = fixtures.response.getSeriesSuccess.Series.Obs.filter((o) => {
      if (firstDate && lastDate) {
        return (
          reverseDate(o.indexDateString) >= firstDate && reverseDate(o.indexDateString) <= lastDate
        );
      }
      if (firstDate) {
        return reverseDate(o.indexDateString) >= firstDate;
      }
      if (lastDate) {
        return reverseDate(o.indexDateString) <= lastDate;
      }
      return true;
    });
    const series = {
      ...fixtures.response.getSeriesSuccess.Series,
      Obs: obs,
    };

    return Promise.resolve({
      json: () =>
        Promise.resolve({
          ...fixtures.response.getSeriesSuccess,
          Series: series,
        }),
    } as Response);
  }

  if (func === 'SearchSeries') {
    const frequency = params.get('frequency');

    if (!Object.values(Frequency).includes(frequency as Frequency)) {
      return Promise.resolve({
        json: () => Promise.resolve(fixtures.response.searchSeriesInvalid),
      } as Response);
    }

    const response = {
      ...fixtures.response.searchSeriesSuccess,
      SeriesInfo: fixtures.response.searchSeriesSuccess.SeriesInfos.filter(
        (series) => series.frequencyCode === frequency,
      ),
    };

    return Promise.resolve({
      json: () => Promise.resolve(response),
    } as Response);
  }

  return Promise.resolve({
    json: () => Promise.resolve({}),
  } as Response);
};
