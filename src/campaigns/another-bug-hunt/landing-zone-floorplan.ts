/**
 * Landing Zone internal map — Dropship, Prefab, Deep Tread Tracks.
 * Nodes are keyed by POI ID. Visibility driven by exploredPoiIds.
 */

export interface LandingZoneNode {
  id: string;
  name: string;
  x: number;
  y: number;
  /** POI ID that must be in exploredPoiIds for this node to be visible */
  poiId: string;
}

/** Connections between nodes (paths) — only visible when both endpoints are visible */
export interface LandingZonePath {
  from: string;
  to: string;
}

const NODES: LandingZoneNode[] = [
  { id: "dropship", name: "Dropship", x: 200, y: 80, poiId: "dropship" },
  { id: "prefab", name: "Prefab", x: 80, y: 180, poiId: "landing-zone-prefab" },
  { id: "tread-tracks", name: "Tread Tracks", x: 320, y: 180, poiId: "tread-tracks" },
];

const PATHS: LandingZonePath[] = [
  { from: "dropship", to: "prefab" },
  { from: "dropship", to: "tread-tracks" },
  { from: "prefab", to: "tread-tracks" },
];

export const LANDING_ZONE_FLOORPLAN = {
  viewBox: { w: 400, h: 260 },
  nodes: NODES,
  paths: PATHS,
};
