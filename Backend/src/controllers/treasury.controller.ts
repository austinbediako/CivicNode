import { Request, Response } from 'express';
import { Transaction } from '../models/Transaction.js';
import { Community } from '../models/Community.js';
import { getTreasuryBalance } from '../services/sui.js';

import { getSuiToGhsRate } from '../services/oracle.js';

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
    const [balanceSui, transactions, suiToGhsRate] = await Promise.all([
      getTreasuryBalance(communityId),
      Transaction.find({ communityId })
        .sort({ confirmedAt: -1 })
        .limit(50)
        .lean(),
      getSuiToGhsRate(),
    ]);

    // Convert SUI microbalance (if 9 decimals) to whole SUI, then to GHS
    // SUI has 9 decimal places
    const SUI_DECIMALS = 10 ** 9;
    const balanceInWholeSui = balanceSui / SUI_DECIMALS;
    const balanceGHS = balanceInWholeSui * suiToGhsRate;

    res.status(200).json({
      communityId: String(community._id),
      balanceSUI: balanceSui,
      balanceGHS,
      transactions: transactions.map((tx: any) => ({
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
