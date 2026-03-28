"use client";

import useSWR from "swr";
import { getVoteTally } from "@/lib/api";
import { POLL_INTERVAL_VOTES } from "@/lib/constants";
import type { VoteTally } from "@/types";

export function useVoteTally(proposalId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    proposalId ? `/api/votes/${proposalId}` : null,
    () => (proposalId ? getVoteTally(proposalId) : null),
    { refreshInterval: POLL_INTERVAL_VOTES }
  );

  const tally = data as VoteTally | null;

  return {
    yes: tally?.yes ?? 0,
    no: tally?.no ?? 0,
    abstain: tally?.abstain ?? 0,
    total: tally?.total ?? 0,
    quorumReached: tally?.quorumReached ?? false,
    isLoading,
    error: error as Error | null,
    mutate,
  };
}
