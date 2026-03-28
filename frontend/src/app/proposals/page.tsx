"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { useProposals } from "@/hooks/useProposals";
import { ProposalCard } from "@/components/proposals/ProposalCard";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { ProposalStatus } from "@/types";
import { cn } from "@/lib/utils";

interface StatusTab {
  label: string;
  value: ProposalStatus | "all";
}

const statusTabs: StatusTab[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: ProposalStatus.DRAFT },
  { label: "Live", value: ProposalStatus.LIVE },
  { label: "Passed", value: ProposalStatus.PASSED },
  { label: "Failed", value: ProposalStatus.FAILED },
  { label: "Executed", value: ProposalStatus.EXECUTED },
];

export default function ProposalsPage() {
  const [activeTab, setActiveTab] = useState<ProposalStatus | "all">("all");

  const { proposals, isLoading, error } = useProposals({
    status: activeTab === "all" ? undefined : activeTab,
  });

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-dark-50">Proposals</h1>
          <p className="text-dark-400 mt-1">
            Browse and filter all community governance proposals.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                activeTab === tab.value
                  ? "bg-primary-700/20 text-primary-400 border border-primary-700/50"
                  : "text-dark-400 hover:text-dark-200 hover:bg-dark-800 border border-transparent"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="card border-accent-600/30 bg-accent-600/5">
            <p className="text-accent-400 text-sm">{error?.message ?? "Something went wrong"}</p>
          </div>
        )}

        {/* Proposals Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card animate-pulse h-48">
                <div className="h-4 bg-dark-700 rounded w-3/4 mb-3" />
                <div className="h-3 bg-dark-700 rounded w-full mb-2" />
                <div className="h-3 bg-dark-700 rounded w-2/3 mb-4" />
                <div className="h-2 bg-dark-700 rounded w-full mb-4" />
                <div className="flex justify-between">
                  <div className="h-3 bg-dark-700 rounded w-24" />
                  <div className="h-3 bg-dark-700 rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : proposals.length === 0 ? (
          <div className="card text-center py-16">
            <FileText className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <p className="text-dark-400 text-lg">No proposals found</p>
            <p className="text-dark-500 text-sm mt-1">
              {activeTab !== "all"
                ? `No proposals with "${activeTab}" status.`
                : "No proposals have been created yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {proposals.map((proposal) => (
              <ProposalCard key={proposal.id} proposal={proposal} />
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
