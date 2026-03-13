/**
 * AI orchestration helpers for puzzle state and NPC logic.
 *
 * Used by API routes and voice/talk to:
 * - Build system prompts from game state + NPC profiles
 * - Validate puzzle progression
 * - Gate information reveals based on player knowledge
 */

import type { GameState, NPCInstance } from "@/types";

export function buildNPCPrompt(npc: NPCInstance, gameState: GameState): string {
  const traits = npc.traits.join(", ");
  const emotionalState = npc.currentEmotionalState;
  const knowledge = npc.knowledgeScope.join("; ");
  const motivation = npc.motivationHooks.join("; ");

  return `You are ${npc.name}, a ${npc.archetype}.
Traits: ${traits}
Current emotional state: ${emotionalState}
You know about: ${knowledge}
You are motivated by: ${motivation}
Trust level with player: ${(npc.trustLevel * 100).toFixed(0)}%
Speech: ${npc.speechProfile.register}, ${npc.speechProfile.verbosity}
${npc.speechProfile.verbalTics?.length ? `Verbal tics: ${npc.speechProfile.verbalTics.join(", ")}` : ""}

Player has learned: ${gameState.playerKnowledge.join(", ") || "nothing yet"}
Current scene: ${gameState.currentScene}`;
}

export function canRevealFact(
  npc: NPCInstance,
  factId: string,
  playerKnowledge: string[]
): boolean {
  if (!npc.knowledgeScope.includes(factId)) return false;
  if (npc.revealedFacts.includes(factId)) return false;
  if (npc.trustLevel < 0.3) return false;
  return true;
}
