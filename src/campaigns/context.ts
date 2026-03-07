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

  // Warden Narrator (opening backstory)
  if (campaign.wardenNarrator?.narrative) {
    parts.push("");
    parts.push("## Warden Narrator (opening narrative)");
    parts.push(
      "Deliver this at session start to set the scene. Atmospheric, authoritative."
    );
    parts.push(`\n${campaign.wardenNarrator.narrative}`);
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
      parts.push(
        `- ${c.name}: ${c.traits.join(", ")}. ${c.personalitySummary}`
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

  return parts.join("\n");
}
