/**
 * Campaign context loader for voice agent
 *
 * Assembles world, scenario, mission, themes, facts, and voice availability
 * into a string for agent prompt injection.
 *
 * Voice interaction model:
 * 1. Warden Narrator - always available, narration
 * 2. Scenario NPCs - unlocked when conditions met (e.g. reach location)
 * 3. The Company - always available for hints when asked
 */

import { getCampaign, getMission, getScenario } from "./registry";
import type { CampaignId } from "./types";
import { getAvailableVoices } from "./voices";
import { anotherBugHuntThemes } from "./another-bug-hunt/themes";
import {
  getFact,
  getFactsForScenario,
} from "./another-bug-hunt/facts";
import { getNpcProfile } from "./another-bug-hunt/npcs";
import type { RunState } from "@/types/run";

export interface CampaignContextOptions {
  /** Current scenario; defaults to first */
  scenarioId?: string | null;
  /** Active NPC (e.g. player is speaking to); includes known facts */
  activeNpcId?: string | null;
  /** Fact IDs the player already knows; gates what NPC would repeat */
  playerKnowledgeFactIds?: string[];
  /** Full run state: characters, explored, NPC attributes, etc. */
  runState?: RunState | null;
  /** Current location ID for location-aware context (e.g. Warden must not assume player has been elsewhere) */
  currentLocationId?: string | null;
}

/**
 * Get assembled context string for a campaign (for agent system prompt).
 */
