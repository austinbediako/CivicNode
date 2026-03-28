import { Router, type IRouter } from 'express';
import {
  getProposals,
  getProposal,
  updateProposal,
  publishProposal,
  synthesizeProposal,
} from '../controllers/proposals.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { UpdateProposalSchema } from '../schemas/proposal.schema.js';
import { createAiSynthesisLimiter } from '../middleware/rateLimit.js';

const router: IRouter = Router();

/**
 * GET /api/proposals
 * List proposals with optional status filter and pagination.
 */
router.get('/', getProposals);

/**
 * GET /api/proposals/:id
 * Get a single proposal by ID.
 */
router.get('/:id', getProposal);

/**
 * PATCH /api/proposals/:id
 * Update a draft proposal (requires auth).
 */
router.patch('/:id', authMiddleware, validate(UpdateProposalSchema), updateProposal);

/**
 * POST /api/proposals/:id/publish
 * Publish a draft proposal to live status (requires auth).
 */
router.post('/:id/publish', authMiddleware, publishProposal);

/**
 * POST /api/proposals/synthesize
 * AI-powered proposal synthesis from chat log (requires auth, rate-limited).
 */
router.post(
  '/synthesize',
  authMiddleware,
  createAiSynthesisLimiter(),
  synthesizeProposal
);

export default router;
