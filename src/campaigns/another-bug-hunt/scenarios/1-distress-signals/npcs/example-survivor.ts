/**
 * Example survivor NPC - Distress Signals
 *
 * A damaged android or crew survivor the player may encounter.
 * Developer: duplicate this file for each NPC, customize personality and attributes.
 */

import type {
  NPCPersonalityProfile,
  NPCManipulatableAttributes,
  NPCAttributeThresholds,
} from "@/types/npc";

const defaultAttributes: NPCManipulatableAttributes = {
  fear: 0.6,
  stress: 0.7,
  affability: 0.3,
};

const attributeThresholds: NPCAttributeThresholds = {
  shareMinor: 0.4,
  shareMajor: 0.6,
};

export const exampleSurvivorProfile: NPCPersonalityProfile = {
  id: "example-survivor",
  name: "Example Survivor",
  archetype: "Damaged survivor, possibly android. Hiding, traumatized, knows something.",
  traits: ["paranoid", "traumatized", "knowledgeable"],
  defaultEmotionalState: "traumatized",
  faction: "crew",
  speechProfile: {
    register: "technical",
    verbosity: "terse",
    verbalTics: ["I don't know if I can...", "They're still out there."],
    avoidPhrases: ["everything is fine"],
  },
  knowledgeScope: [
    "What happened in the last days before the fall",
    "Location of the Carcinid lair",
    "Power restoration sequence",
  ],
  knownFactIds: [
    "last_days",
    "carcinid_garage",
    "power_sequence",
    "outbreak_source",
    "vents_connected",
  ],
  motivationHooks: [
    "Calming them may increase willingness to share",
    "High stress causes fragmented, unreliable recall",
  ],
  manipulatableAttributes: defaultAttributes,
  attributeThresholds,
};
