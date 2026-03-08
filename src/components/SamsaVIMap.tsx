"use client";

import type { PlanetMap } from "@/campaigns/types";

interface SamsaVIMapProps {
  planetMap: PlanetMap;
  currentRegionId?: string;
  exploredRegionIds: string[];
  knownRegionIds?: string[];
  exploredPoiIds?: string[];
  selectedRegionId?: string;
  onRegionClick?: (regionId: string) => void;
  onMarkVisited?: (regionId: string) => void;
  className?: string;
}

/** Extract path designation from name (e.g. "Muddy Path A.1" → "A.1", "Rough Trail B" → "B") */
function getPathLabel(name: string): string {
  const m = name.match(/\s([A-E])\.?(\d?)\s*$/);
  if (m) return m[2] ? `${m[1]}.${m[2]}` : m[1]!;
  return name;
}

export function SamsaVIMap({
  planetMap,
  currentRegionId,
  exploredRegionIds,
  knownRegionIds = planetMap.initialKnownRegionIds,
  exploredPoiIds = [],
  selectedRegionId,
  onRegionClick,
  onMarkVisited,
  className = "",
}: SamsaVIMapProps) {
  const exploredPoiSet = new Set(exploredPoiIds);
  const knownPaths = planetMap.paths.filter(
    (p) =>
      p.knownAtStart ||
      (p.requiredPoiId != null && exploredPoiSet.has(p.requiredPoiId))
  );

  const reachableRegionIds: Set<string> = new Set(
    currentRegionId
      ? knownPaths
          .filter(
            (p) =>
              p.fromRegionId === currentRegionId ||
              p.toRegionId === currentRegionId
          )
          .flatMap((p) => [p.fromRegionId, p.toRegionId])
          .filter((id) => id !== currentRegionId && knownRegionIds.includes(id))
      : knownRegionIds
  );

  // Layout: regions as boxes with clear gaps for paths (paths run in gaps, not through boxes)
  const boxW = 95;
  const boxH = 44;
  const gapX = 45;
  const rowY = 70;
  const regionRects: Record<string, { x: number; y: number; w: number; h: number }> = {
    "landing-zone": { x: 30, y: rowY, w: boxW, h: boxH },
    "greta-base": { x: 30 + boxW + gapX, y: rowY, w: boxW, h: boxH },
    "heron-station": { x: 30 + (boxW + gapX) * 2, y: rowY, w: boxW, h: boxH },
    mothership: { x: 30 + boxW + gapX / 2, y: rowY + boxH + 55, w: boxW, h: boxH },
  };

  /** Edge connection points (paths run in gaps between boxes, not through them) */
  const getPathEndpoints = (
    fromId: string,
    toId: string,
    offset: number
  ): { x1: number; y1: number; x2: number; y2: number } | null => {
    const r1 = regionRects[fromId];
    const r2 = regionRects[toId];
    if (!r1 || !r2) return null;
    if (r2.x > r1.x + r1.w) {
      const y = r1.y + r1.h / 2 + offset;
      return { x1: r1.x + r1.w, y1: y, x2: r2.x, y2: y };
    }
    if (r2.x + r2.w < r1.x) {
      const y = r1.y + r1.h / 2 + offset;
      return { x1: r1.x, y1: y, x2: r2.x + r2.w, y2: y };
    }
    if (r2.y > r1.y + r1.h) {
      const cx = (r1.x + r1.w / 2 + r2.x + r2.w / 2) / 2 + offset;
      return { x1: cx, y1: r1.y + r1.h, x2: cx, y2: r2.y };
    }
    if (r2.y + r2.h < r1.y) {
      const cx = (r1.x + r1.w / 2 + r2.x + r2.w / 2) / 2 + offset;
      return { x1: cx, y1: r1.y, x2: cx, y2: r2.y + r2.h };
    }
    return null;
  };

  // Group paths by connection for parallel rendering
  const connectionKey = (a: string, b: string) => [a, b].sort().join("|");
  const pathsByConnection = new Map<string, typeof knownPaths>();
  for (const path of knownPaths) {
    if (
      !knownRegionIds.includes(path.fromRegionId) ||
      !knownRegionIds.includes(path.toRegionId)
    )
      continue;
    const key = connectionKey(path.fromRegionId, path.toRegionId);
    const list = pathsByConnection.get(key) ?? [];
    list.push(path);
    pathsByConnection.set(key, list);
  }

  const getRegionStyle = (id: string) => {
    const isCurrent = id === currentRegionId;
    const isSelected = id === selectedRegionId;
    const isVisited = exploredRegionIds.includes(id);
    const isReachable = currentRegionId ? reachableRegionIds.has(id) : true;
    if (isCurrent) return { fill: "rgba(57, 255, 20, 0.35)", stroke: "#39ff14", textFill: "#39ff14", strokeWidth: 2 };
    if (isSelected) return { fill: "rgba(255, 0, 110, 0.25)", stroke: "#ff006e", textFill: "#ff006e", strokeWidth: 2 };
    if (isVisited) return { fill: "rgba(37, 99, 235, 0.3)", stroke: "#2563eb", textFill: "#60a5fa", strokeWidth: 1.5 };
    if (isReachable) return { fill: "rgba(64, 64, 64, 0.5)", stroke: "#525252", textFill: "#a3a3a3", strokeWidth: 1.5 };
    return { fill: "rgba(40, 40, 40, 0.5)", stroke: "#404040", textFill: "#737373", strokeWidth: 1.5 };
  };

  return (
    <div
      className={`overflow-auto rounded-lg border border-neutral-800 bg-neutral-950/50 p-2 ${className}`}
    >
      <h4 className="mb-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
        Samsa VI
      </h4>
      <svg
        viewBox="0 0 470 280"
        className="h-full min-h-[120px] w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern id="samsa-grid" width={20} height={20} patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(64,64,64,0.2)" strokeWidth={0.5} />
          </pattern>
        </defs>
        {/* Background — same as Greta Base floorplan */}
        <rect width="100%" height="100%" fill="rgba(34, 64, 34, 0.3)" />
        <rect width="100%" height="100%" fill="url(#samsa-grid)" opacity={0.5} />

        {/* Paths — run in gaps between boxes, render before regions so regions draw on top */}
        {Array.from(pathsByConnection.entries()).flatMap(([, paths]) => {
          const path = paths[0]!;
          const pathOffset = 18;
          return paths.map((p, i) => {
            const n = paths.length;
            const vertOffset = n === 1 ? 0 : (i - (n - 1) / 2) * pathOffset;
            const pts = getPathEndpoints(p.fromRegionId, p.toRegionId, vertOffset);
            if (!pts) return null;
            const midX = (pts.x1 + pts.x2) / 2;
            const midY = (pts.y1 + pts.y2) / 2;
            const label = getPathLabel(p.name);
            const labelW = Math.max(label.length * 7 + 10, 28);
            const labelH = 18;
            return (
              <g key={p.id}>
                <line
                  x1={pts.x1}
                  y1={pts.y1}
                  x2={pts.x2}
                  y2={pts.y2}
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeOpacity={0.9}
                />
                <rect
                  x={midX - labelW / 2}
                  y={midY - labelH / 2}
                  width={labelW}
                  height={labelH}
                  rx={3}
                  fill="rgba(17, 24, 39, 0.98)"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  strokeOpacity={0.9}
                />
                <text
                  x={midX}
                  y={midY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="select-none text-[10px] font-bold"
                  fill="#f59e0b"
                >
                  {label}
                </text>
              </g>
            );
          });
        })}

        {/* Regions (rectangular, like Internal Map) */}
        {planetMap.regions
          .filter((r) => knownRegionIds.includes(r.id))
          .map((region) => {
            const rect = regionRects[region.id];
            if (!rect) return null;
            const style = getRegionStyle(region.id);
            const isReachable = !currentRegionId || reachableRegionIds.has(region.id);
            const isClickable = !!onRegionClick && isReachable;
            return (
              <g
                key={region.id}
                onClick={() => isClickable && onRegionClick?.(region.id)}
                style={{ cursor: isClickable ? "pointer" : "default" }}
                opacity={isReachable ? 1 : 0.45}
              >
                <rect
                  x={rect.x}
                  y={rect.y}
                  width={rect.w}
                  height={rect.h}
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth={style.strokeWidth}
                  rx={2}
                />
                <text
                  x={rect.x + rect.w / 2}
                  y={rect.y + rect.h / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="select-none pointer-events-none text-[10px] font-medium"
                  fill={(style as { textFill?: string }).textFill ?? style.stroke}
                >
                  {region.name}
                </text>
              </g>
            );
          })}
      </svg>

      {/* Legend */}
      <div className="mt-1 flex flex-wrap items-center gap-2 text-[9px] text-neutral-500">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Current
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Visited
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-neutral-500" /> Unexplored
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Path
        </span>
        {selectedRegionId && onMarkVisited && reachableRegionIds.has(selectedRegionId) && (
          <button
            type="button"
            onClick={() => onMarkVisited(selectedRegionId)}
            className={`rounded border px-1.5 py-0.5 text-[9px] font-medium transition ${
              exploredRegionIds.includes(selectedRegionId)
                ? "border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                : "border-amber-500/50 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
            }`}
          >
            {exploredRegionIds.includes(selectedRegionId) ? "Visited ✓ (undo)" : "Mark as Visited"}
          </button>
        )}
      </div>
    </div>
  );
}
