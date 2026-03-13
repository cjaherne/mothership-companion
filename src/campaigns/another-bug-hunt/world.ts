/**
 * Another Bug Hunt - World definition (Samsa VI, Greta Base)
 *
 * Locations, sub-locations, and POIs drawn directly from the PDF
 * "Another Bug Hunt v1.2" — Scenario 1: Distress Signals (pp.10-15).
 */

import type { Location, World } from "../types";

// ---------------------------------------------------------------------------
// Medbay Operating Room (sub-location inside Medbay, locked)
// ---------------------------------------------------------------------------
const medbayOperatingRoom: Location = {
  id: "medbay-operating-room",
  name: "Medbay — Operating Room",
  description:
    "The entire operating area has been destroyed. Equipment is smashed or fused together by carc webbing. Four large specimen containment tubes hold carcinid larvae. Something has been here.",
  backgroundText:
    "The operating room. The entire area has been destroyed—equipment smashed or fused together by something that doesn't belong in a medbay. Specimen containment tubes line the space. A vent in the wall connects to the Garage. A fuel-barrel stack blocks another passage. Whatever happened here, it wasn't surgery.",
  parentLocationId: "medbay",
  isLocked: true,
  lockNote: "Only Dr. Edem has the keycard.",
  requiredItemIds: ["edem-keycard"],
  connectedLocationIds: ["medbay"],
  pointsOfInterest: [
    {
      id: "medpod",
      name: "Litkovich MedPod 1080a",
      description: "Broken. Could restore 1 Wound per week once repaired. Repair takes 1d10 hours.",
    },
    {
      id: "bio-printer",
      name: "Sato T3 Bio-Printer",
      description: "Broken. Prints synthetic biological material. Empty stem cell cartridges. Repair takes 1d10 hours.",
    },
    {
      id: "larva-specimens",
      name: "Specimen Containment Tubes",
      description: "Four large glass tubes, each holding a developing carcinid larva. Untouched.",
      itemIds: ["carcinid-larva-contained"],
    },
    {
      id: "carc-limb",
      name: "Carcinid Limb",
      description: "A metre-long black crab-like limb on the floor near the surgical bed. If touched, it thrashes violently (Body Save or 1d10 DMG).",
      isHidden: true,
    },
    {
      id: "medbay-or-acid",
      name: "Lead Container",
      description: "A heavy lead container. Inside: hydrofluoric acid.",
      itemIds: ["hydrofluoric-acid"],
      isHidden: true,
    },
    {
      id: "vent-to-garage",
      name: "Air Vent (behind surgical bed)",
      description: "A vent in the wall behind the overturned surgical bed. Connects to the Garage.",
      connectedTo: ["garage"],
    },
  ],
};

// ---------------------------------------------------------------------------
// Exterior approach locations — between Landing Zone and Greta Base
// ---------------------------------------------------------------------------

/** The muddy clearing directly in front of the Airlock exterior door (Path A.1). */
const outsideAirlockLocation: Location = {
  id: "outside-airlock",
  name: "Outside Airlock",
  description:
    "The front of Greta Base. Deep tread tracks in the mud lead straight to the reinforced exterior door of the Airlock. The door is rusted but sealed. Rain hammers the prefab walls.",
  backgroundText:
    "The storm hasn't let up. Rain hammers the prefab walls of Greta Base, streaming down corrugated panels in grey sheets. You're standing in the mud at the front of the facility—deep tread tracks cut through the muck, leading straight to the reinforced exterior door of the Airlock. The door is rusted, sealed, silent. To your sides, the perimeter wall stretches away into the downpour. The base looms above you, dark and unresponsive.",
  connectedLocationIds: ["landing-zone", "airlock"],
  pointsOfInterest: [
    {
      id: "airlock-exterior-door",
      name: "Airlock Exterior Door",
      description:
        "Reinforced steel. Rust creeps around the frame. Deep tread tracks end right here. A keycard slot glows faintly amber.",
      connectedTo: ["airlock"],
    },
    {
      id: "front-perimeter-wall",
      name: "Perimeter Wall (Front)",
      description:
        "Prefab corrugated panels, scarred by rain and claw marks at chest height. Something large moved along here.",
    },
  ],
};

