"use client";

import type { PlanetMap } from "@/campaigns/types";

interface SamsaVIMapProps {
  planetMap: PlanetMap;
  /** Current region ID (e.g. landing-zone, greta-base) */
  currentRegionId?: string;
  /** Region IDs the party has visited */
  exploredRegionIds: string[];
  /** Region IDs the party knows about (default: initialKnownRegionIds; Mothership hidden until unlock) */
  knownRegionIds?: string[];
  /** Region currently selected for detail view */
  selectedRegionId?: string;
  /** Callback when user clicks a region */
  onRegionClick?: (regionId: string) => void;
  /** Callback to mark the selected region as visited */
  onMarkVisited?: (regionId: string) => void;
  className?: string;
}

export function SamsaVIMap({
  planetMap,
  currentRegionId,
  exploredRegionIds,
  knownRegionIds = planetMap.initialKnownRegionIds,
  selectedRegionId,
  onRegionClick,
  onMarkVisited,
  className = "",
}: SamsaVIMapProps) {
  const knownPaths = planetMap.paths.filter((p) => p.knownAtStart);

  const layout: Record<string, { x: number; y: number }> = {
    "landing-zone": { x: 80, y: 120 },
    "greta-base": { x: 200, y: 120 },
    "heron-station": { x: 320, y: 120 },
    mothership: { x: 200, y: 220 },
  };

  return (
    <div
      className={`overflow-auto rounded-lg border border-neutral-800 bg-neutral-950/50 p-4 ${className}`}
    >
      <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
        Samsa VI
      </h4>
      <svg
        viewBox="0 0 400 280"
        className="h-full min-h-[180px] w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {knownPaths.map((path) => {
          const from = layout[path.fromRegionId];
          const to = layout[path.toRegionId];
          if (!from || !to || !knownRegionIds.includes(path.fromRegionId) || !knownRegionIds.includes(path.toRegionId))
            return null;
          return (
            <g key={path.id}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="var(--ms-amber, #f59e0b)"
                strokeWidth={2}
                strokeOpacity={0.7}
              />
              <text
                x={(from.x + to.x) / 2}
                y={(from.y + to.y) / 2 - 8}
                textAnchor="middle"
                className="fill-current text-[9px]"
                fill="#ff006e"
              >
                {path.name.match(/ ([A-E])$/)?.[1] ?? path.name}
              </text>
            </g>
          );
        })}
        {planetMap.regions
          .filter((r) => knownRegionIds.includes(r.id))
          .map((region) => {
            const pos = layout[region.id];
            if (!pos) return null;
            const isVisited = exploredRegionIds.includes(region.id);
            const isCurrent = region.id === currentRegionId;
            const isSelected = region.id === selectedRegionId;
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
            const isClickable = !!onRegionClick;
            return (
              <g
                key={region.id}
                onClick={() => onRegionClick?.(region.id)}
                style={{ cursor: isClickable ? "pointer" : undefined }}
                className={isClickable ? "cursor-pointer" : ""}
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={28}
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
                  {region.name}
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
          <span className="h-0.5 w-3 bg-neon-pink" /> Path
        </span>
        {selectedRegionId && onMarkVisited && (
          <button
            type="button"
            onClick={() => onMarkVisited(selectedRegionId)}
            disabled={exploredRegionIds.includes(selectedRegionId)}
            className="ml-auto rounded border border-amber-500/50 bg-amber-500/10 px-2 py-1 text-[10px] font-medium text-amber-400 transition hover:bg-amber-500/20 disabled:opacity-50 disabled:hover:bg-amber-500/10"
          >
            {exploredRegionIds.includes(selectedRegionId) ? "Visited ✓" : "Mark as Visited"}
          </button>
        )}
      </div>
    </div>
  );
}
