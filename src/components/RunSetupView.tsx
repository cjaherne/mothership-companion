"use client";

import { useState } from "react";
import { getCampaign } from "@/campaigns";
import type { CampaignId } from "@/campaigns";
import {
  getRunState,
  addCharacter,
  removeCharacter as removeCharacterFromRun,
  saveRunState,
  type CampaignRun,
} from "@/lib/runs";
import type { Character } from "@/types/run";

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
  const [name, setName] = useState("");
  const [traits, setTraits] = useState("");
  const [personalitySummary, setPersonalitySummary] = useState("");

  const handleAddCharacter = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const char: Character = {
      id: `char_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: trimmedName,
      traits: traits
        .split(/[,;]/)
        .map((t) => t.trim())
        .filter(Boolean),
      personalitySummary: personalitySummary.trim() || "No description provided.",
    };

    addCharacter(run.id, char);
    setCharacters([...characters, char]);
    setName("");
    setTraits("");
    setPersonalitySummary("");
  };

  const handleRemoveCharacter = (characterId: string) => {
    removeCharacterFromRun(run.id, characterId);
    setCharacters((prev) => prev.filter((c) => c.id !== characterId));
  };

  const canStart = characters.length >= 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Set up: {campaign.name}
        </h3>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-neutral-500 hover:text-neutral-300"
        >
          ← Back
        </button>
      </div>

      <p className="text-sm text-neutral-400">
        Create your group&apos;s characters. NPCs will use names, traits, and
        personality to tailor their interactions.
      </p>

      <div className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-950/50 p-6">
        <h4 className="text-sm font-medium text-neon-cyan">Add character</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-neutral-500">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Corporal Vasquez"
              className="w-full rounded border border-neutral-700 bg-black px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-neon-cyan/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-500">
              Traits (comma-separated)
            </label>
            <input
              type="text"
              value={traits}
              onChange={(e) => setTraits(e.target.value)}
              placeholder="e.g. paranoid, tactical, loyal"
              className="w-full rounded border border-neutral-700 bg-black px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-neon-cyan/50 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-500">
            Personality & background (how NPCs should treat this character)
          </label>
          <textarea
            value={personalitySummary}
            onChange={(e) => setPersonalitySummary(e.target.value)}
            placeholder="Brief description: demeanor, quirks, what NPCs might react to..."
            rows={3}
            className="w-full rounded border border-neutral-700 bg-black px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-neon-cyan/50 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={handleAddCharacter}
          disabled={!name.trim()}
          className="rounded border border-neon-cyan/50 px-4 py-2 text-sm text-neon-cyan hover:bg-neon-cyan/10 disabled:border-neutral-700 disabled:text-neutral-500"
        >
          Add character
        </button>
      </div>

      {characters.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-neutral-400">
            Group ({characters.length})
          </h4>
          <ul className="space-y-2">
            {characters.map((c) => (
              <li
                key={c.id}
                className="flex items-start justify-between rounded border border-neutral-800 px-4 py-3"
              >
                <div>
                  <span className="font-medium text-white">{c.name}</span>
                  {c.traits.length > 0 && (
                    <span className="ml-2 text-xs text-neutral-500">
                      {c.traits.join(", ")}
                    </span>
                  )}
                  {c.personalitySummary && (
                    <p className="mt-1 text-xs text-neutral-400">
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
          className="rounded-lg border border-neon-cyan/50 bg-neon-cyan/5 px-6 py-3 font-medium text-neon-cyan transition hover:bg-neon-cyan/10 disabled:border-neutral-800 disabled:bg-transparent disabled:text-neutral-600"
        >
          Start session
        </button>
        {!canStart && (
          <p className="flex items-center text-sm text-neutral-500">
            Add at least one character to start
          </p>
        )}
      </div>
    </div>
  );
}
