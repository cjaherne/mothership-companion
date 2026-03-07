/**
 * Warden campaign - default Mothership scenario.
 *
 * Voice-interactive Warden experience. Echo mode for now;
 * NPCs and puzzles can be added when orchestration is wired.
 */

import type { CampaignConfig } from "../types";

export const wardenCampaign: CampaignConfig = {
  id: "warden",
  name: "Warden",
  description: "Voice-interactive Mothership Warden scenario. Connect to speak with the system.",
  world: {
    id: "warden-world",
    name: "Warden",
    description: "Mothership Warden scenario setting.",
    locations: [
      {
        id: "bridge",
        name: "Bridge",
        description: "Ship bridge.",
      },
    ],
    defaultLocationId: "bridge",
  },
  npcIds: [],
  puzzleIds: [],
  roomName: "mothership-warden",
};
