"use client";

import { useState } from "react";
import type { Location } from "@/campaigns/types";
import { hasRequiredItems } from "@/lib/inventory-utils";
import { WordPuzzleModal } from "./WordPuzzleModal";
import type { Character } from "@/types/run";

interface LocationDetailMapProps {
  location: Location | null;
  /** All locations (to resolve connected location names) */
  allLocations?: Location[];
  exploredLocationIds?: string[];
  currentLocationId?: string;
  /** POI IDs the team has already inspected */
  exploredPoiIds?: string[];
  /** Party characters (for item-based location unlock checks) */
  characters?: Character[];
  /** Callback when user clicks a connected location to navigate */
  onLocationClick?: (locationId: string) => void;
  /** Callback to mark the current location as visited */
  onMarkVisited?: (locationId: string) => void;
  /** Callback when user inspects a point of interest */
  onMarkPoiExplored?: (poiId: string) => void;
  /** Callback when a puzzle is solved */
  onPuzzleSolved?: (puzzleId: string) => void;
  /** Get word puzzle config for a puzzle ID (clue + solution) */
  getPuzzleConfig?: (puzzleId: string) => { clue: string; solution: string } | null;
  /** Puzzle IDs the party has solved */
  solvedPuzzleIds?: string[];
  /** Config for entry to connected rooms. Keys: current location ID. Values can include per-entry lock. */
  entryConfig?: Record<
    string,
    {
      poiId: string;
      targetLocationId: string;
      requiredItemIds?: string[];
      unlockOverridePuzzleIds?: string[];
      lockNote?: string;
    }
  >;
  /** Callback when user enters an interior room from an exterior entry point */
  onEnterInterior?: (targetLocationId: string) => void;
  /** Resolve item ID to display name (for POI itemIds) */
  getItemName?: (itemId: string) => string;
  /** Items taken from POIs: poiId -> { itemId -> characterId } */
  takenPoiItems?: Record<string, Record<string, string>>;
  /** Callback when a character takes an item from a POI */
  onTakeItem?: (poiId: string, itemId: string, characterId: string) => void;
  className?: string;
}

