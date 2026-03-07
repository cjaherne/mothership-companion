"use client";

import { getCampaign } from "@/campaigns";
import type { CampaignId } from "@/campaigns";
import {
  getRunsForCampaign,
  createRun,
  deleteRun,
  getRunState,
  type CampaignRun,
} from "@/lib/runs";
import { useState } from "react";

interface CampaignRunOptionsProps {
  campaignId: CampaignId;
  onStartRun: (campaignId: CampaignId, runId: string) => void;
  onSetupRun: (campaignId: CampaignId, run: import("@/lib/runs").CampaignRun) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CampaignRunOptions({
  campaignId,
  onStartRun,
  onSetupRun,
}: CampaignRunOptionsProps) {
  const campaign = getCampaign(campaignId);
  const [runs, setRuns] = useState<CampaignRun[]>(() =>
    getRunsForCampaign(campaignId)
  );

  const handleCreateNew = () => {
    const campaign = getCampaign(campaignId);
    const scenarioId = campaign.scenarios?.[0]?.id ?? undefined;
    const run = createRun(campaignId, scenarioId);
    setRuns((prev) => [run, ...prev]);
    onSetupRun(campaignId, run);
  };

  const handleResume = (run: CampaignRun) => {
    onStartRun(campaignId, run.id);
  };

  const handleDelete = (e: React.MouseEvent, run: CampaignRun) => {
    e.stopPropagation();
    if (confirm(`Delete this run from ${formatDate(run.lastPlayedAt ?? run.createdAt)}? This cannot be undone.`)) {
      deleteRun(run.id);
      setRuns((prev) => prev.filter((r) => r.id !== run.id));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-1 text-xl font-semibold text-white">
          {campaign.name}
        </h3>
        <p className="text-sm text-neutral-400">{campaign.description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleCreateNew}
          className="group flex flex-col items-start rounded-lg border border-neon-cyan/30 bg-neon-cyan/5 p-6 text-left transition-all hover:border-neon-cyan/60 hover:bg-neon-cyan/10 hover:shadow-neon-cyan"
        >
          <span className="mb-2 text-2xl">▶</span>
          <span className="font-medium text-neon-cyan group-hover:text-neon-cyan">
            Create New Run
          </span>
          <span className="mt-1 text-xs text-neutral-400">
            Start a fresh session
          </span>
        </button>

        <div className="flex flex-col rounded-lg border border-neutral-800 bg-neutral-950/50 p-6">
          <span className="mb-2 text-2xl text-neutral-600">↻</span>
          <span className="font-medium text-neutral-300">
            Resume Previous Run
          </span>
          <span className="mt-1 text-xs text-neutral-500">
            Continue from a saved session
          </span>
          {runs.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-500">
              No previous runs for this campaign.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {runs.slice(0, 5).map((run) => (
                <li key={run.id} className="group flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleResume(run)}
                    className="min-w-0 flex-1 rounded px-3 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white"
                  >
                    <span className="block">
                      {formatDate(run.lastPlayedAt ?? run.createdAt)}
                    </span>
                    {getRunState(run.id).characters.length > 0 && (
                      <span className="mt-0.5 block text-xs text-neutral-500">
                        {getRunState(run.id).characters
                          .map((c) => c.name)
                          .join(", ")}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, run)}
                    className="shrink-0 rounded px-2 py-1 text-xs text-neutral-500 opacity-0 transition hover:bg-red-950/50 hover:text-red-400 group-hover:opacity-100"
                    title="Delete run"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
