"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant?: "danger" | "primary";
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
  isOpen: boolean;
}

export function ConfirmModal({
  title,
  description,
  confirmLabel,
  confirmVariant = "primary",
  onConfirm,
  onCancel,
  isOpen,
}: ConfirmModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div className="relative bg-white dark:bg-navy-800 rounded-modal shadow-modal w-full max-w-md p-6 animate-fade-in">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="font-heading text-section-header text-navy dark:text-white pr-8">
          {title}
        </h2>
        <p className="mt-2 font-sans text-body text-gray-600 dark:text-gray-400">
          {description}
        </p>

        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-btn border border-gray-300 dark:border-navy-600 text-gray-700 dark:text-gray-300 font-sans font-medium text-body hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors focus-ring disabled:opacity-40"
            aria-label="Cancel"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              "px-4 py-2.5 rounded-btn font-sans font-medium text-body text-white transition-colors focus-ring disabled:opacity-40 flex items-center gap-2",
              confirmVariant === "danger"
                ? "bg-danger-gov hover:bg-danger-gov-600"
                : "bg-purple hover:bg-purple-600"
            )}
            aria-label={confirmLabel}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
