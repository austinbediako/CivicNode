"use client";

import { cn } from "@/lib/utils";
import type { ToastMessage } from "@/types";

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const TYPE_STYLES: Record<ToastMessage["type"], string> = {
  success: "bg-teal text-white",
  error: "bg-danger-gov text-white",
  info: "bg-navy text-white",
  warning: "bg-amber-gov text-white",
};

export function Toast({ toast, onDismiss }: ToastProps) {
  return (
    <div
      className={cn(
        TYPE_STYLES[toast.type],
        "rounded-btn px-4 py-3 shadow-modal text-sm font-sans animate-slide-up flex items-center justify-between gap-3"
      )}
      role="alert"
    >
      <span>{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="opacity-70 hover:opacity-100 transition-opacity text-xs font-medium shrink-0"
        aria-label="Dismiss notification"
      >
        &times;
      </button>
    </div>
  );
}
