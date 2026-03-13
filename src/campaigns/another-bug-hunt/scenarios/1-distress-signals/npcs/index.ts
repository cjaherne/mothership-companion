/**
 * Distress Signals - NPC registry
 *
 * Export all NPCs for this scenario. Add new NPCs here when you create them.
 */

import { andersProfile } from "./anders";
import { demarProfile } from "./demar";
import { maasProfile } from "./maas";
import { renfieldProfile } from "./renfield";
import type { NPCPersonalityProfile } from "@/types/npc";

export const distressSignalsNpcs: Record<string, NPCPersonalityProfile> = {
  [maasProfile.id]: maasProfile,
  [andersProfile.id]: andersProfile,
  [renfieldProfile.id]: renfieldProfile,
  [demarProfile.id]: demarProfile,
};

export function getNpcProfile(npcId: string): NPCPersonalityProfile | undefined {
  return distressSignalsNpcs[npcId];
}
