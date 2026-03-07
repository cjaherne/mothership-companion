/**
 * Another Bug Hunt - Mothership introductory campaign
 *
 * Four scenarios: Distress Signals (implemented) + shells for 2-4.
 * Greta Base on Samsa VI. Carcinids. The Company.
 */

import type { CampaignConfig } from "../types";
import { anotherBugHuntWorld } from "./world";
import { missions } from "./mission";
import { scenarios } from "./scenario";
import { puzzleIds } from "./scenarios/1-distress-signals/scenario";

export const anotherBugHuntCampaign: CampaignConfig = {
  id: "another-bug-hunt",
  name: "Another Bug Hunt",
  description:
    "The Company's abandoned terraforming colony on Samsa VI. Four interconnected scenarios of sci-fi horror.",
  world: anotherBugHuntWorld,
  npcIds: ["example-survivor"],
  puzzleIds,
  scenarioIds: scenarios.map((s) => s.id),
  missionIds: missions.map((m) => m.id),
  roomName: "mothership-another-bug-hunt",
};
