/**
 * Mothership Companion - Fact / Knowledge Database
 *
 * Canonical facts that NPCs can know and reveal. Used for structured
 * information gating (who knows what, attribute thresholds).
 */

export type FactId = string;

/** Tier determines which attribute threshold gates reveal (shareMinor vs shareMajor) */
export type FactTier = "minor" | "major";

/** A single canonical fact that can be revealed to the player */
export interface Fact {
  id: FactId;
  /** The actual information (what the NPC would say) */
  text: string;
  /** Gates reveal: minor uses shareMinor threshold, major uses shareMajor */
  tier: FactTier;
  /** Optional: which scenario or location this fact relates to */
  scenarioId?: string;
}
