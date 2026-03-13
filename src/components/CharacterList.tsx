"use client";

import { useState } from "react";
import Image from "next/image";
import type { Character } from "@/types/run";
import { CLASS_NAMES, SEX_LABELS, getLoadoutDisplayText } from "@/lib/mothership";
import { updateCharacter } from "@/lib/runs";
import { StatBadge, ValueOverMaxBadge } from "./MothershipStatDisplay";
import { SkillsTreeView } from "./SkillsTreeView";
import { CharacterArtworkModal } from "./CharacterArtworkModal";
import { DiceRollerModal } from "./DiceRollerModal";

type ModalTab = "character" | "skills";

const AVATAR_SIZE = 72;
const AVATAR_SIZE_COMPACT = 40;
const VISIBLE_ROWS = 4;
const VISIBLE_ROWS_COMPACT = 4;
const ROW_HEIGHT = 120;
const ROW_HEIGHT_COMPACT = 65; // fit 4 rows at 1080p (~260px for list)

interface CharacterListProps {
  characters: Character[];
  compact?: boolean;
  /** Resolve item ID to display name (for inventory list) */
  getItemName?: (itemId: string) => string;
  /** Run ID for persisting skill changes; omit for read-only */
  runId?: string;
  /** Called after character is updated (e.g. to refresh run state) */
  onCharacterUpdate?: () => void;
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

function CharacterStatsInline({ m, compact }: { m: NonNullable<Character["mothership"]>; compact?: boolean }) {
  const wounds = m.currentWounds ?? 0;
  const stressCur = m.stressCurrent ?? 0;
  const stressMax = m.stressMax ?? 10;
  const health = m.health ?? 0;
  const maxWounds = m.maxWounds ?? 2;

  if (compact) {
    return (
      <div className="flex shrink-0 flex-nowrap gap-1 overflow-hidden">
        <div className="rounded border border-neutral-600 bg-neutral-700/50 px-1 py-0.5">
          <div className="flex gap-0.5">
            <StatBadge label="STR" value={m.stats.strength} dark />
            <StatBadge label="SPD" value={m.stats.speed} dark />
            <StatBadge label="INT" value={m.stats.intellect} dark />
            <StatBadge label="CBT" value={m.stats.combat} dark />
          </div>
        </div>
        <div className="rounded border border-neutral-600 bg-neutral-700/50 px-1 py-0.5">
          <div className="flex gap-0.5">
            <StatBadge label="SAN" value={m.stats.sanity} dark />
            <StatBadge label="FEAR" value={m.stats.fear} dark />
            <StatBadge label="BOD" value={m.stats.body} dark />
          </div>
        </div>
        <div className="flex flex-col gap-1 rounded border border-neutral-600 bg-neutral-700/50 px-1.5 py-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-neutral-400">HP</span>
            <span className="text-xs font-medium text-white">{health}/{health}</span>
            <span className="text-[9px] text-neutral-400">W</span>
            <span className="text-xs font-medium text-white">{wounds}/{maxWounds}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-neutral-400">Stress</span>
            <span className="text-xs font-medium text-white">{stressCur}/{stressMax}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 flex-wrap gap-1.5">
      <div className="rounded border border-neutral-600 bg-neutral-700/50 px-1.5 py-0.5">
        <div className="text-[9px] font-semibold uppercase text-neutral-300">Stats</div>
        <div className="flex gap-0.5">
          <StatBadge label="STR" value={m.stats.strength} dark />
          <StatBadge label="SPD" value={m.stats.speed} dark />
          <StatBadge label="INT" value={m.stats.intellect} dark />
          <StatBadge label="CBT" value={m.stats.combat} dark />
        </div>
      </div>
      <div className="rounded border border-neutral-600 bg-neutral-700/50 px-1.5 py-0.5">
        <div className="text-[9px] font-semibold uppercase text-neutral-300">Saves</div>
        <div className="flex gap-0.5">
          <StatBadge label="SAN" value={m.stats.sanity} dark />
          <StatBadge label="FEAR" value={m.stats.fear} dark />
          <StatBadge label="BOD" value={m.stats.body} dark />
        </div>
      </div>
      <div className="rounded border border-neutral-600 bg-neutral-700/50 px-1.5 py-0.5">
        <div className="text-[9px] font-semibold uppercase text-neutral-300">Health</div>
        <div className="mt-0.5 flex gap-2">
          <ValueOverMaxBadge
            current={health}
            max={health}
            label="Health"
            secondLabel="Max"
            large={false}
            dark
          />
          <ValueOverMaxBadge
            current={wounds}
            max={maxWounds}
            label="Wounds"
            secondLabel="Max"
            large={false}
            dark
          />
        </div>
      </div>
      <div className="rounded border border-neutral-600 bg-neutral-700/50 px-1.5 py-0.5">
        <div className="text-[9px] font-semibold uppercase text-neutral-300">Gain</div>
        <div className="mt-0.5 flex flex-col items-center">
          <ValueOverMaxBadge
            current={stressCur}
            max={stressMax}
            label="Stress"
            secondLabel="Min"
            large={false}
            dark
          />
        </div>
      </div>
    </div>
  );
}

export function CharacterList({
  characters,
  compact,
  getItemName,
  runId,
  onCharacterUpdate,
  className = "",
}: CharacterListProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [modalTab, setModalTab] = useState<ModalTab>("character");
  const [showRegenerateArtwork, setShowRegenerateArtwork] = useState(false);
  const [showDiceModal, setShowDiceModal] = useState(false);

  const openCharacter = (char: Character) => {
    setSelectedCharacter(char);
    setModalTab("character");
  };
  const avatarSize = compact ? AVATAR_SIZE_COMPACT : AVATAR_SIZE;
  const maxH = compact
    ? VISIBLE_ROWS_COMPACT * ROW_HEIGHT_COMPACT
    : VISIBLE_ROWS * ROW_HEIGHT;
  const minH = compact ? maxH + 40 : undefined; // ensure 4 rows fit: list + header

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-lg border-2 border-neutral-600 bg-neutral-800/60 ${className}`}
      style={minH ? { minHeight: minH } : undefined}
    >
      <div className={`flex shrink-0 items-center justify-between border-b border-neutral-600 ${compact ? "px-2 py-1" : "px-4 py-3"}`}>
        <h4 className={`font-heading font-semibold uppercase tracking-widest text-amber-200/90 ${compact ? "text-xs" : "text-lg"}`}>
          Players
        </h4>
        {runId && characters.some((c) => c.mothership) && (
          <button
            type="button"
            onClick={() => setShowDiceModal(true)}
            className="rounded border border-amber-600/60 bg-amber-900/30 px-2 py-0.5 text-xs font-medium text-amber-300 transition hover:bg-amber-900/50"
          >
            Call for check
          </button>
        )}
      </div>
      <ul
        className="flex-1 overflow-y-auto p-1 min-h-0"
        style={{ maxHeight: characters.length > 0 ? maxH : undefined }}
      >
        {characters.length === 0 ? (
          <li className={`px-2 text-center text-sm text-neutral-400 ${compact ? "py-2" : "py-4"}`}>
            No players yet
          </li>
        ) : (
          characters.map((char) => (
            <li key={char.id} className="min-h-0 shrink-0">
              <button
                type="button"
                onClick={() => openCharacter(char)}
                className={`flex h-[65px] min-h-0 w-full shrink-0 items-center gap-2 rounded text-left transition hover:bg-neutral-700/50 ${
                  compact ? "px-2 py-1" : "px-3 py-3"
                }`}
              >
                <CharacterAvatar char={char} size={avatarSize} />
                <div className="min-w-0 flex-1 overflow-hidden">
                  <div className={`truncate font-semibold text-neutral-100 ${compact ? "text-base" : "text-xl"}`}>{char.name}</div>
                  {char.mothership && (
                    <div className="truncate text-xs font-medium uppercase text-neutral-400">
                      {CLASS_NAMES[char.mothership.class]}
                    </div>
                  )}
                  {char.playerName && (
                    <div className="truncate text-base text-neutral-400">Player: {char.playerName}</div>
                  )}
                </div>
                {char.mothership && (
                  <CharacterStatsInline m={char.mothership} compact={compact} />
                )}
              </button>
            </li>
          ))
        )}
      </ul>

      {showDiceModal && runId && (
        <DiceRollerModal
          characters={characters}
          runId={runId}
          initialCharacterId={selectedCharacter?.id}
          onClose={() => setShowDiceModal(false)}
          onCharacterUpdate={onCharacterUpdate}
        />
      )}

      {showRegenerateArtwork && selectedCharacter && runId && (
        <CharacterArtworkModal
          character={selectedCharacter}
          runId={runId}
          onAccept={(avatarPath) => {
            updateCharacter(runId, selectedCharacter.id, { avatarPath });
            setSelectedCharacter({ ...selectedCharacter, avatarPath });
            setShowRegenerateArtwork(false);
            onCharacterUpdate?.();
          }}
          onSkip={() => setShowRegenerateArtwork(false)}
          onClose={() => setShowRegenerateArtwork(false)}
        />
      )}

      {selectedCharacter && !showRegenerateArtwork && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Character details"
          onClick={() => setSelectedCharacter(null)}
        >
          <div
            className="max-h-[80vh] w-full max-w-4xl overflow-y-auto rounded-lg border-2 border-neutral-600 bg-neutral-900 p-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex flex-wrap items-baseline gap-2">
                <h5 className="font-heading text-2xl font-semibold text-white">
                  {selectedCharacter.name}
                </h5>
                {selectedCharacter.mothership && (
                  <span className="text-base text-neutral-400">
                    {CLASS_NAMES[selectedCharacter.mothership.class]}
                    {selectedCharacter.mothership.sex != null && (
                      <> · {SEX_LABELS[selectedCharacter.mothership.sex]}</>
                    )}
                  </span>
                )}
                {selectedCharacter.playerName && (
                  <span className="text-base text-neutral-400">
                    Player: {selectedCharacter.playerName}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedCharacter(null)}
                className="rounded p-1 text-neutral-400 hover:bg-neutral-700 hover:text-white"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {selectedCharacter.mothership && (
            <div className="mb-4 flex gap-1 border-b border-neutral-200">
              <button
                type="button"
                onClick={() => setModalTab("character")}
                className={`rounded-t px-4 py-2 text-sm font-medium ${
                  modalTab === "character"
                    ? "border-b-2 border-amber-500/60 bg-neutral-800/50 text-amber-200"
                    : "text-neutral-400 hover:bg-neutral-800/30"
                }`}
              >
                Character
              </button>
              <button
                type="button"
                onClick={() => setModalTab("skills")}
                className={`rounded-t px-4 py-2 text-sm font-medium ${
                  modalTab === "skills"
                    ? "border-b-2 border-amber-500/60 bg-neutral-800/50 text-amber-200"
                    : "text-neutral-400 hover:bg-neutral-800/30"
                }`}
              >
                Skills
              </button>
            </div>
            )}

            {modalTab === "skills" && selectedCharacter.mothership ? (
              <SkillsTreeView
                selectedSkillIds={selectedCharacter.mothership?.skillIds ?? []}
                dark
                onSelectedSkillsChange={(ids) => {
                  if (!selectedCharacter.mothership || !runId) return;
                  updateCharacter(runId, selectedCharacter.id, {
                    mothership: {
                      ...selectedCharacter.mothership,
                      skillIds: ids,
                    },
                  });
                  setSelectedCharacter({
                    ...selectedCharacter,
                    mothership: {
                      ...selectedCharacter.mothership,
                      skillIds: ids,
                    },
                  });
                  onCharacterUpdate?.();
                }}
                disabled={!runId}
              />
            ) : (
            <div className="space-y-5 text-base">
              {selectedCharacter.mothership && (
                <>
                  <div className="flex gap-6">
                    <div className="w-1/3 shrink-0">
                      <div className="relative">
                        <CharacterAvatar char={selectedCharacter} size={320} />
                        {runId && (
                          <button
                            type="button"
                            onClick={() => setShowRegenerateArtwork(true)}
                            className="mt-2 text-sm text-amber-400 hover:text-amber-300"
                          >
                            Regenerate artwork
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 grid grid-cols-2 gap-4">
                      <div className="rounded border border-neutral-600 bg-neutral-800/50 p-4">
                        <h6 className="font-heading mb-2 text-sm font-semibold uppercase text-neutral-300">Stats</h6>
                        <div className="flex flex-wrap gap-4">
                          <StatBadge
                            label="STR"
                            value={selectedCharacter.mothership.stats.strength}
                            large
                            dark
                          />
                          <StatBadge
                            label="SPD"
                            value={selectedCharacter.mothership.stats.speed}
                            large
                            dark
                          />
                          <StatBadge
                            label="INT"
                            value={selectedCharacter.mothership.stats.intellect}
                            large
                            dark
                          />
                          <StatBadge
                            label="CBT"
                            value={selectedCharacter.mothership.stats.combat}
                            large
                            dark
                          />
                        </div>
                      </div>
                      <div className="rounded border border-neutral-600 bg-neutral-800/50 p-4">
                        <h6 className="font-heading mb-2 text-sm font-semibold uppercase text-neutral-300">Saves</h6>
                        <div className="flex flex-wrap gap-4">
                          <StatBadge
                            label="SAN"
                            value={selectedCharacter.mothership.stats.sanity}
                            large
                            dark
                          />
                          <StatBadge
                            label="FEAR"
                            value={selectedCharacter.mothership.stats.fear}
                            large
                            dark
                          />
                          <StatBadge
                            label="BOD"
                            value={selectedCharacter.mothership.stats.body}
                            large
                            dark
                          />
                        </div>
                      </div>
                      <div className="rounded border border-neutral-600 bg-neutral-800/50 p-4">
                        <h6 className="font-heading mb-2 text-sm font-semibold uppercase text-neutral-300">Health</h6>
                        <div className="flex flex-wrap gap-6">
                          <ValueOverMaxBadge
                            current={selectedCharacter.mothership.health}
                            max={selectedCharacter.mothership.health}
                            label="Health"
                            secondLabel="Max"
                            large
                            dark
                          />
                          <div className="flex flex-col items-center">
                            <ValueOverMaxBadge
                              current={selectedCharacter.mothership.currentWounds ?? 0}
                              max={selectedCharacter.mothership.maxWounds ?? 2}
                              label="Wounds"
                              secondLabel="Max"
                              large
                              dark
                            />
                            <span className="mt-0.5 text-sm text-neutral-400">Starts at 2.</span>
                          </div>
                        </div>
                      </div>
                      <div className="rounded border border-neutral-600 bg-neutral-800/50 p-4">
                        <h6 className="font-heading mb-2 text-sm font-semibold uppercase text-neutral-300">Gain</h6>
                        <ValueOverMaxBadge
                          current={selectedCharacter.mothership.stressCurrent ?? 0}
                          max={selectedCharacter.mothership.stressMax ?? 10}
                          label="Stress"
                          secondLabel="Min"
                          large
                          dark
                        />
                      </div>
                    </div>
                  </div>
                  <div className="rounded border border-neutral-600 bg-neutral-800/50 p-4">
                    <p className="text-sm text-neutral-300">
                      {selectedCharacter.mothership.startingGearItemIds?.length
                        ? selectedCharacter.mothership.startingGearItemIds
                            .map((id) => getLoadoutDisplayText(id))
                            .join("; ")
                        : "—"}
                    </p>
                    <p className="mt-2 text-sm text-neutral-400">
                      Trinket: {selectedCharacter.mothership.trinket} | Patch:{" "}
                      {selectedCharacter.mothership.patch} | Credits: {selectedCharacter.mothership.credits} cr
                    </p>
                  </div>
                </>
              )}
              <div className="rounded border border-neutral-600 bg-neutral-800/50 p-4">
                <h6 className="font-heading mb-3 text-sm font-semibold uppercase text-neutral-300">
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
                        <li key={id} className="text-base text-neutral-300">
                          • {resolve(id)}
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </div>
              {selectedCharacter.traits.length > 0 && (
                <div>
                  <span className="text-neutral-400">Traits: </span>
                  <span className="text-lg text-neutral-300">
                    {selectedCharacter.traits.join(", ")}
                  </span>
                </div>
              )}
              <div>
                <span className="text-neutral-400">Personality & background:</span>
                <p className="mt-2 text-lg text-neutral-300">
                  {selectedCharacter.personalitySummary}
                </p>
              </div>
            </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
