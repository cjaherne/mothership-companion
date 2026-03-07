/**
 * Another Bug Hunt - Facts database (Distress Signals)
 *
 * Canonical facts NPCs can know and reveal. Developer: add facts as you
 * build out scenarios. Use fact IDs in NPC knownFactIds.
 */

import type { Fact } from "@/types/fact";

export const distressSignalsFacts: Fact[] = [
  {
    id: "carcinid_garage",
    text: "The creature nests in the garage. You can hear it—a rhythmic thumping.",
    tier: "major",
    scenarioId: "1-distress-signals",
  },
  {
    id: "power_sequence",
    text: "Restore the reactor first, then the main computer. That brings the lights and comms back online.",
    tier: "minor",
    scenarioId: "1-distress-signals",
  },
  {
    id: "outbreak_source",
    text: "It came from the samples in the medical lab. Someone brought something back.",
    tier: "major",
    scenarioId: "1-distress-signals",
  },
  {
    id: "last_days",
    text: "The last few days—people went missing. Then the screaming. Then silence.",
    tier: "minor",
    scenarioId: "1-distress-signals",
  },
  {
    id: "vents_connected",
    text: "The ventilation ducts connect most of the base. They're in the vents.",
    tier: "minor",
    scenarioId: "1-distress-signals",
  },
];

/** All facts for Another Bug Hunt (extend per scenario) */
export const anotherBugHuntFacts: Fact[] = [...distressSignalsFacts];

/** Lookup by ID */
export function getFact(id: string): Fact | undefined {
  return anotherBugHuntFacts.find((f) => f.id === id);
}

/** Get facts for a scenario */
export function getFactsForScenario(scenarioId: string): Fact[] {
  return anotherBugHuntFacts.filter(
    (f) => f.scenarioId === scenarioId || !f.scenarioId
  );
}
