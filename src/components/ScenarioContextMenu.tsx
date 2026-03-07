"use client";

import { useState } from "react";
import { getCampaign, getScenario, getNpcsInLocation } from "@/campaigns";
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
  const npcsInLocation = getNpcsInLocation(campaign, runState, currentLocationId);
  const showTalkToNpc =
    !!runState.activeNpcId &&
    runState.activeNpcId !== WARDEN_NARRATOR_ID &&
    npcsInLocation.includes(runState.activeNpcId);

  const handleTalkToWarden = () => {
    setActiveNpc(runId, WARDEN_NARRATOR_ID);
    onProceedToSession();
  };

  const handleTalkToNpc = () => {
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
      <div className="flex flex-wrap items-center gap-2 border-b border-amber-950/50 bg-amber-950/10 px-8 py-3">
        <span className="text-sm font-medium text-amber-200/90">
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
            className="rounded border border-amber-500/50 px-3 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-500/10"
          >
            New Character
          </button>
          {isPrologue && (
            <button
              type="button"
              onClick={handleDepartForSamsa}
              className="rounded border border-amber-500/50 bg-amber-500/5 px-3 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-500/10"
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
          {showTalkToNpc && (
            <button
              type="button"
              onClick={handleTalkToNpc}
              className="rounded border border-amber-500/50 bg-amber-500/5 px-3 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-500/10"
            >
              Talk to NPC
            </button>
          )}
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
