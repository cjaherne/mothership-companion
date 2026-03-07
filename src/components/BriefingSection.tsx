"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface BriefingSectionProps {
  /** Scenario briefing text (from warden narrative or mission) */
  text: string;
  className?: string;
}

export function BriefingSection({ text, className = "" }: BriefingSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

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
    if (typeof window === "undefined" || !window.speechSynthesis || !text) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    if (isPlaying) return;

    stop();
    const utterance = new SpeechSynthesisUtterance(text);
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
  }, [text, isPlaying, isPaused, stop]);

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

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="flex-1 overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-950/50 p-6">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-300">
          {text}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={play}
          className="rounded border border-neon-cyan/50 px-4 py-2 text-sm font-medium text-neon-cyan hover:bg-neon-cyan/10"
        >
          {isPaused ? "Resume" : "Play"}
        </button>
        <button
          type="button"
          onClick={pause}
          disabled={!isPlaying}
          className="rounded border border-neutral-600 px-4 py-2 text-sm text-neutral-400 hover:bg-neutral-800 disabled:opacity-50"
        >
          Pause
        </button>
        <button
          type="button"
          onClick={stop}
          disabled={!isPlaying && !isPaused}
          className="rounded border border-neutral-600 px-4 py-2 text-sm text-neutral-400 hover:bg-neutral-800 disabled:opacity-50"
        >
          Stop
        </button>
        <button
          type="button"
          onClick={rewind}
          className="rounded border border-neutral-600 px-4 py-2 text-sm text-neutral-400 hover:bg-neutral-800"
        >
          Rewind to Start
        </button>
      </div>
    </div>
  );
}
