"use client";

import { LANDING_ZONE_FLOORPLAN } from "@/campaigns/another-bug-hunt/landing-zone-floorplan";

interface LandingZoneFloorplanProps {
  exploredPoiIds: string[];
  selectedPoiId?: string;
  onPoiClick?: (poiId: string) => void;
  onMarkPoiExplored?: (poiId: string) => void;
  compact?: boolean;
  className?: string;
}

export function LandingZoneFloorplan({
  exploredPoiIds,
  selectedPoiId,
  onPoiClick,
  onMarkPoiExplored,
  compact,
  className = "",
}: LandingZoneFloorplanProps) {
  const exploredSet = new Set(exploredPoiIds);
  const { nodes, paths, viewBox } = LANDING_ZONE_FLOORPLAN;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const isNodeVisible = (node: (typeof nodes)[0]) => exploredSet.has(node.poiId);

  const visibleNodes = nodes.filter(isNodeVisible);
  const visibleIds = new Set(visibleNodes.map((n) => n.id));

  const getNodeStyle = (poiId: string) => {
    const isSelected = poiId === selectedPoiId;
    const isExplored = exploredSet.has(poiId);
    if (isSelected) return { fill: "rgba(255, 0, 110, 0.25)", stroke: "#ff006e", strokeWidth: 3 };
    if (isExplored) return { fill: "rgba(37, 99, 235, 0.3)", stroke: "#2563eb", strokeWidth: 2 };
    return { fill: "rgba(64, 64, 64, 0.5)", stroke: "#525252", strokeWidth: 2 };
  };

  return (
    <div
      className={`flex min-h-0 flex-col overflow-hidden rounded-lg border-2 border-neutral-600 bg-neutral-800/60 ${compact ? "p-2" : "p-4"} ${className}`}
    >
      <h4
        className={`font-heading shrink-0 text-xs font-medium uppercase tracking-wider text-amber-200/90 ${compact ? "mb-1" : "mb-3"}`}
      >
        Landing Zone — Internal Map
      </h4>
      <svg
        viewBox={`0 0 ${viewBox.w} ${viewBox.h}`}
        className="min-h-0 flex-1 w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern id="landing-grid" width={20} height={20} patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(64,64,64,0.2)" strokeWidth={0.5} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="rgba(34, 64, 34, 0.3)" />
        <rect width="100%" height="100%" fill="url(#landing-grid)" opacity={0.5} />

        {/* Paths — only between visible nodes */}
        {paths.map((p) => {
          const from = nodeMap.get(p.from);
          const to = nodeMap.get(p.to);
          if (
            !from ||
            !to ||
            !visibleIds.has(p.from) ||
            !visibleIds.has(p.to)
          )
            return null;
          return (
            <line
              key={`${p.from}-${p.to}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="var(--ms-amber, #f59e0b)"
              strokeWidth={2}
              strokeOpacity={0.7}
            />
          );
        })}

        {/* Nodes — only visible when explored */}
        {visibleNodes.map((node) => {
          const style = getNodeStyle(node.poiId);
          const isClickable = !!onPoiClick;
          return (
            <g
              key={node.id}
              onClick={() => isClickable && onPoiClick?.(node.poiId)}
              style={{ cursor: isClickable ? "pointer" : undefined }}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={28}
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
              />
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="select-none fill-current text-[10px] font-medium pointer-events-none"
                fill={style.stroke === "#ff006e" ? "#ff006e" : "#60a5fa"}
              >
                {node.name.length > 12 ? node.name.slice(0, 10) + "…" : node.name}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-2 shrink-0 flex flex-wrap items-center gap-3 text-[10px] text-neutral-400">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-blue-500" /> Explored
        </span>
        <span className="flex items-center gap-1">
          <span className="h-0.5 w-3 bg-amber-500/70" /> Path
        </span>
        {selectedPoiId && onMarkPoiExplored && exploredSet.has(selectedPoiId) && (
          <button
            type="button"
            onClick={() => onMarkPoiExplored(selectedPoiId)}
            className="ml-auto rounded border px-2 py-1 text-[10px] font-medium transition border-green-600 bg-green-900/40 text-green-400 hover:bg-green-900/60"
          >
            Inspected ✓ (undo)
          </button>
        )}
      </div>
    </div>
  );
}
