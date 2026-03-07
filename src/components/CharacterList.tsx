"use client";

import { useState } from "react";
import type { Character } from "@/types/run";

interface CharacterListProps {
  characters: Character[];
  className?: string;
}

export function CharacterList({ characters, className = "" }: CharacterListProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950/50 ${className}`}
    >
      <h4 className="border-b border-neutral-800 px-4 py-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
        Characters
      </h4>
      <ul className="flex-1 overflow-y-auto p-2">
        {characters.length === 0 ? (
          <li className="px-2 py-4 text-center text-sm text-neutral-500">
            No characters yet
          </li>
        ) : (
          characters.map((char) => (
            <li key={char.id}>
              <button
                type="button"
                onClick={() => setSelectedCharacter(char)}
                className="w-full rounded px-3 py-2 text-left text-sm text-neutral-200 transition hover:bg-neutral-800/80"
              >
                {char.name}
              </button>
            </li>
          ))
        )}
      </ul>

      {selectedCharacter && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Character details"
          onClick={() => setSelectedCharacter(null)}
        >
          <div
            className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-lg border border-neutral-700 bg-neutral-900 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <h5 className="text-lg font-semibold text-white">
                {selectedCharacter.name}
              </h5>
              <button
                type="button"
                onClick={() => setSelectedCharacter(null)}
                className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="space-y-3 text-sm">
              {selectedCharacter.traits.length > 0 && (
                <div>
                  <span className="text-neutral-500">Traits: </span>
                  <span className="text-neutral-200">
                    {selectedCharacter.traits.join(", ")}
                  </span>
                </div>
              )}
              <div>
                <span className="text-neutral-500">Personality & background:</span>
                <p className="mt-1 text-neutral-300">
                  {selectedCharacter.personalitySummary}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
