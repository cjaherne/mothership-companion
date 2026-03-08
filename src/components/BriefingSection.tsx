"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import type { BriefingPage } from "@/campaigns/types";

interface BriefingSectionProps {
  /** Scenario briefing text (fallback when no pages) */
  text: string;
  /** Paginated briefing pages. When set, used instead of text. */
  pages?: BriefingPage[];
  /** Compact mode: smaller text, tighter padding, inline controls */
  compact?: boolean;
  className?: string;
}

export function BriefingSection({ text, pages, compact, className = "" }: BriefingSectionProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const effectivePages: BriefingPage[] =
    pages?.length ? pages : [{ title: "Briefing", content: text }];
  const currentPage = effectivePages[currentPageIndex];
  const displayText = currentPage?.content ?? text;
  const canGoBack = currentPageIndex > 0;
  const canGoForward = currentPageIndex < effectivePages.length - 1;

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  const rewind = useCallback(() => {
    stop();
  }, [stop]);

  const play = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis || !displayText) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    if (isPlaying) return;

    stop();
    const utterance = new SpeechSynthesisUtterance(displayText);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utteranceRef.current = utterance;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  }, [displayText, isPlaying, isPaused, stop]);

  const goToPage = useCallback(
    (index: number) => {
      stop();
      setCurrentPageIndex(Math.max(0, Math.min(index, effectivePages.length - 1)));
    },
    [stop, effectivePages.length]
  );

  const pause = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  const textClass = compact ? "text-[11px] leading-snug" : "text-xs leading-relaxed";
  const padClass = compact ? "p-2" : "p-4";
  const btnClass = compact
    ? "rounded border px-2 py-1 text-[10px]"
    : "rounded border px-3 py-1.5 text-xs";
  const playBtnClass = compact
    ? "rounded border border-amber-500/50 px-2 py-1 text-[10px] font-medium text-amber-400 hover:bg-amber-500/10"
    : "rounded border border-amber-500/50 px-4 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/10";

  return (
    <div className={`flex min-h-0 flex-col ${compact ? "gap-1" : "gap-2"} ${className}`}>
      <div className="flex shrink-0 items-center justify-between gap-1">
        <h5
          className={
            compact
              ? "text-[10px] font-medium uppercase tracking-wider text-neutral-500"
              : "text-xs font-medium uppercase tracking-wider text-neutral-500"
          }
        >
          {currentPage?.title ?? "Briefing"}
        </h5>
        {effectivePages.length > 1 && (
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => goToPage(currentPageIndex - 1)}
              disabled={!canGoBack}
              className="rounded border border-neutral-600 px-1.5 py-0.5 text-[10px] text-neutral-400 hover:bg-neutral-800 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              ←
            </button>
            <span className="px-1 text-[10px] text-neutral-600">
              {currentPageIndex + 1}/{effectivePages.length}
            </span>
            <button
              type="button"
              onClick={() => goToPage(currentPageIndex + 1)}
              disabled={!canGoForward}
              className="rounded border border-neutral-600 px-1.5 py-0.5 text-[10px] text-neutral-400 hover:bg-neutral-800 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              →
            </button>
          </div>
        )}
      </div>
      <div
        className={`min-h-0 flex-1 overflow-y-auto rounded border border-amber-900/40 bg-amber-950/20 ${padClass}`}
      >
        <p className={`whitespace-pre-wrap ${textClass} text-neutral-300`}>
          {displayText}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-1">
        <button type="button" onClick={play} className={playBtnClass}>
          {isPaused ? "Resume" : "Play"}
        </button>
        <button
          type="button"
          onClick={pause}
          disabled={!isPlaying}
          className={`${btnClass} border-neutral-600 text-neutral-400 hover:bg-neutral-800 disabled:opacity-50`}
        >
          Pause
        </button>
        <button
          type="button"
          onClick={stop}
          disabled={!isPlaying && !isPaused}
          className={`${btnClass} border-neutral-600 text-neutral-400 hover:bg-neutral-800 disabled:opacity-50`}
        >
          Stop
        </button>
        <button
          type="button"
          onClick={rewind}
          className={`${btnClass} border-neutral-600 text-neutral-400 hover:bg-neutral-800`}
        >
          Rewind
        </button>
      </div>
    </div>
  );
}
