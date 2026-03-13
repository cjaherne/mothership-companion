/**
 * Another Bug Hunt - Item registry
 *
 * Canonical item definitions for POI loot, starting gear, keys, and crafting.
 */

import { getLoadoutDisplayText } from "@/lib/mothership";
import type { Item } from "@/types/item";

export const ANOTHER_BUG_HUNT_ITEMS: Record<string, Item> = {
  // Medbay Operating Room
  "carcinid-larva-contained": {
    id: "carcinid-larva-contained",
    name: "Carcinid larva (x4, contained)",
    description: "Four large glass tubes, each holding a developing carcinid larva.",
  },
  "hydrofluoric-acid": {
    id: "hydrofluoric-acid",
    name: "Hydrofluoric acid",
    description: "Inside a heavy lead container.",
  },

  // Airlock storage lockers
  "hazard-suit": {
    id: "hazard-suit",
    name: "Hazard suit",
  },
  "pulse-rifle-magazine-x2": {
    id: "pulse-rifle-magazine-x2",
    name: "Pulse rifle magazine (x2)",
  },
  rosary: {
    id: "rosary",
    name: "Rosary",
  },

  // Commissary / corpses
  "dog-tags-xavier": {
    id: "dog-tags-xavier",
    name: "Dog tags: LCpl Xavier",
  },
  "dog-tags-lange": {
    id: "dog-tags-lange",
    name: "Dog tags: 2ndLt Lange",
  },
  "dog-tags-kaplan": {
    id: "dog-tags-kaplan",
    name: "Dog tags: 2ndLt Kaplan",
  },
  "dog-tags-olsson": {
    id: "dog-tags-olsson",
    name: "Dog tags: PFC Olsson",
  },
  "dog-tags-abara": {
    id: "dog-tags-abara",
    name: "Dog tags: Sgt Abara",
  },

  // Pantry
  "mres-large-pile": {
    id: "mres-large-pile",
    name: "MREs (large pile)",
    description: "Rations pulled from every shelf and stacked in rough piles.",
  },

  // Freezer
  "vacuum-tumbler-hydrofluoric": {
    id: "vacuum-tumbler-hydrofluoric",
    name: "Vacuum tumbler (frozen hydrofluoric acid)",
    description: "Clutched by frozen marine. If taken, fingers snap off (Fear Save).",
  },
  "frozen-chemotherapeutic-agents": {
    id: "frozen-chemotherapeutic-agents",
    name: "Frozen chemotherapeutic agents (25L)",
    description: "Used to treat extreme radiation damage.",
  },

  // Crew Habitat
  "stimpak-toilet-tank": {
    id: "stimpak-toilet-tank",
    name: "Stimpak (inside toilet tank)",
  },
  "frag-grenade-x2": {
    id: "frag-grenade-x2",
    name: "Frag grenade (x2)",
  },
  "butterfly-knife": {
    id: "butterfly-knife",
    name: "Butterfly knife",
  },
  "journal-brookman-ivanovic": {
    id: "journal-brookman-ivanovic",
    name: "Journal (Brookman / Ivanovic relationship)",
  },
  "pornographic-magazines": {
    id: "pornographic-magazines",
    name: "Pornographic magazines (Jump Humpers)",
  },
  "cigarettes-richter-blue": {
    id: "cigarettes-richter-blue",
    name: "Cigarettes — Richter Blue (x8 packs)",
  },
  "duty-roster": {
    id: "duty-roster",
    name: "Duty roster",
  },
  "personnel-list-edem-hinton": {
    id: "personnel-list-edem-hinton",
    name: "Personnel list (Dr. Edem; Hinton — Logic Core only)",
  },
  "photograph-kaplan-family": {
    id: "photograph-kaplan-family",
    name: "Photograph (Kaplan family)",
  },
  "samsa-vi-planetary-survey": {
    id: "samsa-vi-planetary-survey",
    name: "Samsa VI planetary survey",
  },
  "revolver-12-bullets": {
    id: "revolver-12-bullets",
    name: "Revolver (12 bullets) — cam-locked drawer",
  },
  "hinton-personal-locator": {
    id: "hinton-personal-locator",
    name: "Hinton's personal locator tracker — cam-locked drawer",
    description: "Shows Hinton's location as the foothills of a nearby mountain.",
  },
  "bao-neumann-bzt-console": {
    id: "bao-neumann-bzt-console",
    name: "Bao-Neumann 'BZT' gaming console",
  },
  "marijuana-plant": {
    id: "marijuana-plant",
    name: "Marijuana plant",
  },
  "the-auctioneer-book": {
    id: "the-auctioneer-book",
    name: "'The Auctioneer' by Joan Samson",
  },
  "anime-body-pillow": {
    id: "anime-body-pillow",
    name: "Anime body pillow",
  },
  "weather-charts-storm": {
    id: "weather-charts-storm",
    name: "Weather charts (storm incoming)",
  },
  "birthday-card-olsson": {
    id: "birthday-card-olsson",
    name: "Birthday card to Olsson (unopened)",
    description: "'Thanks for always listening. Happy 47th. –E'",
  },

  // Command Center
  "revolver-5-shots": {
    id: "revolver-5-shots",
    name: "Revolver (5 shots remaining)",
  },
  "samsa-vi-org-chart": {
    id: "samsa-vi-org-chart",
    name: "Samsa VI Org Chart",
  },

  // Garage
  crowbar: {
    id: "crowbar",
    name: "Crowbar",
  },
  flashlight: {
    id: "flashlight",
    name: "Flashlight",
  },
  "patch-kit": {
    id: "patch-kit",
    name: "Patch kit",
  },
  "nail-gun-x1000": {
    id: "nail-gun-x1000",
    name: "Nail gun (box of x1000 shots)",
  },
  "hand-welder": {
    id: "hand-welder",
    name: "Hand welder",
  },
  "fuel-barrel-x6": {
    id: "fuel-barrel-x6",
    name: "Fuel barrel (x6)",
    description: "For the backup generator.",
  },

  // Keys / keycards (for location unlocks - to be found later)
  "airlock-keycard": {
    id: "airlock-keycard",
    name: "Airlock keycard",
    description: "Opens exterior and interior airlock doors.",
  },
  "interior-keycard": {
    id: "interior-keycard",
    name: "Interior keycard",
    description: "Opens interior airlock door to commissary.",
  },
  "edem-keycard": {
    id: "edem-keycard",
    name: "Dr. Edem's keycard",
    description: "Opens the Medbay Operating Room door.",
  },
  "freezer-keycard": {
    id: "freezer-keycard",
    name: "Freezer keycard",
    description: "Opens the Walk-in Freezer door.",
  },
  "greta-base-schematics": {
    id: "greta-base-schematics",
    name: "Greta Base Schematics",
    description: "Complete floorplan showing all rooms, doors, and ventilation ducts.",
  },
  "mulburstrawberlyberry-gum": {
    id: "mulburstrawberlyberry-gum",
    name: "Mulburstrawberlyberry chewing gum",
    description: "Rare vintage gum. Distinctive purple wrapper. Apparently a family heirloom to some.",
  },
  "debt-slip-50cr": {
    id: "debt-slip-50cr",
    name: "Debt slip (50cr)",
    description: "A handwritten IOU from Renfield for 50 credits. Collectable at Last Light Station.",
  },

  // Crafted items
  "makeshift-tool": {
    id: "makeshift-tool",
    name: "Makeshift tool",
    description: "Crowbar welded to hand welder. Jury-rigged but effective.",
  },
};

/** Get item by ID, or undefined if not found */
export function getItem(itemId: string): Item | undefined {
  return ANOTHER_BUG_HUNT_ITEMS[itemId];
}

/** Resolve item IDs to display names; fallback to ID for unknown items */
export function getItemName(itemId: string): string {
  const loadoutText = getLoadoutDisplayText(itemId);
  if (loadoutText !== itemId) return loadoutText;
  return ANOTHER_BUG_HUNT_ITEMS[itemId]?.name ?? itemId;
}
