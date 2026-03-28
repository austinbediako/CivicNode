"use client";

import { ExternalLink, FileText } from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { ProposalStatusChip } from "@/components/proposals/ProposalStatusChip";
import { useProposals } from "@/hooks/useProposals";
import { formatDate, truncateAddress } from "@/lib/utils";
import type { Proposal } from "@/types";
import Link from "next/link";

export default function HistoryPage() {
  const { proposals, isLoading } = useProposals();

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-dark-50">History</h1>
          <p className="text-dark-400 mt-1">
            Complete audit log of all governance proposals and their outcomes.
          </p>
        </div>

        {/* History Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left py-3 px-4 text-dark-400 font-medium">
                    Proposal
                  </th>
                  <th className="text-left py-3 px-4 text-dark-400 font-medium">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-dark-400 font-medium">
                    Votes (Y/N/A)
                  </th>
                  <th className="text-left py-3 px-4 text-dark-400 font-medium">
                    Created
                  </th>
                  <th className="text-left py-3 px-4 text-dark-400 font-medium">
                    Deadline
                  </th>
                  <th className="text-left py-3 px-4 text-dark-400 font-medium">
                    Tx
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-dark-800">
                      <td className="py-3 px-4">
                        <div className="h-4 bg-dark-700 rounded w-40 animate-pulse" />
                      </td>
                      <td className="py-3 px-4">
                        <div className="h-5 bg-dark-700 rounded w-16 animate-pulse" />
                      </td>
                      <td className="py-3 px-4">
                        <div className="h-4 bg-dark-700 rounded w-24 animate-pulse" />
                      </td>
                      <td className="py-3 px-4">
                        <div className="h-4 bg-dark-700 rounded w-28 animate-pulse" />
                      </td>
                      <td className="py-3 px-4">
                        <div className="h-4 bg-dark-700 rounded w-28 animate-pulse" />
                      </td>
                      <td className="py-3 px-4">
                        <div className="h-4 bg-dark-700 rounded w-20 animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : proposals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16">
                      <FileText className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                      <p className="text-dark-400">No proposals in history yet.</p>
                    </td>
                  </tr>
                ) : (
                  proposals.map((proposal) => (
                    <HistoryRow key={proposal.id} proposal={proposal} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

function HistoryRow({ proposal }: { proposal: Proposal }) {
  return (
    <tr className="border-b border-dark-800 hover:bg-dark-800/50 transition-colors">
      <td className="py-3 px-4">
        <Link
          href={`/vote/${proposal.id}`}
          className="text-dark-200 hover:text-primary-400 transition-colors font-medium"
        >
          {proposal.title}
        </Link>
      </td>
      <td className="py-3 px-4">
        <ProposalStatusChip status={proposal.status} />
      </td>
      <td className="py-3 px-4 text-dark-300 tabular-nums">
        <span className="text-primary-400">{proposal.yesVotes}</span>
        {" / "}
        <span className="text-accent-400">{proposal.noVotes}</span>
        {" / "}
        <span className="text-dark-500">{proposal.abstainVotes}</span>
      </td>
      <td className="py-3 px-4 text-dark-400 text-xs">
        {formatDate(proposal.createdAt)}
      </td>
      <td className="py-3 px-4 text-dark-400 text-xs">
        {formatDate(proposal.deadline)}
      </td>
      <td className="py-3 px-4">
        {proposal.txHash ? (
          <a
            href={`https://explorer.aptoslabs.com/txn/${proposal.txHash}?network=testnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary-400 hover:text-primary-300 transition-colors text-xs font-mono"
          >
            {truncateAddress(proposal.txHash, 4)}
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-dark-600 text-xs">--</span>
        )}
      </td>
    </tr>
  );
}
