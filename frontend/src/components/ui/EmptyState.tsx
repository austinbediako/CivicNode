"use client";

import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        className="mb-6"
        aria-hidden="true"
      >
        <circle cx="40" cy="40" r="36" fill="#0F2D5A" fillOpacity="0.08" />
        <circle cx="40" cy="40" r="20" fill="#4B3F9E" fillOpacity="0.12" />
        <circle cx="40" cy="40" r="8" fill="#4B3F9E" fillOpacity="0.2" />
      </svg>
      <h3 className="font-heading text-section-header text-navy dark:text-white">
        {title}
      </h3>
      <p className="mt-2 font-sans text-body text-gray-500 dark:text-gray-400 max-w-sm">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
