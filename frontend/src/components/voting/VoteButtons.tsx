"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Minus, Loader2 } from "lucide-react";
import { VoteChoice, ProposalStatus } from "@/types";
import { useWallet } from "@/hooks/useWallet";
import { submitVoteRecord } from "@/lib/api";
import { buildVoteTx } from "@/lib/sui";
import { cn } from "@/lib/utils";

interface VoteButtonsProps {
  proposalId: string;
  communityObjectId: string;
  proposalStatus: ProposalStatus;
  hasVoted: boolean;
  onVoteSuccess: () => void;
}

const voteOptions = [
  {
    choice: VoteChoice.YES,
    label: "Yes",
    icon: ThumbsUp,
    className: "border-primary-600/50 hover:bg-primary-700/20 hover:border-primary-600 text-primary-400",
    activeClassName: "bg-primary-700/30 border-primary-600 text-primary-300",
    choiceIndex: 0,
  },
  {
    choice: VoteChoice.NO,
    label: "No",
    icon: ThumbsDown,
    className: "border-accent-600/50 hover:bg-accent-700/20 hover:border-accent-600 text-accent-400",
    activeClassName: "bg-accent-700/30 border-accent-600 text-accent-300",
    choiceIndex: 1,
  },
  {
    choice: VoteChoice.ABSTAIN,
    label: "Abstain",
    icon: Minus,
    className: "border-dark-500 hover:bg-dark-700 hover:border-dark-400 text-dark-300",
    activeClassName: "bg-dark-700 border-dark-400 text-dark-200",
    choiceIndex: 2,
  },
];

export function VoteButtons({
  proposalId,
  communityObjectId,
  proposalStatus,
  hasVoted,
  onVoteSuccess,
}: VoteButtonsProps) {
  const { connected, signAndExecuteTransaction } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<VoteChoice | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isDisabled =
    !connected || hasVoted || proposalStatus !== ProposalStatus.LIVE || isSubmitting;

  const handleVote = async (choice: VoteChoice, choiceIndex: number) => {
    if (isDisabled) return;

    setSelectedChoice(choice);
    setIsSubmitting(true);
    setError(null);

    try {
      // Build the on-chain vote transaction
      const tx = buildVoteTx(communityObjectId, proposalId, choiceIndex);

      // Sign and execute on-chain via the connected wallet (Enoki zkLogin)
      const result = await signAndExecuteTransaction(tx);
      const txHash = result?.digest || result?.hash;

      if (!txHash) {
        throw new Error("Transaction submitted but no digest returned");
      }

      // Record the vote in the backend (mirror for fast querying)
      await submitVoteRecord(proposalId, choice, txHash);
      onVoteSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vote failed");
      setSelectedChoice(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Status Messages */}
      {!connected && (
        <div className="text-sm text-secondary-400 bg-secondary-600/10 border border-secondary-600/30 rounded-lg px-4 py-3">
          Connect your wallet to vote.
        </div>
      )}
      {hasVoted && (
        <div className="text-sm text-primary-400 bg-primary-700/10 border border-primary-700/30 rounded-lg px-4 py-3">
          You have already voted on this proposal.
        </div>
      )}
      {proposalStatus !== ProposalStatus.LIVE && !hasVoted && (
        <div className="text-sm text-dark-400 bg-dark-800 border border-dark-700 rounded-lg px-4 py-3">
          Voting is not currently active for this proposal.
        </div>
      )}

      {/* Vote Buttons */}
      <div className="grid grid-cols-3 gap-3">
        {voteOptions.map((option) => (
          <button
            key={option.choice}
            onClick={() => handleVote(option.choice, option.choiceIndex)}
            disabled={isDisabled}
            className={cn(
              "flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 transition-all duration-200 font-medium",
              isDisabled
                ? "opacity-40 cursor-not-allowed border-dark-700 text-dark-500"
                : selectedChoice === option.choice
                  ? option.activeClassName
                  : option.className
            )}
          >
            {isSubmitting && selectedChoice === option.choice ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <option.icon className="w-6 h-6" />
            )}
            <span className="text-sm">{option.label}</span>
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-accent-400 bg-accent-600/10 border border-accent-600/30 rounded-lg px-4 py-3">
          {error}
        </div>
      )}
    </div>
  );
}
