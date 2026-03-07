"use client";

/**
 * VoiceSession - Client-side audio capture and LiveKit streaming
 *
 * Captures microphone input and streams it directly to a LiveKit room
 * where a voice agent (LiveKit Agents or OpenAI Realtime) processes it.
 * VAD (Voice Activity Detection) is handled by the agent—no awkward silences.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Room, RoomEvent, Track } from "livekit-client";

export interface VoiceSessionProps {
  /** LiveKit server URL */
  serverUrl: string;
  /** JWT token for room access (obtained from /api/livekit/token) */
  token: string;
  /** Room name to join */
  roomName?: string;
  /** Agent name the room will dispatch to (e.g., "mothership-warden") */
  agentName?: string;
  /** Called when connection state changes */
  onConnectionStateChange?: (state: ConnectionState) => void;
  /** Called when agent speaks (remote audio track) */
  onAgentAudio?: (track: MediaStreamTrack) => void;
  /** Optional CSS class */
  className?: string;
}

export type ConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error";

export function VoiceSession({
  serverUrl,
  token,
  roomName = "mothership-warden",
  agentName = "mothership-warden",
  onConnectionStateChange,
  onAgentAudio,
  className = "",
}: VoiceSessionProps) {
  const roomRef = useRef<Room | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateState = useCallback(
    (state: ConnectionState) => {
      setConnectionState(state);
      onConnectionStateChange?.(state);
    },
    [onConnectionStateChange]
  );

  const connect = useCallback(async () => {
    if (!token || !serverUrl) {
      setError("Missing token or server URL");
      return;
    }

    updateState("connecting");
    setError(null);

    try {
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        audioCaptureDefaults: {
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      roomRef.current = room;

      room.on(RoomEvent.Connected, () => {
        updateState("connected");
      });

      room.on(RoomEvent.Disconnected, () => {
        updateState("disconnected");
      });

      room.on(RoomEvent.Reconnecting, () => {
        updateState("reconnecting");
      });

      room.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === Track.Kind.Audio) {
          onAgentAudio?.(track.mediaStreamTrack);
        }
      });

      await room.connect(serverUrl, token, {
        autoSubscribe: true,
      });

      await room.localParticipant.setMicrophoneEnabled(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to connect";
      setError(message);
      updateState("error");
    }
  }, [token, serverUrl, updateState, onAgentAudio]);

  const disconnect = useCallback(async () => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
      updateState("disconnected");
    }
  }, [updateState]);

  const toggleMute = useCallback(async () => {
    if (roomRef.current) {
      const enabled = roomRef.current.localParticipant.isMicrophoneEnabled;
      await roomRef.current.localParticipant.setMicrophoneEnabled(!enabled);
      setIsMuted(enabled);
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return (
    <div className={`voice-session ${className}`}>
      <div className="flex flex-col gap-4">
        <div className="text-sm text-neutral-500">Connection: {connectionState}</div>
        {error && <div className="text-sm text-red-500">{error}</div>}
        <div className="flex gap-2">
          {connectionState === "disconnected" || connectionState === "error" ? (
            <button
              type="button"
              onClick={connect}
              className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
            >
              Connect to Warden
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={toggleMute}
                className="rounded bg-neutral-600 px-4 py-2 text-white hover:bg-neutral-700"
              >
                {isMuted ? "Unmute" : "Mute"}
              </button>
              <button
                type="button"
                onClick={disconnect}
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Disconnect
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
