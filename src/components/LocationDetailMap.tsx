"use client";

import type { Location } from "@/campaigns/types";

interface LocationDetailMapProps {
  location: Location | null;
  /** All locations (to resolve connected location names) */
  allLocations?: Location[];
  exploredLocationIds?: string[];
  currentLocationId?: string;
  /** POI IDs the team has already inspected */
  exploredPoiIds?: string[];
  /** Callback when user clicks a connected location to navigate */
  onLocationClick?: (locationId: string) => void;
  /** Callback to mark the current location as visited */
  onMarkVisited?: (locationId: string) => void;
  /** Callback when user inspects a point of interest */
  onMarkPoiExplored?: (poiId: string) => void;
  /** Config for exterior→interior entry (e.g. Greta Base). Keys: exterior location ID. */
  entryConfig?: Record<string, { poiId: string; targetLocationId: string }>;
  /** Callback when user enters an interior room from an exterior entry point */
  onEnterInterior?: (targetLocationId: string) => void;
  className?: string;
}

export function LocationDetailMap({
  location,
  allLocations = [],
  exploredLocationIds = [],
  currentLocationId,
  exploredPoiIds = [],
  onLocationClick,
  onMarkVisited,
  onMarkPoiExplored,
  entryConfig,
  onEnterInterior,
  className = "",
}: LocationDetailMapProps) {
  const locMap = new Map(allLocations.map((l) => [l.id, l]));
  if (!location) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950/50 p-6 text-neutral-500 ${className}`}
      >
        <p className="text-sm">No location selected</p>
      </div>
    );
  }

  const pois = location.pointsOfInterest ?? [];
  const conns = location.connectedLocationIds ?? [];

  return (
    <div
      className={`flex min-h-0 flex-col overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-950/50 p-4 ${className}`}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-xs font-medium uppercase tracking-wider text-neutral-500">
          {location.name}
        </h4>
        {onMarkVisited && (
          <button
            type="button"
            onClick={() => onMarkVisited(location.id)}
            className={`rounded border px-2 py-1 text-[10px] font-medium transition ${
              exploredLocationIds.includes(location.id)
                ? "border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                : "border-amber-500/50 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
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
          return (
            <div className="mb-4">
              <button
                type="button"
                onClick={() => onEnterInterior(entry.targetLocationId)}
                className="w-full rounded border-2 border-emerald-500/60 bg-emerald-500/20 px-3 py-2 text-sm font-medium text-emerald-300 transition hover:border-emerald-400 hover:bg-emerald-500/30"
              >
                Enter {targetName}
              </button>
            </div>
          );
        })()}

      {pois.length > 0 ? (
        <div className="space-y-2">
          <p className="text-[10px] font-medium uppercase text-neutral-500">
            Points of interest
          </p>
          <ul className="space-y-1.5">
            {pois.map((poi) => {
              const isInspected = exploredPoiIds.includes(poi.id);
              return (
                <li
                  key={poi.id}
                  className="rounded border border-neutral-800 bg-black/30 px-3 py-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full mt-1.5 ${
                          isInspected ? "bg-green-400/80" : "bg-amber-400/80"
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
                        {poi.items && poi.items.length > 0 && isInspected && (
                          <ul className="mt-1 space-y-0.5">
                            {poi.items.map((item) => (
                              <li key={item} className="text-[10px] text-amber-300/70">
                                + {item}
                              </li>
                            ))}
                          </ul>
                        )}
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
            })}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-neutral-500">You are here.</p>
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
                  className={`rounded border border-amber-600/50 px-2 py-1 text-left text-xs text-amber-300/90 transition hover:border-amber-500 hover:bg-amber-500/10 ${
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

      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-neutral-500">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400/80" />
        Door / connection
      </div>
    </div>
  );
}
