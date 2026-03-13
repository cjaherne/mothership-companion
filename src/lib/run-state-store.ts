/**
 * Server-side in-memory run state store
 *
 * Used by /api/run/state for voice and orchestration.
 * Resets on server restart.
 */

import type { RunState } from "@/types/run";

export const stateStore = new Map<string, RunState>();

export function clearRunState(runId: string): void {
  stateStore.delete(runId);
}
