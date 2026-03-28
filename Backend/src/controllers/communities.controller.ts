import { Request, Response } from 'express';
import { Community } from '../models/Community.js';
import { User, UserRole } from '../models/User.js';

/**
 * Create a new community. The requesting user becomes the admin.
 */
export async function createCommunity(req: Request, res: Response): Promise<void> {
  try {
    const { name, quorumThreshold } = req.body as {
      name: string;
      quorumThreshold?: number;
    };

    const walletAddress = req.user?.walletAddress;
    if (!walletAddress) {
      res.status(401).json({
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
        statusCode: 401,
      });
      return;
    }

    // Check if user already administers a community
    const existingCommunity = await Community.findOne({ adminWallet: walletAddress });
    if (existingCommunity) {
      res.status(409).json({
        message: 'You already administer a community',
        code: 'COMMUNITY_ALREADY_EXISTS',
        statusCode: 409,
      });
      return;
    }

    const community = await Community.create({
      name,
      adminWallet: walletAddress,
      quorumThreshold: quorumThreshold ?? 51,
      memberCount: 1,
      memberWallets: [walletAddress],
    });

    // Update the user's role to admin and link them to this community
    await User.findOneAndUpdate(
      { walletAddress },
      { role: UserRole.ADMIN, communityId: community._id }
    );

    res.status(201).json({
      id: String(community._id),
      name: community.name,
      adminWallet: community.adminWallet,
      quorumThreshold: community.quorumThreshold,
      memberCount: community.memberCount,
      memberWallets: community.memberWallets,
      createdAt: community.createdAt.toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[communities] createCommunity error: ${message}`);
    res.status(500).json({
      message: 'Failed to create community',
      code: 'COMMUNITY_CREATE_ERROR',
      statusCode: 500,
    });
  }
}

/**
 * Get a community by ID.
 */
export async function getCommunity(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const community = await Community.findById(id);
    if (!community) {
      res.status(404).json({
        message: 'Community not found',
        code: 'COMMUNITY_NOT_FOUND',
        statusCode: 404,
      });
      return;
    }

    res.status(200).json({
      id: String(community._id),
      name: community.name,
      adminWallet: community.adminWallet,
      quorumThreshold: community.quorumThreshold,
      memberCount: community.memberCount,
      memberWallets: community.memberWallets,
      createdAt: community.createdAt.toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[communities] getCommunity error: ${message}`);
    res.status(500).json({
      message: 'Failed to fetch community',
      code: 'COMMUNITY_FETCH_ERROR',
      statusCode: 500,
    });
  }
}
