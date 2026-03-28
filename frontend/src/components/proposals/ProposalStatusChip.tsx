import { ProposalStatus } from "@/types";
import { cn } from "@/lib/utils";

interface ProposalStatusChipProps {
  status: ProposalStatus;
}

const statusConfig: Record<
  ProposalStatus,
  { label: string; className: string }
> = {
  [ProposalStatus.DRAFT]: {
    label: "Draft",
    className: "bg-dark-600/30 text-dark-300 border-dark-600",
  },
  [ProposalStatus.LIVE]: {
    label: "Live",
    className:
      "bg-primary-700/20 text-primary-400 border-primary-700/50 animate-pulse-slow",
  },
  [ProposalStatus.PASSED]: {
    label: "Passed",
    className: "bg-blue-600/20 text-blue-400 border-blue-600/50",
  },
  [ProposalStatus.FAILED]: {
    label: "Failed",
    className: "bg-accent-600/20 text-accent-400 border-accent-600/50",
  },
  [ProposalStatus.EXECUTED]: {
    label: "Executed",
    className: "bg-secondary-600/20 text-secondary-400 border-secondary-600/50",
  },
  [ProposalStatus.EXECUTION_FAILED]: {
    label: "Exec Failed",
    className:
      "bg-transparent text-accent-400 border-accent-600",
  },
};

export function ProposalStatusChip({ status }: ProposalStatusChipProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
