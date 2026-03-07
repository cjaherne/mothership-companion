/**
 * Another Bug Hunt - NPC registry (campaign-level)
 *
 * Aggregates NPCs from all scenarios. Developer: add new scenario NPCs here.
 */

import { distressSignalsNpcs } from "./scenarios/1-distress-signals/npcs";
import type { NPCPersonalityProfile } from "@/types/npc";

const allNpcs: Record<string, NPCPersonalityProfile> = {
  ...distressSignalsNpcs,
};

export function getNpcProfile(npcId: string): NPCPersonalityProfile | undefined {
  return allNpcs[npcId];
}
