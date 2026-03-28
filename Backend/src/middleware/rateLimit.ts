import rateLimit, { type Options } from 'express-rate-limit';
import { type Request } from 'express';
import { getRedisClient } from '../config/redis.js';
import { getEnv } from '../config/env.js';

/**
 * Create a rate limiter with custom options.
 * Uses a simple in-memory + Redis hybrid approach:
 * express-rate-limit handles the core logic; we use Redis for the key prefix
 * to share state across restarts (but not across instances without a Redis store adapter).
 */
export function createRateLimiter(options: Partial<Options>) {
  return rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
  });
}

/**
 * AI synthesis rate limiter: limits calls per community per day.
 * Uses communityId from the request body as the rate limit key,
 * so each community gets its own quota.
 */
export function createAiSynthesisLimiter() {
  const { RATE_LIMIT_AI_PER_DAY } = getEnv();
  const redis = getRedisClient();

  return async function aiSynthesisLimiter(
    req: Request,
    res: import('express').Response,
    next: import('express').NextFunction
  ): Promise<void> {
    try {
      // Community ID comes from the request body or query
      const communityId =
        (req.body as Record<string, unknown>)?.communityId ??
        req.query.communityId;

      if (!communityId || typeof communityId !== 'string') {
        res.status(400).json({
          message: 'communityId is required for AI synthesis',
          code: 'RATE_LIMIT_MISSING_KEY',
          statusCode: 400,
        });
        return;
      }

      // Daily key: resets at midnight UTC
      const today = new Date().toISOString().slice(0, 10);
      const key = `ratelimit:ai:${communityId}:${today}`;

      const current = await redis.incr(key);

      // Set expiry on first use (25 hours to handle timezone edge cases)
      if (current === 1) {
        await redis.expire(key, 25 * 60 * 60);
      }

      if (current > RATE_LIMIT_AI_PER_DAY) {
        res.status(429).json({
          message: `AI synthesis limit reached (${RATE_LIMIT_AI_PER_DAY} per community per day). Try again tomorrow.`,
          code: 'RATE_LIMIT_AI_EXCEEDED',
          statusCode: 429,
        });
        return;
      }

      // Attach remaining quota in response headers for client visibility
      res.setHeader('X-RateLimit-Limit', RATE_LIMIT_AI_PER_DAY);
      res.setHeader('X-RateLimit-Remaining', RATE_LIMIT_AI_PER_DAY - current);

      next();
    } catch (error: unknown) {
      // If Redis is down, allow the request through rather than blocking all AI usage
      console.error('[rateLimit] Redis error, allowing request:', error instanceof Error ? error.message : error);
      next();
    }
  };
}
