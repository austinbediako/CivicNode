import { Router, type IRouter } from 'express';
import { verifyWallet } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { AuthVerifySchema } from '../schemas/auth.schema.js';

const router: IRouter = Router();

/**
 * POST /api/auth/verify
 * Verify a wallet signature and receive a JWT.
 */
router.post('/verify', validate(AuthVerifySchema), verifyWallet);

export default router;
