"use client";

import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: string;
}

export function StatCard({ label, value, unit, trend }: StatCardProps) {
  const isPositive = trend?.startsWith("+");

  return (
    <div className="bg-white dark:bg-navy-800 rounded-card shadow-card p-4 border border-gray-100 dark:border-navy-700">
      <p className="font-sans text-caption uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-heading text-[28px] font-bold text-navy dark:text-white">
          {value}
        </span>
        {unit && (
          <span className="font-sans text-body text-gray-500 dark:text-gray-400">
            {unit}
          </span>
        )}
        {trend && (
          <span
            className={cn(
              "text-caption font-medium",
              isPositive ? "text-teal" : "text-danger-gov"
            )}
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
