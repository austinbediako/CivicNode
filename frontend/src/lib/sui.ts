import { Transaction } from '@mysten/sui/transactions';
import { CONTRACT_MODULE_ADDRESS } from "./constants";

/**
 * Blockchain transaction helpers.
 * These build Sui Transaction blocks for on-chain governance actions.
 * The actual signing is handled by the connected wallet via Enoki.
 */

export function buildVoteTx(
  proposalId: string,
  choiceIndex: number
): Transaction {
  const tx = new Transaction();
  tx.moveCall({
    target: `${CONTRACT_MODULE_ADDRESS}::governance::cast_vote`,
    arguments: [
      tx.object(proposalId),
      tx.pure.u8(choiceIndex),
    ],
  });
  return tx;
}

export function buildExecuteProposalTx(
  proposalId: string
): Transaction {
  const tx = new Transaction();
  tx.moveCall({
    target: `${CONTRACT_MODULE_ADDRESS}::governance::execute_proposal`,
    arguments: [
      tx.object(proposalId),
    ],
  });
  return tx;
}

export function buildDepositTx(
  communityId: string,
  amount: number
): Transaction {
  const tx = new Transaction();
  // We assume a coin is split from gas to deposit
  const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amount)]);
  
  tx.moveCall({
    target: `${CONTRACT_MODULE_ADDRESS}::treasury::deposit_to_treasury`,
    arguments: [
      tx.object(communityId),
      coin,
    ],
  });
  return tx;
}
