/**
 * Campaign registry - resolve campaign config by ID.
 *
 * Add new campaigns by creating a folder under campaigns/ and
 * registering in CAMPAIGNS.
 */

import type { CampaignConfig, CampaignId, Mission, Scenario } from "./types";
import { anotherBugHuntCampaign } from "./another-bug-hunt";
import { wardenCampaign } from "./warden";

const CAMPAIGNS: Record<CampaignId, CampaignConfig> = {
  [wardenCampaign.id]: wardenCampaign,
  [anotherBugHuntCampaign.id]: anotherBugHuntCampaign,
};

/** Default campaign when none specified */
export const DEFAULT_CAMPAIGN_ID: CampaignId = "warden";

/**
 * Get campaign config by ID.
 * @throws if campaign not found
 */
export function getCampaign(id: CampaignId): CampaignConfig {
  const campaign = CAMPAIGNS[id];
  if (!campaign) {
    throw new Error(`Unknown campaign: ${id}`);
  }
  return campaign;
}

/**
 * Get campaign config by ID, or default if not found.
 */
export function getCampaignOrDefault(id: CampaignId | null | undefined): CampaignConfig {
  if (!id) return getCampaign(DEFAULT_CAMPAIGN_ID);
  try {
    return getCampaign(id);
  } catch {
    return getCampaign(DEFAULT_CAMPAIGN_ID);
  }
}

/** List all registered campaign IDs */
export function listCampaignIds(): CampaignId[] {
  return Object.keys(CAMPAIGNS);
}

/**
 * Get scenario by ID for a campaign.
 * Returns undefined if campaign has no scenarios or scenario not found.
 */
export function getScenario(
  campaignId: CampaignId,
  scenarioId: string
): Scenario | undefined {
  const campaign = CAMPAIGNS[campaignId];
  return campaign?.scenarios?.find((s) => s.id === scenarioId);
}

/**
 * Get mission by ID for a campaign.
 * Returns undefined if campaign has no missions or mission not found.
 */
export function getMission(
  campaignId: CampaignId,
  missionId: string
): Mission | undefined {
  const campaign = CAMPAIGNS[campaignId];
  return campaign?.missions?.find((m) => m.id === missionId);
}
