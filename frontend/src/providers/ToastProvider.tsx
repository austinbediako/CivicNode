"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  type ReactNode,
} from "react";
import type { ToastMessage } from "@/types";
import { TOAST_DISMISS_MS } from "@/lib/constants";

interface ToastContextValue {
  toast: (message: string, type?: ToastMessage["type"]) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
});

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}

const TYPE_STYLES: Record<ToastMessage["type"], string> = {
  success:
    "bg-teal-600 text-white dark:bg-teal-700",
  error:
    "bg-danger-gov text-white dark:bg-danger-gov-600",
  info: "bg-navy text-white dark:bg-navy-600",
  warning:
    "bg-amber-gov text-white dark:bg-amber-gov-600",
};

export function ToastProvider({ children }: { children: ReactNode }): ReactNode {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback(
    (message: string, type: ToastMessage["type"] = "info") => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, TOAST_DISMISS_MS);
    },
    []
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`${TYPE_STYLES[t.type]} rounded-btn px-4 py-3 shadow-modal text-sm font-sans animate-slide-up flex items-center justify-between gap-3`}
          >
            <span>{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="opacity-70 hover:opacity-100 transition-opacity text-xs font-medium"
              aria-label="Dismiss notification"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
