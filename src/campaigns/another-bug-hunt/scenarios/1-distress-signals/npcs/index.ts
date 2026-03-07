/**
 * Distress Signals - NPC registry
 *
 * Export all NPCs for this scenario. Add new NPCs here when you create them.
 */

import { exampleSurvivorProfile } from "./example-survivor";
import type { NPCPersonalityProfile } from "@/types/npc";

export const distressSignalsNpcs: Record<string, NPCPersonalityProfile> = {
  [exampleSurvivorProfile.id]: exampleSurvivorProfile,
};

export function getNpcProfile(npcId: string): NPCPersonalityProfile | undefined {
  return distressSignalsNpcs[npcId];
}
