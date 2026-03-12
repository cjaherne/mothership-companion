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
}

export function NpcVoicePanelWithIntro({
  campaignId,
  runId,
  npcId,
  onExit,
  onUpdate,
}: NpcVoicePanelWithIntroProps) {
  const npc = getNpcProfile(npcId);
  const npcName = npc?.name ?? npcId;
  const introText = npc?.introTtsText;
  const introPlayed = hasNpcIntroPlayed(runId, npcId);

  const [playingIntro, setPlayingIntro] = useState(false);
  const [introError, setIntroError] = useState<string | null>(null);
  const [showPushToTalk, setShowPushToTalk] = useState(introPlayed || !introText);

  const voice =
    npc?.speechProfile?.vocalQuality?.includes("tinny") ? "echo" : "onyx";

  const handlePlayIntro = useCallback(async () => {
    if (!introText) {
      setShowPushToTalk(true);
      return;
    }

    setPlayingIntro(true);
    setIntroError(null);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: introText, voice }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to play intro");
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
      />
    );
  }

  return (
    <div className="rounded-lg border-2 border-neutral-600 bg-neutral-800/60 p-4">
      <p className="text-sm font-medium text-neutral-100">
        Talk to {npcName}
      </p>
      <p className="mt-1 text-xs text-neutral-400">
        {introText
          ? "Listen to the briefing first, then use push-to-talk to respond."
          : "Use push-to-talk to speak."}
      </p>
      {introText && (
        <button
          type="button"
          onClick={handlePlayIntro}
          disabled={playingIntro}
          className="mt-3 w-full rounded border border-neon-pink/50 px-4 py-2 text-sm font-medium text-neon-pink hover:bg-neon-pink/10 disabled:opacity-50"
        >
          {playingIntro ? "Playing briefing…" : `Talk to ${npcName}`}
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
