/**
 * Campaign context loader for voice agent
 *
 * Assembles world, scenario, mission, and themes into a string for
 * future agent prompt injection. Not wired to entrypoint in this PR.
 */

import { getCampaign } from "./registry";
import type { CampaignId } from "./types";
import { anotherBugHuntThemes } from "./another-bug-hunt/themes";
import { scenarios } from "./another-bug-hunt/scenario";
import { missions } from "./another-bug-hunt/mission";

/**
 * Get assembled context string for a campaign (for agent system prompt).
 * @param campaignId - Campaign to load
 * @param scenarioId - Optional; if not provided, uses first scenario
 */
export function getCampaignContextForAgent(
  campaignId: CampaignId,
  scenarioId?: string | null
): string {
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
  if (campaign.scenarioIds?.length) {
    const sid = scenarioId ?? campaign.scenarioIds[0];
    const scenario = scenarios.find((s) => s.id === sid);
    if (scenario) {
      parts.push(`\n## Scenario: ${scenario.name}`);
      parts.push(scenario.description);
    }
  }

  // Mission (if scenario has one)
  if (campaign.missionIds?.length) {
    const scenario = scenarios.find(
      (s) => s.id === (scenarioId ?? campaign.scenarioIds?.[0])
    );
    if (scenario?.missionId) {
      const mission = missions.find((m) => m.id === scenario.missionId);
      if (mission) {
        parts.push(`\n## Mission: ${mission.name}`);
        parts.push(mission.briefing);
        parts.push("\nObjectives: " + mission.objectives.join("; "));
      }
    }
  }

  // Themes (Another Bug Hunt specific for now)
  if (campaignId === "another-bug-hunt") {
    parts.push("\n" + anotherBugHuntThemes);
  }

  return parts.join("\n");
}
