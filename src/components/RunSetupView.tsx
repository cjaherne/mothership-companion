"use client";

import { useState, useCallback } from "react";
import { getCampaign } from "@/campaigns";
import type { CampaignId } from "@/campaigns";
import {
  getRunState,
  addCharacter,
  removeCharacter as removeCharacterFromRun,
  type CampaignRun,
} from "@/lib/runs";
import type { Character } from "@/types/run";
import { CLASS_NAMES } from "@/lib/mothership";
import { AddCharacterForm } from "./AddCharacterForm";
import { CharacterArtworkModal } from "./CharacterArtworkModal";

interface RunSetupViewProps {
  campaignId: CampaignId;
  run: CampaignRun;
  onStart: () => void;
  onBack: () => void;
}

export function RunSetupView({
  campaignId,
  run,
  onStart,
  onBack,
}: RunSetupViewProps) {
  const campaign = getCampaign(campaignId);
  const [characters, setCharacters] = useState<Character[]>(
    () => getRunState(run.id).characters
  );
  const [pendingCharacter, setPendingCharacter] = useState<Character | null>(null);

  const refreshCharacters = useCallback(() => {
    setCharacters(getRunState(run.id).characters);
  }, [run.id]);

  const handleFormSubmit = (char: Character) => {
    setPendingCharacter(char);
  };

  const handleAccept = useCallback(
    (avatarPath: string) => {
      if (pendingCharacter) {
        addCharacter(run.id, { ...pendingCharacter, avatarPath });
        refreshCharacters();
        setPendingCharacter(null);
      }
    },
    [run.id, pendingCharacter, refreshCharacters]
  );

  const handleSkip = useCallback(() => {
    if (pendingCharacter) {
      addCharacter(run.id, pendingCharacter);
      refreshCharacters();
      setPendingCharacter(null);
    }
  }, [run.id, pendingCharacter, refreshCharacters]);

  const handleRemoveCharacter = (characterId: string) => {
    removeCharacterFromRun(run.id, characterId);
    setCharacters((prev) => prev.filter((c) => c.id !== characterId));
  };

  const canStart = characters.length >= 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">
          Set up: {campaign.name}
        </h3>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-neutral-600 hover:text-neutral-900"
        >
          ← Back
        </button>
      </div>

      <p className="text-sm text-neutral-600">
        Create your group&apos;s characters. Capture player name and character
        details. Mothership stats and loadout can be rolled randomly.
      </p>

      {pendingCharacter ? (
        <CharacterArtworkModal
          character={pendingCharacter}
          runId={run.id}
          onAccept={handleAccept}
          onSkip={handleSkip}
          onClose={() => setPendingCharacter(null)}
        />
      ) : null}

      <div className="rounded-lg border border-neutral-300 bg-neutral-50 p-6">
        <AddCharacterForm
          runId={run.id}
          onSubmit={handleFormSubmit}
          submitLabel="Add player"
        />
      </div>

      {characters.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-neutral-600">
            Group ({characters.length})
          </h4>
          <ul className="space-y-2">
            {characters.map((c) => (
              <li
                key={c.id}
                className="flex items-start justify-between rounded border border-neutral-300 px-4 py-3"
              >
                <div>
                  {c.playerName ? (
                    <span className="font-medium text-neutral-900">{c.playerName}</span>
                  ) : null}
                  <span className="font-medium text-neutral-900">
                    {c.playerName ? " → " : ""}
                    {c.name}
                  </span>
                  {c.mothership && (
                    <span className="ml-2 text-xs text-neutral-600">
                      {CLASS_NAMES[c.mothership.class]}
                    </span>
                  )}
                  {c.traits.length > 0 && (
                    <span className="ml-2 text-xs text-neutral-600">
                      {c.traits.join(", ")}
                    </span>
                  )}
                  {c.personalitySummary && (
                    <p className="mt-1 text-xs text-neutral-600">
                      {c.personalitySummary}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveCharacter(c.id)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onStart}
          disabled={!canStart}
          className="rounded-lg border border-neon-pink/50 bg-neon-pink/5 px-6 py-3 font-medium text-neon-pink transition hover:bg-neon-pink/10 disabled:border-neutral-400 disabled:bg-transparent disabled:text-neutral-500"
        >
          Start session
        </button>
        {!canStart && (
          <p className="flex items-center text-sm text-neutral-500">
            Add at least one player to start
          </p>
        )}
      </div>
    </div>
  );
}
