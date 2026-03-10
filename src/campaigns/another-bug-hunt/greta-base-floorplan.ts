/**
 * Greta Base floorplan data for the PDF-style minimap.
 * PDF # mapping: 1=landing-zone, 2=airlock, 3=commissary, 4=pantry, 5=freezer,
 * 6=crew-habitat, 7=armory, 8=medbay, 8a=medbay-operating-room, 9=command-center, 10=garage.
 */

export interface RoomRect {
  id: string;
  pdfNum: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DoorConnection {
  from: string;
  to: string;
  /** POI ID that reveals this door (inspect to show locked/unlocked state) */
  poiId: string;
  /** Whether the door is locked (static). If requiredItemIds is set, actual unlock is computed from party inventory. */
  isLocked: boolean;
  /** Item IDs required to unlock; party must possess all. Overrides isLocked when satisfied. */
  requiredItemIds?: string[];
}

export interface VentConnection {
  from: string;
  to: string;
  /** POI IDs that reveal this vent (inspecting either shows the dashed line) */
  poiIds: string[];
}

/** Placeholder icon position for a POI within a room (for future use) */
export interface PoiPlaceholder {
  roomId: string;
  poiId: string;
  /** Offset from room top-left for icon placement */
  x: number;
  y: number;
}

/** Greta Base: exterior approach areas + internal rooms (PDF 2–10). Landing Zone [1] is off-map. */
const ROOMS: RoomRect[] = [
  { id: "outside-airlock", pdfNum: "1a", x: 140, y: 400, w: 100, h: 40 },
  { id: "outside-garage", pdfNum: "1b", x: 385, y: 65, w: 55, h: 55 },
  { id: "airlock", pdfNum: "2", x: 155, y: 320, w: 70, h: 75 },
  { id: "commissary", pdfNum: "3", x: 95, y: 195, w: 115, h: 120 },
  { id: "pantry", pdfNum: "4", x: 215, y: 225, w: 70, h: 90 },
  { id: "freezer", pdfNum: "5", x: 290, y: 140, w: 75, h: 95 },
  { id: "crew-habitat", pdfNum: "6", x: 10, y: 125, w: 80, h: 160 },
  { id: "armory", pdfNum: "7", x: 30, y: 55, w: 55, h: 65 },
  { id: "medbay", pdfNum: "8", x: 180, y: 60, w: 95, h: 130 },
  { id: "medbay-operating-room", pdfNum: "8a", x: 200, y: 10, w: 75, h: 45 },
  { id: "command-center", pdfNum: "9", x: 95, y: 55, w: 80, h: 75 },
  { id: "garage", pdfNum: "10", x: 290, y: 50, w: 90, h: 85 },
];

/** Exterior approach connections (outside ↔ interior); revealed when POI inspected */
const EXTERIOR_DOORS: DoorConnection[] = [
  {
    from: "outside-airlock",
    to: "airlock",
    poiId: "airlock-exterior-door",
    isLocked: true,
    requiredItemIds: ["airlock-keycard"],
  },
  { from: "outside-garage", to: "garage", poiId: "garage-exterior-doors", isLocked: false },
];

const DOORS: DoorConnection[] = [
  ...EXTERIOR_DOORS,
  {
    from: "airlock",
    to: "commissary",
    poiId: "interior-door",
    isLocked: true,
    requiredItemIds: ["interior-keycard"],
  },
  { from: "commissary", to: "pantry", poiId: "kitchenette", isLocked: false },
  { from: "commissary", to: "crew-habitat", poiId: "barricade", isLocked: false },
  { from: "crew-habitat", to: "armory", poiId: "blast-door", isLocked: false },
  {
    from: "medbay",
    to: "medbay-operating-room",
    poiId: "operating-room-door",
    isLocked: true,
    requiredItemIds: ["edem-keycard"],
  },
];

const VENTS: VentConnection[] = [
  { from: "medbay", to: "freezer", poiIds: ["vent-from-freezer", "vent-to-medbay"] },
  { from: "medbay-operating-room", to: "garage", poiIds: ["vent-to-garage", "fuel-barrels"] },
];

/** Generic door connections (no explicit POI; revealed when either room visited) */
const IMPLICIT_DOORS: Omit<DoorConnection, "poiId">[] = [
  { from: "commissary", to: "command-center", isLocked: false },
  { from: "crew-habitat", to: "medbay", isLocked: false },
  { from: "medbay", to: "command-center", isLocked: false },
  {
    from: "medbay",
    to: "freezer",
    isLocked: true,
    requiredItemIds: ["freezer-keycard"],
  },
  { from: "garage", to: "medbay", isLocked: false },
];

/** Placeholder POI positions (for icons not yet categorized). Add entries as needed. */
const POI_PLACEHOLDERS: PoiPlaceholder[] = [
  // Example: { roomId: "commissary", poiId: "birthday-banner", x: 40, y: 20 },
];

export const GRETA_BASE_FLOORPLAN = {
  viewBox: { w: 460, h: 460 },
  rooms: ROOMS,
  doors: DOORS,
  vents: VENTS,
  implicitDoors: IMPLICIT_DOORS,
  poiPlaceholders: POI_PLACEHOLDERS,
};
