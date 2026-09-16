import mongoose from 'mongoose';
import { config } from './env.js';

interface DatabaseStatus {
  isConnected: boolean;
  status: 'connected' | 'connecting' | 'disconnecting' | 'disconnected';
  host?: string;
  name?: string;
}

export const connectDatabase = async (): Promise<typeof mongoose | null> => {
  try {
    // Event listeners
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connection established successfully.');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected.');
    });

    console.log(`Connecting to MongoDB...`);
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    return conn;
  } catch (error) {
    const err = error as Error;
    console.error(`Failed to connect to MongoDB: ${err.message}`);
    console.warn(`Server will continue running. Ensure MongoDB is running and MONGODB_URI is correctly configured.`);
    return null;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
};

export const getDatabaseStatus = (): DatabaseStatus => {
  const readyState = mongoose.connection.readyState;
  let status: DatabaseStatus['status'];

  switch (readyState) {
    case 1:
      status = 'connected';
      break;
    case 2:
      status = 'connecting';
      break;
    case 3:
      status = 'disconnecting';
      break;
    default:
      status = 'disconnected';
  }

  return {
    isConnected: readyState === 1,
    status,
    host: mongoose.connection.host || undefined,
    name: mongoose.connection.name || undefined,
  };
};
