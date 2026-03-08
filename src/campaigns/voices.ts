/**
 * Voice availability - which voices can the player interact with?
 *
 * 1. Warden Narrator - always available, provides narration
 * 2. Scenario NPCs - unlocked when conditions met (e.g. reach location)
 * 3. The Company - always available for hints when asked
 */

import type { CampaignConfig, NpcUnlockCondition } from "./types";
import type { RunState } from "@/types/run";
import { WARDEN_NARRATOR_ID, THE_COMPANY_ID } from "./shared/meta-npcs";

export interface AvailableVoices {
  warden: boolean;
  npcs: string[];
  company: boolean;
  lockedNpcs: { npcId: string; condition: NpcUnlockCondition }[];
}

/**
 * Get which voices are available for the player to interact with.
 */
export function getAvailableVoices(
  campaign: CampaignConfig,
  runState: RunState | null | undefined
): AvailableVoices {
  const exploredIds = new Set(runState?.exploredLocationIds ?? []);
  const exploredPoiIds = new Set(runState?.exploredPoiIds ?? []);
  const npcIds = campaign.npcIds ?? [];
  const conditions = campaign.npcUnlockConditions ?? {};

  const unlockedNpcs: string[] = [];
  const lockedNpcs: { npcId: string; condition: NpcUnlockCondition }[] = [];

  for (const npcId of npcIds) {
    const cond = conditions[npcId];
    if (!cond) {
      unlockedNpcs.push(npcId);
      continue;
    }
    if (cond.type === "location") {
      const satisfied = cond.locationIds.some((locId) => exploredIds.has(locId));
      if (satisfied) {
        unlockedNpcs.push(npcId);
      } else {
        lockedNpcs.push({ npcId, condition: cond });
      }
    } else if (cond.type === "poi") {
      // Must be in one of the required locations AND all required POIs must be inspected
      const inLocation = cond.locationIds.some((locId) => exploredIds.has(locId));
      const poisSatisfied =
        !cond.requiredPoiIds ||
        cond.requiredPoiIds.length === 0 ||
        cond.requiredPoiIds.every((poiId) => exploredPoiIds.has(poiId));
      if (inLocation && poisSatisfied) {
        unlockedNpcs.push(npcId);
      } else {
        lockedNpcs.push({ npcId, condition: cond });
      }
    } else {
      unlockedNpcs.push(npcId);
    }
  }

  return {
    warden: true,
    npcs: unlockedNpcs,
    company: true,
    lockedNpcs,
  };
}

/**
 * Get NPC IDs that are in the current location (unlocked and present at currentLocationId).
 */
export function getNpcsInLocation(
  campaign: CampaignConfig,
  runState: RunState | null | undefined,
  currentLocationId: string | undefined
): string[] {
  const voices = getAvailableVoices(campaign, runState);
  if (!currentLocationId) return voices.npcs;
  const conditions = campaign.npcUnlockConditions ?? {};
  return voices.npcs.filter((npcId) => {
    const cond = conditions[npcId];
    if (!cond) return true;
    if (cond.type === "location") {
      return cond.locationIds.includes(currentLocationId);
    }
    if (cond.type === "poi") {
      return cond.locationIds.includes(currentLocationId);
    }
    return true;
  });
}

/** Meta-NPC IDs (always available, not scenario NPCs) */
export const META_NPC_IDS = [WARDEN_NARRATOR_ID, THE_COMPANY_ID] as const;
