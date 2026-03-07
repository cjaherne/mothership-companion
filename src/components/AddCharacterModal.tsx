"use client";

import { useEffect, useCallback } from "react";
import { AddCharacterForm } from "./AddCharacterForm";
import type { Character } from "@/types/run";

interface AddCharacterModalProps {
  runId: string;
  onClose: () => void;
  onAdded: () => void;
}

export function AddCharacterModal({
  runId,
  onClose,
  onAdded,
}: AddCharacterModalProps) {
  const handleAdded = (_char: Character) => {
    onAdded();
    onClose();
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Add new character"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-amber-900/50 bg-neutral-950 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-semibold text-amber-200">New Character</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <AddCharacterForm
          runId={runId}
          onSubmit={handleAdded}
          submitLabel="Add character"
        />
      </div>
    </div>
  );
}
