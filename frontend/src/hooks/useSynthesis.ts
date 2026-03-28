"use client";

import { useState, useCallback, useRef } from "react";
import { uploadLog, synthesizeProposal } from "@/lib/api";
import type { Proposal } from "@/types";

export function useSynthesis() {
  const [streamText, setStreamText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [draft, setDraft] = useState<Partial<Proposal> | null>(null);
  const [logId, setLogId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const upload = useCallback(async (file: File | string) => {
    setIsUploading(true);
    setError(null);
    try {
      const result = await uploadLog(file);
      setLogId(result.logId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }, []);

  const synthesize = useCallback(
    async (communityId: string) => {
      if (!logId) {
        setError("No discussion uploaded yet");
        return;
      }

      setIsSynthesizing(true);
      setIsComplete(false);
      setStreamText("");
      setDraft(null);
      setError(null);

      try {
        const response = await synthesizeProposal(logId, communityId);

        if (!response.body) {
          throw new Error("No response stream");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") {
                setIsComplete(true);
                setIsSynthesizing(false);
                try {
                  const parsed = JSON.parse(accumulated) as Partial<Proposal>;
                  setDraft(parsed);
                } catch {
                  // Stream was plain text, not JSON
                }
                return;
              }
              try {
                const parsed = JSON.parse(data) as { token?: string; draft?: Partial<Proposal> };
                if (parsed.token) {
                  accumulated += parsed.token;
                  setStreamText((prev) => prev + parsed.token);
                }
                if (parsed.draft) {
                  setDraft(parsed.draft);
                }
              } catch {
                accumulated += data;
                setStreamText((prev) => prev + data);
              }
            }
          }
        }

        setIsComplete(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Synthesis failed");
      } finally {
        setIsSynthesizing(false);
      }
    },
    [logId]
  );

  const reset = useCallback(() => {
    setStreamText("");
    setIsUploading(false);
    setIsSynthesizing(false);
    setIsComplete(false);
    setDraft(null);
    setLogId(null);
    setError(null);
  }, []);

  return {
    upload,
    synthesize,
    streamText,
    isUploading,
    isSynthesizing,
    isComplete,
    draft,
    logId,
    error,
    reset,
  };
}
