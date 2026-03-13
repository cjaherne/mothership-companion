"use client";

import { useMemo, useState } from "react";
import {
  getSkillsByTier,
  getSkill,
  canTakeSkill,
  getMasterSkillChain,
  getSkillDescription,
  type Skill,
  type SkillTier,
} from "@/lib/mothership-skills";
import type { MothershipClass } from "@/lib/mothership";
import { CLASS_INFO } from "@/lib/mothership";

const TIER_LABELS: Record<SkillTier, string> = {
  trained: "Trained (+10)",
  expert: "Expert (+15)",
  master: "Master (+20)",
};

interface SkillsMatrixProps {
  characterClass: MothershipClass;
  selectedSkillIds: string[];
  onSelectedSkillsChange: (ids: string[]) => void;
  disabled?: boolean;
  /** Dark theme styling (for use on dark backgrounds) */
  dark?: boolean;
}

/** Returns default skill IDs for the class (Scientist has none until Master is picked) */
function getDefaultSkillIds(cls: MothershipClass): string[] {
  return [...CLASS_INFO[cls].defaultSkillIds];
}

/** Returns skill IDs that are bonus picks (not defaults) */
function getBonusSkillIds(cls: MothershipClass, selected: string[]): string[] {
  const defaults = new Set(getDefaultSkillIds(cls));
  return selected.filter((id) => !defaults.has(id));
}

/** For Scientist: the Master skill ID they picked (if any) */
function getScientistMasterPick(selected: string[]): string | null {
  const masterSkills = getSkillsByTier("master");
  return masterSkills.find((s) => selected.includes(s.id))?.id ?? null;
}

/** For Scientist: the full chain (Master + Expert + Trained prereqs) for their Master pick */
function getScientistChain(selected: string[]): string[] {
  const masterId = getScientistMasterPick(selected);
  if (!masterId) return [];
  return getMasterSkillChain(masterId);
}

/** Check if bonus selection is valid per class rules */
function isBonusSelectionValid(cls: MothershipClass, bonusIds: string[]): boolean {
  const trained = bonusIds.filter((id) => getSkill(id)?.tier === "trained").length;
  const expert = bonusIds.filter((id) => getSkill(id)?.tier === "expert").length;
  const master = bonusIds.filter((id) => getSkill(id)?.tier === "master").length;

  switch (cls) {
    case "marine":
    case "android":
      return (expert === 1 && trained === 0) || (expert === 0 && trained === 2);
    case "scientist": {
      if (master !== 1) return false;
      return trained === 1;
    }
    case "teamster":
      return trained === 1 && expert === 1;
    default:
      return false;
  }
}

/** Can the user add this skill as a bonus pick? */
function canAddBonusSkill(
  cls: MothershipClass,
  skillId: string,
  currentSelected: string[]
): boolean {
  const skill = getSkill(skillId);
  if (!skill) return false;

  const defaults = new Set(getDefaultSkillIds(cls));
  const bonusIds = currentSelected.filter((id) => !defaults.has(id));

  if (cls === "scientist") {
    // Scientist: 1 Master (+ full prereq chain) + 1 bonus Trained. Master must be picked first.
    // During creation we add the full chain when Master is picked - no prereq check needed.
    const chain = getScientistChain(currentSelected);
    const hasMaster = chain.some((id) => getSkill(id)?.tier === "master");
    const hasBonusTrained = bonusIds.some((id) => getSkill(id)?.tier === "trained" && !chain.includes(id));

    if (skill.tier === "master") {
      if (hasMaster) return false;
      // No prereq check: picking Master adds its full chain (Expert + Trained prereqs)
      return true;
    }
    if (skill.tier === "trained") {
      if (!hasMaster) return false; // Must pick Master first
      if (hasBonusTrained) return false; // Only one bonus Trained
      return !chain.includes(skillId); // Bonus Trained must be outside the Master's chain
    }
    if (skill.tier === "expert") {
      // Expert is part of the Master's chain - added automatically when Master is picked
      return false;
    }
    return false;
  }

  if (cls === "marine" || cls === "android") {
    // Bonus: 1 Expert (with prereq) OR 2 Trained (no prereq). Mutually exclusive during creation.
    const bonusTrained = bonusIds.filter((id) => getSkill(id)?.tier === "trained").length;
    const hasBonusExpert = bonusIds.some((id) => getSkill(id)?.tier === "expert");

    if (skill.tier === "expert") {
      if (hasBonusExpert) return false;
      if (bonusTrained > 0) return false; // Can't mix: once Trained chosen, no Expert
      return canTakeSkill(skillId, currentSelected);
    }
    if (skill.tier === "trained") {
      if (hasBonusExpert) return false; // Can't mix: once Expert chosen, no Trained
      if (bonusTrained >= 2) return false;
      return true; // Trained have no prerequisites
    }
    return false;
  }

  if (cls === "teamster") {
    // 1 Trained AND 1 Expert. Trained has no prereq; Expert requires prereq.
    const bonusTrained = bonusIds.filter((id) => getSkill(id)?.tier === "trained").length;
    const bonusExpert = bonusIds.filter((id) => getSkill(id)?.tier === "expert").length;
    if (skill.tier === "trained") {
      if (bonusTrained >= 1) return false;
      return true; // Trained have no prerequisites
    }
    if (skill.tier === "expert") {
      if (bonusExpert >= 1) return false;
      return canTakeSkill(skillId, currentSelected);
    }
    return false;
  }

  return false;
}

