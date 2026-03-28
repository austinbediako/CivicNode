"use client";

import { Component, type ReactNode } from "react";
import { EmptyState } from "./EmptyState";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught:", error, info);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <EmptyState
          title="Something went wrong"
          description="An unexpected error occurred. Please try reloading the page."
          action={
            <button
              onClick={() => window.location.reload()}
              className="bg-purple hover:bg-purple-600 text-white font-sans font-medium text-body px-6 py-2.5 rounded-btn focus-ring transition-colors"
              aria-label="Reload page"
            >
              Reload page
            </button>
          }
        />
      );
    }

    return this.props.children;
  }
}
