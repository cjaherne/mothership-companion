"use client";

import { useCallback, useRef, useState } from "react";
import type { CampaignId } from "@/campaigns";
import { getRunState } from "@/lib/runs";

export type AgentType = "warden" | "npc";

interface ClickToTalkPanelProps {
  campaignId: CampaignId;
  runId: string;
  agentType: AgentType;
  npcId?: string;
  onExit?: () => void;
  /** Called after each successful voice exchange (for NPC interaction tracking) */
  onInteractionComplete?: () => void;
  /** Optional label override (e.g. "Talk to Maas") */
  label?: string;
}

type PanelState = "idle" | "recording" | "processing" | "playing";

export function ClickToTalkPanel({
  campaignId,
  runId,
  agentType,
  npcId,
  onExit,
  onInteractionComplete,
  label,
}: ClickToTalkPanelProps) {
  const [state, setState] = useState<PanelState>("idle");
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const sendAudio = useCallback(
    async (blob: Blob) => {
      setState("processing");
      setError(null);

      try {
        const formData = new FormData();
        formData.append("audio", blob, "audio.webm");
        formData.append("runId", runId);
        formData.append("agentType", agentType);
        formData.append("campaignId", campaignId);
        formData.append("runState", JSON.stringify(getRunState(runId)));

        if (agentType === "npc" && npcId) {
          formData.append("npcId", npcId);
        }

        const res = await fetch("/api/voice/talk", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? `Request failed: ${res.status}`);
        }

        const contentType = res.headers.get("Content-Type");
        if (!contentType?.startsWith("audio/")) {
          throw new Error("Expected audio response");
        }

        const arrayBuffer = await res.arrayBuffer();
        const audioUrl = URL.createObjectURL(new Blob([arrayBuffer], { type: "audio/mpeg" }));

        setState("playing");
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        await new Promise<void>((resolve, reject) => {
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            resolve();
          };
          audio.onerror = () => reject(new Error("Audio playback failed"));
          audio.play().catch(reject);
        });
        if (agentType === "npc" && npcId) {
          onInteractionComplete?.();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setState("idle");
        audioRef.current = null;
      }
    },
    [campaignId, runId, agentType, npcId, onInteractionComplete]
  );

  const handlePointerDown = useCallback(() => {
    if (state !== "idle") return;
    setError(null);

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const recorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4",
        });
        mediaRecorderRef.current = recorder;
        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          if (chunks.length > 0) {
            const blob = new Blob(chunks, { type: recorder.mimeType });
            sendAudio(blob);
          } else {
            setState("idle");
          }
        };

        recorder.start();
        setState("recording");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Microphone access denied");
        setState("idle");
      });
  }, [state, sendAudio]);

  const handlePointerUp = useCallback(() => {
    if (state === "recording" && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
  }, [state]);

  const handlePointerLeave = useCallback(() => {
    if (state === "recording" && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
  }, [state]);

  const displayLabel =
    label ??
    (agentType === "warden"
      ? "Talk to Warden"
      : npcId
        ? `Talk to ${npcId}`
        : "Talk");

  const isDisabled = state === "processing" || state === "playing";

  return (
    <div className="rounded-lg border-2 border-neutral-600 bg-neutral-800/60 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-neutral-100">{displayLabel}</p>
          <p className="text-xs text-neutral-400">
            {state === "idle" && "Press and hold to talk"}
            {state === "recording" && "Recording… release to send"}
            {state === "processing" && "Processing…"}
            {state === "playing" && "Playing response…"}
          </p>
        </div>
        <button
          type="button"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          disabled={isDisabled}
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 transition focus:outline-none focus:ring-2 focus:ring-neon-pink/50 disabled:cursor-not-allowed ${
            state === "recording"
              ? "border-red-500 bg-red-900/30"
              : isDisabled
                ? "border-neutral-600 bg-neutral-700/50 text-neutral-500"
                : "border-neon-pink/60 bg-neon-pink/10 text-neon-pink hover:bg-neon-pink/20"
          }`}
          aria-label={state === "recording" ? "Release to send" : "Hold to talk"}
        >
          {state === "recording" ? (
            <span className="h-4 w-4 rounded-full bg-red-500 animate-pulse" />
          ) : (
            <svg
              className="h-6 w-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          )}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      {onExit && (
        <button
          type="button"
          onClick={onExit}
          className="mt-3 text-xs text-neutral-500 hover:text-red-400"
        >
          End conversation
        </button>
      )}
    </div>
  );
}
