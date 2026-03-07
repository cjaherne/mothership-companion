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

/** Mission objectives and briefing */
export interface Mission {
  id: string;
  name: string;
  objectives: string[];
  briefing: string;
}

/** A scenario within a campaign (e.g. Distress Signals) */
export interface Scenario {
  id: string;
  name: string;
  description: string;
  missionId: string | null;
  locationIds: string[];
}

/** Warden Narrator - provides opening backstory/narrative (campaign-specific) */
export interface WardenNarratorConfig {
  /** Opening narrative to deliver at session start */
  narrative: string;
}

/** The Company - provides hints when players ask (campaign-specific) */
export interface TheCompanyConfig {
  /** Hints to offer when players request help (escalating) */
  hints: string[];
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
  /** Scenario IDs in this campaign */
  scenarioIds?: string[];
  /** Mission IDs in this campaign */
  missionIds?: string[];
  /** LiveKit room name (unique per campaign session) */
  roomName: string;
  /** Warden Narrator - opening backstory and narrative (above all campaigns) */
  wardenNarrator?: WardenNarratorConfig;
  /** The Company - hint provider when players ask (above all campaigns) */
  theCompany?: TheCompanyConfig;
}

/** Per-session player state within a campaign */
export interface PlayerSession {
  campaignId: CampaignId;
  playerKnowledge: string[];
  currentLocationId: string;
  turn: number;
}
