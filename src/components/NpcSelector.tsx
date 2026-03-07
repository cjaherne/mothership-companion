"use client";

import Image from "next/image";
import { getNpcProfile } from "@/campaigns";
import type { CampaignId } from "@/campaigns";

const AVATAR_SIZE = 32;
const VISIBLE_ROWS = 4;
const ROW_HEIGHT = 44;

interface NpcSelectorProps {
  campaignId: CampaignId;
  npcIds: string[];
  activeNpcId?: string;
  onSelectNpc: (npcId: string) => void;
  className?: string;
}

function NpcAvatar({ npcId }: { npcId: string }) {
  const profile = getNpcProfile(npcId);
  const avatarPath = profile?.avatarPath;

  if (avatarPath) {
    return (
      <Image
        src={avatarPath}
        alt=""
        width={AVATAR_SIZE}
        height={AVATAR_SIZE}
        className="shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-900/50 text-xs font-medium text-amber-600"
      aria-hidden
    >
      ?
    </div>
  );
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
        className={`flex flex-col overflow-hidden rounded-lg border border-amber-900/40 bg-amber-950/20 ${className}`}
      >
        <h4 className="border-b border-amber-900/40 px-4 py-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
          NPCs
        </h4>
        <p className="p-4 text-sm text-neutral-500">No NPCs available here.</p>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-lg border border-amber-900/40 bg-amber-950/20 ${className}`}
    >
      <h4 className="shrink-0 border-b border-amber-900/40 px-4 py-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
        NPCs in this location
      </h4>
      <ul
        className="flex-1 overflow-y-auto p-2"
        style={{ maxHeight: VISIBLE_ROWS * ROW_HEIGHT }}
      >
        {npcIds.map((npcId) => {
          const profile = getNpcProfile(npcId);
          const name = profile?.name ?? npcId;
          const isSelected = activeNpcId === npcId;
          return (
            <li key={npcId}>
              <button
                type="button"
                onClick={() => onSelectNpc(npcId)}
                className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition ${
                  isSelected
                    ? "bg-amber-500/20 text-amber-400"
                    : "text-neutral-200 hover:bg-neutral-800/80"
                }`}
              >
                <NpcAvatar npcId={npcId} />
                <span className="min-w-0 truncate">{name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
