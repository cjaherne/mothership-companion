"use client";

import { useEffect, useMemo, useState } from "react";
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
  removeExploredLocation,
  addExploredPoi,
  removeExploredPoi,
  setActiveNpc,
  markPuzzleSolved,
  takeItemFromPoi,
} from "@/lib/runs";
import { BriefingSection } from "./BriefingSection";
import { CharacterList } from "./CharacterList";
import { SamsaVIMap } from "./SamsaVIMap";
import { InternalLocationMap } from "./InternalLocationMap";
import { LocationDetailMap } from "./LocationDetailMap";
import { NpcSelector } from "./NpcSelector";
import { NpcVoicePanelWithIntro } from "./NpcVoicePanelWithIntro";
import {
  THE_METAMORPHOSIS_ID,
  GRETA_BASE_ENTRY_POIS,
} from "@/campaigns/another-bug-hunt/world";
import { getItemName } from "@/campaigns/another-bug-hunt/items";
import { getWordPuzzleConfig } from "@/campaigns/another-bug-hunt/scenarios/1-distress-signals/puzzles";
const REGION_IDS = [
  THE_METAMORPHOSIS_ID,
  "landing-zone",
  "greta-base",
  "heron-station",
  "mothership",
];

/** Maps a location ID to its region ID (for planet map) */
function locationToRegionId(locationId: string): string {
  if (REGION_IDS.includes(locationId)) return locationId;
  return "greta-base"; // Facility rooms (airlock, commissary, etc.) are in Greta Base
}

interface BriefingLandingPageProps {
  campaignId: CampaignId;
  runId: string;
  onProceed: () => void;
}

