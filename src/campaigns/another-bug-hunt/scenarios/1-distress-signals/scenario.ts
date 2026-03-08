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
    // Planet-level regions
    "landing-zone",
    "outside-airlock",
    "outside-garage",
    "greta-base",
    "heron-station",
    "mothership",
    // Greta Base internal rooms (from PDF pp.10-15)
    "airlock",
    "commissary",
    "pantry",
    "freezer",
    "crew-habitat",
    "armory",
    "medbay",
    "medbay-operating-room",
    "command-center",
    "garage",
  ],
  startingLocationId: THE_METAMORPHOSIS_ID,
};

export const puzzleIds = distressSignalsPuzzles.map((p) => p.id);
