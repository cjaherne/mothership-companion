"use client";

import { useState, useCallback } from "react";
import { getNpcProfile } from "@/campaigns";
import type { CampaignId } from "@/campaigns";
import {
  markNpcIntroPlayed,
  hasNpcIntroPlayed,
  incrementNpcVoiceInteraction,
} from "@/lib/runs";
import { ClickToTalkPanel } from "./ClickToTalkPanel";

interface NpcVoicePanelWithIntroProps {
  campaignId: CampaignId;
  runId: string;
  npcId: string;
  onExit: () => void;
  onUpdate?: () => void;
  /** When true, omit outer border (e.g. inside combined NPC panel) */
  embedded?: boolean;
}

export function NpcVoicePanelWithIntro({
  campaignId,
  runId,
  npcId,
  onExit,
  onUpdate,
  embedded,
}: NpcVoicePanelWithIntroProps) {
  const npc = getNpcProfile(npcId);
  const npcName = npc?.name ?? npcId;
  const introText = npc?.introTtsText;
  const introPlayed = hasNpcIntroPlayed(runId, npcId);

  const [playingIntro, setPlayingIntro] = useState(false);
  const [introError, setIntroError] = useState<string | null>(null);
  const [showPushToTalk, setShowPushToTalk] = useState(introPlayed || !introText);

  const vq = npc?.speechProfile?.vocalQuality ?? "";
  const voice = vq.includes("tinny")
    ? "echo"
    : vq.includes("high-pitched") || vq.includes("squeaky")
      ? "alloy" // Quirky characters like Renfield
      : "fable"; // Neutral NPC default (onyx reserved for Warden)

  const handlePlayIntro = useCallback(async () => {
    if (!introText) {
      setShowPushToTalk(true);
      return;
    }

    setPlayingIntro(true);
    setIntroError(null);

    try {
      // Try pre-generated asset first (faster); fall back to TTS API
      const preGeneratedUrl = `/sounds/npcs/${npcId}-intro.mp3`;
      let res = await fetch(preGeneratedUrl);
      if (!res.ok) {
        res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: introText, voice }),
        });
      }

      if (!res.ok) {
        const data = await res.json?.().catch(() => ({}));
        throw new Error(data?.error ?? "Failed to play intro");
      }

      const arrayBuffer = await res.arrayBuffer();
      const audioUrl = URL.createObjectURL(
        new Blob([arrayBuffer], { type: "audio/mpeg" })
      );

      const audio = new Audio(audioUrl);
      await new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.onerror = () => reject(new Error("Playback failed"));
        audio.play().catch(reject);
      });

      markNpcIntroPlayed(runId, npcId);
      setShowPushToTalk(true);
      onUpdate?.();
    } catch (err) {
      setIntroError(
        err instanceof Error ? err.message : "Failed to play intro"
      );
    } finally {
      setPlayingIntro(false);
    }
  }, [introText, voice, runId, npcId, onUpdate]);

  if (showPushToTalk) {
    return (
      <div className="space-y-2">
        <ClickToTalkPanel
          campaignId={campaignId}
          runId={runId}
          agentType="npc"
          npcId={npcId}
          label={`Talk to ${npcName}`}
          onExit={onExit}
          onInteractionComplete={() => {
            incrementNpcVoiceInteraction(runId, npcId);
            onUpdate?.();
          }}
          embedded={embedded}
        />
        {introText && (
          <button
            type="button"
            onClick={handlePlayIntro}
            disabled={playingIntro}
            className="w-full rounded border border-neutral-600 px-3 py-2 text-xs text-neutral-400 hover:bg-neutral-700/50 hover:text-neutral-300 disabled:opacity-50"
          >
            {playingIntro ? "Playing intro…" : "Listen to intro again"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={embedded ? "p-1" : "rounded-lg border-2 border-neutral-600 bg-neutral-800/60 p-4"}>
      <p className="text-sm font-medium text-neutral-100">
        Talk to {npcName}
      </p>
      <p className="mt-1 text-xs text-neutral-400">
        {introText
          ? "Listen to the intro first, or use push-to-talk to speak."
          : "Use push-to-talk to speak."}
      </p>
      {introText && (
        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={handlePlayIntro}
            disabled={playingIntro}
            className="w-full rounded border border-neon-pink/50 px-4 py-2 text-sm font-medium text-neon-pink hover:bg-neon-pink/10 disabled:opacity-50"
          >
            {playingIntro ? "Playing intro…" : "Listen to intro"}
          </button>
          <button
            type="button"
            onClick={() => setShowPushToTalk(true)}
            className="w-full rounded border border-neutral-600 px-4 py-2 text-sm text-neutral-400 hover:bg-neutral-700/50 hover:text-neutral-300"
          >
            Skip to push-to-talk
          </button>
        </div>
      )}
      {!introText && (
        <button
          type="button"
          onClick={() => setShowPushToTalk(true)}
          className="mt-3 w-full rounded border border-neon-pink/50 px-4 py-2 text-sm font-medium text-neon-pink hover:bg-neon-pink/10"
        >
          Talk to {npcName}
        </button>
      )}
      {introError && (
        <p className="mt-2 text-xs text-red-400">{introError}</p>
      )}
      <button
        type="button"
        onClick={onExit}
        className="mt-3 text-xs text-neutral-500 hover:text-red-400"
      >
        Cancel
      </button>
    </div>
  );
}
