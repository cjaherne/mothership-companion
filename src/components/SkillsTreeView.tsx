"use client";

import { useMemo, useState } from "react";
import {
  getSkillsByTier,
  getSkill,
  canTakeSkill,
  getSkillDescription,
  type Skill,
  type SkillTier,
} from "@/lib/mothership-skills";

const TIER_LABELS: Record<SkillTier, string> = {
  trained: "Trained (+10)",
  expert: "Expert (+15)",
  master: "Master (+20)",
};

interface SkillsTreeViewProps {
  selectedSkillIds: string[];
  onSelectedSkillsChange: (ids: string[]) => void;
  disabled?: boolean;
  dark?: boolean;
}

/**
 * In-game skill tree: view and add/remove skills.
 * Prerequisites must be met to add a skill; any skill can be removed.
 */
export function SkillsTreeView({
  selectedSkillIds,
  onSelectedSkillsChange,
  disabled = false,
  dark = false,
}: SkillsTreeViewProps) {
  const [focusedSkillId, setFocusedSkillId] = useState<string | null>(null);

  const trained = useMemo(() => getSkillsByTier("trained"), []);
  const expert = useMemo(() => getSkillsByTier("expert"), []);
  const master = useMemo(() => getSkillsByTier("master"), []);

  const selectedSet = useMemo(() => new Set(selectedSkillIds), [selectedSkillIds]);

  const handleRadioClick = (skill: Skill) => {
    if (disabled) return;
    const isSelected = selectedSet.has(skill.id);

    if (isSelected) {
      onSelectedSkillsChange(selectedSkillIds.filter((id) => id !== skill.id));
    } else {
      if (!canTakeSkill(skill.id, selectedSkillIds)) return;
      onSelectedSkillsChange([...selectedSkillIds, skill.id]);
    }
    setFocusedSkillId(skill.id);
  };

  const handleNameClick = (skill: Skill) => {
    setFocusedSkillId(skill.id);
  };

  const SkillCell = ({ skill }: { skill: Skill }) => {
    const isSelected = selectedSet.has(skill.id);
    const prereqMet = canTakeSkill(skill.id, selectedSkillIds);
    const canAdd = !isSelected && prereqMet;
    const canRemove = isSelected;
    const radioClickable = disabled ? false : isSelected ? canRemove : canAdd;
    const isFocused = focusedSkillId === skill.id;
    const isAvailable = canAdd;
    const isUnavailable = !isSelected && !prereqMet;

    return (
      <div
        className={`flex items-center gap-2 rounded px-2 py-1.5 text-left transition-colors ${
          isFocused ? (dark ? "bg-neutral-600/60" : "bg-neutral-200") : ""
        } ${isAvailable ? (dark ? "bg-amber-950/30 border-l-2 border-amber-500/60" : "bg-amber-50 border-l-2 border-amber-600/60") : ""} ${
          isUnavailable ? "opacity-50" : ""
        }`}
      >
        <button
          type="button"
          onClick={() => handleRadioClick(skill)}
          disabled={!radioClickable}
          title={
            canAdd
              ? "Click to choose"
              : canRemove
              ? "Click to remove"
              : !prereqMet && !isSelected
              ? "Prerequisite not met"
              : "Click to choose"
          }
          className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            radioClickable ? "cursor-pointer" : "cursor-default opacity-70"
          } ${
            isSelected
              ? dark
                ? "border-amber-400 bg-amber-400"
                : "border-amber-600 bg-amber-600"
              : "border-neutral-500 bg-transparent"
          } ${!radioClickable && !isSelected ? "opacity-50" : ""}`}
          aria-label={isSelected ? `Deselect ${skill.name}` : `Select ${skill.name}`}
        />
        <button
          type="button"
          onClick={() => handleNameClick(skill)}
          className={`min-w-0 flex-1 truncate text-left text-sm transition-colors ${
            dark ? "text-neutral-200 hover:text-white" : "text-neutral-800 hover:text-black"
          } hover:underline cursor-pointer ${isUnavailable ? "opacity-70" : ""}`}
          title="View description"
        >
          {skill.name}
        </button>
      </div>
    );
  };

  const Column = ({ tier, skills }: { tier: SkillTier; skills: Skill[] }) => (
    <div
      className={`flex flex-col rounded-lg border-2 p-4 ${
        dark ? "border-neutral-600 bg-neutral-800/40" : "border-neutral-400 bg-neutral-100/80"
      }`}
    >
      <h6
        className={`mb-3 text-base font-bold uppercase tracking-wide ${
          dark ? "text-amber-200/90" : "text-amber-800"
        }`}
      >
        {TIER_LABELS[tier]}
      </h6>
      <div className="flex flex-col gap-0.5">
        {skills.map((s) => (
          <SkillCell key={s.id} skill={s} />
        ))}
      </div>
    </div>
  );

  const focusedSkill = focusedSkillId ? getSkill(focusedSkillId) : null;
  const focusedDescription = focusedSkillId ? getSkillDescription(focusedSkillId) : "";

  return (
    <div
      className={`rounded-lg border-2 p-4 ${
        dark ? "border-neutral-600 bg-neutral-800/30" : "border-neutral-300 bg-white"
      }`}
    >
      <div className={`mb-4 text-sm ${dark ? "text-neutral-400" : "text-neutral-600"}`}>
        Click to add or remove skills. Skills are locked until prerequisites are met.
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Column tier="trained" skills={trained} />
        <Column tier="expert" skills={expert} />
        <Column tier="master" skills={master} />
      </div>
      <div
        className={`mt-4 rounded-lg border-2 p-4 ${
          dark ? "border-neutral-600 bg-neutral-900/60" : "border-neutral-300 bg-neutral-50"
        }`}
      >
        <span
          className={`text-xs font-semibold uppercase ${
            dark ? "text-neutral-500" : "text-neutral-400"
          }`}
        >
          Skill description
        </span>
        {focusedSkill ? (
          <div className="mt-2">
            <p
              className={`text-sm font-semibold ${dark ? "text-amber-200/90" : "text-amber-800"}`}
            >
              {focusedSkill.name}
            </p>
            <p
              className={`mt-1.5 text-sm leading-relaxed ${
                dark ? "text-neutral-300" : "text-neutral-600"
              }`}
            >
              {focusedDescription || "No description available."}
            </p>
          </div>
        ) : (
          <p
            className={`mt-2 text-sm italic ${dark ? "text-neutral-500" : "text-neutral-400"}`}
          >
            Click a skill name to view its description, or the circle to add or remove it.
          </p>
        )}
      </div>
    </div>
  );
}
