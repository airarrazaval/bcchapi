import { ErrorResponse } from './types';

export enum ErrorCodes {
  InvalidCredentials = -5,
  InvalidFrequency = -1,
  InvalidSeries = -50,
  InvalidDateRange = -1,
  Unknown = -1,
}

export class WebServiceError extends Error {
  response?: ErrorResponse;

  constructor(response?: ErrorResponse, message?: string) {
    super(message || response?.Descripcion || 'Unknown service error');
    this.response = response;
  }
}

export class InvalidFrequencyError extends WebServiceError {
  constructor(response?: ErrorResponse) {
    super(response, 'Invalid frequency code (must be DAILY, MONTHLY, QUARTERLY or ANNUAL)');
  }
}

export class InvalidCredentialsError extends WebServiceError {
  constructor(response?: ErrorResponse) {
    super(response, 'Invalid username or password');
  }
}

export class InvalidSeriesError extends WebServiceError {
  constructor(response?: ErrorResponse) {
    super(response, 'Invalid series id');
  }
}