/** The muddy track around the back of the base leading to the Garage roll-up doors (Path A.2). */
const outsideGarageLocation: Location = {
  id: "outside-garage",
  name: "Outside Garage",
  description:
    "Around the back of Greta Base. The heavy industrial roll-up doors of the Garage loom ahead. A rhythmic thud reverberates through the metal. Piles of mud flank the entrance — something is buried in them.",
  backgroundText:
    "The back of Greta Base. Torrential rain soaks everything—the mud underfoot, the industrial roll-up doors ahead, the rear perimeter wall. A rhythmic thud reverberates through the metal, barely audible over the storm. Piles of mud flank the garage entrance, slumped and uneven. The heavy doors loom in front of you. The jungle presses in from all sides, grey and thrashing.",
  connectedLocationIds: ["landing-zone", "garage"],
  pointsOfInterest: [
    {
      id: "garage-exterior-doors",
      name: "Garage Roll-Up Doors (Exterior)",
      description:
        "Heavy industrial doors. Barricaded from inside — a Strength Check to force open. The rhythmic thud is louder here.",
      connectedTo: ["garage"],
    },
    {
      id: "mud-piles-exterior",
      name: "Piles of Mud",
      description:
        "Slick mounds of mud flanking the garage entrance. Something is buried beneath them — the outline is wrong for a natural formation.",
      isHidden: true,
    },
    {
      id: "back-perimeter-wall",
      name: "Perimeter Wall (Back)",
      description:
        "The rear prefab wall of the base. The panels here are bulged outward — something large pushed against them from inside.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Greta Base internal locations (rooms 2-10 from the PDF map)
// ---------------------------------------------------------------------------
export const gretaBaseLocations: Location[] = [
  {
    id: "airlock",
    name: "Airlock",
    description:
      "Rust creeps over the large metal door barring entry. Muddy floors inside. Storage lockers line the walls. The interior door will not open while the exterior is open.",
    backgroundText:
      "You're inside the Airlock. Mud from outside has been tracked across the floor. Rust creeps over the exterior door behind you and the interior door ahead. Storage lockers line the walls—standard issue, a few dented. The air is stale. Beyond the interior door lies the base proper.",
    isLocked: true,
    lockNote: "Exterior door requires a keycard (reinforced steel). Interior door is also keycard-locked.",
    requiredItemIds: ["airlock-keycard"],
    unlockOverridePuzzleIds: ["prefab-terminal"],
    connectedLocationIds: ["outside-airlock", "commissary"],
    pointsOfInterest: [
      {
        id: "exterior-door",
        name: "Exterior Door",
        description: "Reinforced steel. Locked with a keycard. Deep tread tracks lead right up to it.",
      },
      {
        id: "interior-door",
        name: "Interior Door",
        description: "Heavy steel. Keycard-locked. Does not open while the exterior door is open.",
      },
      {
        id: "storage-lockers",
        name: "Storage Lockers",
        description: "Lockers lining the walls. A few have deep indentations. One has giant claw marks across it.",
        itemIds: ["hazard-suit", "pulse-rifle-magazine-x2", "rosary"],
      },
      {
        id: "locker-47",
        name: "Locker 47 (Olsson)",
        description:
          "One locker bears scratched initials O.R. and the number 47. A small combination dial. Someone (Resnick?) hid something here.",
        requiredPoiIds: ["storage-lockers"],
        puzzleId: "olsson-birthday-locker",
        itemIds: ["freezer-keycard"],
      },
    ],
  },
  {
    id: "commissary",
    name: "Commissary",
    description:
      "Ransacked mess hall and rec room. Flickering lights. Rain drips from bullet holes in the ceiling. A 'Happy Birthday Olsson' banner droops from above. Empty cups, broken glass, bullet casings, and giant claw gouges everywhere.",
    backgroundText:
      "The commissary—mess hall and rec room. The space has been ransacked. Flickering emergency lighting casts long shadows. Rain drips through bullet holes in the ceiling. A 'Happy Birthday Olsson' banner droops from above. You can make out the kitchenette, tables, a makeshift barricade against one door. The air tastes of stale smoke and something else.",
    connectedLocationIds: ["airlock", "pantry", "crew-habitat", "command-center"],
    pointsOfInterest: [
      {
        id: "birthday-banner",
        name: "'Happy Birthday Olsson' Banner",
        description:
          "Droops from the ceiling. The party clearly went very wrong. On the back, in fading marker: 'Present in the usual spot. –R' and a list of names: Xavier, Lange, Kaplan, Edem, Resnick.",
      },
      {
        id: "xcorp-corpse",
        name: "Headless Corpse (LCpl Xavier)",
        description:
          "Under an upturned table, a headless body in fatigues. 'Paper cuts' criss-cross the skin. The chest cavity is completely hollowed out — something erupted from inside. A human arm protrudes from under the table. Cake splattered across the floor.",
        itemIds: ["dog-tags-xavier"],
      },
      {
        id: "severed-head",
        name: "Woman's Head",
        description: "Ripped at the neck. On the floor near the tables.",
        isHidden: false,
      },
      {
        id: "barricade",
        name: "Makeshift Barricade",
        description: "A couch, table, and chairs shoved against the door to the Crew Habitat.",
        connectedTo: ["crew-habitat"],
      },
      {
        id: "thud-from-garage",
        name: "Rhythmic Thud",
        description: "If the players are quiet, a faint thud can be heard every few seconds — coming from the Garage.",
        isHidden: true,
        connectedTo: ["garage"],
      },
      {
        id: "kitchenette",
        name: "Kitchenette",
        description: "A small kitchenette at the back. Leads to the Pantry.",
        connectedTo: ["pantry"],
      },
    ],
  },
  {
    id: "pantry",
    name: "Pantry",
    description:
      "The shelves are completely bare, their contents divided into large piles of MREs on the floor. Something slumped in the far corner.",
    backgroundText:
      "The pantry. Every shelf has been stripped bare. MRE rations are stacked in rough piles across the floor—someone emptied the stocks in a hurry. The kitchenette connects back to the commissary. The air is thick. It pays to look around.",
    connectedLocationIds: ["commissary"],
    pointsOfInterest: [
      {
        id: "mre-piles",
        name: "Piles of MREs",
        description: "Rations pulled from every shelf and stacked in rough piles across the floor.",
        itemIds: ["mres-large-pile"],
      },
      {
        id: "lange-corpse",
        name: "Slumped Corpse (2ndLt Lange)",
        description:
          "A marine, slumped in the far corner. 'Paper cuts' criss-cross the emaciated body. Scientist or Medical skill: starved to death.",
        itemIds: ["dog-tags-lange"],
      },
      {
        id: "birthday-cake-ruins",
        name: "Ruined Birthday Cake",
        description:
          "Smashed cake, mostly eaten. A plastic '47' candle topper lies in the frosting.",
        requiredPoiIds: ["mre-piles"],
      },
    ],
  },
  {
    id: "freezer",
    name: "Walk-in Freezer",
    description:
      "A medical-grade walk-in freezer. Around -40°C. Empty except for one frozen marine and a discarded medical case.",
    backgroundText:
      "A medical-grade walk-in freezer. The cold hits you like a wall—around -40°C. Frost coats the walls. The space is mostly empty. A ceiling vent connects to the Medbay above. Your breath fogs in the air.",
    isLocked: true,
    lockNote: "Locked. No keycard has been found.",
    requiredItemIds: ["freezer-keycard"],
    connectedLocationIds: ["medbay"],
    pointsOfInterest: [
      {
        id: "frozen-resnick",
        name: "Frozen Marine (LCpl Resnick)",
        description:
          "Wearing a tinfoil hat. Clutches a plastic vacuum tumbler. Inside: frozen hydrofluoric acid. If the tumbler is taken, the marine's fingers snap off (Fear Save).",
        itemIds: ["vacuum-tumbler-hydrofluoric"],
      },
      {
        id: "medical-case",
        name: "Medical Case",
        description:
          "Cold interior. Cracking it open lets out a hiss of frosty vapor. Contains frozen chemotherapeutic agents (25L). Scientist or Medical skill: used to treat extreme radiation damage.",
        itemIds: ["frozen-chemotherapeutic-agents"],
      },
      {
        id: "vent-to-medbay",
        name: "Ceiling Vent",
        description: "A vent in the ceiling. Connects to the Medbay.",
        connectedTo: ["medbay"],
      },
    ],
  },
  {
    id: "crew-habitat",
    name: "Crew Habitat",
    description:
      "The main habitation unit of the base. Graffiti at the entrance reads 'COMMS OFF.' A rhythmic thud carries through the walls. Made up of areas A through F.",
    backgroundText:
      "The main habitation unit. Graffiti at the entrance reads 'COMMS OFF.' A rhythmic thud carries through the walls—distant, relentless. The space is divided into areas: group showers, enlisted barracks, officer barracks, quarters. Doors line the corridor. The barricade from the commissary has been pushed aside. Something happened here.",
    connectedLocationIds: ["commissary", "armory", "medbay"],
    pointsOfInterest: [
      {
        id: "showers",
        name: "A. Group Showers / Toilets",
        description: "Standard crew washroom. Smells stale.",
        itemIds: ["stimpak-toilet-tank"],
        isHidden: true,
      },
      {
        id: "enlisted-barracks",
        name: "B. Marine Enlisted Barracks",
        description:
          "12 bunks in total disarray. Lewd posters. Smells like body odor. If searched: frag grenades, a butterfly knife, a journal detailing a relationship between HM3 Brookman and Cpl Ivanovic.",
        itemIds: [
          "frag-grenade-x2",
          "butterfly-knife",
          "journal-brookman-ivanovic",
          "pornographic-magazines",
          "cigarettes-richter-blue",
        ],
        isHidden: true,
      },
      {
        id: "officer-barracks",
        name: "C. Marine Officer Barracks",
        description:
          "Five bunks, desks, duty roster. List of essential personnel: Dr. Edem, Hinton (Logic Core only).",
        itemIds: ["duty-roster", "personnel-list-edem-hinton"],
        isHidden: true,
      },
      {
        id: "kaplan-quarters",
        name: "D. 2ndLt Kaplan's Quarters",
        description:
          "Tidy. Desk holds a photograph of Kaplan with their partner and two small children, and a Samsa VI planetary survey. Inside a cam-locked desk drawer: a revolver (12 bullets) and Hinton's personal locator tracker — currently showing Hinton's location as the foothills of a nearby mountain.",
        itemIds: [
          "photograph-kaplan-family",
          "samsa-vi-planetary-survey",
          "revolver-12-bullets",
          "hinton-personal-locator",
        ],
        isHidden: true,
      },
      {
        id: "research-barracks",
        name: "E. Research Team Barracks",
        description:
          "Five bunks. A Bao-Neumann 'BZT' gaming console, a marijuana plant, a copy of 'The Auctioneer' by Joan Samson (a bookmark at p.47; margin note: 'Resnick's verse — line 23'), and an anime body pillow.",
        itemIds: [
          "bao-neumann-bzt-console",
          "marijuana-plant",
          "the-auctioneer-book",
          "anime-body-pillow",
        ],
        isHidden: true,
      },
      {
        id: "edem-quarters",
        name: "F. Dr. Edem's Quarters",
        description:
          "Weather charts pinned to the wall show a major storm system incoming. An unopened birthday card addressed to Olsson sits on the desk. Inside: 'Thanks for always listening. Happy 47th. –E'",
        itemIds: [
          "weather-charts-storm",
          "birthday-card-olsson",
        ],
        isHidden: true,
      },
    ],
  },
  {
    id: "armory",
    name: "Armory",
    description:
      "A rugged interior metal cage lined with lockers. The industrial blast door has been ripped off and discarded. What's left of the armory is a giant pile of fused, melted metal.",
    backgroundText:
      "The armory. Or what's left of it. The industrial blast door has been torn from its frame and thrown aside. The rugged metal cage is breached. Lockers line the interior. The contents have been altered—something did a number on the weapons cache. The air smells of scorched metal.",
    connectedLocationIds: ["crew-habitat"],
    pointsOfInterest: [
      {
        id: "blast-door",
        name: "Blast Door (Ripped Off)",
        description: "The heavy blast door has been torn from its frame and thrown aside.",
      },
      {
        id: "melted-weapons",
        name: "Pile of Melted Metal",
        description:
          "The remnants of a once well-stocked armory. Scientist or Android, studied in a lab: the weapons are bonded together at a molecular level by a strong adhesive — a result of the carcs' webbing.",
      },
      {
        id: "empty-lockers",
        name: "Lockers",
        description: "Every locker is open. Every locker is empty.",
      },
    ],
  },
  {
    id: "medbay",
    name: "Medbay — Analysis Lab",
    description:
      "A small medical area. The observation and analysis lab is separated from the operating room by a glass wall. Computer terminals are powered down. Piles of loose paperwork. A log book.",
    backgroundText:
      "The Medbay—specifically the analysis and observation lab. Computer terminals sit powered down. Piles of loose paperwork. A glass wall separates this area from the operating room beyond; the door is locked. A ceiling vent leads to the walk-in freezer. The medbay has seen better days.",
    connectedLocationIds: ["crew-habitat", "command-center"],
    pointsOfInterest: [
      {
        id: "terminals",
        name: "Computer Terminals",
        description: "A small bank of terminals — all powered down.",
      },
      {
        id: "logbook",
        name: "Dr. Edem's Log Book",
        description:
          "Latest entries: notes from Dr. Edem, excited at their discovery of what they call the 'krebslieder' or 'crabsong' — a shrill Shriek the carcinids use in order to replicate. Edem credits Hinton with much of the legwork but claims to have 'put two and two together' herself. A later note: 'Resnick insisted on that awful song for Olsson. And the book — Olsson never went anywhere without it.'",
        isHidden: true,
      },
      {
        id: "vent-from-freezer",
        name: "Ceiling Vent",
        description: "A vent in the ceiling. Connects to the Walk-in Freezer.",
        connectedTo: ["freezer"],
      },
      {
        id: "operating-room-door",
        name: "Operating Room (Glass Wall / Locked Door)",
        description:
          "A glass wall separates the analysis lab from the operating room. The door is locked — only Dr. Edem has the keycard. Through the glass the operating area appears completely destroyed.",
        connectedTo: ["medbay-operating-room"],
      },
    ],
    subLocations: [medbayOperatingRoom],
  },
  {
    id: "command-center",
    name: "Command Center",
    description:
      "The central nervous system of the base and primary communication station for the Company. Central computer and communication instruments are smashed. Emergency lighting only.",
    backgroundText:
      "The Command Center—the base's central nervous system. Primary comms for the Company. The central computer and communication equipment have been smashed. Emergency lighting casts a dull glow over the wreckage.",
    connectedLocationIds: ["medbay", "commissary"],
    pointsOfInterest: [
      {
        id: "kaplan-body",
        name: "Marine Corpse (2ndLt Kaplan)",
        description:
          "Slumped over the controls. Single gunshot wound to the head — self-inflicted. One hand holds a revolver with five shots remaining. The other holds the Samsa VI Org Chart. 'Paper cuts' cover the body.",
        itemIds: [
          "revolver-5-shots",
          "samsa-vi-org-chart",
          "dog-tags-kaplan",
        ],
      },
      {
        id: "smashed-comms",
        name: "Smashed Communications Equipment",
        description:
          "Central computer and comms instruments are destroyed. Campaign mode: repairable in 2d10 hours — once fixed, only broadcasts the Signal unless the Tower has been retaken. One-shot mode: repairable in 1d10 rounds.",
      },
    ],
  },
  {
    id: "garage",
    name: "Garage / Utilities",
    description:
      "The back entrance to the base. Heavy industrial overhead roll-up doors, barricaded from inside. An APC on one side. A gigantic dirt hole on the other. Something is in here.",
    backgroundText:
      "The Garage and utilities bay. Heavy industrial roll-up doors—barricaded from inside—let in slivers of grey storm light. An Armored Personnel Carrier sits on one side, controls visible. A gigantic dirt hole dominates the other. A tool bench, fuel barrels, and a backup generator fill the space. A vent leads to the Medbay Operating Room. The rhythmic thud is loudest here.",
    connectedLocationIds: ["outside-garage", "medbay"],
    pointsOfInterest: [
      {
        id: "olsson-corpse",
        name: "Piles of Mud (Outside)",
        description:
          "The muddy piles outside the garage doors are actually a bisected corpse in fatigues.",
        itemIds: ["dog-tags-olsson"],
        isHidden: true,
      },
      {
        id: "roll-up-doors",
        name: "Overhead Roll-Up Doors",
        description:
          "Heavy industrial doors, barricaded from inside with gym equipment. Strength Check required to force open.",
      },
      {
        id: "apc",
        name: "Armored Personnel Carrier (APC)",
        description:
          "Controls are in working order. Nav display shows the Heron Terraforming Station. The comms, if operated, emit a piercing Shriek (Sanity Save). Someone is inside.",
        npcsPresent: ["demar"],
      },
      {
        id: "dirt-hole",
        name: "Giant Dirt Hole",
        description:
          "Standing in a puddle of water, a marine digs relentlessly, completely ignoring their surroundings. Dog tags: Sgt Abara. DO NOT TOUCH — crab legs will erupt from his neck. A fallen power line (offline) hangs from the ceiling nearby.",
        itemIds: ["dog-tags-abara"],
      },
      {
        id: "tool-bench",
        name: "Tool Bench",
        description: "Assorted tools, well-used.",
        itemIds: [
          "crowbar",
          "flashlight",
          "patch-kit",
          "nail-gun-x1000",
          "hand-welder",
        ],
      },
      {
        id: "fuel-barrels",
        name: "Fuel Barrels",
        description: "Six barrels of fuel for the backup generator. A vent behind them leads to the Medbay Operating Room.",
        itemIds: ["fuel-barrel-x6"],
        connectedTo: ["medbay-operating-room"],
      },
      {
        id: "backup-generator",
        name: "Backup Generator",
        description:
          "Currently offline. If restarted it brings electricity back to the entire base. Warning: loud party music immediately plays from the Commissary (Fear Save with advantage). The tinny pop song blares: '...twenty-two, make a wish for me...'",
      },
    ],
  },
];

/** Prologue location — one-off, no connections. Only Maas is here. */
export const THE_METAMORPHOSIS_ID = "the-metamorphosis";

/** Entry config: POI that reveals "Enter X" button; lock from target or per-entry override */
export interface EntryConfigItem {
  poiId: string;
  targetLocationId: string;
  /** Lock for this passage (when lock is on the door, not the target room) */
  requiredItemIds?: string[];
  unlockOverridePuzzleIds?: string[];
  lockNote?: string;
}

export const GRETA_BASE_ENTRY_POIS: Record<string, EntryConfigItem> = {
  "outside-airlock": {
    poiId: "airlock-exterior-door",
    targetLocationId: "airlock",
    requiredItemIds: ["airlock-keycard"],
    unlockOverridePuzzleIds: ["prefab-terminal"],
    lockNote: "Keycard or solve the prefab terminal puzzle.",
  },
  "outside-garage": { poiId: "garage-exterior-doors", targetLocationId: "garage" },
  "airlock": {
    poiId: "interior-door",
    targetLocationId: "commissary",
    requiredItemIds: ["airlock-keycard"],
    unlockOverridePuzzleIds: ["prefab-terminal"],
    lockNote: "Keycard or solve the prefab terminal puzzle.",
  },
};

/** Location IDs that belong to each primary region (for Internal Location Map) */
export const REGION_INTERNAL_LOCATION_IDS: Record<string, string[]> = {
  [THE_METAMORPHOSIS_ID]: [THE_METAMORPHOSIS_ID],
  "landing-zone": ["landing-zone"],
  "greta-base": [
    "outside-airlock",
    "outside-garage",
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
  "heron-station": ["heron-station"],
  mothership: ["mothership"],
};

export const samsaVIPlanetMap = {
  regions: [
    {
      id: "landing-zone",
      name: "Landing Zone",
      description:
        "Where the dropship touched down. A modular prefab base choked by tumorous vines. The trail ahead forks.",
    },
    {
      id: "greta-base",
      name: "Greta Base",
      description:
        "Abandoned terraforming colony. Six months of silence. Lights out, unresponsive to hailing.",
    },
    {
      id: "heron-station",
      name: "Heron Station",
      description:
        "Secondary terraforming research outpost. A riverbank clearing in dense jungle. Inaccessible during the storm.",
    },
    {
      id: "mothership",
      name: "Mothership",
      description: "Location unknown until discovered.",
    },
  ],
  paths: [
    {
      id: "path-a1",
      name: "Muddy Path A.1",
      fromRegionId: "landing-zone",
      toRegionId: "greta-base",
      knownAtStart: true,
    },
    {
      id: "path-a2",
      name: "Trail Fork A.2",
      fromRegionId: "landing-zone",
      toRegionId: "greta-base",
      knownAtStart: false,
      requiredPoiId: "trail-fork",
    },
    {
      id: "path-b",
      name: "Rough Trail B",
      fromRegionId: "greta-base",
      toRegionId: "heron-station",
      knownAtStart: true,
    },
    {
      id: "path-c",
      name: "Faint Carc Trail C",
      fromRegionId: "greta-base",
      toRegionId: "mothership",
      knownAtStart: false,
    },
    {
      id: "path-d",
      name: "Jungle Hike D",
      fromRegionId: "heron-station",
      toRegionId: "mothership",
      knownAtStart: false,
    },
    {
      id: "path-e",
      name: "The Tunnels E",
      fromRegionId: "heron-station",
      toRegionId: "mothership",
      knownAtStart: false,
    },
  ],
  initialKnownRegionIds: [
    "landing-zone",
    "greta-base",
    "heron-station",
  ],
};

export const anotherBugHuntWorld: World = {
  id: "another-bug-hunt-world",
  name: "Samsa VI",
  description:
    "Jungle planet. Abandoned terraforming colony. Six months of silence. A raging tropical storm blocks all radio communications.",
  locations: [
    {
      id: THE_METAMORPHOSIS_ID,
      name: "The Metamorphosis",
      description:
        "A J2C-I Executive Transport in orbit around Samsa VI. You've awakened from cryosleep. Maas, your corporate liaison, is waiting to brief you on the mission.",
      connectedLocationIds: [],
    },
    {
      id: "landing-zone",
      name: "Landing Zone",
      description:
        "A modular, prefab base choked by tumorous vines, scarred by rain, appearing completely deserted. Thick mud makes it hard to run. Heavy rains garble transmissions and obscure scanning.",
      connectedLocationIds: ["outside-airlock", "outside-garage"],
      pointsOfInterest: [
        {
          id: "dropship",
          name: "Dropship",
          description:
            "The craft you just stepped off. Pilots Anders and Renfield wait by the ramp, staying close to the ship.",
          npcsPresent: ["anders", "renfield"],
        },
        {
          id: "investigate-area",
          name: "Investigate the Area",
          description:
            "You survey the mud-soaked landing zone. Deep tread tracks cut through the mud, leading toward Greta Base in the distance. A deserted prefab structure sits to one side, a broken window staring out at the rain. You can investigate the prefab, proceed down the tread tracks toward Greta Base to get out of the rain and storm, or examine the tread tracks more closely.",
        },
        {
          id: "landing-zone-prefab",
          name: "Landing Zone Prefab",
          description:
            "A deserted modular prefab structure. A broken window. Abandoned equipment and vines creep through the gaps. A marine corpse lies in a pool of dried blood. A security terminal glows faintly in one corner—locked.",
          requiredPoiIds: ["investigate-area"],
        },
        {
          id: "prefab-corpse",
          name: "Dead Marine Corpse",
          description:
            "A marine in torn fatigues. Viciously mauled—deep claw gouges across the torso. The dog-tag chain is broken; the tags have been removed. A thorough search reveals a rare mulburstrawberlyberry chewing gum tucked in a pocket.",
          requiredPoiIds: ["landing-zone-prefab"],
          itemIds: ["mulburstrawberlyberry-gum"],
        },
        {
          id: "prefab-terminal",
          name: "Locked Security Terminal",
          description:
            "A terminal still drawing power. Locked. If bypassed, it could override the base Airlock door system. The security footage option shows landing zone cameras—the feed is too fuzzy to make out details, but faint high-pitched noises followed by screaming can be heard.",
          requiredPoiIds: ["landing-zone-prefab"],
          puzzleId: "prefab-terminal",
        },
        {
          id: "tread-tracks",
          name: "Deep Tread Tracks",
          description:
            "Heavy vehicle tracks pressed deep into the mud. Path A.1 follows them to the Airlock exterior—a route to get out of the rain and storm. Closer inspection reveals a fork where the trail splits.",
          connectedTo: ["outside-airlock"],
          requiredPoiIds: ["investigate-area"],
        },
        {
          id: "greta-base-view",
          name: "Greta Base (Distant)",
          description:
            "In the distance ahead: Greta Base. Lights out. Unresponsive to hailing. The tread tracks lead straight toward it.",
          requiredPoiIds: ["investigate-area"],
        },
        {
          id: "trail-fork",
          name: "Fork in the Trail",
          description:
            "A muddy fork in the trail. Path A.2 winds around the back of the base toward the Garage.",
          connectedTo: ["outside-garage"],
          requiredPoiIds: ["tread-tracks"],
        },
      ],
    },
    outsideAirlockLocation,
    outsideGarageLocation,
    {
      id: "greta-base",
      name: "Greta Base",
      description:
        "Abandoned terraforming facility. Accessible via the Airlock (front) or the Garage (back). All but emergency power is out. A powerful tropical storm is rolling in. The trail to Heron Station is impassable in these conditions.",
      connectedLocationIds: ["outside-airlock", "outside-garage"],
    },
    {
      id: "heron-station",
      name: "Heron Station",
      description:
        "A river bank clearing in the middle of dense jungle. The terraforming station sits against a fast-flowing river. Currently inaccessible—the tropical storm has made the trails impassable.",
      connectedLocationIds: [],
    },
    {
      id: "mothership",
      name: "Mothership",
      description: "Location not yet discovered.",
      connectedLocationIds: ["greta-base"],
      isHiddenAtStart: true,
    },
    ...gretaBaseLocations,
  ],
  defaultLocationId: THE_METAMORPHOSIS_ID,
  planetMap: samsaVIPlanetMap,
  regionInternalLocationIds: REGION_INTERNAL_LOCATION_IDS,
};
