"use client";

import { useState, useCallback, useRef } from "react";
import type { Character } from "@/types/run";
import {
  type CheckType,
  type Modifier,
  CHECK_LABELS,
  rollCheck,
  type RollResult,
} from "@/lib/dice";
import { addStressToCharacter, type MothershipStatKey } from "@/lib/runs";

const CHECK_TYPES: CheckType[] = [
  "strength",
  "speed",
  "intellect",
  "combat",
  "sanity",
  "fear",
  "body",
];

const MODIFIERS: { value: Modifier; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "advantage", label: "Advantage [+]" },
  { value: "disadvantage", label: "Disadvantage [-]" },
];

const SKILL_BONUSES = [0, 10, 15, 20] as const;

const CHECK_TO_STAT: Record<CheckType, MothershipStatKey> = {
  strength: "strength",
  speed: "speed",
  intellect: "intellect",
  combat: "combat",
  sanity: "sanity",
  fear: "fear",
  body: "body",
};

function getTargetForCheck(char: Character, checkType: CheckType): number {
  const m = char.mothership;
  if (!m) return 0;
  return (m.stats[CHECK_TO_STAT[checkType]] ?? 0) as number;
}

function isSaveCheck(checkType: CheckType): boolean {
  return ["sanity", "fear", "body"].includes(checkType);
}

interface DiceRollerModalProps {
  characters: Character[];
  runId: string;
  /** Pre-selected character (e.g. from row click) */
  initialCharacterId?: string;
  onClose: () => void;
  onCharacterUpdate?: () => void;
}

const DICE_SOUND_PATH = "/sounds/dice-roll.mp3";
const ROLL_ANIMATION_MS = 1200;

