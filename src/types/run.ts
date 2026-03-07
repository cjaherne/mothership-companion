/**
 * Mothership Companion - Run state types
 *
 * Character creation and game state persistence for campaign runs.
 */

import type { NPCManipulatableAttributes } from "./npc";

/** Player character in a run (created by user) */
export interface Character {
  id: string;
  name: string;
  /** Traits e.g. ["paranoid", "tactical", "loyal"] */
  traits: string[];
  /** Free-form summary for NPC context: personality, background, how to roleplay them */
  personalitySummary: string;
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
