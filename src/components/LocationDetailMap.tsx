"use client";

import type { Location } from "@/campaigns/types";

interface LocationDetailMapProps {
  location: Location | null;
  /** All locations (to resolve connected location names) */
  allLocations?: Location[];
  exploredLocationIds?: string[];
  currentLocationId?: string;
  className?: string;
}

export function LocationDetailMap({
  location,
  allLocations = [],
  exploredLocationIds = [],
  currentLocationId,
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
      className={`overflow-auto rounded-lg border border-neutral-800 bg-neutral-950/50 p-4 ${className}`}
    >
      <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-500">
        {location.name}
      </h4>
      <p className="mb-4 text-xs text-neutral-400">{location.description}</p>

      {pois.length > 0 ? (
        <div className="space-y-2">
          <p className="text-[10px] font-medium uppercase text-neutral-500">
            Points of interest
          </p>
          <ul className="space-y-1.5">
            {pois.map((poi) => (
              <li
                key={poi.id}
                className="flex items-start gap-2 rounded border border-neutral-800 bg-black/30 px-3 py-2"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-neon-pink/80 mt-1.5" />
                <div>
                  <span className="text-sm text-neutral-200">{poi.name}</span>
                  {poi.description && (
                    <p className="text-xs text-neutral-500">{poi.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-neutral-500">You are here.</p>
      )}

      {conns.length > 0 && (
        <div className="mt-4 space-y-1.5">
          <p className="text-[10px] font-medium uppercase text-neutral-500">
            Connected (doors)
          </p>
          <div className="flex flex-wrap gap-2">
            {conns.map((id) => {
              const loc = locMap.get(id);
              return (
                <span
                  key={id}
                  className="rounded border border-neon-pink/50 px-2 py-1 text-xs text-neon-pink/90"
                >
                  {loc?.name ?? id}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-neutral-500">
        <span className="h-1.5 w-1.5 rounded-full bg-neon-pink/80" />
        Door / connection
      </div>
    </div>
  );
}
