"use client";

import { useCallback, useRef, useState, useEffect } from "react";

let sharedAudioContext: AudioContext | null = null;

/** Unlock audio on user gesture - must be called synchronously from click handler before any await. */
function unlockAudioOnGesture(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    if (!sharedAudioContext) sharedAudioContext = new Ctx();
    if (sharedAudioContext.state === "suspended") {
      sharedAudioContext.resume(); // Must run in user gesture stack
    }
    return sharedAudioContext;
  } catch {
    return null;
  }
}

export interface UseWardenTtsResult {
  play: (text: string, preGeneratedUrl?: string) => void;
  pause: () => void;
  stop: () => void;
  rewind: () => void;
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useWardenTts(): UseWardenTtsResult {
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const currentTextRef = useRef<string>("");

  const bufferCacheRef = useRef<{ buffer: AudioBuffer; text: string } | null>(null);
  const playbackOffsetRef = useRef(0);
  const startTimeRef = useRef(0);
  const ctxRef = useRef<AudioContext | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopSource = useCallback(() => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch {
        /* already stopped */
      }
      audioSourceRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    stopSource();
    playbackOffsetRef.current = 0;
    setIsPlaying(false);
    setIsPaused(false);
    setError(null);
  }, [stopSource]);

  const pause = useCallback(() => {
    if (audioSourceRef.current && ctxRef.current) {
      const elapsed = ctxRef.current.currentTime - startTimeRef.current;
      playbackOffsetRef.current = Math.min(
        playbackOffsetRef.current + elapsed,
        bufferCacheRef.current?.buffer.duration ?? Infinity
      );
      stopSource();
      setIsPaused(true);
      setIsPlaying(false);
    }
  }, [stopSource]);

  const rewind = useCallback(() => {
    playbackOffsetRef.current = 0;
    stopSource();
    if (isPlaying || isPaused) {
      setIsPlaying(false);
      setIsPaused(true);
    }
  }, [isPaused, isPlaying, stopSource]);

  const clearCacheForNewText = useCallback((newText: string) => {
    const buf = bufferCacheRef.current;
    if (buf && buf.text !== newText) {
      bufferCacheRef.current = null;
      playbackOffsetRef.current = 0;
    }
  }, []);

  const play = useCallback(async (text: string, preGeneratedUrl?: string) => {
    // CRITICAL: Unlock audio synchronously before any await (browser autoplay policy)
    const ctx = unlockAudioOnGesture();

    if (typeof window === "undefined" || (!text.trim() && !preGeneratedUrl)) {
      fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: "warn", message: "TTS play: skipped (no text)", meta: { textLen: text?.length } }),
      }).catch(() => {});
      return;
    }

    currentTextRef.current = text;
    clearCacheForNewText(text);

    // If pre-generated URL provided, try it first (faster than TTS API)
    if (preGeneratedUrl && ctx) {
      stopSource();
      playbackOffsetRef.current = 0;
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(preGeneratedUrl);
        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          ctxRef.current = ctx;
          await ctx.resume();
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
          bufferCacheRef.current = { buffer: audioBuffer, text };
          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(ctx.destination);
          source.onended = () => {
            audioSourceRef.current = null;
            setIsPlaying(false);
            setIsPaused(false);
          };
          audioSourceRef.current = source;
          startTimeRef.current = ctx.currentTime;
          source.start(0, 0);
          setIsPlaying(true);
          setIsPaused(false);
          setError(null);
          setIsLoading(false);
          return;
        }
      } catch {
        // Fall through to TTS if pre-generated fetch fails
      }
      setIsLoading(false);
    }

    // Resume from pause (Web Audio): use cached buffer, start from playbackOffset
    if (isPaused && bufferCacheRef.current?.text === text && ctx) {
      const cached = bufferCacheRef.current;
      if (playbackOffsetRef.current >= cached.buffer.duration) {
        playbackOffsetRef.current = 0;
      }
      ctxRef.current = ctx;
      await ctx.resume();
      stopSource();
      const source = ctx.createBufferSource();
      source.buffer = cached.buffer;
      source.connect(ctx.destination);
      source.onended = () => {
        audioSourceRef.current = null;
        setIsPlaying(false);
        setIsPaused(false);
      };
      audioSourceRef.current = source;
      startTimeRef.current = ctx.currentTime;
      source.start(0, playbackOffsetRef.current);
      setIsPaused(false);
      setIsPlaying(true);
      setError(null);
      return;
    }

    if (isPlaying) return;

    // Replay from cache after Stop/Rewind (Web Audio)
    if (bufferCacheRef.current?.text === text && ctx) {
      ctxRef.current = ctx;
      await ctx.resume();
      stopSource();
      const cached = bufferCacheRef.current;
      const source = ctx.createBufferSource();
      source.buffer = cached.buffer;
      source.connect(ctx.destination);
      source.onended = () => {
        audioSourceRef.current = null;
        setIsPlaying(false);
        setIsPaused(false);
      };
      audioSourceRef.current = source;
      startTimeRef.current = ctx.currentTime;
      source.start(0, playbackOffsetRef.current);
      setIsPlaying(true);
      setIsPaused(false);
      setError(null);
      return;
    }

    // First-time play: fetch and cache
    if (!ctx) {
      setError("Audio playback is not available in this browser.");
      return;
    }

    stopSource();
    playbackOffsetRef.current = 0;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: "onyx" }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errMsg = data.error ?? `TTS failed: ${res.status}`;
        fetch("/api/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ level: "error", message: `TTS API error: ${errMsg}`, meta: { status: res.status } }),
        }).catch(() => {});
        throw new Error(errMsg);
      }

      const blob = await res.blob();
      if (blob.size === 0) {
        throw new Error("TTS returned empty audio");
      }

      if (ctx) {
        ctxRef.current = ctx;
        await ctx.resume();
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        bufferCacheRef.current = { buffer: audioBuffer, text };

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => {
          audioSourceRef.current = null;
          setIsPlaying(false);
          setIsPaused(false);
        };
        audioSourceRef.current = source;
        startTimeRef.current = ctx.currentTime;
        source.start(0, 0);
        setIsPlaying(true);
        setIsPaused(false);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "TTS failed";
      setError(msg);
      setIsPlaying(false);
      setIsPaused(false);
      fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: "error", message: `TTS play failed: ${msg}`, meta: { error: String(err) } }),
      }).catch(() => {});
    } finally {
      setIsLoading(false);
    }
  }, [isPaused, isPlaying, stopSource, clearCacheForNewText]);

  useEffect(() => {
    return () => {
      stopSource();
      bufferCacheRef.current = null;
    };
  }, [stopSource]);

  return {
    play,
    pause,
    stop,
    rewind,
    isPlaying,
    isPaused,
    isLoading,
    error,
  };
}
