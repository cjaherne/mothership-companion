"use client";

import { useState } from "react";
import Image from "next/image";
import { getNpcProfile } from "@/campaigns";
import type { CampaignId } from "@/campaigns";

const AVATAR_SIZE = 72;
const AVATAR_SIZE_COMPACT = 56;
const VISIBLE_ROWS = 4;
const VISIBLE_ROWS_COMPACT = 3;
const ROW_HEIGHT = 88;
const ROW_HEIGHT_COMPACT = 76;

interface NpcSelectorProps {
  campaignId: CampaignId;
  npcIds: string[];
  activeNpcId?: string;
  onSelectNpc: (npcId: string) => void;
  compact?: boolean;
  className?: string;
}

function NpcAvatar({ npcId, size = 32 }: { npcId: string; size?: number }) {
  const [imgError, setImgError] = useState(false);
  const profile = getNpcProfile(npcId);
  const avatarPath = profile?.avatarPath;
  const initial = (profile?.name ?? npcId).charAt(0).toUpperCase();

  if (avatarPath && !imgError) {
    const isExternal = avatarPath.startsWith("http");
    if (isExternal) {
      return (
        <img
          src={avatarPath}
          alt=""
          width={size}
          height={size}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="shrink-0 overflow-hidden rounded-full object-cover"
          style={{ width: size, height: size }}
        />
      );
    }
    return (
      <Image
        src={avatarPath}
        alt=""
        width={size}
        height={size}
        unoptimized
        onError={() => setImgError(true)}
        className="shrink-0 overflow-hidden rounded-full object-cover"
      />
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-neutral-300 text-lg font-semibold text-neutral-600"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {initial}
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
      className={`flex flex-col overflow-hidden rounded-lg border border-neutral-300 bg-neutral-50 ${className}`}
    >
      <h4 className={`border-b border-neutral-300 text-sm font-medium uppercase tracking-wider text-neutral-600 ${compact ? "px-2 py-2" : "px-4 py-3"}`}>
        NPCs
      </h4>
        <p className={`text-sm text-neutral-600 ${compact ? "p-2" : "p-4"}`}>No NPCs available here.</p>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-lg border border-neutral-300 bg-neutral-50 ${className}`}
    >
      <h4 className={`shrink-0 border-b border-neutral-300 text-base font-medium uppercase tracking-wider text-neutral-600 ${compact ? "px-2 py-2" : "px-4 py-3"}`}>
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
                  compact ? "px-2 py-2" : "px-3 py-2"
                } ${
                  isSelected
                    ? "bg-neon-pink/20 text-neon-pink"
                    : "text-neutral-900 hover:bg-neutral-200"
                }`}
              >
                <NpcAvatar npcId={npcId} size={avatarSize} />
                <span className="min-w-0 truncate text-xl font-semibold">{name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
