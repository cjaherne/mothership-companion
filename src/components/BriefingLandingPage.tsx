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
} from "@/lib/runs";
import { BriefingSection } from "./BriefingSection";
import { CharacterList } from "./CharacterList";
import { SamsaVIMap } from "./SamsaVIMap";
import { InternalLocationMap } from "./InternalLocationMap";
import { LocationDetailMap } from "./LocationDetailMap";
import { NpcSelector } from "./NpcSelector";
import { NpcVoicePanel } from "./NpcVoicePanel";
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
  onNpcSelect?: () => void;
  showInlineNpcVoice?: boolean;
  onEndNpcVoice?: () => void;
}

export function BriefingLandingPage({
  campaignId,
  runId,
  onProceed,
  onNpcSelect,
  showInlineNpcVoice,
  onEndNpcVoice,
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
        <p className="text-2xl font-bold tracking-widest text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)] sm:text-3xl">
          {currentLocationName.toUpperCase()}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold text-white">
          {campaign.name}
          {scenario && ` — ${scenario.name}`}
        </h3>
        {showInlineNpcVoice &&
          runState.activeNpcId &&
          runState.activeNpcId !== WARDEN_NARRATOR_ID &&
          onEndNpcVoice && (
            <NpcVoicePanel
              campaignId={campaignId}
              runId={runId}
              activeNpcId={runState.activeNpcId}
              onEnd={onEndNpcVoice}
            />
          )}
      </div>

      {/* Top 50%: 2x2 grid - Briefing/NPCs left, Players/Samsa VI right */}
      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-2 gap-4 overflow-hidden lg:grid-cols-2">
        {/* Left column: Briefing (25% vertical) */}
        <div className="flex min-h-0 flex-col overflow-hidden">
          <h4 className="mb-1 shrink-0 text-xs font-medium text-amber-400">
            Scenario Briefing
          </h4>
          <BriefingSection
            text={briefingText}
            pages={briefingPages}
            className="min-h-0 flex-1 overflow-y-auto"
          />
        </div>

        {/* Right column: Players (25% vertical) */}
        <div className="flex min-h-0 flex-col overflow-hidden">
          <CharacterList
            characters={runState.characters ?? []}
            className="h-full min-h-0"
          />
        </div>

        {/* Left column row 2: NPCs (25% vertical) */}
        <div className="flex min-h-0 flex-col overflow-hidden">
          <NpcSelector
            campaignId={campaignId}
            npcIds={npcsInLocation}
            activeNpcId={runState.activeNpcId}
              onSelectNpc={(id) => {
                setActiveNpc(runId, id);
                forceRefresh((x) => x + 1);
                onNpcSelect?.();
              }}
            className="h-full min-h-0"
          />
        </div>

        {/* Right column row 2: Samsa VI map (25% vertical) or empty during prologue */}
        <div className="flex min-h-0 flex-col overflow-hidden">
          {!isPrologue && planetMap ? (
            <SamsaVIMap
              planetMap={planetMap}
              currentRegionId={currentRegionId}
              exploredRegionIds={exploredRegionIds}
              selectedRegionId={primaryRegionId}
              onRegionClick={handleSelectPrimaryRegion}
              onMarkVisited={handleMarkRegionVisited}
              className="h-full min-h-0"
            />
          ) : (
            <div className="flex h-full min-h-[120px] items-center justify-center rounded-lg border border-amber-900/40 bg-amber-950/10 text-xs text-amber-700/70">
              Depart for Samsa VI to reveal the planet map
            </div>
          )}
        </div>
      </div>

      {/* Bottom 50%: Internal Location map + Location detail (hidden during prologue) */}
      {!isPrologue && (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-2">
          <div className="min-h-0 overflow-hidden">
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
          <div className="min-h-0 overflow-hidden">
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
