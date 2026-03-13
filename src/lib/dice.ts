/**
 * Mothership RPG - Dice rolling (d100, Advantage/Disadvantage, Criticals)
 * Per Player's Survival Guide: Stat Checks, Saves, roll-under.
 */

export type CheckType =
  | "strength"
  | "speed"
  | "intellect"
  | "combat"
  | "sanity"
  | "fear"
  | "body";

export type Modifier = "advantage" | "disadvantage" | "normal";

export const CHECK_LABELS: Record<CheckType, string> = {
  strength: "Strength Check",
  speed: "Speed Check",
  intellect: "Intellect Check",
  combat: "Combat Check",
  sanity: "Sanity Save",
  fear: "Fear Save",
  body: "Body Save",
};

/** Roll d100 (0-99). In Mothership: 00 = best (always crit success), 99 = worst (always crit failure). */
export function rollD100(): number {
  return Math.floor(Math.random() * 100);
}

/** Check if roll is doubles (00, 11, 22, ..., 99) */
export function isDoubles(roll: number): boolean {
  const tens = Math.floor(roll / 10);
  const ones = roll % 10;
  return tens === ones;
}

/** Roll with Advantage (roll twice, take best) or Disadvantage (roll twice, take worst) */
export function rollWithModifier(mod: Modifier): number {
  if (mod === "normal") return rollD100();
  const a = rollD100();
  const b = rollD100();
  // Lower is better in roll-under; "best" = lower, "worst" = higher
  return mod === "advantage" ? Math.min(a, b) : Math.max(a, b);
}

export type RollOutcome = "critical_success" | "critical_failure" | "success" | "failure";

export interface RollResult {
  finalRoll: number;
  rawRolls: number[]; // For Advantage/Disadvantage: both rolls
  target: number;
  modifier: Modifier;
  skillBonus: number;
  outcome: RollOutcome;
  isSave: boolean; // Saves incur stress on failure
}

/** Determine outcome: 00 = always crit success, 99 = always crit failure, else roll-under with doubles */
export function resolveOutcome(
  roll: number,
  target: number,
  modifier: Modifier
): RollOutcome {
  if (roll === 0) return "critical_success"; // 00 always crit success
  if (roll === 99) return "critical_failure"; // 99 always crit failure
  const success = roll <= target;
  const doubles = isDoubles(roll);
  if (success && doubles) return "critical_success";
  if (!success && doubles) return "critical_failure";
  return success ? "success" : "failure";
}

/** Execute a full check roll */
export function rollCheck(params: {
  target: number;
  modifier: Modifier;
  skillBonus: number;
  isSave: boolean;
}): RollResult {
  const { target, modifier, skillBonus, isSave } = params;
  const effectiveTarget = Math.min(99, target + skillBonus);
  const rawRolls: number[] = [];
  let finalRoll: number;

  if (modifier === "advantage") {
    const a = rollD100();
    const b = rollD100();
    rawRolls.push(a, b);
    finalRoll = Math.min(a, b);
  } else if (modifier === "disadvantage") {
    const a = rollD100();
    const b = rollD100();
    rawRolls.push(a, b);
    finalRoll = Math.max(a, b);
  } else {
    finalRoll = rollD100();
    rawRolls.push(finalRoll);
  }

  const outcome = resolveOutcome(finalRoll, effectiveTarget, modifier);

  return {
    finalRoll,
    rawRolls,
    target: effectiveTarget,
    modifier,
    skillBonus,
    outcome,
    isSave,
  };
}
