"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { getProposal } from "@/lib/api";
import { useVoteTally } from "@/hooks/useVoteTally";
import { useWallet } from "@/hooks/useWallet";
import { ProposalDetail } from "@/components/proposals/ProposalDetail";
import { VoteButtons } from "@/components/voting/VoteButtons";
import { VoteTallyBar } from "@/components/voting/VoteTallyBar";
import { VoteCountdown } from "@/components/voting/VoteCountdown";
import { PageWrapper } from "@/components/layout/PageWrapper";
import type { Proposal } from "@/types";

export default function VotePage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params.id as string;

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const voteTally = useVoteTally(proposalId);
  const { address } = useWallet();

  // TODO(civicnode): Check if current user has voted via API
  const hasVoted = false;

  useEffect(() => {
    async function fetchProposal() {
      try {
        const data = await getProposal(proposalId);
        setProposal(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load proposal");
      } finally {
        setLoading(false);
      }
    }

    if (proposalId) {
      fetchProposal();
    }
  }, [proposalId]);

  const handleVoteSuccess = () => {
    voteTally.mutate();
    // Refetch proposal for updated counts
    getProposal(proposalId).then(setProposal).catch(console.error);
  };

  return (
    <PageWrapper>
      {/* Back Link */}
      <Link
        href="/proposals"
        className="inline-flex items-center gap-2 text-sm text-dark-400 hover:text-dark-200 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Proposals
      </Link>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="card text-center py-12">
          <p className="text-accent-400 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="btn-outline"
          >
            Go Back
          </button>
        </div>
      ) : proposal ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <ProposalDetail proposal={proposal} />
          </div>

          {/* Voting Sidebar */}
          <div className="space-y-6">
            {/* Countdown */}
            <VoteCountdown deadline={proposal.deadline} />

            {/* Vote Tally */}
            <div className="card">
              <VoteTallyBar
                yesVotes={proposal.yesVotes}
                noVotes={proposal.noVotes}
                abstainVotes={proposal.abstainVotes}
              />
            </div>

            {/* Vote Buttons */}
            <div className="card">
              <h3 className="text-base font-semibold text-dark-100 mb-4">
                Cast Your Vote
              </h3>
              <VoteButtons
                proposalId={proposal.id}
                proposalStatus={proposal.status}
                hasVoted={hasVoted}
                onVoteSuccess={handleVoteSuccess}
              />
            </div>
          </div>
        </div>
      ) : null}
    </PageWrapper>
  );
}
