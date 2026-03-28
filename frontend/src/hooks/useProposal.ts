"use client";

import useSWR from "swr";
import { getProposal } from "@/lib/api";
import type { Proposal } from "@/types";

export function useProposal(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/proposals/${id}` : null,
    () => (id ? getProposal(id) : null)
  );

  return {
    proposal: (data as Proposal) ?? null,
    isLoading,
    error: error as Error | null,
    mutate,
  };
}
