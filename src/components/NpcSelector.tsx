"use client";

import { useState } from "react";
import Image from "next/image";
import { getNpcProfile } from "@/campaigns";
import type { CampaignId } from "@/campaigns";

const AVATAR_SIZE = 72;
const AVATAR_SIZE_COMPACT = 56;
const AVATAR_SIZE_STRIP = 44;
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
  /** Horizontal strip layout: no scroll, fits ≤4 NPCs in one row */
  strip?: boolean;
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
  strip,
  className = "",
}: NpcSelectorProps) {
  const avatarSize = strip ? AVATAR_SIZE_STRIP : compact ? AVATAR_SIZE_COMPACT : AVATAR_SIZE;
  const maxH = compact && !strip ? VISIBLE_ROWS_COMPACT * ROW_HEIGHT_COMPACT : !strip ? VISIBLE_ROWS * ROW_HEIGHT : undefined;

  if (npcIds.length === 0) {
    if (strip) {
      return <p className={`text-xs text-neutral-500 ${className}`}>No NPCs available here.</p>;
    }
    return (
      <div
        className={`flex flex-col overflow-hidden rounded-lg border-2 border-neutral-600 bg-neutral-800/60 ${className}`}
      >
        <h4 className={`font-heading border-b border-neutral-600 text-sm font-medium uppercase tracking-wider text-amber-200/90 ${compact ? "px-2 py-2" : "px-4 py-3"}`}>
          NPCs
        </h4>
        <p className={`text-sm text-neutral-400 ${compact ? "p-2" : "p-4"}`}>No NPCs available here.</p>
      </div>
    );
  }

  if (strip) {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        {npcIds.map((npcId) => {
          const profile = getNpcProfile(npcId);
          const name = profile?.name ?? npcId;
          const role = profile?.role;
          const isSelected = activeNpcId === npcId;
          return (
            <button
              key={npcId}
              type="button"
              onClick={() => onSelectNpc(npcId)}
              className={`flex flex-col items-center gap-1 rounded-lg p-2 min-w-0 transition ${
                isSelected
                  ? "bg-neon-pink/20 text-neon-pink ring-1 ring-neon-pink/50"
                  : "text-neutral-100 hover:bg-neutral-700/50"
              }`}
            >
              <NpcAvatar npcId={npcId} size={avatarSize} />
              <span className="truncate max-w-[80px] text-xs font-medium">{name}</span>
              {role && (
                <span className={`truncate max-w-[80px] text-[10px] ${isSelected ? "text-neon-pink/80" : "text-neutral-500"}`}>
                  {role}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-lg border-2 border-neutral-600 bg-neutral-800/60 ${className}`}
    >
      <h4 className={`font-heading shrink-0 border-b border-neutral-600 text-base font-medium uppercase tracking-wider text-amber-200/90 ${compact ? "px-2 py-2" : "px-4 py-3"}`}>
        NPCs in this location
      </h4>
      <ul
        className="flex-1 overflow-y-auto p-1"
        style={{ maxHeight: maxH }}
      >
        {npcIds.map((npcId) => {
          const profile = getNpcProfile(npcId);
          const name = profile?.name ?? npcId;
          const role = profile?.role;
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
                    : "text-neutral-100 hover:bg-neutral-700/50"
                }`}
              >
                <NpcAvatar npcId={npcId} size={avatarSize} />
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-xl font-semibold">{name}</span>
                  {role && (
                    <span className={`block truncate text-xs ${isSelected ? "text-neon-pink/80" : "text-neutral-500"}`}>
                      {role}
                    </span>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
