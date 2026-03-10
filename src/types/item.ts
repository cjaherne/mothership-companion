/**
 * Mothership Companion - Item types
 *
 * Unified item schema for inventory, POI loot, and unlock requirements.
 */

export type ItemId = string;

/** A single item with unique ID */
export interface Item {
  id: ItemId;
  name: string;
  description?: string;
}
