"use client";

import type { RoomRect, DoorConnection, VentConnection } from "@/campaigns/another-bug-hunt/greta-base-floorplan";
import { GRETA_BASE_FLOORPLAN } from "@/campaigns/another-bug-hunt/greta-base-floorplan";
import { hasRequiredItems } from "@/lib/inventory-utils";
import type { Character } from "@/types/run";

interface GretaBaseFloorplanProps {
  rooms: RoomRect[];
  currentLocationId?: string;
  exploredLocationIds: string[];
  exploredPoiIds: string[];
  /** Party characters (for item-based door unlocks) */
  characters?: Character[];
  selectedLocationId?: string;
  onLocationClick?: (locationId: string) => void;
  onMarkVisited?: (locationId: string) => void;
  /** Compact mode: smaller container, abbreviated legend */
  compact?: boolean;
  className?: string;
}

function getRoomCenter(r: RoomRect) {
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
}

function getEdgeMidpoint(from: RoomRect, to: RoomRect): { x: number; y: number } {
  const fc = getRoomCenter(from);
  const tc = getRoomCenter(to);
  const dx = tc.x - fc.x;
  const dy = tc.y - fc.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const fromEdge = from.w / 2 * Math.abs(ux) + from.h / 2 * Math.abs(uy);
  const t = fromEdge / len;
  return { x: fc.x + dx * Math.min(t, 0.5), y: fc.y + dy * Math.min(t, 0.5) };
}

function LockedDoorIcon({ x, y, size = 10 }: { x: number; y: number; size?: number }) {
  const h = size / 2;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x={-h} y={-h} width={size} height={size} fill="#fff" stroke="#333" strokeWidth={1} />
      <path d={`M ${h} ${-h} L ${-h} ${-h} L ${h} ${h} Z`} fill="#111" />
    </g>
  );
}

function UnlockedDoorIcon({ x, y, size = 10 }: { x: number; y: number; size?: number }) {
  const h = size / 2;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x={-h} y={-h} width={size} height={size} fill="#fff" stroke="#333" strokeWidth={1} />
      <line x1={-h} y1={h} x2={h} y2={-h} stroke="#333" strokeWidth={1} />
    </g>
  );
}

function VentIcon({ x, y, size = 10 }: { x: number; y: number; size?: number }) {
  const h = size / 2;
  const gap = size / 4;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x={-h} y={-h} width={size} height={size} fill="#fff" stroke="#333" strokeWidth={1} />
      <line x1={-h + 2} y1={-gap} x2={h - 2} y2={-gap} stroke="#333" strokeWidth={1} />
      <line x1={-h + 2} y1={0} x2={h - 2} y2={0} stroke="#333" strokeWidth={1} />
      <line x1={-h + 2} y1={gap} x2={h - 2} y2={gap} stroke="#333" strokeWidth={1} />
    </g>
  );
}

