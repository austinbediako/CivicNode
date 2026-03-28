"use client";

import Link from "next/link";
import { Clock, Coins } from "lucide-react";
import type { Proposal } from "@/types";
import { ProposalStatusChip } from "./ProposalStatusChip";
import { formatDeadline, formatSUI } from "@/lib/utils";

interface ProposalCardProps {
  proposal: Proposal;
}

export function ProposalCard({ proposal }: ProposalCardProps) {
  const totalVotes = proposal.yesVotes + proposal.noVotes + proposal.abstainVotes;
  const yesPercent = totalVotes > 0 ? (proposal.yesVotes / totalVotes) * 100 : 0;
  const noPercent = totalVotes > 0 ? (proposal.noVotes / totalVotes) * 100 : 0;
  const abstainPercent =
    totalVotes > 0 ? (proposal.abstainVotes / totalVotes) * 100 : 0;

  return (
    <Link href={`/vote/${proposal.id}`} className="block">
      <div className="card-hover group">
        {/* Top Row: Title + Status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-base font-semibold text-dark-100 group-hover:text-primary-400 transition-colors line-clamp-2">
            {proposal.title}
          </h3>
          <ProposalStatusChip status={proposal.status} />
        </div>

        {/* Summary */}
        <p className="text-sm text-dark-400 line-clamp-2 mb-4">
          {proposal.summary}
        </p>

        {/* Vote Tally Bar */}
        {totalVotes > 0 && (
          <div className="mb-4">
            <div className="flex h-2 rounded-full overflow-hidden bg-dark-700">
              <div
                className="bg-primary-500 transition-all duration-500"
                style={{ width: `${yesPercent}%` }}
              />
              <div
                className="bg-accent-500 transition-all duration-500"
                style={{ width: `${noPercent}%` }}
              />
              <div
                className="bg-dark-500 transition-all duration-500"
                style={{ width: `${abstainPercent}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-dark-500">
              <span>{proposal.yesVotes} Yes</span>
              <span>{proposal.noVotes} No</span>
              <span>{proposal.abstainVotes} Abstain</span>
            </div>
          </div>
        )}

        {/* Bottom Row: Deadline + Budget */}
        <div className="flex items-center justify-between text-xs text-dark-500">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDeadline(proposal.deadline)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5" />
            <span>
              {proposal.budgetRequested} {proposal.currency}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
