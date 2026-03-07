/**
 * Campaign run storage (localStorage)
 *
 * Tracks previous runs for Resume functionality.
 */

const STORAGE_KEY = "mothership-runs";

export interface CampaignRun {
  id: string;
  campaignId: string;
  createdAt: string; // ISO
  lastPlayedAt?: string; // ISO
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

export function getRunsForCampaign(campaignId: string): CampaignRun[] {
  return getRuns().filter((r) => r.campaignId === campaignId);
}

export function createRun(campaignId: string): CampaignRun {
  const run: CampaignRun = {
    id: `run_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    campaignId,
    createdAt: new Date().toISOString(),
  };
  const runs = getRuns();
  runs.unshift(run);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
  return run;
}

export function updateRunLastPlayed(runId: string): void {
  const runs = getRuns();
  const idx = runs.findIndex((r) => r.id === runId);
  if (idx >= 0) {
    runs[idx] = { ...runs[idx], lastPlayedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
  }
}
