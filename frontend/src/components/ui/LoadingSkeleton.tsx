"use client";

import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  variant?: "card" | "row" | "text" | "full-page";
  count?: number;
}

function Pulse({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse bg-gray-200 dark:bg-navy-700 rounded-lg",
        className
      )}
    />
  );
}

export function LoadingSkeleton({
  variant = "card",
  count = 1,
}: LoadingSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === "text") {
    return (
      <div className="space-y-3">
        {items.map((i) => (
          <div key={i} className="space-y-2">
            <Pulse className="h-4 w-3/4" />
            <Pulse className="h-4 w-full" />
            <Pulse className="h-4 w-5/6" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "row") {
    return (
      <div className="space-y-2">
        {items.map((i) => (
          <Pulse key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (variant === "full-page") {
    return (
      <div className="space-y-6 p-6">
        <Pulse className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Pulse className="h-24" />
          <Pulse className="h-24" />
          <Pulse className="h-24" />
        </div>
        <Pulse className="h-6 w-40" />
        <div className="space-y-3">
          <Pulse className="h-[200px]" />
          <Pulse className="h-[200px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((i) => (
        <Pulse key={i} className="h-[200px] rounded-card" />
      ))}
    </div>
  );
}
