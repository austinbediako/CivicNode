import type { VoteChoice } from "@/types";
import { CONTRACT_MODULE_ADDRESS } from "./constants";

/**
 * Blockchain transaction helpers.
 * These build payloads for on-chain governance actions.
 * The actual signing is handled by the connected wallet via wagmi/viem.
 */

interface TransactionPayload {
  module: string;
  function: string;
  arguments: (string | number)[];
}

export function buildVoteTx(
  proposalId: string,
  choiceIndex: number
): TransactionPayload {
  return {
    module: `${CONTRACT_MODULE_ADDRESS}::governance`,
    function: "cast_vote",
    arguments: [proposalId, choiceIndex],
  };
}

export function buildExecuteProposalTx(
  proposalId: string
): TransactionPayload {
  return {
    module: `${CONTRACT_MODULE_ADDRESS}::governance`,
    function: "execute_proposal",
    arguments: [proposalId],
  };
}

export function buildDepositTx(
  communityId: string,
  amount: number
): TransactionPayload {
  return {
    module: `${CONTRACT_MODULE_ADDRESS}::treasury`,
    function: "deposit_to_treasury",
    arguments: [communityId, amount],
  };
}

// TODO(civicnode): Implement actual on-chain tx submission using viem/wagmi writeContract
export async function submitTx(
  _payload: TransactionPayload
): Promise<{ txHash: string }> {
  // Placeholder — in production this would use wagmi's useWriteContract hook
  // or viem's walletClient.writeContract to submit the transaction
  const txHash = `0x${Date.now().toString(16)}${"0".repeat(48)}`;
  return { txHash };
}

// TODO(civicnode): Implement balance query via viem publicClient.readContract
export async function getBalance(_address: string): Promise<number> {
  return 0;
}