export function GretaBaseFloorplan({
  rooms,
  currentLocationId,
  exploredLocationIds,
  exploredPoiIds,
  characters = [],
  selectedLocationId,
  onLocationClick,
  onMarkVisited,
  compact,
  className = "",
}: GretaBaseFloorplanProps) {
  const roomMap = new Map(rooms.map((r) => [r.id, r]));
  const exploredSet = new Set(exploredPoiIds);
  const exploredLocs = new Set(exploredLocationIds);

  const { doors, vents, implicitDoors } = GRETA_BASE_FLOORPLAN;

  const isDoorRevealed = (poiId: string) => exploredSet.has(poiId);
  const isImplicitDoorRevealed = (from: string, to: string) =>
    exploredLocs.has(from) || exploredLocs.has(to);
  const isVentRevealed = (poiIds: string[]) => poiIds.some((id) => exploredSet.has(id));

  const isDoorUnlocked = (d: DoorConnection | Omit<DoorConnection, "poiId">) =>
    d.requiredItemIds?.length
      ? hasRequiredItems(characters, d.requiredItemIds)
      : !d.isLocked;

  const getRoomStyle = (id: string) => {
    const isCurrent = id === currentLocationId;
    const isSelected = id === selectedLocationId;
    const isVisited = exploredLocationIds.includes(id);
    if (isCurrent) return { fill: "rgba(57, 255, 20, 0.35)", stroke: "#39ff14", strokeWidth: 2 };
    if (isSelected) return { fill: "rgba(255, 0, 110, 0.25)", stroke: "#ff006e", strokeWidth: 2 };
    if (isVisited) return { fill: "rgba(37, 99, 235, 0.3)", stroke: "#2563eb", strokeWidth: 1.5 };
    return { fill: "rgba(64, 64, 64, 0.5)", stroke: "#525252", strokeWidth: 1.5 };
  };

  return (
    <div className={`overflow-auto rounded-lg border border-neutral-300 bg-neutral-50 ${compact ? "p-2" : "p-4"} ${className}`}>
      <h4 className={`text-xs font-medium uppercase tracking-wider text-neutral-500 ${compact ? "mb-1" : "mb-3"}`}>
        Greta Base — Minimap
      </h4>
      <svg
        viewBox={`0 0 ${GRETA_BASE_FLOORPLAN.viewBox.w} ${GRETA_BASE_FLOORPLAN.viewBox.h}`}
        className={`h-full w-full ${compact ? "min-h-[140px]" : "min-h-[280px]"}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern id="grid" width={20} height={20} patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(64,64,64,0.2)" strokeWidth={0.5} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="rgba(34, 64, 34, 0.3)" />
        <rect width="100%" height="100%" fill="url(#grid)" opacity={0.5} />

        {vents.map((v) => {
          const from = roomMap.get(v.from);
          const to = roomMap.get(v.to);
          if (!from || !to || !isVentRevealed(v.poiIds)) return null;
          const fc = getRoomCenter(from);
          const tc = getRoomCenter(to);
          return (
            <g key={`vent-${v.from}-${v.to}`}>
              <line
                x1={fc.x}
                y1={fc.y}
                x2={tc.x}
                y2={tc.y}
                stroke="#ff006e"
                strokeWidth={2}
                strokeDasharray="4 3"
                opacity={0.8}
              />
              <VentIcon x={(fc.x + tc.x) / 2} y={(fc.y + tc.y) / 2} />
            </g>
          );
        })}

        {rooms.map((r) => {
          const style = getRoomStyle(r.id);
          const isClickable = !!onLocationClick;
          return (
            <g
              key={r.id}
              onClick={() => isClickable && onLocationClick?.(r.id)}
              style={{ cursor: isClickable ? "pointer" : undefined }}
            >
              <rect
                x={r.x}
                y={r.y}
                width={r.w}
                height={r.h}
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
                rx={2}
              />
              <text
                x={r.x + r.w / 2}
                y={r.y + r.h / 2 - 6}
                textAnchor="middle"
                className="select-none pointer-events-none text-[10px] font-bold"
                fill={style.stroke}
              >
                [{r.pdfNum}]
              </text>
            </g>
          );
        })}

        {doors.map((d) => {
          const from = roomMap.get(d.from);
          const to = roomMap.get(d.to);
          if (!from || !to || !isDoorRevealed(d.poiId)) return null;
          const pos = getEdgeMidpoint(from, to);
          const unlocked = isDoorUnlocked(d);
          return unlocked ? (
            <UnlockedDoorIcon key={`door-${d.from}-${d.to}-${d.poiId}`} x={pos.x} y={pos.y} />
          ) : (
            <LockedDoorIcon key={`door-${d.from}-${d.to}-${d.poiId}`} x={pos.x} y={pos.y} />
          );
        })}

        {implicitDoors.map((d) => {
          const from = roomMap.get(d.from);
          const to = roomMap.get(d.to);
          if (!from || !to || !isImplicitDoorRevealed(d.from, d.to)) return null;
          const pos = getEdgeMidpoint(from, to);
          const unlocked = isDoorUnlocked(d);
          return unlocked ? (
            <UnlockedDoorIcon key={`implicit-${d.from}-${d.to}`} x={pos.x} y={pos.y} />
          ) : (
            <LockedDoorIcon key={`implicit-${d.from}-${d.to}`} x={pos.x} y={pos.y} />
          );
        })}
      </svg>

      <div className="mt-3 space-y-2 text-[10px] text-neutral-500">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Current
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-500" /> Visited
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-neutral-500" /> Unexplored
          </span>
        </div>
        <div className={`flex flex-wrap items-center ${compact ? "gap-2" : "gap-4"}`}>
          <span className="flex items-center gap-2">
            <svg width={16} height={16} className="shrink-0">
              <LockedDoorIcon x={8} y={8} size={12} />
            </svg>
            Locked door
          </span>
          <span className="flex items-center gap-2">
            <svg width={16} height={16} className="shrink-0">
              <UnlockedDoorIcon x={8} y={8} size={12} />
            </svg>
            Unlocked door
          </span>
          <span className="flex items-center gap-2">
            <svg width={16} height={16} className="shrink-0">
              <VentIcon x={8} y={8} size={12} />
            </svg>
            Vent
          </span>
        </div>
        {selectedLocationId && onMarkVisited && (
          <button
            type="button"
            onClick={() => onMarkVisited(selectedLocationId)}
            className={`rounded border px-2 py-1 text-[10px] font-medium transition ${compact ? "mt-1" : "mt-2"} ${
              exploredLocationIds.includes(selectedLocationId)
                ? "border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                : "border-neutral-400 bg-neutral-200 text-neutral-800 hover:bg-neutral-300"
            }`}
          >
            {exploredLocationIds.includes(selectedLocationId) ? "Visited ✓ (undo)" : "Mark as Visited"}
          </button>
        )}
      </div>
    </div>
  );
}
