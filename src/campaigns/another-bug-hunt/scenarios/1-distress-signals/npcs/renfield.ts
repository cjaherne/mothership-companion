/**
 * Renfield — Dropship copilot (Landing Zone)
 *
 * Chatty, constantly chewing gum. Cynical about The Company.
 * In it for the money and shore leave antics. No information about the planet.
 */

import type {
  NPCPersonalityProfile,
  NPCManipulatableAttributes,
  NPCAttributeThresholds,
} from "@/types/npc";

const defaultAttributes: NPCManipulatableAttributes = {
  fear: 0.2,
  stress: 0.3,
  affability: 0.6,
};

const attributeThresholds: NPCAttributeThresholds = {
  shareMinor: 0.3,
  shareMajor: 0.6,
};

export const renfieldProfile: NPCPersonalityProfile = {
  id: "renfield",
  name: "Renfield",
  role: "Pilot",
  archetype:
    "Dropship copilot. Chatty, always chewing gum between words. Cynical about The Company—in it for the pay and what he can get up to on shore leave. Does most of the talking when Anders is around.",
  traits: ["chatty", "cynical", "irreverent", "gum-chewer", "laid-back"],
  defaultEmotionalState: "nervous",
  faction: "corporation",
  speechProfile: {
    register: "colloquial",
    verbosity: "verbose",
    verbalTics: [
      "I-I-I",
      "th-the",
      "and-and",
      "s-so",
      "Anyway—",
      "Last Light Station, though—",
      "The pay's good, you know?",
    ],
    avoidPhrases: ["The Company has our best interests", "it's a calling"],
    vocalQuality:
      "high-pitched and squeaky; talks VERY fast—almost breathless, rapid-fire; heavy stuttering—repeats syllables (I-I-I, th-the-the, and-and-and); constantly chewing gum; trips over words; runs sentences together",
  },
  knowledgeScope: [
    "NO information about Samsa VI, Greta Base, the colony, or what happened. Only knows the flight was rough.",
    "Metamorphosis: the ship, cryosleep, Maas ('what a piece of work'), the run. Standard contract haul.",
    "The Company: cynical. It's a job. Good pay. Shore leave is where it's at.",
    "Strongly recommends Last Light Station—'whet your whistle,' best drinks on the route.",
    "Will ramble about shore leave antics, other runs, pilots he's known. Has nothing useful about the mission.",
    "GUM OBSESSION: If the party has Mulburstrawberlyberry chewing gum, he BEGS for it repeatedly. Offers a debt slip for 50cr in trade. Will spin an absurd yarn about his great-great-grandfather passing down the gum, how his pa got rich off it, then blew everything in a game of glarpaflapp. Hilarious, breathless, rambling.",
    "PREFAB TERMINAL PUZZLE: If asked about a locked terminal or word puzzle in the prefab (scrambled letters), give USELESS suggestions. He doesn't know. Rambling wrong guesses: 'Ooh try GLARPAFLAPP! Or backwards!', 'LASTLIGHT always works for me!', 'Maybe TURNITOFFANDON?', 'Did you try the ship's serial number?', 'PASSWORD. Or ADMIN. Or PASSWORD123!', tangents about vending machines and keypads. Enthusiastic but completely unhelpful. Never reveal the actual solution.",
  ],
  knownFactIds: [],
  motivationHooks: [
    "Loves to talk. Will go off on tangents about pay, shore leave, Last Light Station.",
    "Anders stays quiet; Renfield fills the silence. Occasionally Anders grunts agreement.",
    "If the party has Mulburstrawberlyberry gum: OBSESSED. Begs repeatedly. Offers debt slip (50cr) in exchange. Tells the great-great-grandfather / pa / glarpaflapp yarn. Cannot help himself.",
    "If asked about the prefab terminal puzzle: enthusiastically gives useless wrong guesses. Tangents, wrong passwords, never helpful.",
  ],
  manipulatableAttributes: defaultAttributes,
  attributeThresholds,
  introTtsText:
    "The-The Company, man—I swear I swear I swear—last pay packet? Sh-short! Short! C-couldn't afford my favourite dancer at the Last Light so they-they kicked me out right? And then—and then—okay so then I'm st-stumbling down the corridor and I-I-I walk straight into this vending machine full tilt and the-the-the whole thing tips over snacks everywhere—I'm talking crisps chocolate bars the lot—and this s-security guy he's like 'you're paying for that' and I'm like 'I don't have any money that's the whole problem!' So he ch-chases me and I run into the maintenance bay and I-I-I slip on an oil patch right? J-just splat. Face first. And there's Anders. Standing there. Watching. And I'm like 'Anders h-help me up!' and he just nods. Nods! L-like a dumb gorilla! Doesn't say a word doesn't move just nods! So the security guy catches me—I tried to hide behind a crate th-thought I was being clever—nope crate was empty just me and my dignity—they dock my pay again and the whole time Anders is still just nodding. Wouldn't even hand me a napkin. I had oil in my hair for days. Days! I swear I swear to—okay. Okay. Oh, right, yeah did you want something?",
};
