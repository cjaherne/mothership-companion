"use client";

import { useState } from "react";
import type { Character } from "@/types/run";
import {
  createRandomMothershipCharacter,
  rollRandomName,
  rollRandomTraitsAndPersonality,
  CLASS_NAMES,
  type MothershipCharacterData,
} from "@/lib/mothership";

interface AddCharacterFormProps {
  runId: string;
  onSubmit: (char: Character) => void;
  submitLabel?: string;
}

export function AddCharacterForm({
  runId,
  onSubmit,
  submitLabel = "Add character",
}: AddCharacterFormProps) {
  const [playerName, setPlayerName] = useState("");
  const [name, setName] = useState("");
  const [traits, setTraits] = useState("");
  const [personalitySummary, setPersonalitySummary] = useState("");
  const [mothership, setMothership] = useState<MothershipCharacterData | null>(null);

  const handleRandomize = () => {
    const m = createRandomMothershipCharacter();
    setMothership(m);
    setName(rollRandomName());
    const { traits: t, personality: p } = rollRandomTraitsAndPersonality();
    setTraits(t);
    setPersonalitySummary(p);
  };

  const handleRandomName = () => setName(rollRandomName());

  const handleRandomStats = () => setMothership(createRandomMothershipCharacter());

  const handleRandomTraitsAndPersonality = () => {
    const { traits: t, personality: p } = rollRandomTraitsAndPersonality();
    setTraits(t);
    setPersonalitySummary(p);
  };

  const handleSubmit = () => {
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

    onSubmit(char);
    setPlayerName("");
    setName("");
    setTraits("");
    setPersonalitySummary("");
    setMothership(null);
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-neutral-900">Add character</h4>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-neutral-600">
            Player name (person at the table)
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="e.g. Chris"
            className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-600">
            Character name
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Corporal Vasquez"
              className="flex-1 rounded border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleRandomName}
              className="shrink-0 rounded border border-neutral-400 px-2 py-1.5 text-xs text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900"
            >
              Random
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleRandomize}
          className="rounded border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-200"
        >
          Random full character
        </button>
        <button
          type="button"
          onClick={handleRandomStats}
          className="rounded border border-neutral-400 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900"
        >
          Random stats only
        </button>
        {mothership && (
          <span className="text-xs text-neutral-700">
            {CLASS_NAMES[mothership.class]} • STR {mothership.stats.strength} •
            {mothership.credits} cr
          </span>
        )}
      </div>

      {mothership && (
        <div className="rounded border border-amber-900/50 bg-amber-950/20 p-3 text-xs">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4">
            <span className="text-neutral-600">STR</span>
            <span>{mothership.stats.strength}</span>
            <span className="text-neutral-600">SPD</span>
            <span>{mothership.stats.speed}</span>
            <span className="text-neutral-600">INT</span>
            <span>{mothership.stats.intellect}</span>
            <span className="text-neutral-600">CBT</span>
            <span>{mothership.stats.combat}</span>
            <span className="text-neutral-600">SAN</span>
            <span>{mothership.stats.sanity}</span>
            <span className="text-neutral-600">FEAR</span>
            <span>{mothership.stats.fear}</span>
            <span className="text-neutral-600">BOD</span>
            <span>{mothership.stats.body}</span>
            <span className="text-neutral-600">HP</span>
            <span>{mothership.health}</span>
            <span className="text-neutral-600">Wounds</span>
            <span>0/{mothership.maxWounds ?? 2}</span>
            <span className="text-neutral-600">Credits</span>
            <span>{mothership.credits}</span>
          </div>
          <p className="mt-2 text-neutral-700">{mothership.loadout}</p>
          <p className="mt-1 text-neutral-600">
            {mothership.trinket} • {mothership.patch} patch
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-neutral-600">
            Traits (comma-separated)
          </label>
          <input
            type="text"
            value={traits}
            onChange={(e) => setTraits(e.target.value)}
            placeholder="e.g. paranoid, tactical, loyal"
            className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
          />
        </div>
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="block text-xs text-neutral-600">
            Personality & background (how NPCs should treat this character)
          </label>
          <button
            type="button"
            onClick={handleRandomTraitsAndPersonality}
            className="rounded border border-neutral-400 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900"
          >
            Random traits & personality
          </button>
        </div>
        <textarea
          value={personalitySummary}
          onChange={(e) => setPersonalitySummary(e.target.value)}
          placeholder="Brief description: demeanor, quirks, what NPCs might react to..."
          rows={2}
          className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="rounded border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-200 disabled:border-neutral-400 disabled:text-neutral-500"
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
