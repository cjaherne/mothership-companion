"use client";

import { useCallback, useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
  useVoiceAssistant,
} from "@livekit/components-react";
import { getCampaign } from "@/campaigns";
import type { CampaignId } from "@/campaigns";
import { updateRunLastPlayed } from "@/lib/runs";

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
        <p className="text-sm text-neutral-500">
          Agent: <span className="text-neon-cyan">{state}</span>
        </p>
        <button
          type="button"
          onClick={onExit}
          className="text-xs text-neutral-500 hover:text-red-400"
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

  const fetchToken = useCallback(async () => {
    const res = await fetch(
      `/api/livekit/token?campaign=${campaignId}&participant=player`
    );
    const data = await res.json();
    if (data.token && data.serverUrl) {
      setToken(data.token);
      setServerUrl(data.serverUrl);
    }
  }, [campaignId]);

  const handleDisconnected = useCallback(() => {
    updateRunLastPlayed(runId);
    setToken(null);
    onExit();
  }, [runId, onExit]);

  const campaign = getCampaign(campaignId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          {campaign.name} — Voice Session
        </h3>
        {!token && (
          <p className="text-xs text-neutral-500">
            Run the LiveKit agent separately to process voice.
          </p>
        )}
      </div>

      {!token ? (
        <button
          type="button"
          onClick={fetchToken}
          className="w-full rounded-lg border border-neon-cyan/50 bg-neon-cyan/5 px-4 py-3 font-medium text-neon-cyan transition hover:bg-neon-cyan/10 hover:shadow-neon-cyan"
        >
          Connect to Warden
        </button>
      ) : (
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
      )}
    </div>
  );
}
