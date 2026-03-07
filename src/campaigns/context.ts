/**
 * Campaign context loader for voice agent
 *
 * Assembles world, scenario, mission, themes, facts, and NPC knowledge
 * into a string for agent prompt injection.
 */

import { getCampaign } from "./registry";
import type { CampaignId } from "./types";
import { anotherBugHuntThemes } from "./another-bug-hunt/themes";
import { scenarios } from "./another-bug-hunt/scenario";
import { missions } from "./another-bug-hunt/mission";
import {
  getFactsForScenario,
  getFact,
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
  const parts: string[] = [];

  // World
  parts.push(`## World: ${campaign.world.name}`);
  parts.push(campaign.world.description);
  parts.push(
    "\nLocations: " +
      campaign.world.locations.map((l) => `${l.name} (${l.id})`).join(", ")
  );

  // Scenario (if campaign has scenarios)
  const sid = scenarioId ?? campaign.scenarioIds?.[0];
  if (campaign.scenarioIds?.length && sid) {
    const scenario = scenarios.find((s) => s.id === sid);
    if (scenario) {
      parts.push(`\n## Scenario: ${scenario.name}`);
      parts.push(scenario.description);
    }
  }

  // Mission (if scenario has one)
  if (campaign.missionIds?.length && sid) {
    const scenario = scenarios.find((s) => s.id === sid);
    if (scenario?.missionId) {
      const mission = missions.find((m) => m.id === scenario.missionId);
      if (mission) {
        parts.push(`\n## Mission: ${mission.name}`);
        parts.push(mission.briefing);
        parts.push("\nObjectives: " + mission.objectives.join("; "));
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

  // Active NPC + known facts (who knows what)
  if (campaignId === "another-bug-hunt" && activeNpcId) {
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
