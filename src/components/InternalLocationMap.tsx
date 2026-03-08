"use client";

import type { Location } from "@/campaigns/types";

interface InternalLocationMapProps {
  /** Locations within the current primary region only */
  locations: Location[];
  currentLocationId?: string;
  exploredLocationIds: string[];
  /** Location being viewed in detail */
  selectedLocationId?: string;
  onLocationClick?: (locationId: string) => void;
  onMarkVisited?: (locationId: string) => void;
  /** Name of the primary region (for header) */
  regionName?: string;
  className?: string;
}

/** Simple grid layout for location nodes */
function layoutNodes(locationIds: string[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const cols = Math.ceil(Math.sqrt(locationIds.length)) || 1;
  locationIds.forEach((id, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    positions.set(id, { x: col * 100 + 60, y: row * 70 + 50 });
  });
  return positions;
}

export function InternalLocationMap({
  locations,
  currentLocationId,
  exploredLocationIds,
  selectedLocationId,
  onLocationClick,
  onMarkVisited,
  regionName = "Internal",
  className = "",
}: InternalLocationMapProps) {
  const ids = locations.map((l) => l.id);
  const locMap = new Map(locations.map((l) => [l.id, l]));
  const positions = layoutNodes(ids);

  const renderedEdges = new Set<string>();
  const getEdgeKey = (a: string, b: string) => [a, b].sort().join("-");

  if (ids.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950/50 p-6 text-neutral-500 ${className}`}
      >
        <p className="text-sm">No internal locations</p>
      </div>
    );
  }

  return (
    <div
      className={`overflow-auto rounded-lg border border-neutral-800 bg-neutral-950/50 p-4 ${className}`}
    >
      <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
        {regionName} — Internal Map
      </h4>
      <svg
        viewBox="0 0 400 250"
        className="h-full min-h-[200px] w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {ids.map((id) => {
          const loc = locMap.get(id);
          const conns = (loc?.connectedLocationIds ?? []).filter((c) => ids.includes(c));
          return conns.map((conn) => {
            const key = getEdgeKey(id, conn);
            if (renderedEdges.has(key)) return null;
            renderedEdges.add(key);
            const from = positions.get(id);
            const to = positions.get(conn);
            if (!from || !to) return null;
            return (
              <line
                key={key}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="var(--ms-amber, #f59e0b)"
                strokeWidth={2}
                strokeOpacity={0.7}
              />
            );
          });
        })}
        {ids.map((id) => {
          const pos = positions.get(id);
          const loc = locMap.get(id);
          if (!pos || !loc) return null;
          const isCurrent = id === currentLocationId;
          const isSelected = id === selectedLocationId;
          const isVisited = exploredLocationIds.includes(id);
          const fill = isCurrent
            ? "rgba(57, 255, 20, 0.3)"
            : isSelected
              ? "rgba(255, 0, 110, 0.25)"
              : isVisited
                ? "rgba(37, 99, 235, 0.3)"
                : "rgba(64, 64, 64, 0.5)";
          const stroke = isCurrent
            ? "#39ff14"
            : isSelected
              ? "#ff006e"
              : isVisited
                ? "#2563eb"
                : "#525252";
          const isClickable = !!onLocationClick;
          return (
            <g
              key={id}
              onClick={() => onLocationClick?.(id)}
              style={{ cursor: isClickable ? "pointer" : undefined }}
              className={isClickable ? "cursor-pointer" : ""}
            >
              <circle
                cx={pos.x}
                cy={pos.y}
                r={24}
                fill={fill}
                stroke={stroke}
                strokeWidth={isSelected ? 3 : 2}
              />
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="select-none fill-current text-[10px] font-medium pointer-events-none"
                fill={
                  isCurrent ? "#39ff14" : isSelected ? "#ff006e" : isVisited ? "#60a5fa" : "#737373"
                }
              >
                {loc.name.length > 10 ? loc.name.slice(0, 8) + "…" : loc.name}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-neutral-500">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-400" /> Current
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-700/80" /> Visited
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-neutral-500" /> Unexplored
        </span>
        <span className="flex items-center gap-1">
          <span className="h-0.5 w-3 bg-amber-500" /> Path
        </span>
        {selectedLocationId && onMarkVisited && (
          <button
            type="button"
            onClick={() => onMarkVisited(selectedLocationId)}
            disabled={exploredLocationIds.includes(selectedLocationId)}
            className="ml-auto rounded border border-amber-500/50 bg-amber-500/10 px-2 py-1 text-[10px] font-medium text-amber-400 transition hover:bg-amber-500/20 disabled:opacity-50 disabled:hover:bg-amber-500/10"
          >
            {exploredLocationIds.includes(selectedLocationId) ? "Visited ✓" : "Mark as Visited"}
          </button>
        )}
      </div>
    </div>
  );
}
