"use client";

import { useCallback, useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
  useVoiceAssistant,
} from "@livekit/components-react";

function VoiceAssistantUI() {
  const { state, audioTrack } = useVoiceAssistant();

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-neutral-500">Agent: {state}</p>
      <RoomAudioRenderer />
      <VoiceAssistantControlBar />
    </div>
  );
}

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string>("");

  const fetchToken = useCallback(async () => {
    const res = await fetch("/api/livekit/token?room=mothership-warden&participant=player");
    const data = await res.json();
    if (data.token && data.serverUrl) {
      setToken(data.token);
      setServerUrl(data.serverUrl);
    }
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Mothership Companion
        </h1>
        <p className="text-sm text-neutral-400">
          Voice-interactive Warden. Connect to speak with NPCs and navigate
          scenarios.
        </p>

        {!token ? (
          <button
            type="button"
            onClick={fetchToken}
            className="w-full rounded-lg bg-emerald-700 px-4 py-3 font-medium text-white transition hover:bg-emerald-600"
          >
            Initialize Session
          </button>
        ) : (
          <LiveKitRoom
            serverUrl={serverUrl}
            token={token}
            connect={true}
            audio={true}
            video={false}
            onDisconnected={() => setToken(null)}
          >
            <VoiceAssistantUI />
          </LiveKitRoom>
        )}
      </div>
    </main>
  );
}
