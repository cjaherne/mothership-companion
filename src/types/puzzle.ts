/**
 * Mothership Companion - Puzzle State Interfaces
 *
 * Defines schema for puzzle logic, progression, and state
 * that the AI backend uses to gate NPC responses and events.
 */

/** Unique puzzle identifier */
export type PuzzleId = string;

/** Current state of a puzzle */
export type PuzzleStatus = "locked" | "available" | "in_progress" | "solved" | "failed";

/** A single puzzle in the Warden scenario */
export interface PuzzleState {
  id: PuzzleId;
  status: PuzzleStatus;
  /** Clues the player has discovered */
  discoveredClues: string[];
  /** Required conditions to solve */
  requiredConditions: string[];
  /** Conditions the player has met */
  metConditions: string[];
  /** Optional time pressure (turns/seconds) */
  deadline?: number;
}

/** Global game/session state persisted across voice turns */
export interface GameState {
  /** Campaign ID (for multi-campaign support) */
  campaignId?: string;
  /** Active puzzle IDs and their states */
  puzzles: Record<PuzzleId, PuzzleState>;
  /** Facts the player has learned (affects NPC dialogue) */
  playerKnowledge: string[];
  /** Current location/context */
  currentScene: string;
  /** Turn or timestamp for ordering */
  turn: number;
}
