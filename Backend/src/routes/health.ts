import { Router, type IRouter } from 'express';

const router: IRouter = Router();

/**
 * GET /api/health
 * Basic health check endpoint — no auth required.
 */
router.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;
