/**
 * Another Bug Hunt - World definition (Samsa VI, Greta Base)
 *
 * Jungle planet with abandoned terraforming/research station.
 * Developer: extend locations as needed for your scenario.
 */

import type { World } from "../types";

export const gretaBaseLocations = [
  {
    id: "airlock",
    name: "Airlock",
    description:
      "Main entry point to Greta Base. Lockers line the walls. A minimap on the wall highlights the ventilation system. The inner door leads into the facility.",
  },
  {
    id: "lockers",
    name: "Locker Room",
    description: "Crew lockers and equipment storage. Signs of a hurried evacuation.",
  },
  {
    id: "mess-hall",
    name: "Mess Hall",
    description:
      "Common area with a jukebox. Power restoration will bring it back to life.",
  },
  {
    id: "medical-lab",
    name: "Medical Laboratory",
    description:
      "Where biological samples are stored. Mission objective: retrieve samples.",
  },
  {
    id: "garage",
    name: "Garage",
    description:
      "Vehicle bay. Deep inside, a rhythmic thumping echoes. The Carcinid lair.",
  },
  {
    id: "reactor",
    name: "Reactor / Main Computer",
    description:
      "Power core and main computer. Restoring power here re-establishes communication and lights.",
  },
  {
    id: "vents",
    name: "Ventilation System",
    description: "Narrow ducts connecting rooms. They're in the vents.",
  },
] as const;

export const anotherBugHuntWorld: World = {
  id: "another-bug-hunt-world",
  name: "Samsa VI - Greta Base",
  description:
    "Abandoned terraforming colony on the jungle planet Samsa VI. Six months of silence. A raging tropical storm blocks radio. The facility is dark, ransacked, and deserted.",
  locations: [...gretaBaseLocations],
  defaultLocationId: "airlock",
};
