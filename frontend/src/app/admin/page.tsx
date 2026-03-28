"use client";

import { useState, useCallback } from "react";
import { Sparkles } from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { UploadZone } from "@/components/synthesis/UploadZone";
import { SynthesisStream } from "@/components/synthesis/SynthesisStream";
import { DraftEditor } from "@/components/synthesis/DraftEditor";
import { uploadLog, synthesizeProposal, updateProposal, publishProposal } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { ProposalDraft } from "@/types";

type AdminStep = "upload" | "synthesize" | "edit";

export default function AdminPage() {
  const { user } = useAuth();
  const [step, setStep] = useState<AdminStep>("upload");
  const [chatLogId, setChatLogId] = useState<string | null>(null);
  const [streamResponse, setStreamResponse] = useState<Response | null>(null);
  const [draft, setDraft] = useState<Partial<ProposalDraft> | null>(null);
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const communityId = user?.communityId ?? "";

  const handleUpload = async (text: string) => {
    if (!communityId) return;
    setIsUploading(true);
    try {
      const result = await uploadLog(text);
      setChatLogId(result.logId);
      setStep("synthesize");
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSynthesize = async () => {
    if (!chatLogId || !communityId) return;
    try {
      const response = await synthesizeProposal(chatLogId, communityId);
      setStreamResponse(response);
    } catch (err) {
      console.error("Synthesis request failed:", err);
    }
  };

  const handleSynthesisComplete = useCallback((rawDraft: string, synthProposalId?: string) => {
    if (synthProposalId) {
      setProposalId(synthProposalId);
    }

    // Try to parse the AI output as JSON for the draft
    try {
      const parsed = JSON.parse(rawDraft) as Partial<ProposalDraft>;
      setDraft(parsed);
    } catch {
      // If not JSON, put it all in the summary field
      setDraft({
        title: "",
        summary: rawDraft,
        budgetRequested: 0,
        currency: "GHS",
        actionItems: [],
        rationale: "",
        dissent: "",
      });
    }
    setStep("edit");
  }, []);

  const handleSaveDraft = async (
    draftData: ProposalDraft & { recipient: string; deadline: string }
  ) => {
    if (!proposalId) {
      // TODO(civicnode): Create proposal via API (POST /proposals) — for now just log
      console.log("Saving draft:", draftData);
      return;
    }

    setIsSaving(true);
    try {
      await updateProposal(proposalId, draftData);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!proposalId) {
      // TODO(civicnode): First create, then publish
      console.log("Publishing proposal");
      return;
    }

    setIsPublishing(true);
    try {
      await publishProposal(proposalId);
    } catch (err) {
      console.error("Publish failed:", err);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-dark-50">
            Upload & Synthesize
          </h1>
          <p className="text-dark-400 mt-1">
            Upload community chat logs and generate AI-synthesized governance
            proposals.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-4">
          {["Upload", "Synthesize", "Edit & Publish"].map((label, i) => {
            const stepIndex =
              step === "upload" ? 0 : step === "synthesize" ? 1 : 2;
            const isCompleted = i < stepIndex;
            const isCurrent = i === stepIndex;

            return (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isCurrent
                      ? "bg-primary-700 text-white"
                      : isCompleted
                        ? "bg-primary-700/20 text-primary-400"
                        : "bg-dark-800 text-dark-500"
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`text-sm hidden sm:block ${
                    isCurrent
                      ? "text-dark-100 font-medium"
                      : "text-dark-500"
                  }`}
                >
                  {label}
                </span>
                {i < 2 && (
                  <div className="w-8 h-px bg-dark-700 hidden sm:block" />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        {step === "upload" && (
          <div className="card">
            <UploadZone onUpload={handleUpload} isUploading={isUploading} />
          </div>
        )}

        {step === "synthesize" && (
          <div className="space-y-4">
            {!streamResponse && (
              <div className="card text-center py-8">
                <Sparkles className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                <p className="text-dark-300 mb-4">
                  Chat log uploaded successfully. Ready to synthesize.
                </p>
                <button
                  onClick={handleSynthesize}
                  className="btn-secondary flex items-center gap-2 mx-auto"
                >
                  <Sparkles className="w-4 h-4" />
                  Synthesize Proposal
                </button>
              </div>
            )}
            {streamResponse && (
              <div className="card">
                <SynthesisStream
                  streamResponse={streamResponse}
                  onComplete={handleSynthesisComplete}
                />
              </div>
            )}
          </div>
        )}

        {step === "edit" && draft && (
          <div className="card">
            <DraftEditor
              initialDraft={draft}
              onSave={handleSaveDraft}
              onPublish={handlePublish}
              isSaving={isSaving}
              isPublishing={isPublishing}
            />
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
