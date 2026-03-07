/**
 * Mothership Companion - NPC Personality Profile Interfaces
 *
 * Defines the schema for in-universe character archetypes.
 * Used by the AI backend to maintain consistent personas, dialogue,
 * and puzzle interactions across the Warden experience.
 */

/** Emotional state modifiers that influence NPC responses */
export type EmotionalState =
  | "calm"
  | "panicked"
  | "suspicious"
  | "hostile"
  | "desperate"
  | "resigned"
  | "hopeful"
  | "traumatized";

/** Loyalty/faction alignment affecting trust and information sharing */
export type FactionAlignment =
  | "crew"
  | "corporation"
  | "independent"
  | "hostile"
  | "unknown";

/** Numeric attributes (0–1) that players manipulate through dialogue */
export interface NPCManipulatableAttributes {
  fear: number;
  stress: number;
  affability: number;
}

/** Thresholds that gate information reveals */
export interface NPCAttributeThresholds {
  /** Min affability to share non-critical intel */
  shareMinor?: number;
  /** Min trust/fear combo for critical intel */
  shareMajor?: number;
}

/** Core personality archetype - determines default voice and behavior */
export interface NPCPersonalityProfile {
  /** Unique identifier for this NPC type */
  id: string;

  /** Display name (e.g., "Panicked Marine", "Cynical Android") */
  name: string;

  /** Archetype description for system prompt injection */
  archetype: string;

  /** Core personality traits (e.g., ["paranoid", "loyal", "tactical"]) */
  traits: string[];

  /** Default emotional state; can be overridden by game state */
  defaultEmotionalState: EmotionalState;

  /** Faction alignment */
  faction: FactionAlignment;

  /** Speech patterns: vocabulary level, quirks, catchphrases */
  speechProfile: SpeechProfile;

  /** What this NPC knows; gates information reveals (free-form) */
  knowledgeScope: string[];

  /** Fact IDs this NPC knows (from campaign facts DB); structured info gating */
  knownFactIds?: string[];

  /** Per-fact reveal overrides (minAffability, etc.); use campaign default thresholds if absent */
  factRevealConditions?: Record<string, { minAffability?: number; minTrust?: number }>;

  /** Conditions under which this NPC will/won't help the player */
  motivationHooks: string[];

  /** Default manipulatable attribute values (0–1) */
  manipulatableAttributes?: Partial<NPCManipulatableAttributes>;

  /** Thresholds that gate information reveals based on current attributes */
  attributeThresholds?: NPCAttributeThresholds;

  /** Optional: voice ID for TTS (e.g., ElevenLabs, Cartesia) */
  voiceId?: string;

  /** Optional: message delivered before interaction (e.g. mission briefing). Agent speaks this first. */
  greetingMessage?: string;
}

/** Speech pattern configuration for consistent dialogue generation */
export interface SpeechProfile {
  /** Vocabulary level: "technical", "colloquial", "military", "corporate" */
  register: string;

  /** Sentence length tendency */
  verbosity: "terse" | "moderate" | "verbose";

  /** Recurring phrases or verbal tics */
  verbalTics?: string[];

  /** Words/phrases to avoid */
  avoidPhrases?: string[];

  /** Accent or dialect hint for TTS */
  accentHint?: string;

  /** Vocal quality hint (e.g. "tinny and annoying", "gravelly") for TTS/immersion */
  vocalQuality?: string;
}

/** Runtime instance of an NPC in a scene - extends profile with state */
export interface NPCInstance extends NPCPersonalityProfile {
  /** Current emotional state (may have shifted during interaction) */
  currentEmotionalState: EmotionalState;

  /** Current attribute values (player-manipulated via dialogue); defaults from profile if absent */
  currentAttributes?: NPCManipulatableAttributes;

  /** Facts this instance has revealed to the player */
  revealedFacts: string[];

  /** Trust level with player (0–1) */
  trustLevel: number;

  /** Whether this NPC is currently in the scene */
  isPresent: boolean;
}

/** Predefined archetype templates for common Mothership NPCs */
export const NPC_ARCHETYPES = {
  PANICKED_MARINE: "panicked_marine",
  CYNICAL_ANDROID: "cynical_android",
  CORPORATE_OFFICER: "corporate_officer",
  SHIP_AI: "ship_ai",
  DERANGED_SURVIVOR: "deranged_survivor",
} as const;
