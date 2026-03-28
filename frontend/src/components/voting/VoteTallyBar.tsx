"use client";

import { cn } from "@/lib/utils";

interface VoteTallyBarProps {
  yesVotes: number;
  noVotes: number;
  abstainVotes: number;
}

export function VoteTallyBar({
  yesVotes,
  noVotes,
  abstainVotes,
}: VoteTallyBarProps) {
  const total = yesVotes + noVotes + abstainVotes;
  const yesPercent = total > 0 ? (yesVotes / total) * 100 : 0;
  const noPercent = total > 0 ? (noVotes / total) * 100 : 0;
  const abstainPercent = total > 0 ? (abstainVotes / total) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-dark-300 font-medium">Vote Tally</span>
        <span className="text-dark-500">{total} total votes</span>
      </div>

      {/* Progress Bar */}
      <div className="h-4 rounded-full overflow-hidden bg-dark-700 flex">
        {total > 0 ? (
          <>
            <div
              className="bg-primary-500 transition-all duration-700 ease-out"
              style={{ width: `${yesPercent}%` }}
            />
            <div
              className="bg-accent-500 transition-all duration-700 ease-out"
              style={{ width: `${noPercent}%` }}
            />
            <div
              className="bg-dark-500 transition-all duration-700 ease-out"
              style={{ width: `${abstainPercent}%` }}
            />
          </>
        ) : (
          <div className="w-full bg-dark-700" />
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary-500" />
          <span className="text-dark-300">
            Yes: {yesVotes} ({yesPercent.toFixed(1)}%)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent-500" />
          <span className="text-dark-300">
            No: {noVotes} ({noPercent.toFixed(1)}%)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-dark-500" />
          <span className="text-dark-300">
            Abstain: {abstainVotes} ({abstainPercent.toFixed(1)}%)
          </span>
        </div>
      </div>
    </div>
  );
}
