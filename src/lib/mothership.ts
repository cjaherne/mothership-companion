/**
 * Mothership RPG character creation rules (Player's Survival Guide v1.2)
 *
 * Stats: 2d10+25 per stat (STR, SPD, INT, CBT)
 * Saves: 2d10+10 per save (SAN, FEAR, BOD)
 * Health: 1d10+10 (Maximum Health, NOT equal to Strength)
 * Credits: 2d10×10
 * Loadouts: Roll 1d10 on class-specific table
 * Trinket & Patch: Roll D100
 */

export type MothershipClass = "marine" | "android" | "scientist" | "teamster";

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
  maxWounds: number;
  /** Full loadout description from class table */
  loadout: string;
  trinket: string;
  patch: string;
  credits: number;
}

function roll1d10(): number {
  return Math.floor(Math.random() * 10) + 1;
}

function roll2d10(): number {
  return roll1d10() + roll1d10();
}

/** Stats: 2d10+25 each. Range 27-45. */
function rollStat(): number {
  return roll2d10() + 25;
}

/** Saves: 2d10+10 each. Range 12-30. */
function rollSave(): number {
  return roll2d10() + 10;
}

/** Health: 1d10+10. Range 11-20. */
function rollHealth(): number {
  return roll1d10() + 10;
}

/** Credits: 2d10×10. */
function rollCredits(): number {
  return roll2d10() * 10;
}

/** Class modifiers per Player's Survival Guide p.4-5 */
function applyClassModifiers(
  stats: MothershipStats,
  cls: MothershipClass
): MothershipStats {
  const result = { ...stats };
  switch (cls) {
    case "marine":
      result.combat += 10;
      result.body += 10;
      result.fear += 20;
      break;
    case "android": {
      result.intellect += 20;
      const reduce = ["strength", "speed", "combat"] as const;
      const key = reduce[Math.floor(Math.random() * reduce.length)];
      result[key] = Math.max(1, result[key] - 10);
      result.fear += 60;
      break;
    }
    case "scientist":
      result.intellect += 10;
      result.sanity += 30;
      result.strength = Math.min(85, result.strength + 5);
      break;
    case "teamster":
      result.strength = Math.min(85, result.strength + 5);
      result.speed = Math.min(85, result.speed + 5);
      result.intellect = Math.min(85, result.intellect + 5);
      result.combat = Math.min(85, result.combat + 5);
      result.sanity = Math.min(85, result.sanity + 10);
      result.fear = Math.min(85, result.fear + 10);
      result.body = Math.min(85, result.body + 10);
      break;
  }
  return result;
}

/** Loadout tables from Player's Survival Guide p.7 */
const MARINE_LOADOUTS = [
  "Tank Top and Camo Pants (AP 1), Combat Knife (as Scalpel DMG [+]), Stimpak (x5)",
  "Advanced Battle Dress (AP 10), Flamethrower (4 shots), Boarding Axe",
  "Standard Battle Dress (AP 7), Combat Shotgun (4 rounds), Rucksack, Camping Gear",
  "Standard Battle Dress (AP 7), Pulse Rifle (3 mags), Infrared Goggles",
  "Standard Battle Dress (AP 7), Smart Rifle (3 mags), Binoculars, Personal Locator",
  "Standard Battle Dress (AP 7), SMG (3 mags), MRE (x7)",
  "Fatigues (AP 2), Combat Shotgun (2 rounds), Dog (pet), Leash, Tennis Ball",
  "Fatigues (AP 2), Revolver (12 rounds), Frag Grenade",
  "Dress Uniform (AP 1), Revolver (1 round), Challenge Coin",
  "Advanced Battle Dress (AP 10), General-Purpose Machine Gun (1 Can of ammo), HUD",
];