export function BriefingLandingPage({
  campaignId,
  runId,
  onProceed,
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
  const prologuePage = briefingPages?.find((p) => p.title === "Prologue");
  const arrivalPage = briefingPages?.find((p) => p.title === "Arrival");
  const overviewPage = briefingPages?.find((p) => p.title === "Overview");

  const currentLocationId =
    runState.currentLocationId ?? campaign.world.defaultLocationId;
  const briefingPageId = (() => {
    if (currentLocationId === THE_METAMORPHOSIS_ID) return "prologue";
    if (currentLocationId === "landing-zone") return "arrival";
    return "overview";
  })();

  const locations = campaign.world.locations;
  const currentLocation = locations.find((l) => l.id === currentLocationId);
  const backgroundText = (() => {
    if (currentLocation?.backgroundText) return currentLocation.backgroundText;
    if (currentLocationId === THE_METAMORPHOSIS_ID) return prologuePage?.content;
    if (currentLocationId === "landing-zone") return arrivalPage?.content;
    return overviewPage?.content ?? prologuePage?.content;
  })() ??
    briefingPages?.[0]?.content ??
    campaign.wardenNarrator?.narrative ??
    mission?.briefing ??
    "No background available.";
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
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>(null);
  const [, forceRefresh] = useState(0);
  // Local NPC selection — not persisted until Connect is pressed; resets on location change
  const [selectedNpcId, setSelectedNpcId] = useState<string | null>(null);

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

  // NPC panel uses the location the user is currently VIEWING, not just the
  // game-state current location, so NPCs appear as you browse into a room.
  const npcPanelLocationId = viewedLocationId ?? currentLocationId;
  const npcsInLocation = getNpcsInLocation(
    campaign,
    // Re-read run state so post-inspect refreshes pick up updated exploredPoiIds
    getRunState(runId),
    npcPanelLocationId
  );

  // Reset NPC highlight whenever the viewed location changes
  useEffect(() => {
    setSelectedNpcId(null);
    setActiveNpc(runId, undefined);
  }, [npcPanelLocationId, runId]);

  // Clear activeNpcId when the briefing page unmounts (e.g. navigating back to campaign)
  useEffect(() => {
    return () => {
      setActiveNpc(runId, undefined);
    };
  }, [runId]);

  const handleSelectPrimaryRegion = (regionId: string) => {
    setSelectedPrimaryRegionId(regionId);
    setSelectedLocationId(null);
    setSelectedPoiId(null);
  };

  const handleSelectLocation = (locationId: string) => {
    // Switch to the region that contains this location (e.g. outside-airlock is in greta-base)
    for (const [regionId, locIds] of Object.entries(regionInternalIds)) {
      if (locIds.includes(locationId)) {
        setSelectedPrimaryRegionId(regionId);
        break;
      }
    }
    setSelectedLocationId(locationId);
    setSelectedPoiId(null);
  };

  const handleMarkVisited = (locationId: string) => {
    const alreadyExplored = (getRunState(runId).exploredLocationIds ?? []).includes(locationId);
    if (alreadyExplored) {
      removeExploredLocation(runId, locationId);
    } else {
      addExploredLocation(runId, locationId);
    }
    forceRefresh((x) => x + 1);
  };

  const handlePuzzleSolved = (puzzleId: string) => {
    markPuzzleSolved(runId, puzzleId);
    forceRefresh((x) => x + 1);
  };

  const handleMarkPoiExplored = (poiId: string) => {
    const state = getRunState(runId);
    const alreadyInspected = (state.exploredPoiIds ?? []).includes(poiId);
    if (alreadyInspected) {
      removeExploredPoi(runId, poiId);
    } else {
      addExploredPoi(runId, poiId);
      if (viewedLocationId) {
        addExploredLocation(runId, viewedLocationId);
      }
    }
    forceRefresh((x) => x + 1);
  };

  const handleTakeItem = (poiId: string, itemId: string, characterId: string) => {
    takeItemFromPoi(runId, poiId, itemId, characterId);
    forceRefresh((x) => x + 1);
  };

  const handleMarkRegionVisited = (regionId: string) => {
    const alreadyExplored = (getRunState(runId).exploredLocationIds ?? []).includes(regionId);
    if (alreadyExplored) {
      removeExploredLocation(runId, regionId);
    } else {
      addExploredLocation(runId, regionId);
    }
    forceRefresh((x) => x + 1);
  };

  const currentLocationName = currentLocation?.name ?? currentLocationId ?? "Unknown";
  const baseName = viewedLocation?.name ?? currentLocationName;
  const headerLocationName =
    currentRegionId === "greta-base"
      ? `Greta Base — ${baseName}`
      : baseName;

  const scenarioLabel = scenario ? `${campaign.name} — ${scenario.name}` : campaign.name;

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      {/* Compact header: location | campaign — scenario */}
      <div className="shrink-0 border-b border-neutral-600 pb-2">
        <p className="font-heading text-base font-semibold tracking-wide text-white sm:text-lg">
          {headerLocationName.toUpperCase()}
          <span className="mx-2 text-neutral-500">|</span>
          <span className="text-neutral-400">{scenarioLabel}</span>
        </p>
      </div>

      {/* 3-column layout: Left (Briefing + NPCs) | Center (Maps) | Right (Players + Location) */}
      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_auto_auto_auto] gap-3 overflow-hidden lg:grid-cols-[minmax(220px,1.35fr)_minmax(200px,1.3fr)_minmax(260px,1.35fr)] lg:grid-rows-[1fr_1fr]">
        {/* Left col: Background */}
        <div className="flex min-h-[140px] flex-col overflow-hidden lg:min-h-0">
          <h4 className="mb-1 shrink-0 text-sm font-medium text-neutral-300">
            Background
          </h4>
          <BriefingSection
            text={backgroundText}
            preGeneratedTtsUrl={
              currentLocation?.backgroundText
                ? `/sounds/briefing/${currentLocationId}.mp3`
                : `/sounds/briefing/${briefingPageId}.mp3`
            }
            compact
            useWardenVoice
            className="min-h-0 flex-1 overflow-hidden"
          />
        </div>

        {/* Center col row 1: Samsa VI map */}
        <div className="flex min-h-0 flex-col overflow-hidden">
          {!isPrologue && planetMap ? (
            <SamsaVIMap
              planetMap={planetMap}
              currentRegionId={currentRegionId}
              exploredRegionIds={exploredRegionIds}
              inaccessibleRegionIds={scenario?.inaccessibleRegionIds}
              exploredPoiIds={runState.exploredPoiIds ?? []}
              selectedRegionId={primaryRegionId}
              onRegionClick={handleSelectPrimaryRegion}
              onMarkVisited={handleMarkRegionVisited}
              className="min-h-0 flex-1"
            />
          ) : (
            <div
              className="relative flex h-full min-h-[80px] items-center justify-center overflow-hidden rounded-lg border-2 border-neutral-600 bg-neutral-800/60 text-xs text-neutral-400"
              style={{
                backgroundImage: "url(/images/ui/planet-map-placeholder.png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-black/30" aria-hidden />
              <span className="relative z-10 px-4 text-center font-medium text-white drop-shadow-md">
                Depart for Samsa VI to reveal the planet map
              </span>
            </div>
          )}
        </div>

        {/* Right col row 1: Players */}
        <div className="flex min-h-0 flex-col overflow-hidden">
          <CharacterList
            characters={runState.characters ?? []}
            compact
            getItemName={campaignId === "another-bug-hunt" ? getItemName : undefined}
            runId={runId}
            onCharacterUpdate={() => forceRefresh((x) => x + 1)}
            className="h-full min-h-0"
          />
        </div>

        {/* Left col row 2: NPCs + voice (single panel) */}
        <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border-2 border-neutral-600 bg-neutral-800/60">
          <h4 className="font-heading shrink-0 border-b border-neutral-600 px-3 py-2 text-xs font-medium uppercase tracking-wider text-amber-200/90">
            NPCs in this location
          </h4>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-2">
            <NpcSelector
              campaignId={campaignId}
              npcIds={npcsInLocation}
              activeNpcId={selectedNpcId ?? undefined}
              onSelectNpc={(id) => {
                const next = selectedNpcId === id ? null : id;
                setSelectedNpcId(next);
                setActiveNpc(runId, next ?? undefined);
              }}
              strip
              className="shrink-0"
            />
            {selectedNpcId ? (
              <div className="mt-2 min-h-0 flex-1 overflow-hidden border-t border-neutral-600 pt-2">
                <NpcVoicePanelWithIntro
                  key={selectedNpcId}
                  campaignId={campaignId}
                  runId={runId}
                  npcId={selectedNpcId}
                  embedded
                  onExit={() => {
                    setActiveNpc(runId, undefined);
                    setSelectedNpcId(null);
                    forceRefresh((x) => x + 1);
                  }}
                  onUpdate={() => forceRefresh((x) => x + 1)}
                />
              </div>
            ) : (
              <p className="mt-2 shrink-0 text-xs text-neutral-500">Select an NPC to talk.</p>
            )}
          </div>
        </div>

        {/* Center col row 2: Internal map (hidden during prologue) */}
        <div className="hidden min-h-0 overflow-hidden lg:flex lg:flex-col">
          {!isPrologue && (
            <InternalLocationMap
              locations={internalLocations}
              currentLocationId={currentLocationId}
              exploredLocationIds={runState.exploredLocationIds ?? []}
              exploredPoiIds={runState.exploredPoiIds ?? []}
              characters={runState.characters ?? []}
              solvedPuzzleIds={runState.solvedPuzzleIds ?? []}
              selectedLocationId={viewedLocationId ?? undefined}
              selectedPoiId={selectedPoiId ?? undefined}
              onLocationClick={handleSelectLocation}
              onPoiClick={(poiId) => setSelectedPoiId((prev) => (prev === poiId ? null : poiId))}
              onMarkVisited={handleMarkVisited}
              onMarkPoiExplored={handleMarkPoiExplored}
              regionName={regionName}
              primaryRegionId={primaryRegionId}
              compact
              className="min-h-0 flex-1"
            />
          )}
        </div>

        {/* Right col row 2: Location detail */}
        <div className="flex min-h-0 flex-col overflow-hidden">
          {!isPrologue ? (
            <LocationDetailMap
              location={viewedLocation}
              allLocations={locations}
              currentLocationId={currentLocationId}
              exploredLocationIds={runState.exploredLocationIds ?? []}
              exploredPoiIds={runState.exploredPoiIds ?? []}
              solvedPuzzleIds={runState.solvedPuzzleIds ?? []}
              characters={runState.characters ?? []}
              onLocationClick={handleSelectLocation}
              onMarkVisited={handleMarkVisited}
              onMarkPoiExplored={handleMarkPoiExplored}
              onPuzzleSolved={campaignId === "another-bug-hunt" ? handlePuzzleSolved : undefined}
              getPuzzleConfig={campaignId === "another-bug-hunt" ? getWordPuzzleConfig : undefined}
              takenPoiItems={runState.takenPoiItems}
              onTakeItem={handleTakeItem}
              entryConfig={GRETA_BASE_ENTRY_POIS}
              onEnterInterior={(targetId) => {
                addExploredLocation(runId, targetId);
                forceRefresh((x) => x + 1);
              }}
              getItemName={campaignId === "another-bug-hunt" ? getItemName : undefined}
              className="h-full min-h-0 overflow-y-auto"
            />
          ) : (
            <div
              className="relative flex h-full min-h-[100px] items-center justify-center overflow-hidden rounded-lg border-2 border-neutral-600 bg-neutral-800/60 text-xs text-neutral-400"
              style={{
                backgroundImage: "url(/images/ui/locations-placeholder.png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-black/30" aria-hidden />
              <span className="relative z-10 px-4 text-center font-medium text-white drop-shadow-md">
                Depart for Samsa VI to explore locations
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Narrow screens: show Internal Map as extra row */}
      {!isPrologue && (
        <div className="flex min-h-[120px] flex-col overflow-hidden lg:hidden">
          <InternalLocationMap
            locations={internalLocations}
            currentLocationId={currentLocationId}
            exploredLocationIds={runState.exploredLocationIds ?? []}
            exploredPoiIds={runState.exploredPoiIds ?? []}
            characters={runState.characters ?? []}
            solvedPuzzleIds={runState.solvedPuzzleIds ?? []}
            selectedLocationId={viewedLocationId ?? undefined}
            selectedPoiId={selectedPoiId ?? undefined}
            onLocationClick={handleSelectLocation}
            onPoiClick={(poiId) => setSelectedPoiId((prev) => (prev === poiId ? null : poiId))}
            onMarkVisited={handleMarkVisited}
            onMarkPoiExplored={handleMarkPoiExplored}
            regionName={regionName}
            primaryRegionId={primaryRegionId}
            compact
            className="h-full"
          />
        </div>
      )}
    </div>
  );
}
