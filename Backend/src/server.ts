// Load .env before anything else — must be the first import
import 'dotenv/config';
import mongoose from 'mongoose';
import { validateEnv } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { closeRedis, getRedisClient } from './config/redis.js';
import { startExecutionCron, stopExecutionCron } from './services/execution.js';
import { createApp } from './app.js';

async function main(): Promise<void> {
  // Validate all required environment variables upfront
  const env = validateEnv();

  console.log(`[server] Starting CivicNode Backend (${env.NODE_ENV})...`);

  // Connect to MongoDB with retry logic
  await connectDatabase();

  // Initialize Redis (connection happens lazily on first use, but warm it up)
  getRedisClient();

  // Start the proposal execution cron job
  startExecutionCron();

  // Create and start the Express app
  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log(`[server] Listening on http://localhost:${env.PORT}`);
    console.log(`[server] Health check: http://localhost:${env.PORT}/api/health`);
  });

  // --- Graceful shutdown ---
  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n[server] Received ${signal}. Shutting down gracefully...`);

    // Stop accepting new connections
    server.close(() => {
      console.log('[server] HTTP server closed');
    });

    // Stop the execution cron job
    stopExecutionCron();

    // Close database connection
    try {
      await mongoose.disconnect();
      console.log('[server] MongoDB disconnected');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[server] Error disconnecting MongoDB: ${message}`);
    }

    // Close Redis connection
    try {
      await closeRedis();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[server] Error closing Redis: ${message}`);
    }

    console.log('[server] Shutdown complete');
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[server] Fatal startup error: ${message}`);
  process.exit(1);
});
