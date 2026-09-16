import { Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse.js';

export const notFoundMiddleware = (req: Request, res: Response): void => {
  ApiResponse.error(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};
