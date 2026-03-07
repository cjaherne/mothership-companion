"use client";

import { useCallback, useState } from "react";
import { VoiceSession } from "@/components/VoiceSession";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string>("");
  const [connectionState, setConnectionState] = useState<string>("disconnected");

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
          <VoiceSession
            serverUrl={serverUrl}
            token={token}
            roomName="mothership-warden"
            agentName="mothership-warden"
            onConnectionStateChange={(state) => setConnectionState(state)}
          />
        )}

        <p className="text-xs text-neutral-500">
          Status: {connectionState}. Run the LiveKit agent separately to process
          voice.
        </p>
      </div>
    </main>
  );
}
