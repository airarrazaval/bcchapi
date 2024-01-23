import { expect, describe, it, vi, afterEach, beforeEach } from 'vitest';
import {
  Client,
  Frequency,
  InvalidCredentialsError,
  InvalidSeriesError,
  InvalidFrequencyError,
} from '../src';
import { reverseDate } from '../src/utils';
import fetchMock from './mocks/fetch.mock';
import fixtures from './fixtures';

const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(fetchMock);

describe('Client', () => {
  const client = new Client({
    user: 'test',
    pass: 'test',
  });

  const invalidClient = new Client({
    user: '',
    pass: '',
  });

  it('should create a Client instance', () => {
    expect(client).toBeInstanceOf(Client);
  });

  describe('getSeries', () => {
    beforeEach(() => {
      fetchSpy.mockImplementation(fetchMock);
    });
    afterEach(() => {
      fetchSpy.mockReset();
    });

    it('should throw an error if series is not a non-empty string', async () => {
      await expect(
        client.getSeries({
          series: undefined as unknown as string,
        }),
      ).rejects.toThrow('series must be a non-empty string');
      await expect(
        client.getSeries({
          series: '',
        }),
      ).rejects.toThrow('series must be a non-empty string');

      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should throw an error if date range is invalid', async () => {
      await expect(
        client.getSeries({
          series: 'TEST',
          since: 'invalid',
        }),
      ).rejects.toThrow('"since" is not a valid date string or Date object');
      await expect(
        client.getSeries({
          series: 'TEST',
          since: new Date('invalid'),
        }),
      ).rejects.toThrow('"since" is not a valid date string or Date object');

      await expect(
        client.getSeries({
          series: 'TEST',
          until: 'invalid',
        }),
      ).rejects.toThrow('"until" is not a valid date string or Date object');
      await expect(
        client.getSeries({
          series: 'TEST',
          until: new Date('invalid'),
        }),
      ).rejects.toThrow('"until" is not a valid date string or Date object');

      await expect(
        client.getSeries({
          series: 'TEST',
          since: new Date(2020, 0, 1),
          until: new Date(2000, 0, 1),
        }),
      ).rejects.toThrow('invalid date range');

      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should throw error if credentials are invalid', async () => {
      await expect(invalidClient.getSeries({ series: 'TEST' })).rejects.toThrow(
        InvalidCredentialsError,
      );
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw error if series does not exist', async () => {
      await expect(client.getSeries({ series: 'invalid' })).rejects.toThrow(InvalidSeriesError);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('should return the series history information', async () => {
      const series = await client.getSeries({ series: 'TEST' });

      expect(fetchSpy).toHaveBeenCalledTimes(1);

      expect(series).toBeDefined();
      expect(series.seriesId).toBe('TEST');
      expect(series.description).toBe('Test');
      expect(series.data).toBeInstanceOf(Array);
      expect(series.data).toHaveLength(15);

      for (let i = 0; i < series.data.length; i += 1) {
        expect(reverseDate(series.data[i].date)).toBe(
          fixtures.response.getSeriesSuccess.Series.Obs[i].indexDateString,
        );
        expect(series.data[i].value.toFixed(2)).toBe(
          fixtures.response.getSeriesSuccess.Series.Obs[i].value,
        );

        if (Number.isNaN(series.data[i].value)) {
          expect(fixtures.response.getSeriesSuccess.Series.Obs[i].statusCode).toBe('ND');
        }
      }
    });

    it('should filter the series history by date range', async () => {
      const series = await client.getSeries({
        series: 'TEST',
        until: '2020-12-05',
      });

      expect(fetchSpy).toHaveBeenCalledTimes(1);

      expect(series).toBeDefined();
      expect(series.seriesId).toBe('TEST');
      expect(series.description).toBe('Test');
      expect(series.data).toBeInstanceOf(Array);
      expect(series.data).toHaveLength(5);

      for (let i = 0; i < series.data.length; i += 1) {
        expect(reverseDate(series.data[i].date)).toBe(
          fixtures.response.getSeriesSuccess.Series.Obs[i].indexDateString,
        );
        expect(series.data[i].value.toFixed(2)).toBe(
          fixtures.response.getSeriesSuccess.Series.Obs[i].value,
        );

        if (Number.isNaN(series.data[i].value)) {
          expect(fixtures.response.getSeriesSuccess.Series.Obs[i].statusCode).toBe('ND');
        }
      }
    });

    it('should return empty results if series has no data', async () => {
      const series = await client.getSeries({
        series: 'TEST',
        since: '2020-12-16',
      });

      expect(fetchSpy).toHaveBeenCalledTimes(1);

      expect(series).toBeDefined();
      expect(series.seriesId).toBe('TEST');
      expect(series.description).toBe('Test');
      expect(series.data).toBeInstanceOf(Array);
      expect(series.data).toHaveLength(0);
    });
  });

  describe('searchSeries', () => {
    beforeEach(() => {
      fetchSpy.mockImplementation(fetchMock);
    });
    afterEach(() => {
      fetchSpy.mockReset();
    });

    it('should throw an error if frequency is not a non-empty string', async () => {
      await expect(
        client.searchSeries({
          frequency: undefined as unknown as Frequency,
        }),
      ).rejects.toThrow('frequency must be a non-empty string');
      await expect(
        client.searchSeries({
          frequency: '' as Frequency,
        }),
      ).rejects.toThrow('frequency must be a non-empty string');

      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should throw error if credentials are invalid', async () => {
      await expect(
        invalidClient.searchSeries({
          frequency: Frequency.Daily,
        }),
      ).rejects.toThrow(InvalidCredentialsError);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw error if frequency is invalid', async () => {
      await expect(
        client.searchSeries({
          frequency: 'invalid' as Frequency,
        }),
      ).rejects.toThrow(InvalidFrequencyError);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('should return the series metadata information', async () => {
      const series = await client.searchSeries({
        frequency: Frequency.Daily,
      });

      expect(fetchSpy).toHaveBeenCalledTimes(1);

      expect(series).toBeInstanceOf(Array);
      expect(series).toHaveLength(1);
    });
  });
});
