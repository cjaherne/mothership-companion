"use client";

import type { Location } from "@/campaigns/types";

interface OverviewMapProps {
  locations: Location[];
  currentLocationId?: string;
  exploredLocationIds: string[];
  scenarioLocationIds?: string[];
  /** Location being viewed in detail (for highlight) */
  selectedLocationId?: string;
  /** Callback when user clicks a location node */
  onLocationClick?: (locationId: string) => void;
  className?: string;
}

/** Simple grid layout for location nodes */
function layoutNodes(
  locations: Location[],
  scenarioLocationIds?: string[]
): Map<string, { x: number; y: number }> {
  const ids = scenarioLocationIds?.length
    ? locations.filter((l) => scenarioLocationIds.includes(l.id)).map((l) => l.id)
    : locations.map((l) => l.id);
  const positions = new Map<string, { x: number; y: number }>();
  const cols = Math.ceil(Math.sqrt(ids.length));
  ids.forEach((id, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    positions.set(id, { x: col * 100 + 60, y: row * 70 + 50 });
  });
  return positions;
}

export function OverviewMap({
  locations,
  currentLocationId,
  exploredLocationIds,
  scenarioLocationIds,
  selectedLocationId,
  onLocationClick,
  className = "",
}: OverviewMapProps) {
  const ids = scenarioLocationIds?.length
    ? locations.filter((l) => scenarioLocationIds.includes(l.id)).map((l) => l.id)
    : locations.map((l) => l.id);
  const locMap = new Map(locations.map((l) => [l.id, l]));
  const positions = layoutNodes(locations, scenarioLocationIds);

  const renderedEdges = new Set<string>();
  const getEdgeKey = (a: string, b: string) =>
    [a, b].sort().join("-");

  return (
    <div
      className={`overflow-auto rounded-lg border border-neutral-800 bg-neutral-950/50 p-4 ${className}`}
    >
      <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
        Map
      </h4>
      <svg
        viewBox="0 0 400 250"
        className="h-full min-h-[200px] w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Edges (paths) */}
        {ids.map((id) => {
          const loc = locMap.get(id);
          const conns = loc?.connectedLocationIds ?? [];
          return conns.map((conn) => {
            const key = getEdgeKey(id, conn);
            if (renderedEdges.has(key) || !ids.includes(conn)) return null;
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
        {/* Nodes */}
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
              style={{
                cursor: isClickable ? "pointer" : undefined,
              }}
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
                fill={isCurrent ? "#39ff14" : isSelected ? "#ff006e" : isVisited ? "#60a5fa" : "#737373"}
              >
                {loc.name.length > 10
                  ? loc.name.slice(0, 8) + "…"
                  : loc.name}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-neutral-500">
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
      </div>
    </div>
  );
}
