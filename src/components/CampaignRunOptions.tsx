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
        <h3 className="mb-1 text-xl font-semibold text-neutral-900">
          {campaign.name}
        </h3>
        <p className="text-sm text-neutral-600">{campaign.description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleCreateNew}
          className="group flex flex-col items-start rounded-lg border border-neutral-400 bg-neutral-100 p-6 text-left transition-all hover:border-neutral-500 hover:bg-neutral-200"
        >
          <span className="mb-2 text-2xl">▶</span>
          <span className="font-medium text-neutral-900 group-hover:text-neutral-900">
            Create New Run
          </span>
          <span className="mt-1 text-xs text-neutral-600">
            Start a fresh session
          </span>
        </button>

        <div className="flex flex-col rounded-lg border border-neutral-300 bg-neutral-50 p-6">
          <span className="mb-2 text-2xl text-neutral-500">↻</span>
          <span className="font-medium text-neutral-900">
            Resume Previous Run
          </span>
          <span className="mt-1 text-xs text-neutral-600">
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
                    className="min-w-0 flex-1 rounded px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900"
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
                    className="shrink-0 rounded px-2 py-1 text-xs text-neutral-500 opacity-0 transition hover:bg-red-100 hover:text-red-600 group-hover:opacity-100"
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
