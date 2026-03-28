import Redis from 'ioredis';
import { getEnv } from './env.js';

let redisClient: Redis | undefined;

/**
 * Get or create the Redis client singleton.
 * Handles connection errors gracefully — logs them instead of crashing.
 */
export function getRedisClient(): Redis {
  if (redisClient) {
    return redisClient;
  }

  const { REDIS_URL } = getEnv();

  redisClient = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times: number) {
      // Exponential backoff capped at 3 seconds
      const delay = Math.min(times * 200, 3000);
      console.log(`[redis] Reconnecting in ${delay}ms (attempt ${times})...`);
      return delay;
    },
    lazyConnect: false,
  });

  redisClient.on('connect', () => {
    console.log('[redis] Connected');
  });

  redisClient.on('error', (err: Error) => {
    // Log but don't crash — the app can degrade gracefully without Redis
    console.error(`[redis] Connection error: ${err.message}`);
  });

  redisClient.on('close', () => {
    console.log('[redis] Connection closed');
  });

  return redisClient;
}

/**
 * Gracefully close the Redis connection.
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = undefined;
    console.log('[redis] Disconnected');
  }
}
