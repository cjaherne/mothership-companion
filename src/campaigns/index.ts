/**
 * Campaign module - multi-campaign support.
 *
 * Usage:
 *   import { getCampaignOrDefault, DEFAULT_CAMPAIGN_ID } from "@/campaigns";
 */

export * from "./types";
export {
  getCampaign,
  getCampaignOrDefault,
  listCampaignIds,
  DEFAULT_CAMPAIGN_ID,
} from "./registry";
