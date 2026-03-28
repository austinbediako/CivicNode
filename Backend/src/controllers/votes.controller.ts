import { Request, Response } from 'express';
import { Vote, VoteChoice } from '../models/Vote.js';
import { Proposal, ProposalStatus } from '../models/Proposal.js';
import { Community } from '../models/Community.js';

/**
 * Cast a vote on a live proposal.
 * Verifies membership, prevents double voting, and updates proposal tallies.
 */
export async function castVote(req: Request, res: Response): Promise<void> {
  try {
    const walletAddress = req.user?.walletAddress;
    if (!walletAddress) {
      res.status(401).json({
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
        statusCode: 401,
      });
      return;
    }

    const { proposalId, choice } = req.body as {
      proposalId: string;
      choice: string;
    };

    // Fetch the proposal
    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      res.status(404).json({
        message: 'Proposal not found',
        code: 'PROPOSAL_NOT_FOUND',
        statusCode: 404,
      });
      return;
    }

    // Only live proposals accept votes
    if (proposal.status !== ProposalStatus.LIVE) {
      res.status(400).json({
        message: 'Voting is only allowed on live proposals',
        code: 'PROPOSAL_NOT_LIVE',
        statusCode: 400,
      });
      return;
    }

    // Check deadline
    if (proposal.deadline && new Date() > proposal.deadline) {
      res.status(400).json({
        message: 'Voting deadline has passed',
        code: 'VOTING_DEADLINE_PASSED',
        statusCode: 400,
      });
      return;
    }

    // Verify the voter is a member of the proposal's community
    const community = await Community.findById(proposal.communityId);
    if (!community) {
      res.status(404).json({
        message: 'Community not found',
        code: 'COMMUNITY_NOT_FOUND',
        statusCode: 404,
      });
      return;
    }

    const isMember = community.memberWallets.includes(walletAddress);
    if (!isMember) {
      res.status(403).json({
        message: 'You must be a community member to vote',
        code: 'NOT_COMMUNITY_MEMBER',
        statusCode: 403,
      });
      return;
    }

    // Attempt to create the vote — the compound unique index prevents double voting
    try {
      const vote = await Vote.create({
        proposalId: proposal._id,
        voterWallet: walletAddress,
        choice: choice as VoteChoice,
        txHash: null,
      });

      // Update the proposal's vote tallies atomically
      const incrementField =
        choice === VoteChoice.YES
          ? 'yesVotes'
          : choice === VoteChoice.NO
            ? 'noVotes'
            : 'abstainVotes';

      await Proposal.findByIdAndUpdate(proposalId, {
        $inc: { [incrementField]: 1 },
      });

      res.status(201).json({
        id: String(vote._id),
        proposalId: String(vote.proposalId),
        voterWallet: vote.voterWallet,
        choice: vote.choice,
        txHash: vote.txHash,
        votedAt: vote.votedAt.toISOString(),
      });
    } catch (dupError: unknown) {
      // MongoDB duplicate key error code is 11000
      if (
        dupError instanceof Error &&
        'code' in dupError &&
        (dupError as { code: number }).code === 11000
      ) {
        res.status(409).json({
          message: 'You have already voted on this proposal',
          code: 'DUPLICATE_VOTE',
          statusCode: 409,
        });
        return;
      }
      throw dupError;
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[votes] castVote error: ${message}`);
    res.status(500).json({
      message: 'Failed to cast vote',
      code: 'VOTE_ERROR',
      statusCode: 500,
    });
  }
}

/**
 * Get all votes for a proposal.
 */
export async function getVotes(req: Request, res: Response): Promise<void> {
  try {
    const { proposalId } = req.params;

    const votes = await Vote.find({ proposalId })
      .sort({ votedAt: -1 })
      .lean();

    res.status(200).json({
      data: votes.map((v) => ({
        id: String(v._id),
        proposalId: String(v.proposalId),
        voterWallet: v.voterWallet,
        choice: v.choice,
        txHash: v.txHash,
        votedAt: v.votedAt.toISOString(),
      })),
      total: votes.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[votes] getVotes error: ${message}`);
    res.status(500).json({
      message: 'Failed to fetch votes',
      code: 'VOTES_FETCH_ERROR',
      statusCode: 500,
    });
  }
}
