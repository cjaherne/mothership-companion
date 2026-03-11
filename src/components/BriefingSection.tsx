"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useWardenTts } from "@/hooks/useWardenTts";
import type { BriefingPage } from "@/campaigns/types";

interface BriefingSectionProps {
  /** Background text (single pane, no pagination) */
  text: string;
  /** @deprecated Pagination removed; use text only */
  pages?: BriefingPage[];
  /** Compact mode: smaller text, tighter padding, inline controls */
  compact?: boolean;
  /** Show TTS controls. Default true. */
  useWardenVoice?: boolean;
  className?: string;
}

export function BriefingSection({
  text,
  compact,
  useWardenVoice = true,
  className = "",
}: BriefingSectionProps) {
  const [errorDismissed, setErrorDismissed] = useState(false);
  const displayText = text;

  const wardenTts = useWardenTts();

  useEffect(() => {
    if (wardenTts.error) setErrorDismissed(false);
  }, [wardenTts.error]);

  const isPlaying = wardenTts.isPlaying;
  const isPaused = wardenTts.isPaused;
  const isLoading = wardenTts.isLoading;
  const showErrorPopup = wardenTts.error && !errorDismissed;

  const stop = useCallback(() => {
    wardenTts.stop();
  }, [wardenTts]);

  const rewind = useCallback(() => {
    wardenTts.rewind();
  }, [wardenTts]);

  const pause = useCallback(() => {
    wardenTts.pause();
  }, [wardenTts]);

  const play = useCallback(() => {
    if (!displayText) return;
    setErrorDismissed(false);
    wardenTts.play(displayText);
  }, [displayText, wardenTts]);

  const dismissError = useCallback(() => {
    setErrorDismissed(true);
  }, []);

  const stopRef = useRef(stop);
  stopRef.current = stop;
  useEffect(() => {
    return () => {
      stopRef.current();
    };
  }, []);

  const textClass = "text-base leading-relaxed";
  const padClass = compact ? "p-2" : "p-4";
  const iconSize = compact ? 14 : 16;
  const iconBtnClass =
    "rounded border border-neutral-500 p-1.5 text-neutral-400 transition hover:bg-neutral-700 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-neutral-500";

  return (
    <div className={`flex min-h-0 flex-col ${compact ? "gap-1" : "gap-2"} ${className}`}>
      <div
        className={`min-h-0 flex-1 overflow-y-auto rounded border-2 border-neutral-600 bg-neutral-800/60 ${padClass}`}
      >
        <p className={`whitespace-pre-wrap ${textClass} text-neutral-300`}>
          {displayText}
        </p>
      </div>
      {showErrorPopup && useWardenVoice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="tts-error-title"
        >
          <div className="max-w-sm rounded border border-neutral-700 bg-neutral-900 p-4 shadow-xl">
            <h3 id="tts-error-title" className="mb-2 font-medium text-red-400">
              Voice playback failed
            </h3>
            <p className="mb-3 text-sm text-neutral-400">{wardenTts.error}</p>
            <p className="mb-4 text-sm text-neutral-400">
              Please read through the briefing instead.
            </p>
            <button
              type="button"
              onClick={dismissError}
              className="rounded border border-neutral-500 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
      {useWardenVoice && (
      <div className="flex shrink-0 items-center gap-1" role="group" aria-label="Background audio player">
        <button
          type="button"
          onClick={play}
          disabled={isLoading || !displayText}
          className={iconBtnClass}
          title={isLoading ? "Loading…" : isPaused ? "Resume" : "Play"}
          aria-label={isLoading ? "Loading" : isPaused ? "Resume" : "Play"}
        >
          {isLoading ? (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor" className="animate-pulse" aria-hidden>
              <circle cx="8" cy="12" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="16" cy="12" r="1.5" />
            </svg>
          ) : (
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <button
          type="button"
          onClick={pause}
          disabled={!isPlaying}
          className={iconBtnClass}
          title="Pause"
          aria-label="Pause"
        >
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={stop}
          disabled={!isPlaying && !isPaused}
          className={iconBtnClass}
          title="Stop"
          aria-label="Stop"
        >
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M6 6h12v12H6z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={rewind}
          className={iconBtnClass}
          title="Rewind"
          aria-label="Rewind"
        >
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
          </svg>
        </button>
      </div>
      )}
    </div>
  );
}
