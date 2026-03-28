import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuiExplorerLinkProps {
  hash: string;
  type?: "tx" | "account" | "object";
  className?: string;
  showIcon?: boolean;
}

export function SuiExplorerLink({
  hash,
  type = "tx",
  className,
  showIcon = true,
}: SuiExplorerLinkProps) {
  // Use suiscan for testnet exploratory links
  const baseUrl = "https://suiscan.xyz/testnet";
  const path = type === "tx" ? "tx" : type === "account" ? "account" : "object";
  const url = `${baseUrl}/${path}/${hash}`;

  const shortHash = `${hash.slice(0, 6)}...${hash.slice(-4)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1 text-primary-400 hover:text-primary-300 transition-colors",
        className
      )}
    >
      <span className="font-mono">{shortHash}</span>
      {showIcon && <ExternalLink className="w-3 h-3" />}
    </a>
  );
}
