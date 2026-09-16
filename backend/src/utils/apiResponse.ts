import { Response } from 'express';

export interface ApiResponseData<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: unknown;
  timestamp: string;
}

export class ApiResponse {
  static success<T>(res: Response, message: string, data?: T, statusCode = 200): Response {
    const payload: ApiResponseData<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(payload);
  }

  static error(res: Response, message: string, statusCode = 500, error?: unknown): Response {
    const payload: ApiResponseData = {
      success: false,
      message,
      error: error ?? null,
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(payload);
  }
}