/** Can the user remove this skill? (only bonus picks are removable; Scientist can remove Master or bonus Trained) */
function canRemoveSkill(cls: MothershipClass, skillId: string, currentSelected: string[]): boolean {
  const defaults = new Set(getDefaultSkillIds(cls));
  if (defaults.has(skillId)) return false;

  if (cls === "scientist") {
    const chain = getScientistChain(currentSelected);
    const masterId = getScientistMasterPick(currentSelected);
    if (skillId === masterId) return true;
    if (chain.includes(skillId)) return false;
    return getSkill(skillId)?.tier === "trained";
  }

  return true;
}

export function SkillsMatrix({
  characterClass: cls,
  selectedSkillIds,
  onSelectedSkillsChange,
  disabled = false,
  dark = false,
}: SkillsMatrixProps) {
  const [focusedSkillId, setFocusedSkillId] = useState<string | null>(null);

  const trained = useMemo(() => getSkillsByTier("trained"), []);
  const expert = useMemo(() => getSkillsByTier("expert"), []);
  const master = useMemo(() => getSkillsByTier("master"), []);

  const selectedSet = useMemo(() => new Set(selectedSkillIds), [selectedSkillIds]);
  const defaultIds = useMemo(() => new Set(getDefaultSkillIds(cls)), [cls]);

  const handleRadioClick = (skill: Skill) => {
    if (disabled) return;
    const isSelected = selectedSet.has(skill.id);

    if (isSelected) {
      if (!canRemoveSkill(cls, skill.id, selectedSkillIds)) return;
      if (cls === "scientist" && skill.tier === "master") {
        const chain = getMasterSkillChain(skill.id);
        onSelectedSkillsChange(selectedSkillIds.filter((id) => !chain.includes(id)));
      } else {
        onSelectedSkillsChange(selectedSkillIds.filter((id) => id !== skill.id));
      }
    } else {
      if (!canAddBonusSkill(cls, skill.id, selectedSkillIds)) return;
      if (cls === "scientist" && skill.tier === "master") {
        const chain = getMasterSkillChain(skill.id);
        const toAdd = chain.filter((id) => !selectedSet.has(id));
        onSelectedSkillsChange([...selectedSkillIds, ...toAdd]);
      } else {
        onSelectedSkillsChange([...selectedSkillIds, skill.id]);
      }
    }
    setFocusedSkillId(skill.id);
  };

  const handleNameClick = (skill: Skill) => {
    setFocusedSkillId(skill.id);
  };

  const SkillCell = ({ skill }: { skill: Skill }) => {
    const isSelected = selectedSet.has(skill.id);
    const isDefault = defaultIds.has(skill.id);
    const canAdd = canAddBonusSkill(cls, skill.id, selectedSkillIds);
    const canRemove = canRemoveSkill(cls, skill.id, selectedSkillIds);
    const prereqMet = canTakeSkill(skill.id, selectedSkillIds);
    const radioClickable = disabled ? false : isSelected ? canRemove : canAdd;
    const isFocused = focusedSkillId === skill.id;
    const isAvailable = canAdd && !isSelected;
    const isUnavailable = !isSelected && (!prereqMet || !canAdd);

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
            isDefault
              ? "Default skill (cannot remove)"
              : canAdd
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

  const Column = ({ tier, skills }: { tier: SkillTier; skills: Skill[] }) => {
    const focusedInColumn = focusedSkillId && skills.some((s) => s.id === focusedSkillId);
    const focusedSkill = focusedInColumn && focusedSkillId ? getSkill(focusedSkillId) : null;
    const focusedDescription = focusedSkill ? getSkillDescription(focusedSkill.id) : "";

    return (
      <div
        className={`flex flex-col rounded-lg border-2 p-3 sm:p-4 ${
          dark ? "border-neutral-600 bg-neutral-800/40" : "border-neutral-400 bg-neutral-100/80"
        }`}
      >
        <h6
          className={`mb-3 text-sm sm:text-base font-bold uppercase tracking-wide ${
            dark ? "text-amber-200/90" : "text-amber-800"
          }`}
        >
          {TIER_LABELS[tier]}
        </h6>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            {skills.map((s) => (
              <SkillCell key={s.id} skill={s} />
            ))}
          </div>
          <div
            className={`w-full shrink-0 rounded border p-3 sm:w-48 ${
              dark ? "border-neutral-600 bg-neutral-900/60" : "border-neutral-300 bg-neutral-50"
            }`}
          >
            <span
              className={`text-xs font-semibold uppercase ${
                dark ? "text-neutral-500" : "text-neutral-400"
              }`}
            >
              Description
            </span>
            {focusedSkill ? (
              <div className="mt-2">
                <p
                  className={`text-sm font-semibold ${
                    dark ? "text-amber-200/90" : "text-amber-800"
                  }`}
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
                className={`mt-2 text-sm italic ${
                  dark ? "text-neutral-500" : "text-neutral-400"
                }`}
              >
                Click name or circle
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`min-w-0 rounded-lg border-2 p-3 sm:p-4 ${
        dark
          ? "border-neutral-600 bg-neutral-800/30"
          : "border-neutral-300 bg-white"
      }`}
    >
      <p
        className={`mb-4 text-lg font-semibold leading-tight ${
          dark ? "text-amber-100" : "text-amber-900"
        }`}
      >
        {CLASS_INFO[cls].bonusRules}
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Column tier="trained" skills={trained} />
        <Column tier="expert" skills={expert} />
        <Column tier="master" skills={master} />
      </div>
    </div>
  );
}
