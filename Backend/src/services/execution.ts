import cron, { type ScheduledTask } from 'node-cron';
import { Proposal, ProposalStatus } from '../models/Proposal.js';
import { Community } from '../models/Community.js';
import { Transaction } from '../models/Transaction.js';
import { Vote, VoteChoice } from '../models/Vote.js';
import { executeProposal } from './sui.js';

let cronTask: ScheduledTask | undefined;

/**
 * Check expired proposals and execute or fail them based on vote tallies.
 * Runs every 10 minutes.
 */
async function processExpiredProposals(): Promise<void> {
  const now = new Date();

  try {
    // Find all live proposals whose deadline has passed
    const expiredProposals = await Proposal.find({
      status: ProposalStatus.LIVE,
      deadline: { $lt: now },
    });

    if (expiredProposals.length === 0) {
      return;
    }

    console.log(`[execution] Processing ${expiredProposals.length} expired proposal(s)...`);

    for (const proposal of expiredProposals) {
      try {
        await processProposal(proposal);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(
          `[execution] Error processing proposal ${String(proposal._id)}: ${message}`
        );

        // Mark as execution_failed so it doesn't get retried indefinitely
        proposal.status = ProposalStatus.EXECUTION_FAILED;
        await proposal.save();
      }
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[execution] Cron job error: ${message}`);
  }
}

async function processProposal(proposal: InstanceType<typeof Proposal>): Promise<void> {
  const proposalId = String(proposal._id);

  // Count votes from the Vote collection for accuracy
  const [yesCount, noCount, abstainCount] = await Promise.all([
    Vote.countDocuments({ proposalId: proposal._id, choice: VoteChoice.YES }),
    Vote.countDocuments({ proposalId: proposal._id, choice: VoteChoice.NO }),
    Vote.countDocuments({ proposalId: proposal._id, choice: VoteChoice.ABSTAIN }),
  ]);

  // Sync vote tallies in case they drifted
  proposal.yesVotes = yesCount;
  proposal.noVotes = noCount;
  proposal.abstainVotes = abstainCount;

  const totalVotes = yesCount + noCount + abstainCount;

  // Get the community to check quorum threshold
  const community = await Community.findById(proposal.communityId);
  if (!community) {
    console.error(`[execution] Community not found for proposal ${proposalId}`);
    proposal.status = ProposalStatus.FAILED;
    await proposal.save();
    return;
  }

  // Quorum: percentage of members who voted
  const memberCount = community.memberCount || community.memberWallets.length;
  const quorumPercentage = memberCount > 0 ? (totalVotes / memberCount) * 100 : 0;
  const quorumMet = quorumPercentage >= community.quorumThreshold;

  console.log(
    `[execution] Proposal ${proposalId}: ${yesCount}Y/${noCount}N/${abstainCount}A, ` +
    `quorum ${quorumPercentage.toFixed(1)}% (threshold ${community.quorumThreshold}%)`
  );

  if (!quorumMet || noCount >= yesCount) {
    // Proposal failed: quorum not met or more no votes than yes
    proposal.status = ProposalStatus.FAILED;
    await proposal.save();
    console.log(`[execution] Proposal ${proposalId} FAILED`);
    return;
  }

  // Proposal passed — execute on-chain
  try {
    // Verify we have the on-chain object IDs needed for PTB
    const proposalOnChainId = proposal.onChainId;
    const communityOnChainId = community.onChainId;
    const adminCapId = community.adminCapId;

    if (!proposalOnChainId || !communityOnChainId || !adminCapId) {
      console.error(
        `[execution] Missing on-chain IDs for proposal ${proposalId}: ` +
        `proposal=${proposalOnChainId}, community=${communityOnChainId}, adminCap=${adminCapId}`
      );
      proposal.status = ProposalStatus.EXECUTION_FAILED;
      await proposal.save();
      return;
    }

    const txHash = await executeProposal(proposalOnChainId, communityOnChainId, adminCapId);

    proposal.status = ProposalStatus.EXECUTED;
    proposal.txHash = txHash;
    await proposal.save();

    // Record the transaction
    await Transaction.create({
      communityId: proposal.communityId,
      proposalId: proposal._id,
      amount: proposal.budgetRequested,
      recipient: proposal.recipient,
      txHash,
      confirmedAt: new Date(),
    });

    console.log(`[execution] Proposal ${proposalId} EXECUTED. TX: ${txHash}`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[execution] On-chain execution failed for ${proposalId}: ${message}`);

    proposal.status = ProposalStatus.EXECUTION_FAILED;
    await proposal.save();
  }
}

/**
 * Start the execution cron job (every 10 minutes).
 */
export function startExecutionCron(): void {
  if (cronTask) {
    console.warn('[execution] Cron already running');
    return;
  }

  cronTask = cron.schedule('*/10 * * * *', () => {
    // Fire-and-forget; errors are caught inside processExpiredProposals
    void processExpiredProposals();
  });

  console.log('[execution] Cron job started (every 10 minutes)');
}

/**
 * Stop the execution cron job.
 */
export function stopExecutionCron(): void {
  if (cronTask) {
    cronTask.stop();
    cronTask = undefined;
    console.log('[execution] Cron job stopped');
  }
}
