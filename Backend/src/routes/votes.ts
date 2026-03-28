import { Router, type IRouter } from 'express';
import { castVote, getVotes } from '../controllers/votes.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { VoteSchema } from '../schemas/vote.schema.js';

const router: IRouter = Router();

/**
 * POST /api/votes
 * Cast a vote on a proposal (requires auth).
 */
router.post('/', authMiddleware, validate(VoteSchema), castVote);

/**
 * GET /api/votes/:proposalId
 * Get all votes for a proposal.
 */
router.get('/:proposalId', getVotes);

export default router;
