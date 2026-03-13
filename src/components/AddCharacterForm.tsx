"use client";

import { useState, useCallback } from "react";
import type { Character } from "@/types/run";
import {
  rollRandomName,
  rollRandomTraitsAndPersonality,
  CLASS_INFO,
  CLASS_NAMES,
  SEX_LABELS,
  getLoadoutDisplayText,
  rollStat,
  rollSave,
  rollHealth,
  rollLoadoutTrinketPatchCredits,
  buildMothershipCharacter,
  computeStatsWithClass,
  getClassReferenceImagePath,
  STAT_KEYS,
  type MothershipCharacterData,
  type MothershipClass,
  type MothershipStats,
  type CharacterSex,
} from "@/lib/mothership";
import { StatBadge, StatBadgeWithRoll, HealthBadgeWithRoll, ValueOverMaxBadge } from "@/components/MothershipStatDisplay";
import { SkillsMatrix } from "@/components/SkillsMatrix";

const STAT_LABELS: Record<keyof MothershipStats, string> = {
  strength: "STR",
  speed: "SPD",
  intellect: "INT",
  combat: "CBT",
  sanity: "SAN",
  fear: "FEAR",
  body: "BOD",
};

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

  const [cls, setCls] = useState<MothershipClass>("marine");
  const [sex, setSex] = useState<CharacterSex>("male");
  const [baseStats, setBaseStats] = useState<MothershipStats | null>(null);
  const [androidReduceStat, setAndroidReduceStat] = useState<keyof MothershipStats | "">("");
  const [scientistBoostStat, setScientistBoostStat] = useState<keyof MothershipStats | "">("");
  const [health, setHealth] = useState<number | null>(null);
  const [skillIds, setSkillIds] = useState<string[]>(() => [...CLASS_INFO.marine.defaultSkillIds]);
  const [loadoutTrinketPatchCredits, setLoadoutTrinketPatchCredits] = useState<{
    loadoutId: string;
    trinket: string;
    patch: string;
    credits: number;
  } | null>(null);

  const handleRandomize = useCallback(() => {
    const classes: MothershipClass[] = ["marine", "android", "scientist", "teamster"];
    const sexes: CharacterSex[] = ["male", "female", "other"];
    const c = classes[Math.floor(Math.random() * classes.length)];
    setCls(c);
    setSex(sexes[Math.floor(Math.random() * sexes.length)]);
    setBaseStats({
      strength: rollStat(),
      speed: rollStat(),
      intellect: rollStat(),
      combat: rollStat(),
      sanity: rollSave(),
      fear: rollSave(),
      body: rollSave(),
    });
    setAndroidReduceStat(
      c === "android"
        ? (["strength", "speed", "combat"] as const)[Math.floor(Math.random() * 3)]
        : ""
    );
    setScientistBoostStat(
      c === "scientist"
        ? (["strength", "speed", "intellect", "combat"] as const)[
            Math.floor(Math.random() * 4)
          ]
        : ""
    );
    setHealth(rollHealth());
    setSkillIds([...CLASS_INFO[c].defaultSkillIds]);
    setLoadoutTrinketPatchCredits(rollLoadoutTrinketPatchCredits(c));
    setName(rollRandomName());
    const { traits: t, personality: p } = rollRandomTraitsAndPersonality();
    setTraits(t);
    setPersonalitySummary(p);
  }, []);

  const handleRandomName = () => setName(rollRandomName());

  const onRandomTraitsAndPersonality = () => {
    const { traits: t, personality: p } = rollRandomTraitsAndPersonality();
    setTraits(t);
    setPersonalitySummary(p);
  };

  const handleClassChange = (newCls: MothershipClass) => {
    setCls(newCls);
    setSkillIds([...CLASS_INFO[newCls].defaultSkillIds]);
    if (newCls !== "android") setAndroidReduceStat("");
    if (newCls !== "scientist") setScientistBoostStat("");
    setLoadoutTrinketPatchCredits(rollLoadoutTrinketPatchCredits(newCls));
  };

  const handleRollStat = (key: keyof MothershipStats) => {
    setBaseStats((prev) => ({
      ...(prev ?? {
        strength: 0,
        speed: 0,
        intellect: 0,
        combat: 0,
        sanity: 0,
        fear: 0,
        body: 0,
      }),
      [key]: key === "sanity" || key === "fear" || key === "body" ? rollSave() : rollStat(),
    }));
  };

  const handleRollAllStats = () => {
    setBaseStats({
      strength: rollStat(),
      speed: rollStat(),
      intellect: rollStat(),
      combat: rollStat(),
      sanity: rollSave(),
      fear: rollSave(),
      body: rollSave(),
    });
  };

  const handleRollHealth = () => setHealth(rollHealth());

  const handleRollLoadoutEtc = () =>
    setLoadoutTrinketPatchCredits(rollLoadoutTrinketPatchCredits(cls));

  const hasMothership = baseStats !== null && health !== null && loadoutTrinketPatchCredits !== null;

  /** Class-modified stats for display (available as soon as baseStats exists) */
  const finalStats: MothershipStats | null =
    baseStats != null
      ? computeStatsWithClass(baseStats, cls, {
          androidReduceStat:
            cls === "android" && androidReduceStat ? androidReduceStat : undefined,
          scientistBoostStat:
            cls === "scientist" && scientistBoostStat ? scientistBoostStat : undefined,
        })
      : null;

  const mothership: MothershipCharacterData | null = hasMothership
    ? buildMothershipCharacter({
        class: cls,
        sex,
        baseStats,
        health,
        skillIds,
        androidReduceStat:
          cls === "android" ? (androidReduceStat || "strength") : undefined,
        scientistBoostStat:
          cls === "scientist" ? (scientistBoostStat || "strength") : undefined,
        ...loadoutTrinketPatchCredits,
      })
    : null;

  const handleSubmit = () => {
    const trimmedPlayerName = playerName.trim();
    const trimmedName = name.trim();
    if (!trimmedName || !mothership) return;

    const char: Character = {
      id: `char_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      playerName: trimmedPlayerName || undefined,
      name: trimmedName,
      traits: traits
        .split(/[,;]/)
        .map((t) => t.trim())
        .filter(Boolean),
      personalitySummary: personalitySummary.trim() || "No description provided.",
      mothership: { ...mothership, skillIds },
      inventoryItemIds: mothership.startingGearItemIds ? [...mothership.startingGearItemIds] : [],
    };

    onSubmit(char);
    setPlayerName("");
    setName("");
    setTraits("");
    setPersonalitySummary("");
    setCls("marine");
    setSex("male");
    setBaseStats(null);
    setAndroidReduceStat("");
    setScientistBoostStat("");
    setHealth(null);
    setSkillIds([...CLASS_INFO.marine.defaultSkillIds]);
    setLoadoutTrinketPatchCredits(null);
  };

  const classInfo = CLASS_INFO[cls];

  return (
    <div className="min-w-0 space-y-6 text-neutral-100">
      <h4 className="font-heading text-xl font-semibold tracking-wide text-white">Add character</h4>

      {/* Class panel (left) and Character panel (right) */}
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-[1fr_1fr]">
        {/* Class panel */}
        <div className="min-w-0 rounded-lg border-2 border-neutral-600 bg-neutral-800/60 p-3 sm:p-4">
          <h5 className="font-heading mb-4 border-b border-neutral-600 pb-3 text-lg font-semibold uppercase tracking-widest text-amber-200/90">
            Class
          </h5>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
            <div className="shrink-0 self-center sm:self-start">
              <div className="aspect-square w-28 overflow-hidden rounded border-2 border-neutral-500 bg-neutral-700 sm:w-36 md:w-40 lg:w-44">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getClassReferenceImagePath(cls, sex)}
                  alt={`${CLASS_NAMES[cls]} (${SEX_LABELS[sex]})`}
                  className="h-full w-full object-cover object-top"
                />
              </div>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-5">
              <div>
                <label className="font-heading mb-2 block text-base font-semibold uppercase tracking-wider text-neutral-200">
                  Class
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["marine", "android", "scientist", "teamster"] as MothershipClass[]).map((c) => (
                    <label
                      key={c}
                      className="flex cursor-pointer items-center gap-2 rounded border border-neutral-500 px-4 py-2.5 text-sm transition-colors has-[:checked]:border-amber-500/80 has-[:checked]:bg-amber-950/40 has-[:checked]:text-amber-200"
                    >
                      <input
                        type="radio"
                        name="class"
                        value={c}
                        checked={cls === c}
                        onChange={() => handleClassChange(c)}
                        className="sr-only"
                      />
                      {CLASS_NAMES[c]}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-heading mb-2 block text-base font-semibold uppercase tracking-wider text-neutral-200">
                  Sex
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["male", "female", "other"] as CharacterSex[]).map((s) => (
                    <label
                      key={s}
                      className="flex cursor-pointer items-center gap-2 rounded border border-neutral-500 px-4 py-2.5 text-sm transition-colors has-[:checked]:border-amber-500/80 has-[:checked]:bg-amber-950/40 has-[:checked]:text-amber-200"
                    >
                      <input
                        type="radio"
                        name="sex"
                        value={s}
                        checked={sex === s}
                        onChange={() => setSex(s)}
                        className="sr-only"
                      />
                      {SEX_LABELS[s]}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-neutral-400">{classInfo.description}</p>
          <div className="mt-4 rounded border border-amber-900/60 bg-amber-950/30 p-3 text-sm">
          <p>
            <span className="font-medium text-amber-400/90">Trauma:</span>{" "}
            <span className="text-neutral-300">{classInfo.traumaResponse}</span>
          </p>
          <p className="mt-2 font-medium text-amber-400/90">Class stat bonuses:</p>
          <ul className="mt-1 list-inside list-disc text-neutral-300">
            {classInfo.statModifiers.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>

        {cls === "android" && (
          <div className="mt-2">
            <label className="mb-1 block text-sm text-neutral-300">
              Choose stat for -10 (STR, SPD, or CBT)
            </label>
            <select
              value={androidReduceStat}
              onChange={(e) =>
                setAndroidReduceStat((e.target.value || "") as keyof MothershipStats | "")
              }
              className="rounded border border-neutral-500 bg-neutral-700 px-2 py-1 text-sm text-neutral-100"
            >
              <option value="">— Select —</option>
              {(["strength", "speed", "combat"] as const).map((k) => (
                <option key={k} value={k}>
                  {STAT_LABELS[k]}
                </option>
              ))}
            </select>
          </div>
        )}

        {cls === "scientist" && (
          <div className="mt-2">
            <label className="mb-1 block text-sm text-neutral-300">Choose stat for +5</label>
            <select
              value={scientistBoostStat}
              onChange={(e) =>
                setScientistBoostStat((e.target.value || "") as keyof MothershipStats | "")
              }
              className="rounded border border-neutral-500 bg-neutral-700 px-2 py-1 text-sm text-neutral-100"
            >
              <option value="">— Select —</option>
              {STAT_KEYS.map((k) => (
                <option key={k} value={k}>
                  {STAT_LABELS[k]}
                </option>
              ))}
            </select>
          </div>
        )}
        </div>

        {/* Character panel */}
        <div className="min-w-0 rounded-lg border-2 border-neutral-600 bg-neutral-800/60 p-3 sm:p-4">
          <h5 className="font-heading mb-4 border-b border-neutral-600 pb-3 text-lg font-semibold uppercase tracking-widest text-amber-200/90">
            Character
          </h5>
          <div className="flex flex-col gap-6">
            {/* Character Name - first half */}
            <div>
              <h6 className="font-heading mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-200">
                Character Name
              </h6>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm text-neutral-400">
                    Player name (person at the table)
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="e.g. Chris"
                    className="w-full rounded border border-neutral-500 bg-neutral-700 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-neutral-400">Character name</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Corporal Vasquez"
                      className="flex-1 rounded border border-neutral-500 bg-neutral-700 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-500/50 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleRandomName}
                      className="shrink-0 rounded border border-neutral-500 px-2 py-1.5 text-xs text-neutral-300 hover:bg-neutral-600 hover:text-white"
                    >
                      Random
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Traits & Personality */}
            <div>
              <h6 className="font-heading mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-200">
                Traits & Personality
              </h6>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm text-neutral-400">
                    Traits (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={traits}
                    onChange={(e) => setTraits(e.target.value)}
                    placeholder="e.g. paranoid, tactical, loyal"
                    className="w-full rounded border border-neutral-500 bg-neutral-700 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="block text-sm text-neutral-400">
                      Personality & background (how NPCs should treat this character)
                    </label>
                    <button
                      type="button"
                      onClick={onRandomTraitsAndPersonality}
                      className="rounded border border-neutral-500 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-600 hover:text-white"
                    >
                      Random traits & personality
                    </button>
                  </div>
                  <textarea
                    value={personalitySummary}
                    onChange={(e) => setPersonalitySummary(e.target.value)}
                    placeholder="Brief description: demeanor, quirks, what NPCs might react to..."
                    rows={2}
                    className="w-full rounded border border-neutral-500 bg-neutral-700 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-500/50 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Character Stats - second half */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h6 className="font-heading text-sm font-semibold uppercase tracking-wider text-neutral-200">
                  Character Stats
                </h6>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={handleRandomize}
                    className="rounded border border-neutral-500 px-2 py-1 text-xs font-medium text-neutral-300 hover:bg-neutral-600 hover:text-white"
                  >
                    Random full
                  </button>
                  <button
                    type="button"
                    onClick={handleRollAllStats}
                    className="rounded border border-neutral-500 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-600 hover:text-white"
                  >
                    Roll all stats
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded border border-neutral-600 bg-neutral-700/50 p-2 sm:p-3">
                  <h6 className="font-heading mb-1.5 text-xs font-semibold uppercase text-neutral-300">Stats</h6>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {(["strength", "speed", "intellect", "combat"] as const).map((key) => (
                      <StatBadgeWithRoll
                        key={key}
                        label={STAT_LABELS[key]}
                        value={baseStats?.[key] ?? "—"}
                        modifierValue={
                          finalStats && baseStats && finalStats[key] !== baseStats[key]
                            ? finalStats[key]
                            : undefined
                        }
                        onRoll={() => handleRollStat(key)}
                        dark
                        large={false}
                      />
              ))}
            </div>
          </div>
                <div className="rounded border border-neutral-600 bg-neutral-700/50 p-2 sm:p-3">
                  <h6 className="font-heading mb-1.5 text-xs font-semibold uppercase text-neutral-300">Saves</h6>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {(["sanity", "fear", "body"] as const).map((key) => (
                      <StatBadgeWithRoll
                        key={key}
                        label={STAT_LABELS[key]}
                        value={baseStats?.[key] ?? "—"}
                        modifierValue={
                          finalStats && baseStats && finalStats[key] !== baseStats[key]
                            ? finalStats[key]
                            : undefined
                        }
                        onRoll={() => handleRollStat(key)}
                        dark
                        large={false}
                      />
                    ))}
                  </div>
                </div>
                <div className="rounded border border-neutral-600 bg-neutral-700/50 p-2 sm:p-3">
                  <h6 className="font-heading mb-1.5 text-xs font-semibold uppercase text-neutral-300">Health</h6>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    <HealthBadgeWithRoll value={health} onRoll={handleRollHealth} dark large={false} />
                    <ValueOverMaxBadge
                      current={0}
                      max={cls === "marine" || cls === "android" ? 3 : 2}
                      label="Wounds"
                      dark
                      large={false}
                    />
                  </div>
                </div>
                <div className="rounded border border-neutral-600 bg-neutral-700/50 p-2 sm:p-3">
                  <h6 className="font-heading mb-1.5 text-xs font-semibold uppercase text-neutral-300">Gain</h6>
                  <div className="flex flex-col">
                    <ValueOverMaxBadge current={2} max={2} label="Stress" secondLabel="Min" dark large={false} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory */}
      <div className="rounded-lg border-2 border-neutral-600 bg-neutral-800/60 p-3 sm:p-4">
        <div className="mb-4 flex items-center justify-between border-b border-neutral-600 pb-3">
          <h5 className="font-heading text-lg font-semibold uppercase tracking-widest text-amber-200/90">
            Inventory
          </h5>
          <button
            type="button"
            onClick={handleRollLoadoutEtc}
            className="rounded border border-neutral-500 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-600 hover:text-white"
          >
            Roll
          </button>
        </div>
        {loadoutTrinketPatchCredits && (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded border border-neutral-600 bg-neutral-700/50 p-2 sm:p-3">
              <h6 className="font-heading mb-1.5 text-xs font-semibold uppercase text-neutral-300">Loadout</h6>
              <p className="text-sm text-neutral-200">
                {getLoadoutDisplayText(loadoutTrinketPatchCredits.loadoutId)}
              </p>
            </div>
            <div className="rounded border border-neutral-600 bg-neutral-700/50 p-2 sm:p-3">
              <h6 className="font-heading mb-1.5 text-xs font-semibold uppercase text-neutral-300">Trinket</h6>
              <p className="text-sm text-neutral-200">
                {loadoutTrinketPatchCredits.trinket}
              </p>
            </div>
            <div className="rounded border border-neutral-600 bg-neutral-700/50 p-2 sm:p-3">
              <h6 className="font-heading mb-1.5 text-xs font-semibold uppercase text-neutral-300">Patch</h6>
              <p className="text-sm text-neutral-200">
                {loadoutTrinketPatchCredits.patch}
              </p>
            </div>
            <div className="rounded border border-neutral-600 bg-neutral-700/50 p-2 sm:p-3">
              <h6 className="font-heading mb-1.5 text-xs font-semibold uppercase text-neutral-300">Credits</h6>
              <div className="flex flex-wrap gap-2 pt-1">
                <StatBadge
                  label="CR"
                  value={loadoutTrinketPatchCredits.credits}
                  large={false}
                  dark
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Skills */}
      <div className="rounded-lg border-2 border-neutral-600 bg-neutral-800/60 p-3 sm:p-4">
        <h5 className="font-heading mb-4 border-b border-neutral-600 pb-3 text-lg font-semibold uppercase tracking-widest text-amber-200/90">
          Skills
        </h5>
        <SkillsMatrix
          characterClass={cls}
          selectedSkillIds={skillIds}
          onSelectedSkillsChange={setSkillIds}
          dark
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={
            !name.trim() ||
            !mothership ||
            (cls === "android" && !androidReduceStat) ||
            (cls === "scientist" && !scientistBoostStat)
          }
          className="rounded border border-amber-500/60 bg-amber-950/40 px-4 py-2 text-sm font-medium text-amber-200 hover:bg-amber-900/50 disabled:border-neutral-600 disabled:bg-transparent disabled:text-neutral-500"
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