export function getCampaignContextForAgent(
  campaignId: CampaignId,
  options: CampaignContextOptions = {}
): string {
  const {
    scenarioId,
    activeNpcId,
    playerKnowledgeFactIds = [],
    runState,
    currentLocationId,
  } = options;
  const playerKnowledge = runState?.playerKnowledgeFactIds ?? playerKnowledgeFactIds;
  const campaign = getCampaign(campaignId);
  const voices = getAvailableVoices(campaign, runState);
  const parts: string[] = [];

  // Voice interaction model
  parts.push("## Voice Interaction Model");
  parts.push(
    "Players can interact with three voice types. Switch persona based on what the player addresses:"
  );
  parts.push("");
  parts.push("1. WARDEN (always available): Program-wide narrator. Use when players ask for narration, scene-setting, or 'Warden'. Deliver opening narrative at session start.");
  parts.push(
    "2. SCENARIO NPCs (unlocked when conditions met): In-universe characters. Only use NPCs that are unlocked. See list below."
  );
  parts.push(
    "3. THE COMPANY (always available): For hints. Use when players explicitly ask for a hint, help, or 'Company'. Cold, corporate voice."
  );
  parts.push("");

  // Available voices
  parts.push("### Available now");
  parts.push("- Warden: yes");
  parts.push(`- Unlocked NPCs: ${voices.npcs.length ? voices.npcs.join(", ") : "none"}`);
  parts.push("- The Company: yes (when player asks for hint)");
  if (voices.lockedNpcs.length > 0) {
    parts.push("");
    parts.push("### Locked (not yet reachable)");
    voices.lockedNpcs.forEach(({ npcId, condition }) => {
      parts.push(
        `- ${npcId}: requires exploring ${condition.locationIds.join(" or ")}`
      );
    });
  }

  // Warden Narrator (opening backstory) — gate by location for Another Bug Hunt prologue
  const locId = currentLocationId ?? runState?.currentLocationId ?? campaign.world.defaultLocationId;
  const isPrologueShip = locId === "the-metamorphosis";
  if (campaign.wardenNarrator?.narrative) {
    parts.push("");
    parts.push("## Warden Narrator (opening narrative)");
    if (isPrologueShip && activeNpcId === "warden-narrator") {
      parts.push(
        "At session start on The Metamorphosis: describe the ship, cryosleep, orbital view of Samsa VI. Maas awaits with the briefing. Do NOT mention tropical storm, descent, or surface—they haven't landed yet."
      );
    } else {
      parts.push(
        "Deliver this at session start to set the scene. Atmospheric, authoritative."
      );
      parts.push(`\n${campaign.wardenNarrator.narrative}`);
    }
  }

  // The Company (hints)
  if (campaign.theCompany?.hints?.length) {
    parts.push("");
    parts.push("## The Company (hints)");
    parts.push(
      "When players ask for a hint: offer these in order. Escalate gradually."
    );
    campaign.theCompany.hints.forEach((hint, i) => {
      parts.push(`- Hint ${i + 1}: ${hint}`);
    });
  }

  // World
  parts.push(`\n## World: ${campaign.world.name}`);
  parts.push(campaign.world.description);
  parts.push(
    "\nLocations: " +
      campaign.world.locations.map((l) => `${l.name} (${l.id})`).join(", ")
  );

  // Scenario (if campaign has scenarios)
  const sid = scenarioId ?? campaign.scenarios?.[0]?.id;
  if (campaign.scenarios?.length && sid) {
    const scenario = getScenario(campaignId, sid);
    if (scenario) {
      parts.push(`\n## Scenario: ${scenario.name}`);
      parts.push(scenario.description);
    }
  }

  // Mission (if scenario has one)
  if (sid) {
    const scenario = getScenario(campaignId, sid);
    if (scenario?.missionId) {
      const mission = getMission(campaignId, scenario.missionId);
      if (mission) {
        parts.push(`\n## Mission: ${mission.name}`);
        parts.push(mission.briefing);
        parts.push("\nObjectives: " + mission.objectives.join("; "));
      }
    }
  }

  // Unlocked scenario NPCs (personas available for dialogue)
  if (voices.npcs.length > 0 && campaignId === "another-bug-hunt") {
    parts.push("\n## Unlocked NPCs (roleplay when player addresses them)");
    for (const npcId of voices.npcs) {
      const npc = getNpcProfile(npcId);
      if (npc) {
        const knownFacts = (npc.knownFactIds ?? [])
          .map((fid) => getFact(fid))
          .filter((f): f is NonNullable<typeof f> => !!f);
        const notYetRevealed = knownFacts.filter(
          (f) => !playerKnowledge.includes(f.id)
        );
        parts.push(`\n### ${npc.name} (${npcId})`);
        parts.push(`Archetype: ${npc.archetype}`);
        parts.push(`Traits: ${npc.traits.join(", ")}`);
        parts.push(
          `Can reveal: ${notYetRevealed.map((f) => f.text).join(" | ") || "nothing new"}`
        );
      }
    }
  }

  // Facts (Another Bug Hunt)
  if (campaignId === "another-bug-hunt" && sid) {
    const facts = getFactsForScenario(sid);
    if (facts.length > 0) {
      parts.push("\n## Facts (canonical information)");
      parts.push(
        facts.map((f) => `- [${f.id}] (${f.tier}): ${f.text}`).join("\n")
      );
    }
  }

  // Active NPC + known facts (only for unlocked scenario NPCs)
  if (
    campaignId === "another-bug-hunt" &&
    activeNpcId &&
    voices.npcs.includes(activeNpcId)
  ) {
    const npc = getNpcProfile(activeNpcId);
    if (npc?.knownFactIds?.length) {
      const knownFacts = npc.knownFactIds
        .map((fid) => getFact(fid))
        .filter((f): f is NonNullable<typeof f> => !!f);
      const alreadyRevealed = knownFacts.filter((f) =>
        playerKnowledge.includes(f.id)
      );
      const notYetRevealed = knownFacts.filter(
        (f) => !playerKnowledge.includes(f.id)
      );
      parts.push(`\n## Active NPC: ${npc.name}`);
      parts.push(`Knows ${knownFacts.length} facts. Already told player: ${alreadyRevealed.map((f) => f.id).join(", ") || "none"}.`);
      parts.push(
        "Can still reveal: " +
          notYetRevealed.map((f) => `[${f.id}] ${f.text}`).join(" | ")
      );
    }
  }

  // Player characters (for NPC interaction context)
  if (runState?.characters?.length) {
    parts.push("\n## Player characters");
    runState.characters.forEach((c) => {
      const playerLabel = c.playerName ? `${c.playerName} (${c.name})` : c.name;
      parts.push(
        `- ${playerLabel}: ${c.traits.join(", ")}. ${c.personalitySummary}`
      );
    });
  }

  // Explored locations
  if (runState?.exploredLocationIds?.length) {
    parts.push(
      "\nExplored: " + runState.exploredLocationIds.join(", ")
    );
  }

  // NPC attribute state (how NPCs feel about players)
  if (runState?.npcAttributeState && Object.keys(runState.npcAttributeState).length > 0) {
    parts.push("\n## NPC attitudes toward players");
    Object.entries(runState.npcAttributeState).forEach(([npcId, attrs]) => {
      parts.push(
        `- ${npcId}: fear=${attrs.fear.toFixed(2)}, stress=${attrs.stress.toFixed(2)}, affability=${attrs.affability.toFixed(2)}`
      );
    });
  }

  // Themes (Another Bug Hunt specific)
  if (campaignId === "another-bug-hunt") {
    parts.push("\n" + anotherBugHuntThemes);
  }

  // Warden-only: location-aware context and what players know
  if (activeNpcId === "warden-narrator" && runState) {
    const explored = runState.exploredLocationIds ?? [];
    const knownFacts = runState.playerKnowledgeFactIds ?? [];
    const interacted = runState.interactedNpcIds ?? [];
    const currentLocId = currentLocationId ?? runState.currentLocationId ?? campaign.world.defaultLocationId;
    const currentLoc = campaign.world.locations.find((l) => l.id === currentLocId);

    parts.push("\n## Warden: CRITICAL — Current player location");
    parts.push(`- CURRENT LOCATION: ${currentLoc?.name ?? currentLocId}`);
    parts.push("- You MUST get the player's location correct. They are here right now. Never say they are somewhere they haven't been.");
    parts.push("");

    // Prologue-safe: at The Metamorphosis, players only know ship, cryosleep, colony exists
    const isPrologue = currentLocId === "the-metamorphosis";
    if (isPrologue) {
      parts.push("## Warden: Prologue context (players still on The Metamorphosis)");
      parts.push("- Players have just woken from cryosleep on a J2C-I Executive Transport in orbit around Samsa VI.");
      parts.push("- Maas (corporate liaison) is here to brief them. They have NOT descended to the planet yet.");
      parts.push("- They know: Samsa VI is a jungle planet, terraforming colony, research station. Six months of silence from Greta Base.");
      parts.push("- They do NOT yet know: tropical storm, descent, Greta Base details, facility layout, anything on the surface.");
      parts.push("- Only describe: the ship, cryosleep, Maas, the mission briefing (investigate the colony). Do NOT mention the storm, landing, or surface locations.");
      parts.push("");
    }

    parts.push("## Warden: What the players know (you may reference only this)");
    const locNames = campaign.world.locations
      .filter((l) => explored.includes(l.id))
      .map((l) => l.name)
      .join(", ");
    parts.push(`- Explored locations: ${locNames || "none yet"}`);
    parts.push(`- NPCs interacted with: ${interacted.length ? interacted.join(", ") : "none yet"}`);
    if (knownFacts.length > 0) {
      const factTexts = knownFacts
        .map((fid) => getFact(fid)?.text)
        .filter(Boolean);
      parts.push(`- Facts they have learned: ${factTexts.join(" | ")}`);
    } else {
      parts.push("- Facts they have learned: none yet");
    }
    parts.push("");
    parts.push("CRITICAL: Do NOT reveal any fact, plot point, puzzle solution, or location detail not listed above. Never say the player is at a location they have not explored. You assist with what they know—you never spoil what they haven't discovered.");
  }

  return parts.join("\n");
}

