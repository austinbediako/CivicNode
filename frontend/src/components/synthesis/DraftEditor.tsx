"use client";

import { useState } from "react";
import {
  Save,
  Send,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import type { ProposalDraft } from "@/types";
import { cn } from "@/lib/utils";

interface DraftEditorProps {
  initialDraft?: Partial<ProposalDraft> & {
    recipient?: string;
    deadline?: string;
  };
  onSave: (
    draft: ProposalDraft & { recipient: string; deadline: string }
  ) => Promise<void>;
  onPublish: () => Promise<void>;
  isSaving?: boolean;
  isPublishing?: boolean;
}

export function DraftEditor({
  initialDraft,
  onSave,
  onPublish,
  isSaving = false,
  isPublishing = false,
}: DraftEditorProps) {
  const [title, setTitle] = useState(initialDraft?.title ?? "");
  const [summary, setSummary] = useState(initialDraft?.summary ?? "");
  const [budgetRequested, setBudgetRequested] = useState(
    initialDraft?.budgetRequested ?? 0
  );
  const [currency, setCurrency] = useState(initialDraft?.currency ?? "SUI");
  const [actionItems, setActionItems] = useState<string[]>(
    initialDraft?.actionItems ?? [""]
  );
  const [rationale, setRationale] = useState(initialDraft?.rationale ?? "");
  const [dissent, setDissent] = useState(initialDraft?.dissent ?? "");
  const [recipient, setRecipient] = useState(initialDraft?.recipient ?? "");
  const [deadline, setDeadline] = useState(initialDraft?.deadline ?? "");

  const addActionItem = () => {
    setActionItems([...actionItems, ""]);
  };

  const removeActionItem = (index: number) => {
    setActionItems(actionItems.filter((_, i) => i !== index));
  };

  const updateActionItem = (index: number, value: string) => {
    const updated = [...actionItems];
    updated[index] = value;
    setActionItems(updated);
  };

  const handleSave = async () => {
    await onSave({
      title,
      summary,
      budgetRequested,
      currency,
      actionItems: actionItems.filter((item) => item.trim()),
      rationale,
      dissent,
      recipient,
      deadline,
    });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="label-text">
          Proposal Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter proposal title..."
          className="input-field text-lg font-semibold"
        />
      </div>

      {/* Summary */}
      <div>
        <label htmlFor="summary" className="label-text">
          Summary
        </label>
        <textarea
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Brief summary of the proposal..."
          rows={4}
          className="input-field resize-none"
        />
      </div>

      {/* Budget & Currency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="budget" className="label-text">
            Budget Requested
          </label>
          <input
            id="budget"
            type="number"
            value={budgetRequested}
            onChange={(e) => setBudgetRequested(Number(e.target.value))}
            min={0}
            step={0.01}
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="currency" className="label-text">
            Currency
          </label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="input-field"
          >
            <option value="SUI">SUI</option>
            <option value="GHS">GHS</option>
          </select>
        </div>
      </div>

      {/* Action Items */}
      <div>
        <label className="label-text">Action Items</label>
        <div className="space-y-2">
          {actionItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-primary-700/20 text-primary-400 rounded-full flex items-center justify-center text-xs font-medium">
                {index + 1}
              </span>
              <input
                type="text"
                value={item}
                onChange={(e) => updateActionItem(index, e.target.value)}
                placeholder={`Action item ${index + 1}...`}
                className="input-field flex-1"
              />
              {actionItems.length > 1 && (
                <button
                  onClick={() => removeActionItem(index)}
                  className="p-2 text-dark-400 hover:text-accent-400 transition-colors"
                  aria-label="Remove action item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addActionItem}
            className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors py-1"
          >
            <Plus className="w-4 h-4" />
            Add action item
          </button>
        </div>
      </div>

      {/* Rationale */}
      <div>
        <label htmlFor="rationale" className="label-text">
          Rationale
        </label>
        <textarea
          id="rationale"
          value={rationale}
          onChange={(e) => setRationale(e.target.value)}
          placeholder="Why this proposal should be approved..."
          rows={4}
          className="input-field resize-none"
        />
      </div>

      {/* Dissent */}
      <div>
        <label htmlFor="dissent" className="label-text">
          Dissenting View (Minority Opinion)
        </label>
        <textarea
          id="dissent"
          value={dissent}
          onChange={(e) => setDissent(e.target.value)}
          placeholder="Opposing arguments or concerns..."
          rows={3}
          className="input-field resize-none"
        />
      </div>

      {/* Recipient Address */}
      <div>
        <label htmlFor="recipient" className="label-text">
          Recipient Wallet Address
        </label>
        <input
          id="recipient"
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="0x..."
          className="input-field font-mono text-sm"
        />
      </div>

      {/* Deadline */}
      <div>
        <label htmlFor="deadline" className="label-text">
          Voting Deadline
        </label>
        <input
          id="deadline"
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-dark-700">
        <button
          onClick={handleSave}
          disabled={isSaving || !title.trim()}
          className="btn-outline flex items-center justify-center gap-2 flex-1"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Draft
        </button>
        <button
          onClick={onPublish}
          disabled={isPublishing || !title.trim()}
          className="btn-primary flex items-center justify-center gap-2 flex-1"
        >
          {isPublishing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Publish Proposal
        </button>
      </div>
    </div>
  );
}
