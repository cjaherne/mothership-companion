"use client";

import { useMemo, useState } from "react";
import { getCampaign, getMission, getScenario } from "@/campaigns";
import type { CampaignId } from "@/campaigns";
import { getRun, getRunState, addExploredLocation } from "@/lib/runs";
import { BriefingSection } from "./BriefingSection";
import { CharacterList } from "./CharacterList";
import { SamsaVIMap } from "./SamsaVIMap";
import { InternalLocationMap } from "./InternalLocationMap";
import { LocationDetailMap } from "./LocationDetailMap";

const REGION_IDS = ["landing-zone", "greta-base", "heron-station", "mothership"];

/** Maps a location ID to its region ID (for planet map) */
function locationToRegionId(locationId: string): string {
  if (REGION_IDS.includes(locationId)) return locationId;
  return "greta-base"; // Facility rooms (airlock, lockers, etc.) are in Greta Base
}

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

  const mission = scenario?.missionId
    ? getMission(campaignId, scenario.missionId)
    : undefined;
  const briefingPages = mission?.briefingPages;
  const briefingText =
    briefingPages?.length
      ? briefingPages[0]?.content
      : campaign.wardenNarrator?.narrative ??
        mission?.briefing ??
        "No briefing available.";

  const currentLocationId =
    runState.currentLocationId ?? campaign.world.defaultLocationId;
  const locations = campaign.world.locations;
  const planetMap = campaign.world.planetMap;

  const currentRegionId = useMemo(
    () => (currentLocationId ? locationToRegionId(currentLocationId) : undefined),
    [currentLocationId]
  );

  const exploredRegionIds = useMemo(() => {
    const ids = runState.exploredLocationIds ?? [];
    return Array.from(new Set(ids.map(locationToRegionId)));
  }, [runState.exploredLocationIds]);

  const [selectedPrimaryRegionId, setSelectedPrimaryRegionId] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [, forceRefresh] = useState(0);

  const primaryRegionId =
    selectedPrimaryRegionId ?? currentRegionId ?? "landing-zone";
  const regionInternalIds = campaign.world.regionInternalLocationIds ?? {};
  const internalLocationIds = regionInternalIds[primaryRegionId] ?? [primaryRegionId];
  const internalLocations = locations.filter((l) => internalLocationIds.includes(l.id));

  const viewedLocationId =
    selectedLocationId ??
    (internalLocationIds.includes(currentLocationId ?? "") ? currentLocationId : internalLocationIds[0]) ??
    null;
  const viewedLocation = viewedLocationId
    ? locations.find((l) => l.id === viewedLocationId) ?? null
    : null;

  const regionName =
    planetMap?.regions.find((r) => r.id === primaryRegionId)?.name ?? primaryRegionId;

  const handleSelectPrimaryRegion = (regionId: string) => {
    setSelectedPrimaryRegionId(regionId);
    setSelectedLocationId(null);
  };

  const handleSelectLocation = (locationId: string) => {
    if (REGION_IDS.includes(locationId) && regionInternalIds[locationId]) {
      setSelectedPrimaryRegionId(locationId);
    }
    setSelectedLocationId(locationId);
  };

  const handleMarkVisited = (locationId: string) => {
    addExploredLocation(runId, locationId);
    forceRefresh((x) => x + 1);
  };

  const handleMarkRegionVisited = (regionId: string) => {
    addExploredLocation(runId, regionId);
    forceRefresh((x) => x + 1);
  };

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

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-hidden lg:grid-cols-2">
        {/* Left: Briefing */}
        <div className="flex min-h-0 flex-col overflow-hidden">
          <h4 className="mb-2 text-sm font-medium text-neon-cyan">
            Scenario Briefing
          </h4>
          <BriefingSection
            text={briefingText}
            pages={briefingPages}
            className="min-h-[180px] flex-1 overflow-y-auto"
          />
        </div>

        {/* Right: Characters (upper) + Samsa VI map (lower) */}
        <div className="flex min-h-0 flex-col gap-4 overflow-hidden">
          <div className="min-h-0 flex-1 overflow-hidden">
            <CharacterList
              characters={runState.characters ?? []}
              className="h-full max-h-[200px]"
            />
          </div>
          {planetMap && (
            <div className="min-h-0 flex-1 overflow-hidden">
              <SamsaVIMap
                planetMap={planetMap}
                currentRegionId={currentRegionId}
                exploredRegionIds={exploredRegionIds}
                selectedRegionId={primaryRegionId}
                onRegionClick={handleSelectPrimaryRegion}
                onMarkVisited={handleMarkRegionVisited}
                className="h-full min-h-[200px]"
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Internal Location map + Location detail map */}
      <div className="grid min-h-0 grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="min-h-[200px]">
          <InternalLocationMap
            locations={internalLocations}
            currentLocationId={currentLocationId}
            exploredLocationIds={runState.exploredLocationIds ?? []}
            selectedLocationId={viewedLocationId ?? undefined}
            onLocationClick={handleSelectLocation}
            onMarkVisited={handleMarkVisited}
            regionName={regionName}
            className="h-full"
          />
        </div>
        <div className="min-h-[200px]">
          <LocationDetailMap
            location={viewedLocation}
            allLocations={locations}
            currentLocationId={currentLocationId}
            exploredLocationIds={runState.exploredLocationIds ?? []}
            onLocationClick={handleSelectLocation}
            onMarkVisited={handleMarkVisited}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
