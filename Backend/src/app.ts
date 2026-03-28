import express, { type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { getEnv } from './config/env.js';

// Route imports
import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import communitiesRoutes from './routes/communities.js';
import logsRoutes from './routes/logs.js';
import proposalsRoutes from './routes/proposals.js';
import votesRoutes from './routes/votes.js';
import treasuryRoutes from './routes/treasury.js';

/**
 * Structured API error shape returned to clients.
 */
interface ApiErrorResponse {
  message: string;
  code: string;
  statusCode: number;
}

export function createApp(): express.Application {
  const app = express();
  const { CORS_ORIGIN } = getEnv();

  // --- Security & parsing middleware ---
  app.use(helmet());
  app.use(
    cors({
      origin: CORS_ORIGIN,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // --- Route mounts (all under /api prefix) ---
  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/communities', communitiesRoutes);
  app.use('/api/logs', logsRoutes);
  app.use('/api/proposals', proposalsRoutes);
  app.use('/api/votes', votesRoutes);
  app.use('/api/treasury', treasuryRoutes);

  // --- 404 handler for unmatched routes ---
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      message: 'Route not found',
      code: 'NOT_FOUND',
      statusCode: 404,
    } satisfies ApiErrorResponse);
  });

  // --- Global error handler ---
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const message = err instanceof Error ? err.message : 'Internal server error';
    const statusCode =
      err instanceof Error && 'statusCode' in err
        ? (err as { statusCode: number }).statusCode
        : 500;

    console.error(`[error] ${message}`, err instanceof Error ? err.stack : '');

    res.status(statusCode).json({
      message,
      code: 'INTERNAL_ERROR',
      statusCode,
    } satisfies ApiErrorResponse);
  });

  return app;
}