const ANDROID_LOADOUTS = [
  "Vaccsuit (AP 3), Smart Rifle (2 mags), Infrared Goggles, Mylar Blanket",
  "Vaccsuit (AP 3), Revolver (12 rounds), Long-range Comms, Satchel",
  "Hazard Suit (AP 5), Revolver (6 rounds), Defibrillator, First Aid Kit, Flashlight",
  "Hazard Suit (AP 5), Foam Gun (2 charges), Sample Collection Kit, Screwdriver (as Assorted Tools)",
  "Standard Battle Dress (AP 7), Tranq Pistol (3 shots), Paracord (100m)",
  "Standard Crew Attire (AP 1), Stun Baton, Small Pet (organic)",
  "Standard Crew Attire (AP 1), Scalpel, Bioscanner",
  "Standard Crew Attire (AP 1), Frag Grenade, Pen Knife",
  "Manufacturer Supplied Attire (AP 1), Jump-9 Ticket (destination blank)",
  "Corporate Attire (AP 1), VIP Corporate Key Card",
];

const SCIENTIST_LOADOUTS = [
  "Hazard Suit (AP 5), Tranq Pistol (3 shots), Bioscanner, Sample Collection Kit",
  "Hazard Suit (AP 5), Flamethrower (1 charge), Stimpak, Electronic Tool Set",
  "Vaccsuit (AP 3), Rigging Gun, Sample Collection Kit, Flashlight, Lab Rat (pet)",
  "Vaccsuit (AP 3), Foam Gun (2 charges), Foldable Stretcher, First Aid Kit, Radiation Pills (x5)",
  "Lab Coat (AP 1), Screwdriver (as Assorted Tools), Medscanner, Vaccine (1 dose)",
  "Lab Coat (AP 1), Cybernetic Diagnostic Scanner, Portable Computer Terminal",
  "Scrubs (AP 1), Scalpel, Automed (x5), Oxygen Tank with Filter Mask",
  "Scrubs (AP 1), Vial of Acid, Mylar Blanket, First Aid Kit",
  "Standard Crew Attire (AP 1), Utility Knife (as Scalpel), Cybernetic Diagnostic Scanner, Duct Tape",
  "Civilian Clothes (AP 1), Briefcase, Prescription Pad, Fountain Pen (Poison Injector)",
];

const TEAMSTER_LOADOUTS = [
  "Vaccsuit (AP 3), Laser Cutter (1 extra battery), Patch Kit (x3), Toolbelt with Assorted Tools",
  "Vaccsuit (AP 3), Revolver (6 rounds), Crowbar, Flashlight",
  "Vaccsuit (AP 3), Rigging Gun (1 shot), Shovel, Salvage Drone",
  "Hazard Suit (AP 5), Vibechete, Spanner, Camping Gear, Water Filtration Device",
  "Heavy Duty Work Clothes (AP 2), Explosives & Detonator, Cigarettes",
  "Heavy Duty Work Clothes (AP 2), Drill (as Assorted Tools), Paracord (100m), Salvage Drone",
  "Standard Crew Attire (AP 1), Combat Shotgun (4 rounds), Extension Cord (20m), Cat (pet)",
  "Standard Crew Attire (AP 1), Nail Gun (32 rounds), Head Lamp, Toolbelt with Assorted Tools, Lunch Box",
  "Standard Crew Attire (AP 1), Flare Gun (2 rounds), Water Filtration Device, Personal Locator, Subsurface Scanner",
  "Lounge Wear (AP 1), Crowbar, Stimpak, Six Pack of Beer",
];

function getClassLoadouts(cls: MothershipClass): string[] {
  switch (cls) {
    case "marine": return MARINE_LOADOUTS;
    case "android": return ANDROID_LOADOUTS;
    case "scientist": return SCIENTIST_LOADOUTS;
    case "teamster": return TEAMSTER_LOADOUTS;
  }
}

