/**
 * Fact gating and intent detection for click-to-talk voice API.
 *
 * - detectInteractionIntent: parse STT text for threaten/bribe/charm
 * - getRevealableFactIds: filter NPC known facts by canRevealFact
 */

import type { NPCPersonalityProfile, NPCManipulatableAttributes } from "@/types/npc";
import type { Character } from "@/types/run";
import { canRevealFact, type InteractionIntent } from "@/campaigns/another-bug-hunt/fact-utils";

const THREATEN_PATTERN = /(threaten|intimidate|violence|gun|weapon|shoot|hurt|kill|fear|scare)/i;
const BRIBE_PATTERN = /(bribe|pay|credit|compensation|reward|money|cash|offer|deal)/i;
const CHARM_PATTERN = /(charm|flatter|persuade|smooth\s*talk|please|nice|friendly|compliment)/i;

/**
 * Detect interaction intent from transcribed player speech.
 */
export function detectInteractionIntent(transcript: string): InteractionIntent {
  const t = transcript.trim();
  if (!t) return null;
  if (THREATEN_PATTERN.test(t)) return "threaten";
  if (BRIBE_PATTERN.test(t)) return "bribe";
  if (CHARM_PATTERN.test(t)) return "charm";
  return null;
}

/**
 * Get fact IDs this NPC may reveal given current run state and interaction intent.
 */
export function getRevealableFactIds(
  npc: NPCPersonalityProfile,
  currentAttributes: NPCManipulatableAttributes,
  alreadyRevealedFactIds: string[],
  playerKnowledgeFactIds: string[],
  characters: Character[],
  interactionIntent: InteractionIntent
): string[] {
  const knownIds = npc.knownFactIds ?? [];
  const revealable: string[] = [];

  for (const factId of knownIds) {
    if (
      canRevealFact(
        npc,
        factId,
        currentAttributes,
        alreadyRevealedFactIds,
        characters,
        { playerKnowledgeFactIds, interactionIntent }
      )
    ) {
      revealable.push(factId);
    }
  }

  return revealable;
}
