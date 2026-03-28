import { Request, Response } from 'express';
import { Transaction } from '../models/Transaction.js';
import { Community } from '../models/Community.js';
import { getTreasuryBalance } from '../services/aptos.js';

/**
 * Get treasury info for a community: on-chain balance + transaction history.
 */
export async function getTreasury(req: Request, res: Response): Promise<void> {
  try {
    const communityId = req.params.communityId as string;

    // Verify community exists
    const community = await Community.findById(communityId);
    if (!community) {
      res.status(404).json({
        message: 'Community not found',
        code: 'COMMUNITY_NOT_FOUND',
        statusCode: 404,
      });
      return;
    }

    // Fetch on-chain balance and transaction history in parallel
    const [balanceAPT, transactions] = await Promise.all([
      getTreasuryBalance(communityId),
      Transaction.find({ communityId })
        .sort({ confirmedAt: -1 })
        .limit(50)
        .lean(),
    ]);

    res.status(200).json({
      communityId: String(community._id),
      balanceAPT,
      // TODO(civicnode): Integrate a price oracle for APT-to-GHS conversion
      balanceGHS: 0,
      transactions: transactions.map((tx) => ({
        id: String(tx._id),
        communityId: String(tx.communityId),
        proposalId: tx.proposalId ? String(tx.proposalId) : null,
        amount: tx.amount,
        recipient: tx.recipient,
        txHash: tx.txHash,
        confirmedAt: tx.confirmedAt.toISOString(),
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[treasury] getTreasury error: ${message}`);
    res.status(500).json({
      message: 'Failed to fetch treasury info',
      code: 'TREASURY_FETCH_ERROR',
      statusCode: 500,
    });
  }
}
