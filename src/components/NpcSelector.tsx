"use client";

import Image from "next/image";
import { getNpcProfile } from "@/campaigns";
import type { CampaignId } from "@/campaigns";

const AVATAR_SIZE = 32;
const AVATAR_SIZE_COMPACT = 24;
const VISIBLE_ROWS = 4;
const VISIBLE_ROWS_COMPACT = 3;
const ROW_HEIGHT = 44;
const ROW_HEIGHT_COMPACT = 32;

interface NpcSelectorProps {
  campaignId: CampaignId;
  npcIds: string[];
  activeNpcId?: string;
  onSelectNpc: (npcId: string) => void;
  compact?: boolean;
  className?: string;
}

function NpcAvatar({ npcId, size = 32 }: { npcId: string; size?: number }) {
  const profile = getNpcProfile(npcId);
  const avatarPath = profile?.avatarPath;

  if (avatarPath) {
    return (
      <Image
        src={avatarPath}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-amber-900/50 text-xs font-medium text-amber-600"
      style={{ width: size, height: size }}
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
  compact,
  className = "",
}: NpcSelectorProps) {
  const avatarSize = compact ? AVATAR_SIZE_COMPACT : AVATAR_SIZE;
  const maxH = compact ? VISIBLE_ROWS_COMPACT * ROW_HEIGHT_COMPACT : VISIBLE_ROWS * ROW_HEIGHT;

  if (npcIds.length === 0) {
    return (
      <div
        className={`flex flex-col overflow-hidden rounded-lg border border-amber-900/40 bg-amber-950/20 ${className}`}
      >
        <h4 className={`border-b border-amber-900/40 text-xs font-medium uppercase tracking-wider text-neutral-500 ${compact ? "px-2 py-2" : "px-4 py-3"}`}>
          NPCs
        </h4>
        <p className={`text-sm text-neutral-500 ${compact ? "p-2" : "p-4"}`}>No NPCs available here.</p>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-lg border border-amber-900/40 bg-amber-950/20 ${className}`}
    >
      <h4 className={`shrink-0 border-b border-amber-900/40 text-xs font-medium uppercase tracking-wider text-neutral-500 ${compact ? "px-2 py-2" : "px-4 py-3"}`}>
        NPCs in this location
      </h4>
      <ul
        className="flex-1 overflow-y-auto p-1"
        style={{ maxHeight: maxH }}
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
                className={`flex w-full items-center gap-2 rounded text-left transition ${
                  compact ? "px-1.5 py-1 text-xs" : "px-2 py-1.5 text-sm"
                } ${
                  isSelected
                    ? "bg-amber-500/20 text-amber-400"
                    : "text-neutral-200 hover:bg-neutral-800/80"
                }`}
              >
                <NpcAvatar npcId={npcId} size={avatarSize} />
                <span className="min-w-0 truncate">{name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
