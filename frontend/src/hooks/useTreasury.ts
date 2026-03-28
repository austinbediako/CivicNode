"use client";

import useSWR from "swr";
import { getTreasury } from "@/lib/api";
import { POLL_INTERVAL_TREASURY } from "@/lib/constants";
import type { TreasuryData } from "@/types";

export function useTreasury(communityId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    communityId ? `/api/treasury/${communityId}` : null,
    () => (communityId ? getTreasury(communityId) : null),
    { refreshInterval: POLL_INTERVAL_TREASURY }
  );

  const treasury = data as TreasuryData | null;

  return {
    balanceAPT: treasury?.balanceAPT ?? 0,
    balanceGHS: treasury?.balanceGHS ?? 0,
    transactions: treasury?.transactions ?? [],
    totalDisbursed: treasury?.totalDisbursed ?? 0,
    totalFunded: treasury?.totalFunded ?? 0,
    pendingExecution: treasury?.pendingExecution ?? 0,
    isLoading,
    error: error as Error | null,
    mutate,
  };
}
