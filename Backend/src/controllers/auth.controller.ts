import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User.js';
import { getEnv } from '../config/env.js';

/**
 * Verify a wallet signature and issue a JWT.
 * In a full implementation, the signature would be verified against the message
 * using the wallet's public key. For now, we trust the wallet address and
 * find-or-create the user.
 *
 * TODO(civicnode): Implement actual signature verification using ethers or viem
 */
export async function verifyWallet(req: Request, res: Response): Promise<void> {
  try {
    const { walletAddress, signature, message } = req.body as {
      walletAddress: string;
      signature: string;
      message: string;
    };

    // TODO(civicnode): Verify the signature cryptographically
    // For now, we check that all fields are present (Zod already validated this)
    // In production, use viem's verifyMessage or ethers to confirm the wallet owns the signature
    if (!signature || !message) {
      res.status(400).json({
        message: 'Signature and message are required for verification',
        code: 'AUTH_MISSING_FIELDS',
        statusCode: 400,
      });
      return;
    }

    // Find existing user or create a new one
    let user = await User.findOne({ walletAddress });

    if (!user) {
      user = await User.create({
        walletAddress,
        role: UserRole.MEMBER,
        communityId: null,
      });
      console.log(`[auth] New user created: ${walletAddress}`);
    }

    // Sign a JWT with user info
    const { JWT_SECRET } = getEnv();
    const tokenPayload = {
      walletAddress: user.walletAddress,
      role: user.role,
      communityId: user.communityId ? String(user.communityId) : '',
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({
      token,
      user: {
        id: String(user._id),
        walletAddress: user.walletAddress,
        role: user.role,
        communityId: user.communityId ? String(user.communityId) : '',
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[auth] verifyWallet error: ${message}`);
    res.status(500).json({
      message: 'Authentication failed',
      code: 'AUTH_INTERNAL_ERROR',
      statusCode: 500,
    });
  }
}
