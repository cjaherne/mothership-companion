"use client";

import { useState } from "react";
import { getCampaign } from "@/campaigns";
import type { CampaignId } from "@/campaigns";
import {
  getRunState,
  addCharacter,
  removeCharacter as removeCharacterFromRun,
  type CampaignRun,
} from "@/lib/runs";
import type { Character } from "@/types/run";
import {
  createRandomMothershipCharacter,
  CLASS_NAMES,
  LOADOUT_NAMES,
  type MothershipCharacterData,
} from "@/lib/mothership";

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

  const [playerName, setPlayerName] = useState("");
  const [name, setName] = useState("");
  const [traits, setTraits] = useState("");
  const [personalitySummary, setPersonalitySummary] = useState("");
  const [mothership, setMothership] = useState<MothershipCharacterData | null>(
    null
  );

  const handleRandomize = () => {
    const m = createRandomMothershipCharacter();
    setMothership(m);
    if (!name.trim()) {
      const suggestions = ["Vasquez", "Hicks", "Drake", "Frost", "Hudson", "Apone"];
      setName(suggestions[Math.floor(Math.random() * suggestions.length)]);
    }
  };

  const handleAddCharacter = () => {
    const trimmedPlayerName = playerName.trim();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const char: Character = {
      id: `char_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      playerName: trimmedPlayerName || undefined,
      name: trimmedName,
      traits: traits
        .split(/[,;]/)
        .map((t) => t.trim())
        .filter(Boolean),
      personalitySummary: personalitySummary.trim() || "No description provided.",
      mothership: mothership ?? undefined,
    };

    addCharacter(run.id, char);
    setCharacters([...characters, char]);

    setName("");
    setPlayerName("");
    setTraits("");
    setPersonalitySummary("");
    setMothership(null);
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
        Create your group&apos;s characters. Capture player name and character
        details. Mothership stats and loadout can be rolled randomly.
      </p>

      <div className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-950/50 p-6">
        <h4 className="text-sm font-medium text-neon-cyan">Add player</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-neutral-500">
              Player name (person at the table)
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="e.g. Chris"
              className="w-full rounded border border-neutral-700 bg-black px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-neon-cyan/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-500">
              Character name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Corporal Vasquez"
              className="w-full rounded border border-neutral-700 bg-black px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-neon-cyan/50 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRandomize}
            className="rounded border border-neon-green/50 px-4 py-2 text-sm font-medium text-neon-green hover:bg-neon-green/10"
          >
            Random Character Creation
          </button>
          {mothership && (
            <span className="text-xs text-neutral-500">
              {CLASS_NAMES[mothership.class]} • {LOADOUT_NAMES[mothership.loadout]} •
              STR {mothership.stats.strength} • {mothership.credits} credits
            </span>
          )}
        </div>

        {mothership && (
          <div className="rounded border border-neutral-700 bg-black/50 p-3 text-xs">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4">
              <span className="text-neutral-500">STR</span>
              <span>{mothership.stats.strength}</span>
              <span className="text-neutral-500">SPD</span>
              <span>{mothership.stats.speed}</span>
              <span className="text-neutral-500">INT</span>
              <span>{mothership.stats.intellect}</span>
              <span className="text-neutral-500">CBT</span>
              <span>{mothership.stats.combat}</span>
              <span className="text-neutral-500">SAN</span>
              <span>{mothership.stats.sanity}</span>
              <span className="text-neutral-500">FEAR</span>
              <span>{mothership.stats.fear}</span>
              <span className="text-neutral-500">BOD</span>
              <span>{mothership.stats.body}</span>
              <span className="text-neutral-500">HP</span>
              <span>{mothership.health}</span>
              <span className="text-neutral-500">Credits</span>
              <span>{mothership.credits}</span>
            </div>
            <p className="mt-2 text-neutral-400">
              {mothership.trinket} • {mothership.patch} patch
            </p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
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
            rows={2}
            className="w-full rounded border border-neutral-700 bg-black px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-neon-cyan/50 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={handleAddCharacter}
          disabled={!name.trim()}
          className="rounded border border-neon-cyan/50 px-4 py-2 text-sm text-neon-cyan hover:bg-neon-cyan/10 disabled:border-neutral-700 disabled:text-neutral-500"
        >
          Add player
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
                  {c.playerName ? (
                    <span className="font-medium text-white">{c.playerName}</span>
                  ) : null}
                  <span className="font-medium text-white">
                    {c.playerName ? " → " : ""}
                    {c.name}
                  </span>
                  {c.mothership && (
                    <span className="ml-2 text-xs text-neutral-500">
                      {CLASS_NAMES[c.mothership.class]}
                    </span>
                  )}
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
            Add at least one player to start
          </p>
        )}
      </div>
    </div>
  );
}
