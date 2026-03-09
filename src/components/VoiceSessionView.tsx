"use client";

import { useCallback, useEffect, useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
  useVoiceAssistant,
} from "@livekit/components-react";
import { getCampaign } from "@/campaigns";
import type { CampaignId } from "@/campaigns";
import { updateRunLastPlayed, getRunState, syncRunStateToApiAsync } from "@/lib/runs";
import { RunStatePanel } from "./RunStatePanel";

interface VoiceSessionViewProps {
  campaignId: CampaignId;
  runId: string;
  onExit: () => void;
}

function VoiceAssistantUI({ onExit }: { onExit: () => void }) {
  const { state } = useVoiceAssistant();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-600">
          Agent: <span className="text-neutral-900 font-medium">{state}</span>
        </p>
        <button
          type="button"
          onClick={onExit}
          className="text-xs text-neutral-600 hover:text-red-600"
        >
          Exit session
        </button>
      </div>
      <RoomAudioRenderer />
      <VoiceAssistantControlBar />
    </div>
  );
}

export function VoiceSessionView({
  campaignId,
  runId,
  onExit,
}: VoiceSessionViewProps) {
  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string>("");

  useEffect(() => {
    fetch("/api/run/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runId, state: getRunState(runId) }),
    }).catch(() => {});
  }, [runId]);

  const fetchToken = useCallback(async () => {
    await syncRunStateToApiAsync(runId);
    const res = await fetch(
      `/api/livekit/token?campaign=${encodeURIComponent(campaignId)}&runId=${encodeURIComponent(runId)}&participant=player`
    );
    const data = await res.json();
    if (data.token && data.serverUrl) {
      setToken(data.token);
      setServerUrl(data.serverUrl);
    }
  }, [campaignId, runId]);

  const handleDisconnected = useCallback(() => {
    updateRunLastPlayed(runId);
    setToken(null);
    fetch("/api/livekit/cleanup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId, runId }),
    }).catch(() => {});
    onExit();
  }, [campaignId, runId, onExit]);

  const campaign = getCampaign(campaignId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">
          {campaign.name} — Voice Session
        </h3>
        {!token && (
          <p className="text-xs text-neutral-600">
            Run the LiveKit agent separately to process voice.
          </p>
        )}
      </div>

      {!token ? (
        <button
          type="button"
          onClick={fetchToken}
          className="w-full rounded-lg border border-neutral-400 bg-neutral-100 px-4 py-3 font-medium text-neutral-900 transition hover:bg-neutral-200"
        >
          Connect to Warden
        </button>
      ) : (
        <div className="space-y-6">
          <LiveKitRoom
            serverUrl={serverUrl}
            token={token}
            connect={true}
            audio={true}
            video={false}
            onDisconnected={handleDisconnected}
          >
            <VoiceAssistantUI onExit={handleDisconnected} />
          </LiveKitRoom>
          <RunStatePanel runId={runId} campaignId={campaignId} />
        </div>
      )}
    </div>
  );
}
