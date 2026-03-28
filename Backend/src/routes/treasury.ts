import { Router, type IRouter } from 'express';
import { getTreasury } from '../controllers/treasury.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router: IRouter = Router();

/**
 * GET /api/treasury/:communityId
 * Get treasury balance and transaction history (requires auth).
 */
router.get('/:communityId', authMiddleware, getTreasury);

export default router;
