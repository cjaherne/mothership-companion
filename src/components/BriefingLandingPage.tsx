"use client";

import { useMemo, useState } from "react";
import {
  getCampaign,
  getMission,
  getScenario,
  getNpcsInLocation,
} from "@/campaigns";
import type { CampaignId } from "@/campaigns";
import {
  getRun,
  getRunState,
  addExploredLocation,
  setActiveNpc,
  completePrologue,
} from "@/lib/runs";
import { BriefingSection } from "./BriefingSection";
import { CharacterList } from "./CharacterList";
import { SamsaVIMap } from "./SamsaVIMap";
import { InternalLocationMap } from "./InternalLocationMap";
import { LocationDetailMap } from "./LocationDetailMap";
import { NpcSelector } from "./NpcSelector";
import { THE_METAMORPHOSIS_ID } from "@/campaigns/another-bug-hunt/world";
import { WARDEN_NARRATOR_ID } from "@/campaigns/shared/meta-npcs";

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

  const isPrologue = currentLocationId === THE_METAMORPHOSIS_ID;
  const npcsInLocation = getNpcsInLocation(
    campaign,
    runState,
    currentLocationId
  );

  const handleProceedWithNpc = (npcId: string) => {
    setActiveNpc(runId, npcId);
    onProceed();
  };

  const handleTalkToWarden = () => {
    setActiveNpc(runId, WARDEN_NARRATOR_ID);
    onProceed();
  };

  const handleDepartForSamsa = () => {
    completePrologue(runId, "landing-zone");
    forceRefresh((x) => x + 1);
  };

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

  const currentLocation = locations.find((l) => l.id === currentLocationId);
  const currentLocationName = currentLocation?.name ?? currentLocationId ?? "Unknown";

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Large neon current location */}
      <div className="shrink-0 border-b border-neutral-800 pb-4">
        <p className="text-2xl font-bold tracking-widest text-neon-cyan drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] sm:text-3xl">
          {currentLocationName.toUpperCase()}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          {campaign.name}
          {scenario && ` — ${scenario.name}`}
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-sm text-neutral-500 hover:text-neutral-300"
            >
              ← Back
            </button>
          )}
          {isPrologue && (
            <button
              type="button"
              onClick={handleDepartForSamsa}
              className="rounded-lg border border-neon-green/50 bg-neon-green/5 px-4 py-2 text-sm font-medium text-neon-green hover:bg-neon-green/10"
            >
              Depart for Samsa VI
            </button>
          )}
          <button
            type="button"
            onClick={handleTalkToWarden}
            className="rounded-lg border border-neutral-600 bg-neutral-800/50 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white"
          >
            Talk to Warden
          </button>
          {runState.activeNpcId &&
            runState.activeNpcId !== WARDEN_NARRATOR_ID &&
            npcsInLocation.includes(runState.activeNpcId) && (
              <button
                type="button"
                onClick={() => handleProceedWithNpc(runState.activeNpcId!)}
                className="rounded-lg border border-neon-cyan/50 bg-neon-cyan/5 px-4 py-2 text-sm font-medium text-neon-cyan hover:bg-neon-cyan/10"
              >
                Talk to NPC
              </button>
            )}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-hidden lg:grid-cols-2">
        {/* Left: Briefing (compact) */}
        <div className="flex min-h-0 flex-col overflow-hidden">
          <h4 className="mb-1 text-xs font-medium text-neon-cyan">
            Scenario Briefing
          </h4>
          <BriefingSection
            text={briefingText}
            pages={briefingPages}
            className="max-h-[140px] min-h-0 overflow-y-auto"
          />
        </div>

        {/* Right: Players + NPCs (and Samsa VI map when not prologue) */}
        <div className="flex min-h-0 flex-col gap-4 overflow-hidden">
          <div className="min-h-0 flex-1 overflow-hidden">
            <CharacterList
              characters={runState.characters ?? []}
              className="h-full max-h-[200px]"
            />
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            <NpcSelector
              campaignId={campaignId}
              npcIds={npcsInLocation}
              activeNpcId={runState.activeNpcId}
              onSelectNpc={(id) => {
                setActiveNpc(runId, id);
                forceRefresh((x) => x + 1);
              }}
              className="h-full max-h-[180px]"
            />
          </div>
          {!isPrologue && planetMap && (
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

      {/* Bottom: Internal Location map + Location detail map (hidden during prologue) */}
      {!isPrologue && (
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
      )}
    </div>
  );
}
