/**
 * Distress Signals - Puzzle definitions
 *
 * Developer: define puzzle IDs, required conditions, and clue hints.
 */

/** Puzzle definition for campaign config (static) */
export interface PuzzleDefinition {
  id: string;
  requiredConditions: string[];
  /** Clue IDs or hints the player can discover */
  clues?: string[];
}

export const distressSignalsPuzzles: PuzzleDefinition[] = [
  {
    id: "power-restoration",
    requiredConditions: ["reach-reactor", "restore-power", "main-computer-online"],
    clues: ["reactor_location", "power_conduits", "main_computer_access"],
  },
  {
    id: "biological-samples",
    requiredConditions: ["reach-medical-lab", "retrieve-samples"],
    clues: ["medical_lab_location", "sample_storage", "cold_storage_access"],
  },
];
