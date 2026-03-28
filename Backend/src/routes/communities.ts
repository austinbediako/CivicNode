import { Router, type IRouter } from 'express';
import { createCommunity, getCommunity } from '../controllers/communities.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router: IRouter = Router();

/**
 * POST /api/communities
 * Create a new community (requires auth).
 */
router.post('/', authMiddleware, createCommunity);

/**
 * GET /api/communities/:id
 * Get a community by ID.
 */
router.get('/:id', getCommunity);

export default router;