/** Trinkets D100 table - subset from Player's Survival Guide p.8 */
const TRINKETS = [
  "Manual: PANIC: Harbinger of Catastrophe", "Antique Company Scrip (Asteroid Mine)",
  "Manual: SURVIVAL: Eat Soup With a Knife", "Desiccated Husk Doll", "Pressed Alien Flower (common)",
  "Necklace of Shell Casings", "Corroded Android Logic Core", "Pamphlet: Signs of Parasitical Infection",
  "Manual: Treat Your Rifle Like A Lady", "Bone Knife", "Calendar: Alien Pin-Up Art",
  "Rejected Application (Colony Ship)", "Holographic Serpentine Dancer", "Snake Whiskey",
  "Medical Container, Purple Powder", "Casino Playing Cards", "Lagomorph Foot", "Moonstone Ring",
  "Manual: Mining Safety and You", "Pamphlet: Against Human Simulacra", "Animal Skull, 3 Eyes, Curled Horns",
  "Bartender's Certification (Expired)", "Bunraku Puppet", "Prospecting Mug, Dented", "Eerie Mask",
  "Ultrablack Marble", "Ivory Dice", "Tarot Cards, Worn, Pyrite Gilded Edges", "Bag of Assorted Teeth",
  "Ashes (A Relative)", "DNR Beacon Necklace", "Cigarettes (Grinning Skull)", "Pills: Areca Nut",
  "Pendant: Shell Fragments Suspended in Plastic", "Pamphlet: Zen and the Art of Cargo Arrangement",
  "Pair of Shot Glasses (Spent Shotgun Shells)", "Key (Childhood Home)", "Dog Tags (Heirloom)",
  "Token: Is Your Morale Improving?", "Pamphlet: The Relic of Flesh", "Pamphlet: The Indifferent Stars",
  "Calendar: Military Battles", "Manual: Rich Captain, Poor Captain", "Chibi Cthulhu",
  "Campaign Poster (Home Planet)", "Preserved Insectile Aberration", "Titanium Toothpick",
  "Gloves, Leather (Xenomorph Hide)", "Smut (Seditious): The Captain, Ordered", "Towel, Slightly Frayed",
  "Brass Knuckles", "Fuzzy Handcuffs", "Journal of Grudges", "Stylized Cigarette Case",
  "Ball of Assorted Gauge Wire", "Spanner", "Switchblade, Ornamental", "Powdered Xenomorph Horn",
  "Bonsai Tree, Potted", "Golf Club (Putter)", "Trilobite Fossil", "Pamphlet: A Lover In Every Port",
  "Patched Overalls, Personalized", "Fleshy Thing Sealed in a Murky Jar", "Spiked Bracelet",
  "Harmonica", "Pictorial Pornography, Dog-eared, Well-thumbed", "Interstellar Compass, Always Points to Homeworld",
  "Coffee Cup, Chipped, reads: HAPPINESS IS MANDATORY", "Manual: Moonshining With Gun Oil & Fuel",
  "Miniature Chess Set, Bone, Pieces Missing", "Gyroscope, Bent, Tin", "Faded Green Poker Chip",
  "Ukulele", "Spray Paint", "Wanted Poster, Weathered", "Locket, Hair Braid", "Sculpture of a Rat (Gold)",
  "Blanket, Fire Retardant", "Hooded Parka, Fleece-Lined", "BB Gun", "Flint Hatchet",
  "Pendant: Two Astronauts form a Skull", "Rubik's Cube", "Stress Ball, reads: Zero Stress in Zero G",
  "Sputnik Pin", "Ushanka", "Trucker Cap, Mesh, Grey Alien Logo", "Menthol Balm", "Pith Helmet",
  "10m x 10m Tarp", "I Ching, Missing Sticks", "Kukri", "Trench Shovel", "Shiv, Sharpened Butter Knife",
  "Taxidermied Cat", "Pamphlet: Interpreting Sheep Dreams", "Faded Photograph, A Windswept Heath",
  "Opera Glasses", "Pamphlet: Android Overlords", "Poker Hand: Dead Man's Hand",
];

