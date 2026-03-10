/**
 * Inventory utilities for item-based unlocks and crafting
 */

import type { CraftRecipe } from "@/campaigns/types";
import type { Character } from "@/types/run";

/** Collect all item IDs possessed by the party (union across characters) */
export function getPartyItemIds(characters: Character[]): string[] {
  const set = new Set<string>();
  for (const c of characters) {
    const ids = c.inventoryItemIds ?? [];
    ids.forEach((id) => set.add(id));
  }
  return Array.from(set);
}

/** True if the party has all required item IDs (any character can hold each) */
export function hasRequiredItems(
  characters: Character[],
  requiredItemIds: string[] | undefined
): boolean {
  if (!requiredItemIds?.length) return true;
  const partyIds = new Set(getPartyItemIds(characters));
  return requiredItemIds.every((id) => partyIds.has(id));
}

/** Get character inventory as mutable count map (for crafting) */
function getInventoryCounts(inventoryItemIds: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const id of inventoryItemIds) {
    m.set(id, (m.get(id) ?? 0) + 1);
  }
  return m;
}

/** True if character has all input items (with correct counts) for a recipe */
export function canCraft(
  character: Character,
  recipe: CraftRecipe
): boolean {
  const inv = getInventoryCounts(character.inventoryItemIds ?? []);
  for (const id of recipe.inputItemIds) {
    const have = inv.get(id) ?? 0;
    if (have < 1) return false;
    inv.set(id, have - 1);
  }
  return true;
}

/** Find a recipe whose inputs exactly match the given item IDs (order-independent) */
export function findMatchingRecipe(
  inputItemIds: string[],
  recipes: CraftRecipe[]
): CraftRecipe | undefined {
  const sortedInput = [...inputItemIds].sort();
  return recipes.find((r) => {
    const sortedRecipe = [...r.inputItemIds].sort();
    if (sortedRecipe.length !== sortedInput.length) return false;
    return sortedRecipe.every((id, i) => id === sortedInput[i]);
  });
}
