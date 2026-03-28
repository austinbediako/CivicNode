"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SynthesisStreamProps {
  /** A pending Response from the POST /proposals/synthesize endpoint. */
  streamResponse: Response | null;
  /** Called when streaming completes with the full accumulated text. */
  onComplete: (draft: string, proposalId?: string) => void;
}

/**
 * Consumes a Server-Sent Events (SSE) stream from a fetch Response
 * and renders each token as it arrives with a pulsing cursor.
 */
export function SynthesisStream({
  streamResponse,
  onComplete,
}: SynthesisStreamProps) {
  const [content, setContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Stable callback ref to avoid re-triggering the effect when onComplete changes
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const processStream = useCallback(async (response: Response) => {
    const body = response.body;
    if (!body) {
      setError("Response body is empty.");
      setIsStreaming(false);
      return;
    }

    const reader = body.getReader();
    const decoder = new TextDecoder();
    let accumulated = "";
    let buffer = "";
    let proposalId: string | undefined;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE format: each message is "data: <payload>\n\n"
        const lines = buffer.split("\n\n");
        // Keep the last incomplete chunk in the buffer
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;

          const payload = trimmed.slice(6); // Remove "data: " prefix

          if (payload === "[DONE]") {
            setIsStreaming(false);
            onCompleteRef.current(accumulated, proposalId);
            return;
          }

          try {
            const parsed = JSON.parse(payload) as Record<string, unknown>;

            if (parsed.error) {
              setError(String(parsed.error));
              setIsStreaming(false);
              return;
            }

            if (parsed.done) {
              if (typeof parsed.proposalId === "string") {
                proposalId = parsed.proposalId;
              }
              // Stream end event — [DONE] sentinel will follow
              continue;
            }

            if (typeof parsed.chunk === "string") {
              accumulated += parsed.chunk;
              setContent(accumulated);
            }
          } catch {
            // If data isn't JSON, treat it as raw text (fallback)
            accumulated += payload;
            setContent(accumulated);
          }

          // Auto-scroll to bottom
          if (contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
          }
        }
      }

      // Stream ended without [DONE] sentinel — still deliver what we have
      if (accumulated) {
        setIsStreaming(false);
        onCompleteRef.current(accumulated, proposalId);
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // Stream was intentionally aborted (e.g., unmount) — not an error
        return;
      }
      const message =
        err instanceof Error ? err.message : "Stream reading failed";
      setError(message);
      setIsStreaming(false);

      // If we have accumulated content, still pass it through
      if (accumulated) {
        onCompleteRef.current(accumulated, proposalId);
      }
    }
  }, []);

  useEffect(() => {
    if (!streamResponse) return;

    // Reset state for new stream
    setContent("");
    setError(null);
    setIsStreaming(true);

    const abort = new AbortController();
    abortRef.current = abort;

    void processStream(streamResponse);

    return () => {
      abort.abort();
      abortRef.current = null;
    };
  }, [streamResponse, processStream]);

  if (!streamResponse && !content) return null;

  return (
    <div className="space-y-3">
      {/* Streaming Header */}
      <div className="flex items-center gap-2">
        <Sparkles
          className={cn(
            "w-5 h-5",
            isStreaming
              ? "text-secondary-400 animate-pulse"
              : "text-primary-400"
          )}
        />
        <span className="text-sm font-medium text-dark-200">
          {isStreaming ? "AI is synthesizing..." : "Synthesis complete"}
        </span>
      </div>

      {/* Stream Content */}
      <div
        ref={contentRef}
        className="bg-dark-950 border border-dark-700 rounded-xl p-4 max-h-96 overflow-y-auto"
      >
        <pre className="whitespace-pre-wrap text-sm text-dark-200 font-mono leading-relaxed">
          {content}
          {isStreaming && (
            <span className="inline-block w-2 h-4 bg-primary-400 animate-pulse ml-0.5" />
          )}
        </pre>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-secondary-400 bg-secondary-600/10 border border-secondary-600/30 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
