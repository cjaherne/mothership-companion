/**
 * Mothership RPG character creation rules and helpers
 *
 * Based on Mothership 1e rules. Stats: Strength, Speed, Intellect, Combat.
 * Saves: Sanity, Fear, Body. Roll 2d10 per stat (×2 for range 4–200, max 85 with modifiers).
 * Simplified: roll 2d10, sum, ×2, add class modifier, cap 85.
 * Health = Strength.
 */

export type MothershipClass = "marine" | "android" | "scientist" | "teamster";

export type MothershipLoadout =
  | "excavation"
  | "exploration"
  | "extermination"
  | "examination";

export interface MothershipStats {
  strength: number;
  speed: number;
  intellect: number;
  combat: number;
  sanity: number;
  fear: number;
  body: number;
}

export interface MothershipCharacterData {
  class: MothershipClass;
  stats: MothershipStats;
  health: number;
  loadout: MothershipLoadout;
  trinket: string;
  patch: string;
  credits: number;
}

const CLASS_MODIFIERS: Record<
  MothershipClass,
  { strength?: number; speed?: number; intellect?: number; combat?: number }
> = {
  marine: { combat: 5 },
  android: { speed: 5, intellect: 5 },
  scientist: { intellect: 10 },
  teamster: { strength: 5, speed: 5 },
};

const LOADOUT_ITEMS: Record<MothershipLoadout, string[]> = {
  excavation: [
    "Crowbar",
    "Hand Welder",
    "Laser Cutter",
    "Bioscanner",
    "Vaccsuit",
    "Tools",
  ],
  exploration: [
    "Vibechete",
    "Survey Kit",
    "Vaccsuit",
    "Camping Gear",
    "Survival equipment",
  ],
  extermination: [
    "SMG",
    "Frag Grenades",
    "Battle Dress",
    "Stimpack",
    "Combat gear",
  ],
  examination: [
    "Medical tools",
    "Tranq Pistol",
    "Hazard Suit",
    "Medscanner",
    "Medical supplies",
  ],
};

const TRINKETS = [
  "Worn photo",
  "Lucky coin",
  "Broken compass",
  "Child's drawing",
  "Dog tags",
  "Tarnished medal",
  "Handwritten letter",
  "Pocket knife",
  "Old watch",
  "Patch from old unit",
  "Bottle cap collection",
  "Crushed cigarette pack",
  "Faded ticket stub",
  "Rusty key",
  "Dried flower",
];

const PATCHES = [
  "Skull",
  "Anchor",
  "Lightning bolt",
  "Planet",
  "Star",
  "Crossbones",
  "Shield",
  "Wrench",
  "Flame",
  "Cog",
  "Target",
  "Wing",
  "Arrow",
  "Medal",
  "Chain",
];

const MAX_STAT = 85;

function roll2d10(): number {
  return Math.floor(Math.random() * 10) + 1 + Math.floor(Math.random() * 10) + 1;
}

function rollStat(): number {
  return Math.min(MAX_STAT, roll2d10() * 2);
}

function rollCredits(): number {
  let sum = 0;
  for (let i = 0; i < 5; i++) {
    sum += Math.floor(Math.random() * 10) + 1;
  }
  return sum * 10;
}

export function rollRandomStats(): MothershipStats {
  return {
    strength: rollStat(),
    speed: rollStat(),
    intellect: rollStat(),
    combat: rollStat(),
    sanity: rollStat(),
    fear: rollStat(),
    body: rollStat(),
  };
}

export function applyClassModifiers(
  stats: MothershipStats,
  cls: MothershipClass
): MothershipStats {
  const mods = CLASS_MODIFIERS[cls];
  const result = { ...stats };
  if (mods.strength) result.strength = Math.min(MAX_STAT, result.strength + mods.strength);
  if (mods.speed) result.speed = Math.min(MAX_STAT, result.speed + mods.speed);
  if (mods.intellect) result.intellect = Math.min(MAX_STAT, result.intellect + mods.intellect);
  if (mods.combat) result.combat = Math.min(MAX_STAT, result.combat + mods.combat);
  return result;
}

export function createRandomMothershipCharacter(): MothershipCharacterData {
  const classes: MothershipClass[] = ["marine", "android", "scientist", "teamster"];
  const loadouts: MothershipLoadout[] = [
    "excavation",
    "exploration",
    "extermination",
    "examination",
  ];

  const cls = classes[Math.floor(Math.random() * classes.length)];
  const loadout = loadouts[Math.floor(Math.random() * loadouts.length)];

  let stats = rollRandomStats();
  stats = applyClassModifiers(stats, cls);

  const health = stats.strength;

  const trinket = TRINKETS[Math.floor(Math.random() * TRINKETS.length)];
  const patch = PATCHES[Math.floor(Math.random() * PATCHES.length)];
  const credits = rollCredits();

  return {
    class: cls,
    stats,
    health,
    loadout,
    trinket,
    patch,
    credits,
  };
}

export function getLoadoutItems(loadout: MothershipLoadout): string[] {
  return LOADOUT_ITEMS[loadout];
}

export const CLASS_NAMES: Record<MothershipClass, string> = {
  marine: "Marine",
  android: "Android",
  scientist: "Scientist",
  teamster: "Teamster",
};

export const LOADOUT_NAMES: Record<MothershipLoadout, string> = {
  excavation: "Excavation",
  exploration: "Exploration",
  extermination: "Extermination",
  examination: "Examination",
};
