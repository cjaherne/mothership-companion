/**
 * Mothership Companion - Run state types
 *
 * Character creation and game state persistence for campaign runs.
 */

import type { NPCManipulatableAttributes } from "./npc";
import type { MothershipCharacterData } from "@/lib/mothership";

/** Player character in a run (created by user) */
export interface Character {
  id: string;
  /** Player's real name (person at the table). Optional for backwards compat. */
  playerName?: string;
  /** Character's in-game name */
  name: string;
  /** Traits e.g. ["paranoid", "tactical", "loyal"] */
  traits: string[];
  /** Free-form summary for NPC context: personality, background, how to roleplay them */
  personalitySummary: string;
  /** Mothership RPG stats, loadout, etc. (optional for backwards compat) */
  mothership?: MothershipCharacterData;
}

/** Persisted game state for a run */
export interface RunState {
  /** Player characters (the group) */
  characters: Character[];
  /** Location IDs the team has explored */
  exploredLocationIds: string[];
  /** NPC IDs the team has interacted with */
  interactedNpcIds: string[];
  /** Current NPC attribute values (how they feel about the players) */
  npcAttributeState: Record<string, NPCManipulatableAttributes>;
  /** Fact IDs the players have learned */
  playerKnowledgeFactIds: string[];
  /** Current location/context */
  currentLocationId?: string;
  /** NPC the player is currently speaking to (for voice session) */
  activeNpcId?: string;
  /** Turn or session count */
  turn?: number;
}

export const EMPTY_RUN_STATE: RunState = {
  characters: [],
  exploredLocationIds: [],
  interactedNpcIds: [],
  npcAttributeState: {},
  playerKnowledgeFactIds: [],
  turn: 0,
};