/** Patches D100 table - subset from Player's Survival Guide p.9 */
const PATCHES = [
  "I'm Not A Rocket Scientist / But You're An Idiot", "Medic Patch (Skull and Crossbones over Cross)",
  "Don't Run You'll Only Die Tired Backpatch", "Red Shirt Logo", "Blood Type (Reference Patch)",
  "Do I LOOK Like An Expert?", "Biohazard Symbol", "Mr. Yuck", "Nuclear Symbol", "Eat The Rich",
  "Be Sure: Doubletap", "Flame Emoji", "Smiley Face (Glow in the Dark)", "Smile: Big Brother is Watching",
  "Jolly Roger", "Viking Skull", "APEX PREDATOR (Sabertooth Skull)", "Pin-Up Model (Ace of Spades)",
  "Queen of Hearts", "Security Guard", "LONER", "Front Towards Enemy (Claymore Mine)",
  "Pin-Up Model (Riding Missile)", "FUBAR", "I'm A (Love) Machine", "Pin-Up Model (Mechanic)",
  "HELLO MY NAME IS:", "Powered By Coffee", "Take Me To Your Leader (UFO)", "DO YOUR JOB",
  "Take My Life (Please)", "Upstanding Citizen", "Allergic To Bullshit (Medical Style Patch)",
  "Fix Me First (Caduceus)", "I Like My Tools Clean / And My Lovers Dirty",
  "The Louder You Scream the Faster I Come (Nurse Pin-Up)", "HMFIC", "Dove in Crosshairs",
  "BOHICA", "I Am My Brother's Keeper", "Mama Tried", "Black Widow Spider",
  "My Other Ride Married You", "One Size Fits All (Grenade)", "Grim Reaper Backpatch",
  "отъебись (Fuck Off, Russian)", "Smooth Operator", "Atom Symbol", "For Science!",
  "Actually, I AM A Rocket Scientist", "Help Wanted", "Princess", "NOMAD", "GOOD BOY",
  "Dice (Snake Eyes)", "#1 Worker", "Good (Brain)", "Bad Bitch", "Too Pretty To Die",
  "Fuck Forever (Roses)", "Icarus", "Girl's Best Friend (Diamond)", "Risk of Electrocution Symbol",
  "Inverted Cross", "Do You Sign My Paychecks? Backpatch", "I ♥ Myself", "Double Cherry",
  "Volunteer", "Poker Hand: Dead Man's Hand",
];

function rollD100(): number {
  return Math.floor(Math.random() * 100);
}

export function rollRandomStats(): MothershipStats {
  return {
    strength: rollStat(),
    speed: rollStat(),
    intellect: rollStat(),
    combat: rollStat(),
    sanity: rollSave(),
    fear: rollSave(),
    body: rollSave(),
  };
}

export function createRandomMothershipCharacter(): MothershipCharacterData {
  const classes: MothershipClass[] = ["marine", "android", "scientist", "teamster"];
  const cls = classes[Math.floor(Math.random() * classes.length)];

  let stats = rollRandomStats();
  stats = applyClassModifiers(stats, cls);

  const health = rollHealth();
  const maxWounds = cls === "marine" || cls === "android" ? 3 : 2;

  const loadouts = getClassLoadouts(cls);
  const loadout = loadouts[Math.floor(Math.random() * loadouts.length)];

  const trinket = TRINKETS[rollD100() % TRINKETS.length];
  const patch = PATCHES[rollD100() % PATCHES.length];
  const credits = rollCredits();

  return {
    class: cls,
    stats,
    health,
    maxWounds,
    loadout,
    trinket,
    patch,
    credits,
  };
}

export const CLASS_NAMES: Record<MothershipClass, string> = {
  marine: "Marine",
  android: "Android",
  scientist: "Scientist",
  teamster: "Teamster",
};

/** Pick one element from an array at random */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Mothership-appropriate character names (last names, military/corporate/sci-fi) */
const CHARACTER_NAMES = [
  "Vasquez", "Hicks", "Drake", "Frost", "Hudson", "Apone", "Ripley", "Lambert",
  "Kane", "Dallas", "Brett", "Parker", "Ash", "Dietrich", "Ferro", "Gorman",
  "Spunkmeyer", "Wierzbowski", "Crowe", "Boggs", "Cole",
  "Saito", "Moreau", "Kowalski", "Chen", "O'Brien", "Reed", "Volkov",
  "Nielsen", "Torres", "Marino", "Kovac", "Singh", "Okonkwo", "Tanaka",
  "Rodriguez", "Novak", "Petrov", "Kim", "Nguyen", "Zhao", "Berg",
];