export type AgentType = "warden" | "npc";

/**
 * Get context string for the Warden (game helper).
 * Only includes facts the player has already discovered; never reveals new information.
 */
export function getWardenContext(
  campaignId: CampaignId,
  runState: RunState | null
): string {
  const campaign = getCampaign(campaignId);
  const playerKnowledge = runState?.playerKnowledgeFactIds ?? [];
  const explored = runState?.exploredLocationIds ?? [];
  const interacted = runState?.interactedNpcIds ?? [];
  const currentLocId =
    runState?.currentLocationId ?? campaign.world.defaultLocationId;
  const currentLoc = campaign.world.locations.find((l) => l.id === currentLocId);

  const parts: string[] = [];
  parts.push("## Role: Warden (Game Helper)");
  parts.push(
    "You are the Warden—the AI assistant for this Mothership RPG session. Sci-fi dark horror setting."
  );
  parts.push(
    "Your persona: grim, atmospheric, subtly foreboding. You assist players by summarizing what they know."
  );
  parts.push("");
  parts.push("## CRITICAL — What you may reference");
  parts.push("- ONLY the facts, locations, and NPCs listed below. NEVER reveal plot points or information they haven't discovered.");
  parts.push(`- CURRENT LOCATION: ${currentLoc?.name ?? currentLocId}`);
  parts.push("- You MUST get the player's location correct.");
  parts.push("");

  const locNames = campaign.world.locations
    .filter((l) => explored.includes(l.id))
    .map((l) => l.name)
    .join(", ");
  parts.push(`Explored locations: ${locNames || "none yet"}`);
  parts.push(`NPCs interacted with: ${interacted.length ? interacted.join(", ") : "none yet"}`);

  if (playerKnowledge.length > 0) {
    const factTexts = playerKnowledge
      .map((fid) => getFact(fid)?.text)
      .filter(Boolean);
    parts.push(`Facts they have learned: ${factTexts.join(" | ")}`);
  } else {
    parts.push("Facts they have learned: none yet");
  }

  const isPrologue = currentLocId === "the-metamorphosis";
  if (isPrologue) {
    parts.push("");
    parts.push("## Prologue context (players on The Metamorphosis)");
    parts.push("- Players have just woken from cryosleep. Maas awaits with briefing.");
    parts.push("- They have NOT descended to the planet yet. Do NOT mention storm, landing, or surface.");
  }

  if (runState?.characters?.length) {
    parts.push("");
    parts.push("## Player characters");
    runState.characters.forEach((c) => {
      const label = c.playerName ? `${c.playerName} (${c.name})` : c.name;
      parts.push(`- ${label}: ${c.traits.join(", ")}`);
    });
  }

  parts.push("");
  parts.push(
    "CRITICAL: Do NOT reveal any fact, plot point, puzzle solution, or location detail not listed above. Keep responses concise for voice (2-4 sentences)."
  );

  return parts.join("\n");
}