export function LocationDetailMap({
  location,
  allLocations = [],
  exploredLocationIds = [],
  currentLocationId,
  exploredPoiIds = [],
  solvedPuzzleIds = [],
  characters = [],
  onLocationClick,
  onMarkVisited,
  onMarkPoiExplored,
  onPuzzleSolved,
  getPuzzleConfig,
  entryConfig,
  onEnterInterior,
  getItemName,
  takenPoiItems = {},
  onTakeItem,
  className = "",
}: LocationDetailMapProps) {
  const [puzzleModalPuzzleId, setPuzzleModalPuzzleId] = useState<string | null>(null);
  const [pendingTake, setPendingTake] = useState<{ poiId: string; itemId: string } | null>(null);
  const locMap = new Map(allLocations.map((l) => [l.id, l]));
  if (!location) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border-2 border-neutral-600 bg-neutral-800/60 p-6 text-neutral-400 ${className}`}
      >
        <p className="text-sm">No location selected</p>
      </div>
    );
  }

  const pois = location.pointsOfInterest ?? [];
  const conns = location.connectedLocationIds ?? [];

  return (
    <div
      className={`flex min-h-0 flex-col overflow-y-auto rounded-lg border-2 border-neutral-600 bg-neutral-800/60 p-4 ${className}`}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-heading text-xs font-medium uppercase tracking-wider text-amber-200/90">
          {location.name}
        </h4>
        {onMarkVisited && (
          <button
            type="button"
            onClick={() => onMarkVisited(location.id)}
            className={`rounded border px-2 py-1 text-[10px] font-medium transition ${
              exploredLocationIds.includes(location.id)
                ? "border-green-600 bg-green-900/40 text-green-400 hover:bg-green-900/60"
                : "border-neutral-500 bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
            }`}
          >
            {exploredLocationIds.includes(location.id) ? "Visited ✓ (undo)" : "Mark as Visited"}
          </button>
        )}
      </div>
      <p className="mb-4 text-xs text-neutral-400">{location.description}</p>

      {entryConfig &&
        onEnterInterior &&
        (() => {
          const entry = entryConfig[location.id];
          if (!entry) return null;
          const hasInspected = exploredPoiIds.includes(entry.poiId);
          if (!hasInspected) return null;
          const targetLoc = locMap.get(entry.targetLocationId);
          const targetName = targetLoc?.name ?? entry.targetLocationId;
          const requiredIds = entry.requiredItemIds ?? targetLoc?.requiredItemIds ?? [];
          const overridePuzzleIds =
            entry.unlockOverridePuzzleIds ?? targetLoc?.unlockOverridePuzzleIds ?? [];
          const hasOverride = overridePuzzleIds.some((id) => solvedPuzzleIds.includes(id));
          const canEnter =
            requiredIds.length === 0 || hasRequiredItems(characters, requiredIds) || hasOverride;
          const lockNote = entry.lockNote ?? targetLoc?.lockNote ?? "requires keycard";
          return (
            <div className="mb-4">
              {canEnter ? (
                <button
                  type="button"
                  onClick={() => onEnterInterior(entry.targetLocationId)}
                  className="w-full rounded border-2 border-emerald-600 bg-emerald-900/40 px-3 py-2 text-sm font-medium text-emerald-400 transition hover:bg-emerald-900/60"
                >
                  Enter {targetName}
                </button>
              ) : (
                <p className="rounded border border-amber-600/50 bg-amber-950/40 px-3 py-2 text-sm text-amber-300">
                  Locked — {lockNote}
                </p>
              )}
            </div>
          );
        })()}

      {pois.length > 0 ? (
        <div className="space-y-2">
          <p className="text-[10px] font-medium uppercase text-neutral-600">
            Points of interest
          </p>
          {(() => {
            const visiblePois = pois.filter(
              (poi) =>
                !poi.requiredPoiIds?.length ||
                poi.requiredPoiIds.every((id) => exploredPoiIds.includes(id))
            );
            const prefabParentId = "landing-zone-prefab";
            const parentPoi = pois.find((p) => p.id === prefabParentId);
            const insidePrefab = visiblePois.filter(
              (poi) => poi.requiredPoiIds?.includes(prefabParentId)
            );
            const topLevel = visiblePois.filter(
              (poi) => !poi.requiredPoiIds?.includes(prefabParentId)
            );

            const renderPoiItem = (poi: (typeof pois)[0]) => {
              const isInspected = exploredPoiIds.includes(poi.id);
              return (
                <li
                  key={poi.id}
                  className="rounded border border-neutral-600 bg-neutral-700/50 px-3 py-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full mt-1.5 ${
                          isInspected ? "bg-green-500" : "bg-neutral-500"
                        }`}
                      />
                      <div className="min-w-0">
                        <span
                          className={`text-sm ${
                            isInspected ? "text-neutral-400" : "text-neutral-200"
                          }`}
                        >
                          {poi.name}
                          {isInspected && (
                            <span className="ml-1.5 text-[10px] text-green-400/70">
                              ✓ Inspected
                            </span>
                          )}
                        </span>
                        {poi.description && isInspected && (
                          <p className="text-xs text-neutral-500">{poi.description}</p>
                        )}
                        {isInspected && poi.puzzleId && (() => {
                          const isSolved = solvedPuzzleIds.includes(poi.puzzleId);
                          const config = getPuzzleConfig?.(poi.puzzleId);
                          if (isSolved) {
                            return (
                              <span className="ml-1.5 text-[10px] text-emerald-400/80">
                                Puzzle solved ✓
                              </span>
                            );
                          }
                          if (config && onPuzzleSolved) {
                            return (
                              <button
                                type="button"
                                onClick={() => setPuzzleModalPuzzleId(poi.puzzleId!)}
                                className="mt-1 rounded border border-amber-600/50 bg-amber-900/30 px-2 py-0.5 text-[10px] font-medium text-amber-400 hover:bg-amber-900/50"
                              >
                                Solve puzzle
                              </button>
                            );
                          }
                          return null;
                        })()}
                        {isInspected && (() => {
                          const itemIds = poi.itemIds ?? [];
                          const legacyItems = poi.items ?? [];
                          const resolve = getItemName ?? ((id: string) => id);
                          const hasPuzzle = !!poi.puzzleId;
                          const puzzleSolved = hasPuzzle && solvedPuzzleIds.includes(poi.puzzleId!);
                          if (hasPuzzle && !puzzleSolved && itemIds.length > 0) {
                            return (
                              <p className="mt-1 text-[10px] text-amber-400/80">
                                Solve the combination to access the contents.
                              </p>
                            );
                          }
                          if (itemIds.length > 0) {
                            return (
                              <ul className="mt-1 space-y-1">
                                {itemIds.map((id) => {
                                  const takenByCharId = takenPoiItems[poi.id]?.[id];
                                  const takenBy = takenByCharId
                                    ? characters.find((c) => c.id === takenByCharId)
                                    : null;
                                  const isPending = pendingTake?.poiId === poi.id && pendingTake?.itemId === id;
                                  return (
                                    <li key={id} className="text-[10px] text-neutral-600">
                                      {takenBy ? (
                                        <span>+ {resolve(id)} <span className="text-green-500/80">✓ Taken by {takenBy.name}</span></span>
                                      ) : (
                                        <span className="flex flex-wrap items-center gap-1">
                                          <span>+ {resolve(id)}</span>
                                          {onTakeItem && characters.length > 0 && (
                                            <>
                                              {isPending ? (
                                                <span className="flex flex-wrap items-center gap-1">
                                                  <span className="text-neutral-500">Who picks it up?</span>
                                                  {characters.map((c) => (
                                                    <button
                                                      key={c.id}
                                                      type="button"
                                                      onClick={() => {
                                                        onTakeItem(poi.id, id, c.id);
                                                        setPendingTake(null);
                                                      }}
                                                      className="rounded border border-cyan-600/50 bg-cyan-900/30 px-1.5 py-0.5 text-[10px] text-cyan-400 hover:bg-cyan-900/50"
                                                    >
                                                      {c.name}
                                                    </button>
                                                  ))}
                                                  <button
                                                    type="button"
                                                    onClick={() => setPendingTake(null)}
                                                    className="text-[10px] text-neutral-500 hover:text-neutral-400"
                                                  >
                                                    Cancel
                                                  </button>
                                                </span>
                                              ) : (
                                                <button
                                                  type="button"
                                                  onClick={() => setPendingTake({ poiId: poi.id, itemId: id })}
                                                  className="rounded border border-cyan-600/50 bg-cyan-900/30 px-1.5 py-0.5 text-[10px] text-cyan-400 hover:bg-cyan-900/50"
                                                >
                                                  Take
                                                </button>
                                              )}
                                            </>
                                          )}
                                        </span>
                                      )}
                                    </li>
                                  );
                                })}
                              </ul>
                            );
                          }
                          if (legacyItems.length > 0) {
                            return (
                              <ul className="mt-1 space-y-0.5">
                                {legacyItems.map((item) => (
                                  <li key={item} className="text-[10px] text-neutral-600">
                                    + {item}
                                  </li>
                                ))}
                              </ul>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                    {onMarkPoiExplored && (
                      <button
                        type="button"
                        onClick={() => onMarkPoiExplored(poi.id)}
                        className={`shrink-0 rounded border px-2 py-0.5 text-[10px] font-medium transition ${
                          isInspected
                            ? "border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                            : "border-cyan-500/50 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
                        }`}
                      >
                        {isInspected ? "Inspected ✓ (undo)" : "Inspect"}
                      </button>
                    )}
                  </div>
                </li>
              );
            };

            return (
              <>
                <ul className="space-y-1.5">
                  {topLevel.map(renderPoiItem)}
                </ul>
                {insidePrefab.length > 0 && parentPoi && (
                  <div className="mt-3">
                    <p className="mb-1.5 text-[10px] font-medium uppercase text-neutral-500">
                      Inside {parentPoi.name}
                    </p>
                    <ul className="space-y-1.5">
                      {insidePrefab.map(renderPoiItem)}
                    </ul>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      ) : (
        <p className="text-sm text-neutral-600">You are here.</p>
      )}

      {conns.length > 0 && (
        <div className="mt-4 space-y-1.5">
          <p className="text-[10px] font-medium uppercase text-neutral-500">
            Connected (click to view)
          </p>
          <div className="flex flex-wrap gap-2">
            {conns.map((id) => {
              const loc = locMap.get(id);
              const isClickable = !!onLocationClick;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onLocationClick?.(id)}
                  disabled={!isClickable}
                  className={`rounded border border-neutral-400 px-2 py-1 text-left text-xs text-neutral-800 transition hover:bg-neutral-200 ${
                    isClickable ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  {loc?.name ?? id}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-neutral-600">
        <span className="h-1.5 w-1.5 rounded-full bg-neutral-500" />
        Door / connection
      </div>

      {puzzleModalPuzzleId && getPuzzleConfig?.(puzzleModalPuzzleId) && onPuzzleSolved && (
        <WordPuzzleModal
          puzzleId={puzzleModalPuzzleId}
          clue={getPuzzleConfig(puzzleModalPuzzleId)!.clue}
          solution={getPuzzleConfig(puzzleModalPuzzleId)!.solution}
          onSolve={() => onPuzzleSolved(puzzleModalPuzzleId)}
          onClose={() => setPuzzleModalPuzzleId(null)}
        />
      )}
    </div>
  );
}
