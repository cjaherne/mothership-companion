"use client";

import { useState } from "react";
import { getCampaign, getScenario } from "@/campaigns";
import type { CampaignId } from "@/campaigns";
import { completePrologue, setActiveNpc, getRunState, getRun } from "@/lib/runs";
import { AddCharacterModal } from "./AddCharacterModal";
import { WARDEN_NARRATOR_ID } from "@/campaigns/shared/meta-npcs";

interface ScenarioContextMenuProps {
  campaignId: CampaignId;
  runId: string;
  viewState: "briefing" | "session";
  onProceedToSession: () => void;
  onScenarioChange?: () => void;
  onBack?: () => void;
}

export function ScenarioContextMenu({
  campaignId,
  runId,
  viewState,
  onProceedToSession,
  onScenarioChange,
  onBack,
}: ScenarioContextMenuProps) {
  const [showAddCharacter, setShowAddCharacter] = useState(false);

  const campaign = getCampaign(campaignId);
  const run = getRun(runId);
  const runState = getRunState(runId);
  const scenarioId = run?.scenarioId;
  const scenario = scenarioId
    ? getScenario(campaignId, scenarioId)
    : undefined;

  const currentLocationId =
    runState.currentLocationId ?? campaign.world.defaultLocationId;
  const isPrologue =
    !!scenario?.startingLocationId &&
    currentLocationId === scenario.startingLocationId;

  const handleTalkToWarden = () => {
    setActiveNpc(runId, WARDEN_NARRATOR_ID);
    onProceedToSession();
  };

  const handleDepartForSamsa = () => {
    completePrologue(runId, "landing-zone");
    onScenarioChange?.();
  };

  const handleCharacterAdded = () => {
    onScenarioChange?.();
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800 bg-neutral-900/50 px-8 py-3">
        <span className="text-sm font-medium text-neutral-300">
          {campaign.name}
          {scenario && ` — ${scenario.name}`}
        </span>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="rounded border border-neutral-600 px-3 py-1.5 text-xs text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
            >
              ← Back
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowAddCharacter(true)}
            className="rounded border border-neon-pink/50 px-3 py-1.5 text-xs font-medium text-neon-pink hover:bg-neon-pink/10"
          >
            New Character
          </button>
          {isPrologue && (
            <button
              type="button"
              onClick={handleDepartForSamsa}
              className="rounded border border-neon-pink/50 bg-neon-pink/5 px-3 py-1.5 text-xs font-medium text-neon-pink hover:bg-neon-pink/10"
            >
              Depart for Samsa VI
            </button>
          )}
          <button
            type="button"
            onClick={handleTalkToWarden}
            className="rounded border border-neutral-600 bg-neutral-800/50 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white"
          >
            Talk to Warden
          </button>
        </div>
      </div>

      {showAddCharacter && (
        <AddCharacterModal
          runId={runId}
          onClose={() => setShowAddCharacter(false)}
          onAdded={handleCharacterAdded}
        />
      )}
    </>
  );
}
