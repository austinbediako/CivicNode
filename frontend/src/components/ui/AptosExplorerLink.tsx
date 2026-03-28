"use client";

import { ExternalLink } from "lucide-react";
import { BLOCK_EXPLORER_BASE_URL } from "@/lib/constants";

interface AptosExplorerLinkProps {
  txHash: string;
  label?: string;
}

export function AptosExplorerLink({
  txHash,
  label = "View on Explorer",
}: AptosExplorerLinkProps) {
  const url = `${BLOCK_EXPLORER_BASE_URL}/tx/${txHash}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-purple hover:text-purple-600 transition-colors font-sans text-[13px] focus-ring rounded"
      aria-label={`${label} - opens in new tab`}
    >
      <span className="font-mono text-[13px]">{label}</span>
      <ExternalLink className="w-3.5 h-3.5" />
    </a>
  );
}
