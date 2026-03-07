"use client";

import { getNpcProfile } from "@/campaigns";
import type { CampaignId } from "@/campaigns";

interface NpcSelectorProps {
  campaignId: CampaignId;
  npcIds: string[];
  activeNpcId?: string;
  onSelectNpc: (npcId: string) => void;
  className?: string;
}

export function NpcSelector({
  campaignId,
  npcIds,
  activeNpcId,
  onSelectNpc,
  className = "",
}: NpcSelectorProps) {
  if (npcIds.length === 0) {
    return (
      <div
        className={`flex flex-col overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950/50 ${className}`}
      >
        <h4 className="border-b border-neutral-800 px-4 py-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
          NPCs
        </h4>
        <p className="p-4 text-sm text-neutral-500">No NPCs available here.</p>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950/50 ${className}`}
    >
      <h4 className="border-b border-neutral-800 px-4 py-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
        NPCs in this location
      </h4>
      <ul className="flex-1 overflow-y-auto p-2">
        {npcIds.map((npcId) => {
          const profile = getNpcProfile(npcId);
          const name = profile?.name ?? npcId;
          const isSelected = activeNpcId === npcId;
          return (
            <li key={npcId}>
              <button
                type="button"
                onClick={() => onSelectNpc(npcId)}
                className={`w-full rounded px-3 py-2 text-left text-sm transition ${
                  isSelected
                    ? "bg-neon-cyan/20 text-neon-cyan"
                    : "text-neutral-200 hover:bg-neutral-800/80"
                }`}
              >
                {name}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
