/**
 * TTS API - Warden voice for Scenario Briefing
 *
 * Uses OpenAI TTS (tts-1, onyx voice) to generate audio from text.
 * No LiveKit involvement; does not touch run state.
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

const OPENAI_TTS_LIMIT = 4096;
const CHUNK_SIZE = 4000;

const VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"] as const;
type VoiceOption = (typeof VOICES)[number];

function chunkText(text: string): string[] {
  if (text.length <= OPENAI_TTS_LIMIT) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= CHUNK_SIZE) {
      chunks.push(remaining);
      break;
    }
    const segment = remaining.slice(0, CHUNK_SIZE);
    const lastPeriod = segment.lastIndexOf(". ");
    const lastNewline = segment.lastIndexOf("\n");
    const splitAt = Math.max(lastPeriod, lastNewline, Math.floor(CHUNK_SIZE / 2));

    if (splitAt > 0) {
      chunks.push(remaining.slice(0, splitAt + 1).trim());
      remaining = remaining.slice(splitAt + 1).trim();
    } else {
      chunks.push(segment);
      remaining = remaining.slice(CHUNK_SIZE);
    }
  }

  return chunks;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 500 }
    );
  }

  let body: { text?: string; voice?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    logger.warn("TTS: empty text in request");
    return NextResponse.json(
      { error: "text is required" },
      { status: 400 }
    );
  }

  const voice: VoiceOption =
    body.voice && VOICES.includes(body.voice as VoiceOption)
      ? (body.voice as VoiceOption)
      : "onyx";

  logger.info("TTS: request received", { textLength: text.length, voice });

  const chunks = chunkText(text);

  try {
    const buffers: ArrayBuffer[] = [];
    for (const chunk of chunks) {
      const res = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "tts-1",
          voice,
          input: chunk,
          response_format: "mp3",
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        return NextResponse.json(
          { error: `OpenAI TTS failed: ${err}` },
          { status: res.status }
        );
      }

      const arrBuf = await res.arrayBuffer();
      buffers.push(arrBuf);
    }

    const totalLength = buffers.reduce((acc, b) => acc + b.byteLength, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const buf of buffers) {
      combined.set(new Uint8Array(buf), offset);
      offset += buf.byteLength;
    }

    return new NextResponse(combined, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(combined.length),
      },
    });
  } catch (err) {
    logger.error("TTS route error", { error: String(err) });
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}
