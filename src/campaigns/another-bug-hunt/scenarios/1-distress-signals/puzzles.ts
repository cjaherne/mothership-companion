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
  /** Word puzzle: player must enter this solution (case-insensitive) */
  wordPuzzle?: {
    clue: string;
    solution: string;
  };
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
  {
    id: "prefab-terminal",
    requiredConditions: [],
    wordPuzzle: {
      clue: "Scratched into the terminal bezel: 15-22-5-18-18-9-4-5. No other legible clues remain.",
      solution: "OVERRIDE",
    },
  },
  {
    id: "olsson-birthday-locker",
    requiredConditions: [],
    wordPuzzle: {
      clue: "The locker bears a three-part combination: 47 - ? - ?. 'The usual spot' and clues from the party hold the rest.",
      solution: "47-22-23",
    },
  },
];

/** Get word puzzle config by ID (for POI puzzle UI) */
export function getWordPuzzleConfig(puzzleId: string): { clue: string; solution: string } | null {
  const p = distressSignalsPuzzles.find((x) => x.id === puzzleId);
  return p?.wordPuzzle ?? null;
}
