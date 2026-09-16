import { Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse.js';
import { config } from '../config/env.js';
import { getDatabaseStatus } from '../config/database.js';

export const getHealth = (_req: Request, res: Response): void => {
  const dbStatus = getDatabaseStatus();

  const healthData = {
    status: 'healthy',
    service: 'smart-university-backend',
    version: '1.0.0',
    environment: config.nodeEnv,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      isConnected: dbStatus.isConnected,
      status: dbStatus.status,
      name: dbStatus.name || 'smart_university',
    },
  };

  ApiResponse.success(
    res,
    'Smart University Backend API is operational',
    healthData
  );
};
