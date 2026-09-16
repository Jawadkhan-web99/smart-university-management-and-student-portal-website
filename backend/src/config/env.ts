import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  isProduction: process.env.NODE_ENV === 'production',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_university',
  jwtSecret: process.env.JWT_SECRET || 'super_secret_jwt_key_phase2_replace_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
} as const;
