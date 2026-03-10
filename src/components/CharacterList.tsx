"use client";

import { useState } from "react";
import Image from "next/image";
import type { Character } from "@/types/run";
import { CLASS_NAMES, getLoadoutDisplayText } from "@/lib/mothership";

const AVATAR_SIZE = 72;
const AVATAR_SIZE_COMPACT = 56;
const VISIBLE_ROWS = 4;
const VISIBLE_ROWS_COMPACT = 3;
const ROW_HEIGHT = 120;
const ROW_HEIGHT_COMPACT = 100;

interface CharacterListProps {
  characters: Character[];
  compact?: boolean;
  /** Resolve item ID to display name (for inventory list) */
  getItemName?: (itemId: string) => string;
  className?: string;
}

function CharacterAvatar({ char, size = 32 }: { char: Character; size?: number }) {
  const [imgError, setImgError] = useState(false);
  const initial = (char.name || "?").charAt(0).toUpperCase();

  if (char.avatarPath && !imgError) {
    const isExternal = char.avatarPath.startsWith("http");
    if (isExternal) {
      return (
        <img
          src={char.avatarPath}
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
        src={char.avatarPath}
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
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-300 text-lg font-semibold text-neutral-600"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {initial}
    </div>
  );
}

/** Single stat value in a circle */
function StatBadge({
  label,
  value,
  large,
}: {
  label: string;
  value: number | string;
  large?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`flex shrink-0 items-center justify-center rounded-full border-2 border-neutral-800 bg-white font-bold text-neutral-900 ${
          large ? "h-12 w-12 text-base" : "h-8 w-8 text-xs"
        }`}
      >
        {value}
      </div>
      <span
        className={`mt-0.5 font-medium uppercase text-neutral-600 ${
          large ? "text-sm" : "text-[10px]"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function CharacterStatsInline({ m }: { m: NonNullable<Character["mothership"]> }) {
  const wounds = m.currentWounds ?? 0;
  const stressCur = m.stressCurrent ?? 0;
  const stressMax = m.stressMax ?? 10;

  return (
    <div className="flex shrink-0 flex-wrap gap-1.5">
      <div className="rounded border border-neutral-400 bg-white px-1.5 py-0.5">
        <div className="text-[9px] font-semibold uppercase text-neutral-500">Stats</div>
        <div className="flex gap-0.5">
          <StatBadge label="STR" value={m.stats.strength} />
          <StatBadge label="SPD" value={m.stats.speed} />
          <StatBadge label="INT" value={m.stats.intellect} />
          <StatBadge label="CBT" value={m.stats.combat} />
        </div>
      </div>
      <div className="rounded border border-neutral-400 bg-white px-1.5 py-0.5">
        <div className="text-[9px] font-semibold uppercase text-neutral-500">Saves</div>
        <div className="flex gap-0.5">
          <StatBadge label="SAN" value={m.stats.sanity} />
          <StatBadge label="FEAR" value={m.stats.fear} />
          <StatBadge label="BOD" value={m.stats.body} />
        </div>
      </div>
      <div className="rounded border border-neutral-400 bg-white px-1.5 py-0.5">
        <div className="text-[9px] font-semibold uppercase text-neutral-500">Health</div>
        <div className="mt-0.5 flex gap-2">
          <div className="flex flex-col items-center">
            <div className="rounded-full border-2 border-neutral-800 bg-white px-2 py-0.5 text-xs font-bold">
              {m.health}/{m.health}
            </div>
            <span className="mt-0.5 text-[9px] text-neutral-600">Health</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="rounded-full border-2 border-neutral-800 bg-white px-2 py-0.5 text-xs font-bold">
              {wounds}/{m.maxWounds ?? 2}
            </div>
            <span className="mt-0.5 text-[9px] text-neutral-600">Wounds</span>
          </div>
        </div>
      </div>
      <div className="rounded border border-neutral-400 bg-white px-1.5 py-0.5">
        <div className="text-[9px] font-semibold uppercase text-neutral-500">Gain</div>
        <div className="mt-0.5 flex flex-col items-center">
          <div className="rounded-full border-2 border-neutral-800 bg-white px-2 py-0.5 text-xs font-bold">
            {stressCur}/{stressMax}
          </div>
          <span className="mt-0.5 text-[9px] text-neutral-600">Stress</span>
        </div>
      </div>
    </div>
  );
}

export function CharacterList({
  characters,
  compact,
  getItemName,
  className = "",
}: CharacterListProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const avatarSize = compact ? AVATAR_SIZE_COMPACT : AVATAR_SIZE;
  const maxH = compact
    ? VISIBLE_ROWS_COMPACT * ROW_HEIGHT_COMPACT
    : VISIBLE_ROWS * ROW_HEIGHT;

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-lg border border-neutral-300 bg-neutral-50 ${className}`}
    >
      <h4 className={`shrink-0 border-b border-neutral-300 text-lg font-semibold uppercase tracking-wider text-neutral-700 ${compact ? "px-2 py-2" : "px-4 py-3"}`}>
        Players
      </h4>
      <ul
        className="flex-1 overflow-y-auto p-1"
        style={{ maxHeight: characters.length > 0 ? maxH : undefined }}
      >
        {characters.length === 0 ? (
          <li className={`px-2 text-center text-sm text-neutral-600 ${compact ? "py-2" : "py-4"}`}>
            No players yet
          </li>
        ) : (
          characters.map((char) => (
            <li key={char.id} className="min-h-0 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedCharacter(char)}
                className={`flex min-h-[112px] w-full items-center gap-4 rounded text-left transition hover:bg-neutral-200 ${
                  compact ? "px-2 py-2" : "px-3 py-3"
                }`}
              >
                <CharacterAvatar char={char} size={avatarSize} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-semibold text-neutral-900">{char.name}</span>
                    {char.mothership && (
                      <span className="text-xs font-medium uppercase text-neutral-500">
                        {CLASS_NAMES[char.mothership.class]}
                      </span>
                    )}
                  </div>
                  {char.playerName && (
                    <div className="text-base text-neutral-600">Player: {char.playerName}</div>
                  )}
                </div>
                {char.mothership && (
                  <CharacterStatsInline m={char.mothership} />
                )}
              </button>
            </li>
          ))
        )}
      </ul>

      {selectedCharacter && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Character details"
          onClick={() => setSelectedCharacter(null)}
        >
          <div
            className="max-h-[80vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-neutral-300 bg-white p-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <CharacterAvatar char={selectedCharacter} size={80} />
                <div>
                  <h5 className="text-2xl font-semibold text-neutral-900">
                    {selectedCharacter.name}
                  </h5>
                  {selectedCharacter.playerName && (
                    <p className="text-base text-neutral-600">
                      Player: {selectedCharacter.playerName}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCharacter(null)}
                className="rounded p-1 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="space-y-5 text-base">
              {selectedCharacter.mothership && (
                <>
                  <div className="rounded border border-neutral-300 bg-neutral-100 p-4">
                    <h6 className="mb-2 text-sm font-semibold uppercase text-neutral-600">Class</h6>
                    <p className="text-lg font-medium text-neutral-900">
                      {CLASS_NAMES[selectedCharacter.mothership.class]}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded border border-neutral-300 bg-neutral-100 p-4">
                      <h6 className="mb-2 text-sm font-semibold uppercase text-neutral-600">Stats</h6>
                      <div className="flex flex-wrap gap-4">
                        <StatBadge
                          label="STR"
                          value={selectedCharacter.mothership.stats.strength}
                          large
                        />
                        <StatBadge
                          label="SPD"
                          value={selectedCharacter.mothership.stats.speed}
                          large
                        />
                        <StatBadge
                          label="INT"
                          value={selectedCharacter.mothership.stats.intellect}
                          large
                        />
                        <StatBadge
                          label="CBT"
                          value={selectedCharacter.mothership.stats.combat}
                          large
                        />
                      </div>
                    </div>
                    <div className="rounded border border-neutral-300 bg-neutral-100 p-4">
                      <h6 className="mb-2 text-sm font-semibold uppercase text-neutral-600">Saves</h6>
                      <div className="flex flex-wrap gap-4">
                        <StatBadge
                          label="SAN"
                          value={selectedCharacter.mothership.stats.sanity}
                          large
                        />
                        <StatBadge
                          label="FEAR"
                          value={selectedCharacter.mothership.stats.fear}
                          large
                        />
                        <StatBadge
                          label="BOD"
                          value={selectedCharacter.mothership.stats.body}
                          large
                        />
                      </div>
                    </div>
                    <div className="rounded border border-neutral-300 bg-neutral-100 p-4">
                      <h6 className="mb-2 text-sm font-semibold uppercase text-neutral-600">Health</h6>
                      <div className="flex flex-wrap gap-6">
                        <div className="flex flex-col">
                          <div className="flex items-center justify-center gap-1 rounded-full border-2 border-neutral-800 bg-white px-4 py-2">
                            <span className="text-lg font-bold text-neutral-900">{selectedCharacter.mothership.health}</span>
                            <span className="text-neutral-400">/</span>
                            <span className="text-lg font-bold text-neutral-900">{selectedCharacter.mothership.health}</span>
                          </div>
                          <div className="mt-1 flex justify-between gap-4 text-sm text-neutral-600">
                            <span>Current</span>
                            <span>Maximum</span>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center justify-center gap-1 rounded-full border-2 border-neutral-800 bg-white px-4 py-2">
                            <span className="text-lg font-bold text-neutral-900">{selectedCharacter.mothership.currentWounds ?? 0}</span>
                            <span className="text-neutral-400">/</span>
                            <span className="text-lg font-bold text-neutral-900">{selectedCharacter.mothership.maxWounds ?? 2}</span>
                          </div>
                          <div className="mt-1 flex justify-between gap-4 text-sm text-neutral-600">
                            <span>Current</span>
                            <span>Maximum</span>
                          </div>
                          <span className="mt-0.5 text-sm text-neutral-500">Starts at 2.</span>
                        </div>
                      </div>
                    </div>
                    <div className="rounded border border-neutral-300 bg-neutral-100 p-4">
                      <h6 className="mb-2 text-sm font-semibold uppercase text-neutral-600">Gain</h6>
                      <div className="flex flex-col">
                        <div className="flex items-center justify-center gap-1 rounded-full border-2 border-neutral-800 bg-white px-4 py-2">
                          <span className="text-lg font-bold text-neutral-900">{selectedCharacter.mothership.stressCurrent ?? 0}</span>
                          <span className="text-neutral-400">/</span>
                          <span className="text-lg font-bold text-neutral-900">{selectedCharacter.mothership.stressMax ?? 10}</span>
                        </div>
                        <div className="mt-1 flex justify-between gap-4 text-sm text-neutral-600">
                          <span>Current</span>
                          <span>Maximum</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded border border-neutral-300 bg-neutral-100 p-4">
                    <p className="text-sm text-neutral-600">
                      {selectedCharacter.mothership.startingGearItemIds?.length
                        ? selectedCharacter.mothership.startingGearItemIds
                            .map((id) => getLoadoutDisplayText(id))
                            .join("; ")
                        : "—"}
                    </p>
                    <p className="mt-2 text-sm text-neutral-600">
                      Trinket: {selectedCharacter.mothership.trinket} | Patch:{" "}
                      {selectedCharacter.mothership.patch} | Credits: {selectedCharacter.mothership.credits} cr
                    </p>
                  </div>
                </>
              )}
              <div className="rounded border border-neutral-300 bg-neutral-100 p-4">
                <h6 className="mb-3 text-sm font-semibold uppercase text-neutral-600">
                  Inventory
                </h6>
                {(() => {
                  const ids = selectedCharacter.inventoryItemIds ?? [];
                  const resolve = getItemName ?? getLoadoutDisplayText;
                  if (ids.length === 0) {
                    return (
                      <p className="text-sm text-neutral-500">No items</p>
                    );
                  }
                  return (
                    <ul className="space-y-1.5">
                      {ids.map((id) => (
                        <li key={id} className="text-base text-neutral-800">
                          • {resolve(id)}
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </div>
              {selectedCharacter.traits.length > 0 && (
                <div>
                  <span className="text-neutral-600">Traits: </span>
                  <span className="text-lg text-neutral-800">
                    {selectedCharacter.traits.join(", ")}
                  </span>
                </div>
              )}
              <div>
                <span className="text-neutral-600">Personality & background:</span>
                <p className="mt-2 text-lg text-neutral-800">
                  {selectedCharacter.personalitySummary}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
