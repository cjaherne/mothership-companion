"use client";

import { getCampaign, getMission, getScenario } from "@/campaigns";
import type { CampaignId } from "@/campaigns";
import { getRun, getRunState } from "@/lib/runs";
import { BriefingSection } from "./BriefingSection";
import { OverviewMap } from "./OverviewMap";
import { LocationDetailMap } from "./LocationDetailMap";

interface BriefingLandingPageProps {
  campaignId: CampaignId;
  runId: string;
  onProceed: () => void;
  onBack?: () => void;
}

export function BriefingLandingPage({
  campaignId,
  runId,
  onProceed,
  onBack,
}: BriefingLandingPageProps) {
  const campaign = getCampaign(campaignId);
  const run = getRun(runId);
  const runState = getRunState(runId);
  const scenarioId = run?.scenarioId;
  const scenario = scenarioId ? getScenario(campaignId, scenarioId) : undefined;

  const missionBriefing =
    scenario?.missionId &&
    getMission(campaignId, scenario.missionId)?.briefing;
  const briefingText =
    campaign.wardenNarrator?.narrative ??
    missionBriefing ??
    "No briefing available.";

  const currentLocationId =
    runState.currentLocationId ?? campaign.world.defaultLocationId;
  const locations = campaign.world.locations;
  const scenarioLocationIds = scenario?.locationIds;

  const currentLocation = currentLocationId
    ? locations.find((l) => l.id === currentLocationId) ?? null
    : null;

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          {campaign.name}
          {scenario && ` — ${scenario.name}`}
        </h3>
        <div className="flex gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-sm text-neutral-500 hover:text-neutral-300"
            >
              ← Back
            </button>
          )}
          <button
            type="button"
            onClick={onProceed}
            className="rounded-lg border border-neon-cyan/50 bg-neon-cyan/5 px-4 py-2 text-sm font-medium text-neon-cyan hover:bg-neon-cyan/10"
          >
            Proceed to Session
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-hidden">
        <div className="flex min-h-0 flex-[1] flex-col">
          <h4 className="text-sm font-medium text-neon-cyan">
            Scenario Briefing
          </h4>
          <BriefingSection text={briefingText} className="min-h-[180px] flex-1" />
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="min-h-[200px]">
            <OverviewMap
              locations={locations}
              currentLocationId={currentLocationId}
              exploredLocationIds={runState.exploredLocationIds ?? []}
              scenarioLocationIds={scenarioLocationIds}
              className="h-full"
            />
          </div>
          <div className="min-h-[200px]">
            <LocationDetailMap
              location={currentLocation}
              allLocations={locations}
              currentLocationId={currentLocationId}
              exploredLocationIds={runState.exploredLocationIds ?? []}
              className="h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
