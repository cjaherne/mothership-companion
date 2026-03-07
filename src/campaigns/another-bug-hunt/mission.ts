/**
 * Another Bug Hunt - Mission definitions
 *
 * Developer: fill in briefing and objectives for each scenario.
 */

import type { Mission } from "../types";

/** Scenario 1: Distress Signals */
export const distressSignalsMission: Mission = {
  id: "distress-signals",
  name: "Distress Signals",
  objectives: [
    "Rendezvous with the station's marine commander",
    "Re-establish power to the main computer",
    "Retrieve biological samples from the medical laboratory",
  ],
  briefing: `The Company has lost contact with Greta Base on Samsa VI six months ago. You are being sent to investigate. A raging tropical storm will make radio communication nearly impossible. Your objectives: rendezvous with the station's marine commander, re-establish power to the main computer, and retrieve any biological samples from the medical laboratory. Expect the unexpected.`,
};

/** Scenario 2 - Shell (developer fills in) */
export const scenario2Mission: Mission = {
  id: "scenario-2",
  name: "Scenario 2",
  objectives: [],
  briefing: "",
};

/** Scenario 3 - Shell (developer fills in) */
export const scenario3Mission: Mission = {
  id: "scenario-3",
  name: "Scenario 3",
  objectives: [],
  briefing: "",
};

/** Scenario 4 - Shell (developer fills in) */
export const scenario4Mission: Mission = {
  id: "scenario-4",
  name: "Scenario 4",
  objectives: [],
  briefing: "",
};

export const missions: Mission[] = [
  distressSignalsMission,
  scenario2Mission,
  scenario3Mission,
  scenario4Mission,
];
