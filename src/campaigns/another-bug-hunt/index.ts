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
  scenarios,
  missions,
  npcIds: ["maas", "demar"],
  npcUnlockConditions: {
    maas: {
      type: "location",
      locationIds: ["the-metamorphosis"],
    },
    demar: {
      type: "poi",
      locationIds: ["garage"],
      requiredPoiIds: ["apc"],
      isHidden: true,
    },
  },
  puzzleIds,
  roomName: "mothership-another-bug-hunt",
  wardenNarrator: {
    narrative: `Six months. That's how long Greta Base has been silent. Samsa VI—a jungle planet, a terraforming colony, a research station. The Company sends you because someone has to. The tropical storm howls outside. Radio is dead. You descend into darkness. The facility is ransacked. No survivors—or so it seems. Something waits in the shadows. Something that came from the samples.`,
  },
  theCompany: {
    hints: [
      "Check the reactor—power restoration is your first priority.",
      "The ventilation system connects most of the base. Consider your routes.",
      "The medical lab holds answers—and the source of the outbreak.",
      "The creature is drawn to sound and movement. Use that.",
      "Smart weapons. Conventional arms won't penetrate its shell.",
    ],
  },
};
