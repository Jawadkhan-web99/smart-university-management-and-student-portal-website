import { createApp } from './app.js';
import { config } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

const app = createApp();

const startServer = async () => {
  const server = app.listen(config.port, () => {
    console.log(`=========================================`);
    console.log(` Smart University Backend API Running`);
    console.log(` Environment : ${config.nodeEnv}`);
    console.log(` Port        : ${config.port}`);
    console.log(` Health URL  : http://localhost:${config.port}/api/health`);
    console.log(` Auth URL    : http://localhost:${config.port}/api/auth`);
    console.log(`=========================================`);
  });

  // Connect to MongoDB asynchronously
  connectDatabase().catch((err) => {
    console.warn(`[Database] Initial MongoDB connection error: ${err.message}`);
  });

  // Graceful shutdown handling
  const shutdown = async (signal: string) => {
    console.log(`${signal} signal received: shutting down gracefully`);
    await disconnectDatabase();
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
