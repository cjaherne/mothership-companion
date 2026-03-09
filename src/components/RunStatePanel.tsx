"use client";

import { useState } from "react";
import { getRunState } from "@/lib/runs";
import { getCampaign } from "@/campaigns";

interface RunStatePanelProps {
  runId: string;
  campaignId: string;
}

export function RunStatePanel({ runId, campaignId }: RunStatePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const state = getRunState(runId);
  const campaign = getCampaign(campaignId);

  const locationNames = new Map(
    campaign.world.locations.map((l) => [l.id, l.name])
  );

  return (
    <div className="rounded-lg border border-neutral-300">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-neutral-700 hover:text-neutral-900"
      >
        <span>Run state</span>
        <span className="text-xs">{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && (
        <div className="space-y-4 border-t border-neutral-300 px-4 py-3 text-sm">
          {state.characters.length > 0 && (
            <div>
              <h5 className="mb-1 text-xs font-medium text-neutral-500">
                Characters
              </h5>
              <ul className="space-y-1">
                {state.characters.map((c) => (
                  <li key={c.id} className="text-neutral-800">
                    {c.name}
                    {c.traits.length > 0 && (
                      <span className="ml-2 text-neutral-600">
                        ({c.traits.join(", ")})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {state.exploredLocationIds.length > 0 && (
            <div>
              <h5 className="mb-1 text-xs font-medium text-neutral-500">
                Explored
              </h5>
              <p className="text-neutral-700">
                {state.exploredLocationIds
                  .map((id) => locationNames.get(id) ?? id)
                  .join(", ")}
              </p>
            </div>
          )}
          {state.interactedNpcIds.length > 0 && (
            <div>
              <h5 className="mb-1 text-xs font-medium text-neutral-500">
                NPCs interacted
              </h5>
              <p className="text-neutral-700">{state.interactedNpcIds.join(", ")}</p>
            </div>
          )}
          {Object.keys(state.npcAttributeState).length > 0 && (
            <div>
              <h5 className="mb-1 text-xs font-medium text-neutral-500">
                NPC attitudes
              </h5>
              <ul className="space-y-1">
                {Object.entries(state.npcAttributeState).map(([npcId, attrs]) => (
                  <li key={npcId} className="text-neutral-700">
                    {npcId}: fear {attrs.fear.toFixed(2)}, stress{" "}
                    {attrs.stress.toFixed(2)}, affability{" "}
                    {attrs.affability.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {state.playerKnowledgeFactIds.length > 0 && (
            <div>
              <h5 className="mb-1 text-xs font-medium text-neutral-500">
                Facts learned
              </h5>
              <p className="text-neutral-700">
                {state.playerKnowledgeFactIds.length} fact(s)
              </p>
            </div>
          )}
          {state.characters.length === 0 &&
            state.exploredLocationIds.length === 0 &&
            state.interactedNpcIds.length === 0 &&
            Object.keys(state.npcAttributeState).length === 0 && (
              <p className="text-neutral-600">No state recorded yet.</p>
            )}
        </div>
      )}
    </div>
  );
}
