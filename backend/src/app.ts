import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config/env.js';
import apiRouter from './routes/index.js';
import { notFoundMiddleware } from './middleware/notFound.middleware.js';
import { errorHandlerMiddleware } from './middleware/error.middleware.js';

export const createApp = (): Application => {
  const app: Application = express();

  // Basic security and parsing middleware
  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static uploads directory for submissions and profile avatars
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Root welcome endpoint
  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: 'Smart University Management & Student Portal API',
      version: '1.0.0',
      documentation: '/api/health',
    });
  });

  // API sub-routes
  app.use('/api', apiRouter);

  // 404 handler for unmatched routes
  app.use(notFoundMiddleware);

  // Centralized error handler
  app.use(errorHandlerMiddleware);

  return app;
};
