/**
 * Fact reveal logic - attribute-based gating
 *
 * Determines if an NPC would reveal a fact based on current attributes,
 * thresholds, and optional item prerequisites.
 */

import type { NPCPersonalityProfile, NPCManipulatableAttributes } from "@/types/npc";
import type { Character } from "@/types/run";
import type { Fact } from "@/types/fact";
import { hasRequiredItems } from "@/lib/inventory-utils";
import { getFact } from "./facts";

/**
 * Check if an NPC would reveal a fact given current attributes and party inventory.
 * Uses fact tier (minor/major), attribute thresholds, and optional requiredItemIds.
 */
export function canRevealFact(
  npc: NPCPersonalityProfile,
  factId: string,
  currentAttributes: NPCManipulatableAttributes,
  alreadyRevealedFactIds: string[],
  characters: Character[] = []
): boolean {
  if (alreadyRevealedFactIds.includes(factId)) return false;
  if (!npc.knownFactIds?.includes(factId)) return false;

  const fact = getFact(factId);
  if (!fact) return false;

  const perFact = npc.factRevealConditions?.[factId];
  if (perFact?.requiredItemIds?.length && !hasRequiredItems(characters, perFact.requiredItemIds)) {
    return false;
  }

  const thresholds = npc.attributeThresholds ?? {};
  const minAffability =
    perFact?.minAffability ?? (fact.tier === "major" ? thresholds.shareMajor : thresholds.shareMinor);

  if (minAffability != null && currentAttributes.affability < minAffability) {
    return false;
  }

  return true;
}