export function DiceRollerModal({
  characters,
  runId,
  initialCharacterId,
  onClose,
  onCharacterUpdate,
}: DiceRollerModalProps) {
  const validChars = characters.filter((c) => c.mothership);
  const [characterId, setCharacterId] = useState<string>(
    initialCharacterId && validChars.some((c) => c.id === initialCharacterId)
      ? initialCharacterId
      : validChars[0]?.id ?? ""
  );
  const [checkType, setCheckType] = useState<CheckType>("body");
  const [modifier, setModifier] = useState<Modifier>("normal");
  const [skillBonus, setSkillBonus] = useState<number>(0);
  const [isRolling, setIsRolling] = useState(false);
  const [displayRoll, setDisplayRoll] = useState<number | null>(null);
  const [result, setResult] = useState<RollResult | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const char = validChars.find((c) => c.id === characterId);
  const target = char ? getTargetForCheck(char, checkType) : 0;
  const effectiveTarget = Math.min(99, target + skillBonus);

  const playDiceSound = useCallback(() => {
    try {
      const audio = new Audio(DICE_SOUND_PATH);
      audio.volume = 0.6;
      audio.play().catch(() => {});
      audioRef.current = audio;
    } catch {
      // Ignore if audio fails
    }
  }, []);

  const handleRoll = useCallback(() => {
    if (!char) return;
    setIsRolling(true);
    setResult(null);
    setDisplayRoll(null);
    playDiceSound();

    // Animate: cycle random numbers
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      if (elapsed >= ROLL_ANIMATION_MS) {
        clearInterval(interval);
        const rollResult = rollCheck({
          target,
          modifier,
          skillBonus,
          isSave: isSaveCheck(checkType),
        });
        setDisplayRoll(rollResult.finalRoll);
        setResult(rollResult);
        setIsRolling(false);

        // Per Mothership rules 20.1: gain 1 Stress on any failed Stat Check or Save
        if (rollResult.outcome === "failure" || rollResult.outcome === "critical_failure") {
          addStressToCharacter(runId, char.id, 1, CHECK_TO_STAT[checkType]);
          onCharacterUpdate?.();
        }
      } else {
        setDisplayRoll(Math.floor(Math.random() * 100));
      }
    }, 60);
  }, [char, target, modifier, skillBonus, checkType, runId, playDiceSound, onCharacterUpdate]);

  const resetAndClose = () => {
    setResult(null);
    setDisplayRoll(null);
    onClose();
  };

  const outcomeLabel = result
    ? result.outcome === "critical_success"
      ? "Critical Success!"
      : result.outcome === "critical_failure"
        ? "Critical Failure!"
        : result.outcome === "success"
          ? "Success"
          : "Failure"
    : null;

  const outcomeClass = result
    ? result.outcome === "critical_success"
      ? "text-emerald-400 font-bold"
      : result.outcome === "critical_failure"
        ? "text-red-500 font-bold"
        : result.outcome === "success"
          ? "text-emerald-300"
          : "text-red-400"
    : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={resetAndClose}
      aria-modal
      role="dialog"
      aria-label="Dice roller"
    >
      <div
        className="w-full max-w-md rounded-lg border-2 border-neutral-600 bg-neutral-800 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-heading mb-4 text-sm font-medium uppercase tracking-wider text-amber-200/90">
          Call for Check
        </h3>

        {validChars.length === 0 ? (
          <p className="text-sm text-neutral-400">No characters with Mothership stats.</p>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase text-neutral-400">
                Character
              </label>
              <select
                value={characterId}
                onChange={(e) => setCharacterId(e.target.value)}
                disabled={isRolling}
                className="w-full rounded border border-neutral-600 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none disabled:opacity-60"
              >
                {validChars.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase text-neutral-400">
                Check Type
              </label>
              <select
                value={checkType}
                onChange={(e) => setCheckType(e.target.value as CheckType)}
                disabled={isRolling}
                className="w-full rounded border border-neutral-600 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none disabled:opacity-60"
              >
                {CHECK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {CHECK_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase text-neutral-400">
                Modifier
              </label>
              <div className="flex gap-2">
                {MODIFIERS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setModifier(m.value)}
                    disabled={isRolling}
                    className={`flex-1 rounded px-2 py-1.5 text-xs font-medium transition disabled:opacity-60 ${
                      modifier === m.value
                        ? "border border-amber-500 bg-amber-900/30 text-amber-200"
                        : "border border-neutral-600 text-neutral-300 hover:bg-neutral-700/50"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase text-neutral-400">
                Skill bonus (if applicable)
              </label>
              <select
                value={skillBonus}
                onChange={(e) => setSkillBonus(Number(e.target.value))}
                disabled={isRolling}
                className="w-full rounded border border-neutral-600 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none disabled:opacity-60"
              >
                {SKILL_BONUSES.map((b) => (
                  <option key={b} value={b}>
                    {b === 0 ? "None" : `+${b}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded border border-neutral-600 bg-neutral-900/50 p-4">
              <p className="text-xs text-neutral-400">
                Target: roll under {effectiveTarget}
                {skillBonus > 0 && (
                  <span className="ml-1">
                    (base {target} + {skillBonus} skill)
                  </span>
                )}
              </p>
            </div>

            {/* Dice display */}
            <div className="flex flex-col items-center gap-3 py-4">
              <div
                className={`flex h-20 w-24 items-center justify-center rounded-lg border-2 border-neutral-600 bg-neutral-900 font-mono text-3xl font-bold text-white transition ${
                  isRolling ? "animate-pulse border-amber-500/50" : ""
                }`}
              >
                {displayRoll !== null ? (
                  <span>{String(displayRoll).padStart(2, "0")}</span>
                ) : (
                  <span className="text-neutral-500">--</span>
                )}
              </div>
              {result && (
                <p className={`text-lg ${outcomeClass}`}>{outcomeLabel}</p>
              )}
              {(result?.outcome === "failure" || result?.outcome === "critical_failure") && (
                <p className="text-xs text-amber-400">+1 Stress applied</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleRoll}
                disabled={isRolling}
                className="flex-1 rounded border border-amber-600 bg-amber-900/40 px-4 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-900/60 disabled:opacity-60"
              >
                {isRolling ? "Rolling…" : "Roll"}
              </button>
              <button
                type="button"
                onClick={resetAndClose}
                className="rounded border border-neutral-500 px-4 py-2 text-sm text-neutral-400 transition hover:bg-neutral-700/50"
              >
                {result ? "Close" : "Cancel"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
