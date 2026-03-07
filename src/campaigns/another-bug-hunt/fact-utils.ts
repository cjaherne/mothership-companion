/**
 * Fact reveal logic - attribute-based gating
 *
 * Determines if an NPC would reveal a fact based on current attributes
 * and thresholds. Use when building agent prompts or validating dialogue.
 */

import type { NPCPersonalityProfile, NPCManipulatableAttributes } from "@/types/npc";
import type { Fact } from "@/types/fact";
import { getFact } from "./facts";

/**
 * Check if an NPC would reveal a fact given current attributes.
 * Uses fact tier (minor/major) and attribute thresholds.
 */
export function canRevealFact(
  npc: NPCPersonalityProfile,
  factId: string,
  currentAttributes: NPCManipulatableAttributes,
  alreadyRevealedFactIds: string[]
): boolean {
  if (alreadyRevealedFactIds.includes(factId)) return false;
  if (!npc.knownFactIds?.includes(factId)) return false;

  const fact = getFact(factId);
  if (!fact) return false;

  const thresholds = npc.attributeThresholds ?? {};
  const perFact = npc.factRevealConditions?.[factId];
  const minAffability = perFact?.minAffability ?? (fact.tier === "major" ? thresholds.shareMajor : thresholds.shareMinor);

  if (minAffability != null && currentAttributes.affability < minAffability) {
    return false;
  }

  return true;
}
