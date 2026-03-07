/**
 * Campaign structure for multi-campaign support.
 *
 * A campaign represents a Mothership scenario with its own world,
 * NPCs, puzzles, and player progression. The registry allows adding
 * new campaigns without changing core logic.
 */

export type CampaignId = string;

/** Point of interest within a location (for detailed map) */
export interface PointOfInterest {
  id: string;
  name: string;
  description?: string;
  /** IDs of POIs or locations this connects to (e.g. door to another room) */
  connectedTo?: string[];
}

/** A location or scene within a world */
export interface Location {
  id: string;
  name: string;
  description: string;
  /** Location IDs reachable from here (doors, corridors, vents) */
  connectedLocationIds?: string[];
  /** Points of interest within this location (for detailed map) */
  pointsOfInterest?: PointOfInterest[];
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
  /** Where the party begins this scenario (must be in locationIds) */
  startingLocationId: string;
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

/** Unlock condition for scenario NPCs (e.g. must reach a location) */
export interface NpcUnlockCondition {
  type: "location";
  /** NPC unlocks when player has explored any of these locations */
  locationIds: string[];
}

/** Campaign configuration - defines the scenario structure */
export interface CampaignConfig {
  id: CampaignId;
  name: string;
  description: string;
  world: World;
  /** Scenario definitions (for multi-scenario campaigns) */
  scenarios?: Scenario[];
  /** Mission definitions (for scenario briefings) */
  missions?: Mission[];
  /** Scenario NPC profile IDs (excludes Warden and The Company—those are always available) */
  npcIds: string[];
  /** Unlock conditions per NPC: must satisfy to interact (e.g. reach location) */
  npcUnlockConditions?: Record<string, NpcUnlockCondition>;
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
