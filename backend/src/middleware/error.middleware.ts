import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse.js';
import { config } from '../config/env.js';

export interface AppError extends Error {
  statusCode?: number;
  code?: number;
  errors?: Record<string, { message: string }>;
}

export const errorHandlerMiddleware = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose duplicate key error (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate key error: An account with this email address already exists.';
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    const errorDetails = Object.values(err.errors).map((e) => e.message);
    message = `Validation failed: ${errorDetails.join('; ')}`;
  }

  // Handle Mongoose cast errors (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource identifier provided.';
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token signature.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired.';
  }

  console.error(`[Error] ${statusCode} - ${message}`);

  ApiResponse.error(
    res,
    message,
    statusCode,
    config.isProduction ? undefined : { stack: err.stack }
  );
};
