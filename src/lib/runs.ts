/**
 * Campaign run storage (localStorage)
 *
 * Tracks runs, character creation, and game state for persistence.
 */

import { getCampaign, getScenario } from "@/campaigns";
import type { RunState, Character } from "@/types/run";
import { EMPTY_RUN_STATE } from "@/types/run";

const STORAGE_KEY = "mothership-runs";

export interface CampaignRun {
  id: string;
  campaignId: string;
  /** Scenario ID for multi-scenario campaigns */
  scenarioId?: string;
  createdAt: string;
  lastPlayedAt?: string;
  /** Persisted game state */
  state?: RunState;
}

export function getRuns(): CampaignRun[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CampaignRun[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getRun(runId: string): CampaignRun | undefined {
  return getRuns().find((r) => r.id === runId);
}

export function getRunsForCampaign(campaignId: string): CampaignRun[] {
  return getRuns().filter((r) => r.campaignId === campaignId);
}

export function deleteRun(runId: string): void {
  const runs = getRuns().filter((r) => r.id !== runId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
}

export function getRunState(runId: string): RunState {
  const run = getRun(runId);
  return run?.state ? { ...EMPTY_RUN_STATE, ...run.state } : { ...EMPTY_RUN_STATE };
}

export function createRun(
  campaignId: string,
  scenarioId: string | undefined,
  initialState?: Partial<RunState>
): CampaignRun {
  let state = {
    ...EMPTY_RUN_STATE,
    ...initialState,
    turn: initialState?.turn ?? 0,
  };

  // Resolve starting location from scenario or world default
  if (typeof window !== "undefined") {
    try {
      let startingLocationId: string | undefined;
      if (scenarioId) {
        const scenario = getScenario(campaignId, scenarioId);
        startingLocationId = scenario?.startingLocationId;
      }
      if (!startingLocationId) {
        startingLocationId = getCampaign(campaignId).world.defaultLocationId;
      }
      if (startingLocationId) {
        state = {
          ...state,
          currentLocationId: startingLocationId,
          exploredLocationIds: [startingLocationId],
        };
      }
    } catch {
      // Campaign module may not be available in SSR
    }
  }

  const run: CampaignRun = {
    id: `run_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    campaignId,
    scenarioId,
    createdAt: new Date().toISOString(),
    state,
  };
  const runs = getRuns();
  runs.unshift(run);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
  syncRunStateToApi(run.id);
  return run;
}

export function updateRunLastPlayed(runId: string): void {
  updateRun(runId, { lastPlayedAt: new Date().toISOString() });
}

export function updateRun(
  runId: string,
  patch: Partial<Pick<CampaignRun, "lastPlayedAt" | "state">>
): void {
  const runs = getRuns();
  const idx = runs.findIndex((r) => r.id === runId);
  if (idx >= 0) {
    if (patch.state) {
      const current = runs[idx].state ?? { ...EMPTY_RUN_STATE };
      runs[idx] = {
        ...runs[idx],
        ...patch,
        state: deepMergeRunState(current, patch.state),
      };
    } else {
      runs[idx] = { ...runs[idx], ...patch };
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
  }
}

export function saveRunState(runId: string, statePatch: Partial<RunState>): void {
  const current = getRunState(runId);
  const merged = deepMergeRunState(current, statePatch);
  updateRun(runId, { state: merged });
  syncRunStateToApi(runId);
}

/** Sync localStorage state to API so agent can read it */
function syncRunStateToApi(runId: string): void {
  if (typeof window === "undefined") return;
  const state = getRunState(runId);
  fetch("/api/run/state", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ runId, state }),
  }).catch(() => {});
}

/** Awaitable sync - use before connecting to ensure agent has run state */
export async function syncRunStateToApiAsync(runId: string): Promise<void> {
  if (typeof window === "undefined") return;
  const state = getRunState(runId);
  await fetch("/api/run/state", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ runId, state }),
  });
}

function deepMergeRunState(
  current: RunState,
  patch: Partial<RunState>
): RunState {
  return {
    ...current,
    ...patch,
    characters: patch.characters ?? current.characters,
    npcAttributeState: {
      ...current.npcAttributeState,
      ...(patch.npcAttributeState ?? {}),
    },
    exploredLocationIds: patch.exploredLocationIds ?? current.exploredLocationIds,
    interactedNpcIds: patch.interactedNpcIds ?? current.interactedNpcIds,
    playerKnowledgeFactIds:
      patch.playerKnowledgeFactIds ?? current.playerKnowledgeFactIds,
  };
}

export function addCharacter(runId: string, character: Character): void {
  const state = getRunState(runId);
  const chars = [...state.characters, character];
  saveRunState(runId, { characters: chars });
}

export function removeCharacter(runId: string, characterId: string): void {
  const state = getRunState(runId);
  const chars = state.characters.filter((c) => c.id !== characterId);
  saveRunState(runId, { characters: chars });
}

/** Update a character by ID (e.g. set avatarPath) */
export function updateCharacter(
  runId: string,
  characterId: string,
  patch: Partial<Character>
): void {
  const state = getRunState(runId);
  const chars = state.characters.map((c) =>
    c.id === characterId ? { ...c, ...patch } : c
  );
  saveRunState(runId, { characters: chars });
}

/** Mark a location as explored (unlocks NPCs with location-based conditions) */
export function addExploredLocation(runId: string, locationId: string): void {
  const state = getRunState(runId);
  const ids = state.exploredLocationIds ?? [];
  if (!ids.includes(locationId)) {
    saveRunState(runId, {
      exploredLocationIds: [...ids, locationId],
    });
  }
}

/** Set active NPC for voice session */
export function setActiveNpc(runId: string, npcId: string | undefined): void {
  saveRunState(runId, { activeNpcId: npcId });
}

/** Complete prologue: move from The Metamorphosis to Landing Zone */
export function completePrologue(runId: string, landingLocationId: string): void {
  const state = getRunState(runId);
  const explored = new Set(state.exploredLocationIds ?? []);
  explored.add(landingLocationId);
  saveRunState(runId, {
    currentLocationId: landingLocationId,
    exploredLocationIds: Array.from(explored),
  });
}