/** Trait + personality archetypes (generated together for consistency) */
const TRAIT_PERSONALITY_ARCHETYPES: { traits: string; personality: string }[] = [
  { traits: "paranoid, tactical, twitchy", personality: "Sees threats everywhere. Checks corners, trusts no one. Years in the black have left them jumpy—useful in a firefight, exhausting in the mess hall." },
  { traits: "cynical, hardened, deadpan", personality: "Nothing surprises them anymore. Seen too much, lost too many. Speaks in flat monosyllables. Still does the job." },
  { traits: "loyal, protective, stubborn", personality: "Looks out for the crew. Won't leave anyone behind. Once they've decided you're on their side, they'll go through hell for you." },
  { traits: "reckless, thrill-seeking, overconfident", personality: "Lives for the rush. Volunteers for the dangerous runs. Thinks they're invincible—usually learns otherwise the hard way." },
  { traits: "methodical, quiet, observant", personality: "Speaks little, notices everything. Keeps a running tally of who's trustworthy. When they finally speak up, people listen." },
  { traits: "sarcastic, quick-witted, evasive", personality: "Deflects with humor. Doesn't like talking about the past. Uses jokes to keep people at arm's length." },
  { traits: "stoic, disciplined, by-the-book", personality: "Follows protocol. Doesn't improvise well. Reliable under pressure when the rules apply—less so when they don't." },
  { traits: "curious, naive, idealistic", personality: "New to the black. Thinks they can make a difference. The kind of optimism that gets people killed—or saves them." },
  { traits: "pragmatic, ruthless, survivalist", personality: "Does what it takes. Doesn't lose sleep over hard choices. Might cut you loose if you're slowing the group down." },
  { traits: "haunted, jumpy, guilt-ridden", personality: "Survivor's guilt. Sees the dead in their sleep. Keeps moving so the memories don't catch up." },
  { traits: "charming, manipulative, self-serving", personality: "Gets people to like them. Good at reading a room. Always has an angle—sometimes it's just staying alive." },
  { traits: "technical, precise, socially awkward", personality: "Better with machines than people. Explains things in jargon. Surprisingly reliable when the systems go haywire." },
  { traits: "protective, parental, anxious", personality: "Treats the crew like family. Frets over everyone's safety. The one who remembers to check life support." },
  { traits: "bitter, resentful, dutiful", personality: "Signed up for the wrong reasons. Hates the job but does it anyway. Grumbles constantly—still pulls their weight." },
  { traits: "superstitious, ritualistic, jumpy", personality: "Has lucky charms. Won't leave port on certain days. The black does things to people—they've seen enough to believe." },
  { traits: "cold, analytical, detached", personality: "Treats situations as data. Low emotional output. Might be an android—or just someone who shut down a long time ago." },
  { traits: "weary, resigned, gallows humor", personality: "Expects the worst. Cracks jokes about it. Been through enough cycles to know how these things end." },
  { traits: "determined, driven, obsessive", personality: "Has a mission. Won't let anything stop them. The kind of focus that saves the day—or gets everyone killed." },
  { traits: "cheerful, oblivious, accident-prone", personality: "Somehow always fine. Doesn't seem to notice the danger. Crew isn't sure if they're lucky or cursed." },
  { traits: "secretive, haunted, watchful", personality: "Hiding something. Maybe from the Company. Maybe from themselves. Keeps to the edges of conversations." },
];

/** Returns a random character name (single name, suitable for military/corporate callsigns) */
export function rollRandomName(): string {
  return pick(CHARACTER_NAMES);
}

/** Returns random traits and personality as a pair (consistent with each other) */
export function rollRandomTraitsAndPersonality(): { traits: string; personality: string } {
  return pick(TRAIT_PERSONALITY_ARCHETYPES);
}
