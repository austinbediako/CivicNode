"use client";

import useSWR from "swr";
import { getProposals } from "@/lib/api";
import { REVALIDATE_PROPOSALS } from "@/lib/constants";
import type { Proposal, ProposalStatus } from "@/types";

interface UseProposalsOptions {
  status?: ProposalStatus;
  page?: number;
  limit?: number;
}

export function useProposals(options: UseProposalsOptions = {}) {
  const key = `/api/proposals?status=${options.status ?? "all"}&page=${options.page ?? 1}&limit=${options.limit ?? 20}`;

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => getProposals(options),
    { refreshInterval: REVALIDATE_PROPOSALS }
  );

  return {
    proposals: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    error: error as Error | null,
    mutate,
  };
}
