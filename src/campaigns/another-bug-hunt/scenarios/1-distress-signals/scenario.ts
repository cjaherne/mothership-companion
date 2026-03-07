/**
 * Distress Signals - Scenario 1 of Another Bug Hunt
 */

import type { Scenario } from "../../../types";
import { THE_METAMORPHOSIS_ID } from "../../world";
import { distressSignalsPuzzles } from "./puzzles";

export const distressSignalsScenario: Scenario = {
  id: "1-distress-signals",
  name: "Distress Signals",
  description:
    "Investigate the abandoned Greta Base. Re-establish power, retrieve samples, survive.",
  missionId: "distress-signals",
  locationIds: [
    THE_METAMORPHOSIS_ID,
    "landing-zone",
    "greta-base",
    "heron-station",
    "mothership",
    "airlock",
    "lockers",
    "mess-hall",
    "medical-lab",
    "garage",
    "reactor",
    "vents",
  ],
  startingLocationId: THE_METAMORPHOSIS_ID,
};

export const puzzleIds = distressSignalsPuzzles.map((p) => p.id);
