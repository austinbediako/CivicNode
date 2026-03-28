import { Transaction } from '@mysten/sui/transactions';
import { CONTRACT_MODULE_ADDRESS } from "./constants";

/**
 * Blockchain transaction helpers.
 * These build Sui Programmable Transaction Blocks for on-chain governance actions.
 * The actual signing is handled by the connected wallet via Enoki zkLogin.
 *
 * Contract function signatures (governance.move):
 *   vote_on_proposal(community: &Community, proposal: &mut Proposal, choice: u8, clock: &Clock)
 *   execute_proposal(admin_cap: &AdminCap, community: &mut Community, proposal: &mut Proposal, clock: &Clock)
 *   deposit_to_treasury(community: &mut Community, coin: Coin<SUI>)
 */

const SUI_CLOCK_OBJECT_ID = '0x6';

export function buildVoteTx(
  communityObjectId: string,
  proposalObjectId: string,
  choiceIndex: number
): Transaction {
  const tx = new Transaction();
  tx.moveCall({
    target: `${CONTRACT_MODULE_ADDRESS}::governance::vote_on_proposal`,
    arguments: [
      tx.object(communityObjectId),
      tx.object(proposalObjectId),
      tx.pure.u8(choiceIndex),
      tx.object(SUI_CLOCK_OBJECT_ID),
    ],
  });
  return tx;
}

export function buildExecuteProposalTx(
  adminCapObjectId: string,
  communityObjectId: string,
  proposalObjectId: string
): Transaction {
  const tx = new Transaction();
  tx.moveCall({
    target: `${CONTRACT_MODULE_ADDRESS}::governance::execute_proposal`,
    arguments: [
      tx.object(adminCapObjectId),
      tx.object(communityObjectId),
      tx.object(proposalObjectId),
      tx.object(SUI_CLOCK_OBJECT_ID),
    ],
  });
  return tx;
}

export function buildDepositTx(
  communityObjectId: string,
  amount: number
): Transaction {
  const tx = new Transaction();
  const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amount)]);

  tx.moveCall({
    target: `${CONTRACT_MODULE_ADDRESS}::governance::deposit_to_treasury`,
    arguments: [
      tx.object(communityObjectId),
      coin,
    ],
  });
  return tx;
}
