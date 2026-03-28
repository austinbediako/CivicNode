import type { Proposal } from "@/types";
import { ProposalStatusChip } from "./ProposalStatusChip";
import { formatDate, formatAPT } from "@/lib/utils";
import { Calendar, Coins, User, FileText, ExternalLink } from "lucide-react";

interface ProposalDetailProps {
  proposal: Proposal;
}

export function ProposalDetail({ proposal }: ProposalDetailProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <ProposalStatusChip status={proposal.status} />
          <span className="text-xs text-dark-500">
            Created {formatDate(proposal.createdAt)}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-dark-50 mb-2">
          {proposal.title}
        </h1>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card py-4 px-4">
          <div className="flex items-center gap-2 text-dark-500 mb-1">
            <Coins className="w-4 h-4" />
            <span className="text-xs">Budget</span>
          </div>
          <div className="text-lg font-semibold text-dark-100">
            {proposal.budgetRequested} {proposal.currency}
          </div>
        </div>
        <div className="card py-4 px-4">
          <div className="flex items-center gap-2 text-dark-500 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">Deadline</span>
          </div>
          <div className="text-sm font-medium text-dark-100">
            {formatDate(proposal.deadline)}
          </div>
        </div>
        <div className="card py-4 px-4">
          <div className="flex items-center gap-2 text-dark-500 mb-1">
            <User className="w-4 h-4" />
            <span className="text-xs">Recipient</span>
          </div>
          <div className="text-sm font-mono text-dark-100 truncate">
            {proposal.recipient || "TBD"}
          </div>
        </div>
        <div className="card py-4 px-4">
          <div className="flex items-center gap-2 text-dark-500 mb-1">
            <FileText className="w-4 h-4" />
            <span className="text-xs">Total Votes</span>
          </div>
          <div className="text-lg font-semibold text-dark-100">
            {proposal.yesVotes + proposal.noVotes + proposal.abstainVotes}
          </div>
        </div>
      </div>

      {/* Summary */}
      <section>
        <h2 className="text-lg font-semibold text-dark-100 mb-3">Summary</h2>
        <p className="text-dark-300 leading-relaxed whitespace-pre-wrap">
          {proposal.summary}
        </p>
      </section>

      {/* Rationale */}
      <section>
        <h2 className="text-lg font-semibold text-dark-100 mb-3">Rationale</h2>
        <p className="text-dark-300 leading-relaxed whitespace-pre-wrap">
          {proposal.rationale}
        </p>
      </section>

      {/* Action Items */}
      {proposal.actionItems.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-dark-100 mb-3">
            Action Items
          </h2>
          <ul className="space-y-2">
            {proposal.actionItems.map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-dark-300"
              >
                <span className="flex-shrink-0 w-6 h-6 bg-primary-700/20 text-primary-400 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                  {index + 1}
                </span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Dissent / Minority View */}
      {proposal.dissent && (
        <section>
          <h2 className="text-lg font-semibold text-dark-100 mb-3">
            Dissenting View
          </h2>
          <div className="border-l-4 border-secondary-600 pl-4">
            <p className="text-dark-300 leading-relaxed italic whitespace-pre-wrap">
              {proposal.dissent}
            </p>
          </div>
        </section>
      )}

      {/* Transaction Hash */}
      {proposal.txHash && (
        <section>
          <h2 className="text-lg font-semibold text-dark-100 mb-3">
            On-Chain Transaction
          </h2>
          <a
            href={`https://explorer.aptoslabs.com/txn/${proposal.txHash}?network=testnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors text-sm font-mono"
          >
            {proposal.txHash}
            <ExternalLink className="w-4 h-4" />
          </a>
        </section>
      )}
    </div>
  );
}
