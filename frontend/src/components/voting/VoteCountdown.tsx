"use client";

import { useState, useEffect } from "react";
import { Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoteCountdownProps {
  deadline: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(deadline: string): TimeLeft | null {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export function VoteCountdown({ deadline }: VoteCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() =>
    calculateTimeLeft(deadline)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(deadline));
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  if (!timeLeft) {
    return (
      <div className="flex items-center gap-2 text-accent-400 bg-accent-600/10 border border-accent-600/30 rounded-lg px-4 py-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm font-medium">Voting Ended</span>
      </div>
    );
  }

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 6;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-4 py-3 border",
        isUrgent
          ? "bg-secondary-600/10 border-secondary-600/30"
          : "bg-dark-800 border-dark-700"
      )}
    >
      <Clock
        className={cn(
          "w-5 h-5 flex-shrink-0",
          isUrgent ? "text-secondary-400" : "text-dark-400"
        )}
      />
      <div className="flex items-center gap-3">
        {timeLeft.days > 0 && (
          <TimeUnit value={timeLeft.days} label="d" urgent={isUrgent} />
        )}
        <TimeUnit value={timeLeft.hours} label="h" urgent={isUrgent} />
        <TimeUnit value={timeLeft.minutes} label="m" urgent={isUrgent} />
        <TimeUnit value={timeLeft.seconds} label="s" urgent={isUrgent} />
      </div>
      <span
        className={cn(
          "text-xs ml-1",
          isUrgent ? "text-secondary-400" : "text-dark-500"
        )}
      >
        remaining
      </span>
    </div>
  );
}

function TimeUnit({
  value,
  label,
  urgent,
}: {
  value: number;
  label: string;
  urgent: boolean;
}) {
  return (
    <div className="flex items-baseline gap-0.5">
      <span
        className={cn(
          "text-lg font-bold tabular-nums",
          urgent ? "text-secondary-300" : "text-dark-100"
        )}
      >
        {String(value).padStart(2, "0")}
      </span>
      <span
        className={cn(
          "text-xs",
          urgent ? "text-secondary-500" : "text-dark-500"
        )}
      >
        {label}
      </span>
    </div>
  );
}