/**
 * Get context string for an NPC.
 * Includes only facts that pass canRevealFact gating.
 */
export function getNpcContext(
  campaignId: CampaignId,
  npcId: string,
  runState: RunState | null,
  revealableFactIds: string[],
  interactionIntent: "threaten" | "bribe" | "charm" | null
): string {
  const campaign = getCampaign(campaignId);
  const npc = getNpcProfile(npcId);
  if (!npc) return `Unknown NPC: ${npcId}`;

  const playerKnowledge = runState?.playerKnowledgeFactIds ?? [];
  const attrs = runState?.npcAttributeState?.[npcId] ?? npc.manipulatableAttributes ?? {
    fear: 0.5,
    stress: 0.5,
    affability: 0.5,
  };

  const parts: string[] = [];
  parts.push(`## Role: ${npc.name} (${npcId})`);
  parts.push(`Archetype: ${npc.archetype}`);
  parts.push(`Traits: ${npc.traits.join(", ")}`);
  const fear = attrs.fear ?? 0.5;
  const stress = attrs.stress ?? 0.5;
  const affability = attrs.affability ?? 0.5;
  parts.push(
    `Current attitude: fear=${fear.toFixed(2)}, stress=${stress.toFixed(2)}, affability=${affability.toFixed(2)}`
  );
  parts.push(`Speech: ${npc.speechProfile.register}, ${npc.speechProfile.verbosity}`);

  const manner = npc.speechProfile.responseManner;
  if (manner) {
    parts.push(
      `Response manner: ${manner}. You must respond in a ${manner} way—stay in character.`
    );
  }

  if (npc.speechProfile.verbalTics?.length) {
    parts.push(`Verbal tics (use SPARINGLY, vary them—never start every response with the same one like "Look, the point is..."); choose at most one per response: ${npc.speechProfile.verbalTics.join(", ")}`);
  }

  // Irritation escalation: the more players talk to this NPC, the more abrupt they get
  const interactionCount = runState?.npcVoiceInteractionCounts?.[npcId] ?? 0;
  if (interactionCount >= 2) {
    const level = interactionCount >= 5 ? "very irritated" : interactionCount >= 3 ? "irritated" : "getting impatient";
    parts.push(`VOICE INTERACTION COUNT: ${interactionCount}. You are ${level}. Become more abrupt, shorter answers, less willing to elaborate. Do not repeat yourself.`);
  }

  parts.push("");
  parts.push("## What you know and may reveal");
  parts.push(`Knowledge scope: ${npc.knowledgeScope.join("; ")}`);

  if (revealableFactIds.length > 0) {
    const factTexts = revealableFactIds
      .map((fid) => getFact(fid)?.text)
      .filter(Boolean);
    parts.push(`Facts you may reveal now: ${factTexts.join(" | ")}`);
  } else {
    parts.push("Facts you may reveal now: none (player hasn't met conditions or you've already told them)");
  }

  parts.push("");
  parts.push(`Already told player: ${playerKnowledge.filter((f) => npc.knownFactIds?.includes(f)).join(", ") || "none"}`);
  parts.push(`Motivation: ${npc.motivationHooks.join("; ")}`);

  if (interactionIntent) {
    parts.push(`Current interaction intent detected: ${interactionIntent}`);
  }

  if (runState?.characters?.length) {
    parts.push("");
    parts.push("## Player characters present");
    runState.characters.forEach((c) => {
      parts.push(`- ${c.name}: ${c.traits.join(", ")}`);
    });
  }

  parts.push("");
  parts.push(
    "Stay in character. Speak only as this NPC. No asterisks or stage directions. Keep responses concise for voice (2-4 sentences)."
  );

  return parts.join("\n");
}
