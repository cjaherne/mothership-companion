"use client";

import { useState } from "react";

interface WordPuzzleModalProps {
  puzzleId: string;
  clue: string;
  solution: string;
  onSolve: () => void;
  onClose: () => void;
}

export function WordPuzzleModal({
  puzzleId,
  clue,
  solution,
  onSolve,
  onClose,
}: WordPuzzleModalProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim().toUpperCase();
    const expected = solution.trim().toUpperCase();
    if (trimmed === expected) {
      onSolve();
      onClose();
    } else {
      setError("Incorrect. Try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      aria-modal
      role="dialog"
    >
      <div
        className="w-full max-w-md rounded-lg border-2 border-neutral-600 bg-neutral-800 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-heading mb-4 text-sm font-medium uppercase tracking-wider text-amber-200/90">
          Solve the puzzle
        </h3>
        <p className="mb-4 text-sm text-neutral-300">{clue}</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            placeholder="Enter your answer..."
            className="mb-2 w-full rounded border border-neutral-600 bg-neutral-900 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-amber-500 focus:outline-none"
            autoFocus
          />
          {error && <p className="mb-2 text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded border border-emerald-600 bg-emerald-900/40 px-3 py-1.5 text-sm font-medium text-emerald-400 transition hover:bg-emerald-900/60"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-neutral-500 px-3 py-1.5 text-sm text-neutral-400 transition hover:bg-neutral-700/50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
