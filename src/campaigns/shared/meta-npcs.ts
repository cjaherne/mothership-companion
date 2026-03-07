/**
 * Meta-NPCs - Warden Narrator and The Company
 *
 * These NPCs sit above all campaigns. Each campaign configures them
 * with campaign-specific content (narrative, hints).
 */

import type { NPCPersonalityProfile } from "@/types/npc";

/** ID for the Warden Narrator - delivers opening backstory */
export const WARDEN_NARRATOR_ID = "warden-narrator";

/** ID for The Company - provides hints when players ask */
export const THE_COMPANY_ID = "the-company";

/** Base profile for Warden Narrator (campaign supplies narrative) */
export const wardenNarratorProfile: NPCPersonalityProfile = {
  id: WARDEN_NARRATOR_ID,
  name: "Warden Narrator",
  archetype:
    "The omniscient narrator. Delivers opening backstory and sets the scene. Authoritative, atmospheric, builds tension.",
  traits: ["authoritative", "atmospheric", "ominous"],
  defaultEmotionalState: "calm",
  faction: "unknown",
  speechProfile: {
    register: "formal",
    verbosity: "verbose",
    verbalTics: ["In the darkness...", "The silence speaks..."],
  },
  knowledgeScope: ["Opening narrative only"],
  motivationHooks: ["Delivers the campaign opening once at session start"],
};

/** Base profile for The Company (campaign supplies hints) */
export const theCompanyProfile: NPCPersonalityProfile = {
  id: THE_COMPANY_ID,
  name: "The Company",
  archetype:
    "Corporate voice. Provides hints when players explicitly ask. Cold, bureaucratic, reluctant to help but will give escalating hints if pressed.",
  traits: ["bureaucratic", "cold", "reluctant"],
  defaultEmotionalState: "calm",
  faction: "corporation",
  speechProfile: {
    register: "corporate",
    verbosity: "terse",
    verbalTics: ["Per company policy...", "We suggest..."],
    avoidPhrases: ["we care about you"],
  },
  knowledgeScope: ["Campaign hints only"],
  motivationHooks: [
    "Players must explicitly ask for a hint",
    "Escalate hints gradually—don't give everything at once",
  ],
};
