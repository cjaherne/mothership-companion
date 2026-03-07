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
    connectedLocationIds: ["greta-base", "lockers", "mess-hall"],
    pointsOfInterest: [
      { id: "inner-door", name: "Inner door", description: "Leads into the facility" },
      { id: "minimap", name: "Minimap", description: "Wall map highlighting the ventilation system" },
    ],
  },
  {
    id: "lockers",
    name: "Locker Room",
    description: "Crew lockers and equipment storage. Signs of a hurried evacuation.",
    connectedLocationIds: ["airlock", "mess-hall"],
    pointsOfInterest: [
      { id: "crew-lockers", name: "Crew lockers" },
      { id: "equipment-storage", name: "Equipment storage" },
    ],
  },
  {
    id: "mess-hall",
    name: "Mess Hall",
    description:
      "Common area with a jukebox. Power restoration will bring it back to life.",
    connectedLocationIds: ["airlock", "lockers", "medical-lab", "reactor", "vents"],
    pointsOfInterest: [
      { id: "jukebox", name: "Jukebox", description: "Requires power" },
      { id: "mess-tables", name: "Mess tables" },
    ],
  },
  {
    id: "medical-lab",
    name: "Medical Laboratory",
    description:
      "Where biological samples are stored. Mission objective: retrieve samples.",
    connectedLocationIds: ["mess-hall"],
    pointsOfInterest: [
      { id: "sample-storage", name: "Sample storage" },
      { id: "lab-equipment", name: "Lab equipment" },
    ],
  },
  {
    id: "garage",
    name: "Garage",
    description:
      "Vehicle bay. Deep inside, a rhythmic thumping echoes. The Carcinid lair.",
    connectedLocationIds: ["reactor", "vents"],
    pointsOfInterest: [
      { id: "vehicle-bay", name: "Vehicle bay" },
      { id: "deep-interior", name: "Deep interior", description: "Rhythmic thumping echoes from within" },
    ],
  },
  {
    id: "reactor",
    name: "Reactor / Main Computer",
    description:
      "Power core and main computer. Restoring power here re-establishes communication and lights.",
    connectedLocationIds: ["mess-hall", "vents", "garage"],
    pointsOfInterest: [
      { id: "power-core", name: "Power core" },
      { id: "main-computer", name: "Main computer" },
    ],
  },
  {
    id: "vents",
    name: "Ventilation System",
    description: "Narrow ducts connecting rooms. They're in the vents.",
    connectedLocationIds: ["mess-hall", "reactor", "garage"],
    pointsOfInterest: [
      { id: "duct-entrance", name: "Duct entrance" },
      { id: "vent-shaft", name: "Vent shaft" },
    ],
  },
];

/** Location IDs that belong to each primary region (for Internal Location Map) */
export const REGION_INTERNAL_LOCATION_IDS: Record<string, string[]> = {
  "landing-zone": ["landing-zone"],
  "greta-base": ["greta-base", "airlock", "lockers", "mess-hall", "medical-lab", "garage", "reactor", "vents"],
  "heron-station": ["heron-station"],
  mothership: ["mothership"],
};

export const samsaVIPlanetMap = {
  regions: [
    { id: "landing-zone", name: "Landing Zone", description: "Where the shuttle touched down. A short muddy walk to Greta Base." },
    { id: "greta-base", name: "Greta Base", description: "Abandoned terraforming facility. Six months of silence." },
    { id: "heron-station", name: "Heron Station", description: "Secondary research outpost." },
    { id: "mothership", name: "Mothership", description: "Unknown until discovered." },
  ],
  paths: [
    { id: "path-a", name: "Muddy Path A", fromRegionId: "landing-zone", toRegionId: "greta-base", knownAtStart: true },
    { id: "path-b", name: "Rough Trail B", fromRegionId: "greta-base", toRegionId: "heron-station", knownAtStart: true },
    { id: "path-c", name: "Faint Carc Trail C", fromRegionId: "greta-base", toRegionId: "mothership", knownAtStart: false },
    { id: "path-d", name: "Jungle Hike D", fromRegionId: "heron-station", toRegionId: "mothership", knownAtStart: false },
    { id: "path-e", name: "The Tunnels E", fromRegionId: "heron-station", toRegionId: "mothership", knownAtStart: false },
  ],
  initialKnownRegionIds: ["landing-zone", "greta-base", "heron-station"],
};

export const anotherBugHuntWorld: World = {
  id: "another-bug-hunt-world",
  name: "Samsa VI",
  description:
    "Jungle planet. Abandoned terraforming colony. Six months of silence. A raging tropical storm blocks radio.",
  locations: [
    {
      id: "landing-zone",
      name: "Landing Zone",
      description: "Where the shuttle touched down. A short muddy walk to Greta Base.",
      connectedLocationIds: ["greta-base"],
    },
    {
      id: "greta-base",
      name: "Greta Base",
      description: "Abandoned terraforming facility. Main entry via airlock.",
      connectedLocationIds: ["landing-zone", "heron-station", "airlock"],
    },
    {
      id: "heron-station",
      name: "Heron Station",
      description: "Secondary research outpost.",
      connectedLocationIds: ["greta-base"],
    },
    {
      id: "mothership",
      name: "Mothership",
      description: "Discovered through exploration.",
      connectedLocationIds: ["greta-base", "heron-station"],
    },
    ...gretaBaseLocations,
  ],
  defaultLocationId: "landing-zone",
  planetMap: samsaVIPlanetMap,
  regionInternalLocationIds: REGION_INTERNAL_LOCATION_IDS,
};
