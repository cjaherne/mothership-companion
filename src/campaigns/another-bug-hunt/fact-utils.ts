/**
 * Fact reveal logic - attribute-based gating
 *
 * Determines if an NPC would reveal a fact based on current attributes,
 * thresholds, item prerequisites, prerequisite facts, and interaction type.
 */

import type { NPCPersonalityProfile, NPCManipulatableAttributes } from "@/types/npc";
import type { Character } from "@/types/run";
import type { Fact } from "@/types/fact";
import { hasRequiredItems } from "@/lib/inventory-utils";
import { getFact } from "./facts";

export type InteractionIntent = "threaten" | "bribe" | "charm" | null;

export interface CanRevealFactOptions {
  npc: NPCPersonalityProfile;
  factId: string;
  currentAttributes: NPCManipulatableAttributes;
  alreadyRevealedFactIds: string[];
  playerKnowledgeFactIds: string[];
  characters?: Character[];
  interactionIntent?: InteractionIntent;
}

/**
 * Check if an NPC would reveal a fact given current attributes, party inventory,
 * prerequisite facts, and interaction intent.
 */
export function canRevealFact(
  npc: NPCPersonalityProfile,
  factId: string,
  currentAttributes: NPCManipulatableAttributes,
  alreadyRevealedFactIds: string[],
  characters: Character[] = [],
  options?: { playerKnowledgeFactIds?: string[]; interactionIntent?: InteractionIntent }
): boolean {
  if (alreadyRevealedFactIds.includes(factId)) return false;
  if (!npc.knownFactIds?.includes(factId)) return false;

  const fact = getFact(factId);
  if (!fact) return false;

  const perFact = npc.factRevealConditions?.[factId];

  if (perFact?.requiredItemIds?.length && !hasRequiredItems(characters, perFact.requiredItemIds)) {
    return false;
  }

  const playerKnowledge = options?.playerKnowledgeFactIds ?? [];
  if (perFact?.requiredFactIds?.length) {
    const hasAllPrereqs = perFact.requiredFactIds.every((id) => playerKnowledge.includes(id));
    if (!hasAllPrereqs) return false;
  }

  const intent = options?.interactionIntent;
  if (perFact?.requiredInteractionType) {
    if (!intent || intent !== perFact.requiredInteractionType) return false;
  }

  const thresholds = npc.attributeThresholds ?? {};
  const minAffability =
    perFact?.minAffability ?? (fact.tier === "major" ? thresholds.shareMajor : thresholds.shareMinor);

  if (minAffability != null && currentAttributes.affability < minAffability) {
    return false;
  }

  return true;
}
