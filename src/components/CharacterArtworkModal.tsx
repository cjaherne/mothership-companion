"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import type { Character } from "@/types/run";

const VARIABILITY_HINTS = [
  "different gender",
  "different hairstyle and hair color",
  "different facial expression",
  "different clothing or uniform style",
  "different age appearance",
  "different facial structure",
  "different background color",
  "add glasses, goggles, or sunglasses",
  "add scarf, hood, or bandana",
];

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

interface CharacterArtworkModalProps {
  character: Character;
  runId: string;
  onAccept: (avatarPath: string) => void;
  onSkip: () => void;
  onClose: () => void;
}

export function CharacterArtworkModal({
  character,
  runId,
  onAccept,
  onSkip,
  onClose,
}: CharacterArtworkModalProps) {
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (regenerate = false) => {
      setLoading(true);
      setError(null);
      const hints = regenerate ? pickRandom(VARIABILITY_HINTS, 3) : undefined;
      try {
        const res = await fetch("/api/character-art", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            character: {
              name: character.name,
              traits: character.traits,
              personalitySummary: character.personalitySummary,
            },
            regenerate,
            variabilityHints: hints,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "Generation failed");
        }
        setImageUrl(data.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to generate artwork");
      } finally {
        setLoading(false);
      }
    },
    [character.name, character.traits, character.personalitySummary]
  );

  useEffect(() => {
    generate(false);
  }, [generate]);

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
      aria-label="Character artwork"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-amber-900/50 bg-neutral-950 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-semibold text-amber-200">
            Character artwork: {character.name}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-amber-600">Generating artwork...</p>
            <p className="mt-2 text-xs text-neutral-500">This may take 10–20 seconds</p>
          </div>
        )}

        {error && !loading && (
          <div className="space-y-4">
            <p className="text-sm text-red-400">{error}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => generate(true)}
                className="rounded border border-amber-500/50 px-3 py-2 text-sm text-amber-400 hover:bg-amber-500/10"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={onSkip}
                className="rounded border border-neutral-600 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {imageUrl && !loading && (
          <div className="space-y-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-amber-900/40 bg-amber-950/20">
              <Image
                src={imageUrl}
                alt={`Portrait of ${character.name}`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onAccept(imageUrl)}
                className="rounded border border-amber-500/50 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/20"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => generate(true)}
                className="rounded border border-amber-800/60 px-4 py-2 text-sm text-amber-600 hover:bg-amber-950/50 hover:text-amber-400"
              >
                Regenerate
              </button>
              <button
                type="button"
                onClick={onSkip}
                className="rounded border border-neutral-600 px-4 py-2 text-sm text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
              >
                Skip
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
