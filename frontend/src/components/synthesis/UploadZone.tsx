"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, FileText, X, ClipboardPaste } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onUpload: (text: string) => void;
  isUploading?: boolean;
}

export function UploadZone({ onUpload, isUploading = false }: UploadZoneProps) {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setText(content);
        setFileName(file.name);
      };
      reader.readAsText(file);
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("text/")) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleSubmit = () => {
    if (text.trim()) {
      onUpload(text.trim());
    }
  };

  const handleClear = () => {
    setText("");
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag-and-Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
          isDragging
            ? "border-primary-500 bg-primary-700/10"
            : "border-dark-600 hover:border-dark-500"
        )}
      >
        <Upload className="w-10 h-10 mx-auto text-dark-500 mb-3" />
        <p className="text-dark-300 mb-1">
          Drag & drop a chat log file, or{" "}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-primary-400 hover:text-primary-300 underline"
          >
            browse
          </button>
        </p>
        <p className="text-xs text-dark-500">
          Supports .txt, .csv, and other text files
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.csv,.log,.json"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Or Paste Text */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <ClipboardPaste className="w-4 h-4 text-dark-500" />
          <span className="text-sm text-dark-400">Or paste chat log text</span>
        </div>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setFileName(null);
          }}
          placeholder="Paste community chat log here..."
          rows={8}
          className="input-field resize-none font-mono text-sm"
        />
      </div>

      {/* File Preview */}
      {fileName && (
        <div className="flex items-center gap-3 bg-dark-800 rounded-lg px-4 py-3 border border-dark-700">
          <FileText className="w-5 h-5 text-primary-400 flex-shrink-0" />
          <span className="text-sm text-dark-200 truncate flex-1">
            {fileName}
          </span>
          <span className="text-xs text-dark-500">
            {text.length.toLocaleString()} chars
          </span>
          <button
            onClick={handleClear}
            className="p-1 text-dark-400 hover:text-dark-200"
            aria-label="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!text.trim() || isUploading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {isUploading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Upload Chat Log
          </>
        )}
      </button>
    </div>
  );
}
