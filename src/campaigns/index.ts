/**
 * Campaign module - multi-campaign support.
 *
 * Usage:
 *   import { getCampaignOrDefault, DEFAULT_CAMPAIGN_ID } from "@/campaigns";
 */

export * from "./types";
export {
  WARDEN_NARRATOR_ID,
  THE_COMPANY_ID,
  wardenNarratorProfile,
  theCompanyProfile,
} from "./shared/meta-npcs";
export {
  getAvailableVoices,
  type AvailableVoices,
} from "./voices";
export {
  getCampaign,
  getCampaignOrDefault,
  getMission,
  getScenario,
  listCampaignIds,
  DEFAULT_CAMPAIGN_ID,
} from "./registry";
export { getCampaignContextForAgent } from "./context";
export type { CampaignContextOptions } from "./context";
