"use client";

import { useCallback, useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
  useVoiceAssistant,
} from "@livekit/components-react";
import { getNpcProfile } from "@/campaigns";
import type { CampaignId } from "@/campaigns";
import { syncRunStateToApiAsync } from "@/lib/runs";

interface NpcVoicePanelProps {
  campaignId: CampaignId;
  runId: string;
  activeNpcId: string;
  onEnd: () => void;
}

function NpcVoiceControls({ onEnd }: { onEnd: () => void }) {
  const { state } = useVoiceAssistant();

  const stateLabel =
    state === "listening"
      ? "Listening"
      : state === "thinking"
        ? "Thinking"
        : state === "speaking"
          ? "Speaking"
          : state ?? "Connecting";

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-900/50 bg-amber-950/20 px-4 py-2">
      <span className="text-xs font-medium text-amber-400">
        {stateLabel}
      </span>
      <div className="flex items-center gap-2">
        <RoomAudioRenderer />
        <VoiceAssistantControlBar />
        <button
          type="button"
          onClick={onEnd}
          className="rounded border border-amber-800/50 px-2 py-1 text-xs text-amber-600 hover:bg-amber-950/50 hover:text-amber-400"
        >
          End conversation
        </button>
      </div>
    </div>
  );
}

export function NpcVoicePanel({
  campaignId,
  runId,
  activeNpcId,
  onEnd,
}: NpcVoicePanelProps) {
  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const npcProfile = getNpcProfile(activeNpcId);
  const npcName = npcProfile?.name ?? activeNpcId;

  const fetchToken = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      await syncRunStateToApiAsync(runId);
      const res = await fetch(
        `/api/livekit/token?campaign=${encodeURIComponent(campaignId)}&runId=${encodeURIComponent(runId)}&participant=player`
      );
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      if (data.token && data.serverUrl) {
        setToken(data.token);
        setServerUrl(data.serverUrl);
      } else {
        setError("Failed to get voice session token");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setConnecting(false);
    }
  }, [campaignId, runId]);

  const handleDisconnected = useCallback(() => {
    setToken(null);
    fetch("/api/livekit/cleanup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId, runId }),
    }).catch(() => {});
    onEnd();
  }, [campaignId, runId, onEnd]);

  if (!token) {
    return (
      <div className="rounded-lg border border-amber-900/50 bg-amber-950/20 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-amber-200">
              Talk to {npcName}
            </p>
            <p className="text-xs text-amber-700/80">
              Connect to start a voice conversation
            </p>
          </div>
          <button
            type="button"
            onClick={fetchToken}
            disabled={connecting}
            className="shrink-0 rounded border border-amber-500/50 px-4 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/10 disabled:opacity-50"
          >
            {connecting ? "Connecting…" : "Connect"}
          </button>
        </div>
        {error && (
          <p className="mt-2 text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-900/50 bg-amber-950/20 p-2">
      <p className="mb-2 text-xs font-medium text-amber-700/90">
        Speaking with {npcName}
      </p>
      <LiveKitRoom
        serverUrl={serverUrl}
        token={token}
        connect={true}
        audio={true}
        video={false}
        onDisconnected={handleDisconnected}
      >
        <NpcVoiceControls onEnd={handleDisconnected} />
      </LiveKitRoom>
    </div>
  );
}
