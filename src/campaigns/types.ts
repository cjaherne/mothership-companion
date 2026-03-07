/**
 * Campaign structure for multi-campaign support.
 *
 * A campaign represents a Mothership scenario with its own world,
 * NPCs, puzzles, and player progression. The registry allows adding
 * new campaigns without changing core logic.
 */

export type CampaignId = string;

/** A location or scene within a world */
export interface Location {
  id: string;
  name: string;
  description: string;
}

/** World/setting for a campaign (ship, station, planet, etc.) */
export interface World {
  id: string;
  name: string;
  description: string;
  locations: Location[];
  defaultLocationId: string;
}

/** Campaign configuration - defines the scenario structure */
export interface CampaignConfig {
  id: CampaignId;
  name: string;
  description: string;
  world: World;
  /** NPC profile IDs available in this campaign */
  npcIds: string[];
  /** Puzzle IDs in this campaign */
  puzzleIds: string[];
  /** LiveKit room name (unique per campaign session) */
  roomName: string;
}

/** Per-session player state within a campaign */
export interface PlayerSession {
  campaignId: CampaignId;
  playerKnowledge: string[];
  currentLocationId: string;
  turn: number;
}
