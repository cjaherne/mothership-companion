/**
 * Another Bug Hunt - Facts database (Distress Signals)
 *
 * Canonical facts NPCs can know and reveal. Developer: add facts as you
 * build out scenarios. Use fact IDs in NPC knownFactIds.
 */

import type { Fact } from "@/types/fact";

export const distressSignalsFacts: Fact[] = [
  // --- What the carcinids are and how they spread ---
  {
    id: "carc-infestation-progression",
    text: "The infestation spread over weeks. First the animals disappeared, then colonists started acting strangely—erratic behaviour, sleeplessness, violence. Then the shrieking at night. Then silence.",
    tier: "minor",
    scenarioId: "1-distress-signals",
  },
  {
    id: "crabsong",
    text: "Dr. Edem discovered the carcinids use a high-pitched 'krebslieder'—crabsong—to replicate. Exposure to the shriek causes a Sanity Save or the listener begins to dig compulsively.",
    tier: "major",
    scenarioId: "1-distress-signals",
  },
  {
    id: "carc-larvae-in-or",
    text: "Four carcinid larvae are contained in specimen tubes inside the Medbay Operating Room. The room is completely destroyed by webbing. The larvae appear to be developing.",
    tier: "major",
    scenarioId: "1-distress-signals",
  },
  // --- Personnel fates ---
  {
    id: "abara-possessed",
    text: "Sgt Abara is in the Garage, digging an ever-deeper hole. He does not eat, sleep, or respond. His eyes are wrong. Do NOT touch him—crab legs will erupt from his neck.",
    tier: "major",
    scenarioId: "1-distress-signals",
  },
  {
    id: "kaplan-fate",
    text: "2ndLt Kaplan took his own life in the Command Center, one hand on the controls, the other holding the Samsa VI Org Chart. He bears the same 'paper cut' laceration pattern as other victims.",
    tier: "minor",
    scenarioId: "1-distress-signals",
  },
  {
    id: "edem-locked-in-or",
    text: "Dr. Edem locked herself in the Medbay Operating Room. Only she has the keycard. It is unknown whether she is still alive.",
    tier: "major",
    scenarioId: "1-distress-signals",
  },
  {
    id: "hinton-left-base",
    text: "The synthetic science officer Hinton left Greta Base weeks ago with a scanner, heading south into the jungle—toward the foothills of a nearby mountain. His personal locator tracker is in a cam-locked drawer in Kaplan's quarters.",
    tier: "major",
    scenarioId: "1-distress-signals",
  },
  // --- Base infrastructure ---
  {
    id: "power_sequence",
    text: "The power restoration sequence for the backup generator. Restart procedures are documented in the maintenance logs.",
    tier: "minor",
    scenarioId: "1-distress-signals",
  },
  {
    id: "carcinid_garage",
    text: "The carcinid—or something that was the carcinid—is in the Garage. It has grown. It makes a rhythmic thudding sound.",
    tier: "major",
    scenarioId: "1-distress-signals",
  },
  {
    id: "comms-destroyed",
    text: "The Command Center communications equipment is destroyed. It can be repaired (takes 2d10 hours in campaign mode). Until the Heron Station comm tower is retaken, repaired comms will only broadcast the Signal.",
    tier: "minor",
    scenarioId: "1-distress-signals",
  },
  {
    id: "backup-generator-offline",
    text: "The backup generator in the Garage is offline. If restarted, electricity returns to the entire base—and loud party music immediately blares from the Commissary. The music triggers a Fear Save.",
    tier: "minor",
    scenarioId: "1-distress-signals",
  },
  {
    id: "armory-destroyed",
    text: "The Armory has been ripped open and all weapons are fused together at a molecular level by carcinid webbing. Nothing functional remains.",
    tier: "minor",
    scenarioId: "1-distress-signals",
  },
  // --- Exploration and navigation ---
  {
    id: "vents-connected",
    text: "The ventilation ducts connect the Medbay, the Walk-in Freezer, and the Medbay Operating Room via the Garage. The carcinids use them.",
    tier: "minor",
    scenarioId: "1-distress-signals",
  },
  {
    id: "storm-incoming",
    text: "A major tropical storm system is rolling in—see the weather charts in Dr. Edem's quarters. Heavy rain garbles transmissions and obscures scanning. Running in the mud risks falls.",
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
