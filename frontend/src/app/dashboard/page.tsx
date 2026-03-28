"use client";

import { Users, FileText, Wallet, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useProposals } from "@/hooks/useProposals";
import { useAuth } from "@/hooks/useAuth";
import { ProposalCard } from "@/components/proposals/ProposalCard";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { ProposalStatus } from "@/types";

const statsPlaceholder = [
  {
    label: "Members",
    value: "128",
    icon: Users,
    color: "text-primary-400",
    bgColor: "bg-primary-700/20",
  },
  {
    label: "Active Proposals",
    value: "5",
    icon: FileText,
    color: "text-secondary-400",
    bgColor: "bg-secondary-600/20",
  },
  {
    label: "Treasury Balance",
    value: "1,250 APT",
    icon: Wallet,
    color: "text-blue-400",
    bgColor: "bg-blue-600/20",
  },
];

export default function DashboardPage() {
  const { proposals, isLoading } = useProposals({ status: ProposalStatus.LIVE });
  const { isAdmin } = useAuth();

  return (
    <PageWrapper>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-dark-50">Dashboard</h1>
            <p className="text-dark-400 mt-1">
              Overview of your community governance activity.
            </p>
          </div>
          {isAdmin && (
            <Link href="/admin" className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Synthesis
            </Link>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statsPlaceholder.map((stat) => (
            <div key={stat.label} className="card">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 ${stat.bgColor} rounded-xl flex items-center justify-center`}
                >
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-dark-500 uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p className="text-xl font-bold text-dark-50">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Active Proposals */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-dark-100">
              Active Proposals
            </h2>
            <Link
              href="/proposals"
              className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 transition-colors"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="card animate-pulse h-48"
                >
                  <div className="h-4 bg-dark-700 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-dark-700 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-dark-700 rounded w-full mb-4" />
                  <div className="h-2 bg-dark-700 rounded w-full mb-4" />
                  <div className="flex justify-between">
                    <div className="h-3 bg-dark-700 rounded w-24" />
                    <div className="h-3 bg-dark-700 rounded w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : proposals.length === 0 ? (
            <div className="card text-center py-12">
              <FileText className="w-12 h-12 text-dark-600 mx-auto mb-3" />
              <p className="text-dark-400">No active proposals right now.</p>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 mt-4 text-primary-400 hover:text-primary-300 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create a new synthesis
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {proposals.map((proposal) => (
                <ProposalCard key={proposal.id} proposal={proposal} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
