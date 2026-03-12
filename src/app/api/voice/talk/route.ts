/**
 * POST /api/voice/talk
 *
 * Click-to-talk voice API: STT → context/fact-gate → LLM → TTS.
 * Supports Warden (game helper) and NPC (in-universe) agent types.
 */

import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { getWardenContext, getNpcContext } from "@/campaigns/context";
import { getNpcProfile } from "@/campaigns/another-bug-hunt/npcs";
import {
  detectInteractionIntent,
  getRevealableFactIds,
} from "@/lib/voice/fact-gate";
import { stateStore } from "@/lib/run-state-store";
import { logger } from "@/lib/logger";
import type { RunState } from "@/types/run";
import type { CampaignId } from "@/campaigns/types";

const VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"] as const;
type VoiceOption = (typeof VOICES)[number];

async function transcribeWithWhisper(
  audioBlob: Blob,
  apiKey: string
): Promise<string> {
  const formData = new FormData();
  formData.append("file", audioBlob, "audio.webm");
  formData.append("model", "whisper-1");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Whisper failed: ${err}`);
  }

  const json = (await res.json()) as { text?: string };
  return (json.text ?? "").trim();
}

async function synthesizeWithOpenAI(
  text: string,
  voice: VoiceOption,
  apiKey: string
): Promise<ArrayBuffer> {
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1",
      voice,
      input: text.slice(0, 4096),
      response_format: "mp3",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`TTS failed: ${err}`);
  }

  return res.arrayBuffer();
}

export async function POST(request: NextRequest) {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const audio = formData.get("audio") as Blob | null;
    const runId = formData.get("runId") as string | null;
    const agentType = formData.get("agentType") as string | null;
    const npcId = (formData.get("npcId") as string | null) ?? undefined;
    const campaignId = formData.get("campaignId") as string | null;
    const runStateJson = formData.get("runState") as string | null;

    if (!audio || !runId || !agentType || !campaignId) {
      return NextResponse.json(
        { error: "Missing required fields: audio, runId, agentType, campaignId" },
        { status: 400 }
      );
    }

    if (agentType !== "warden" && agentType !== "npc") {
      return NextResponse.json(
        { error: "agentType must be 'warden' or 'npc'" },
        { status: 400 }
      );
    }

    if (agentType === "npc" && !npcId) {
      return NextResponse.json(
        { error: "npcId required when agentType is 'npc'" },
        { status: 400 }
      );
    }

    let runState: RunState | null = null;
    if (runStateJson) {
      try {
        runState = JSON.parse(runStateJson) as RunState;
      } catch {
        logger.warn("voice/talk: invalid runState JSON, using server store");
      }
    }
    if (!runState) {
      runState = stateStore.get(runId) ?? null;
    }

    logger.info("voice/talk: transcribing", { agentType, npcId });

    const transcript = await transcribeWithWhisper(audio, openaiKey);
    if (!transcript) {
      return NextResponse.json(
        { error: "No speech detected", transcript: "" },
        { status: 400 }
      );
    }

    logger.info("voice/talk: transcript", { transcript: transcript.slice(0, 80) });

    let systemPrompt: string;
    let ttsVoice: VoiceOption = "onyx";

    if (agentType === "warden") {
      systemPrompt = getWardenContext(campaignId as CampaignId, runState);
      ttsVoice = "onyx";
    } else {
      const npc = getNpcProfile(npcId!);
      if (!npc) {
        return NextResponse.json(
          { error: `Unknown NPC: ${npcId}` },
          { status: 400 }
        );
      }

      const intent = detectInteractionIntent(transcript);
      const rawAttrs =
        runState?.npcAttributeState?.[npcId!] ?? npc.manipulatableAttributes ?? {};
      const attrs = {
        fear: rawAttrs.fear ?? 0.5,
        stress: rawAttrs.stress ?? 0.5,
        affability: rawAttrs.affability ?? 0.5,
      };
      const characters = runState?.characters ?? [];
      const playerKnowledge = runState?.playerKnowledgeFactIds ?? [];
      const revealable = getRevealableFactIds(
        npc,
        attrs,
        playerKnowledge,
        playerKnowledge,
        characters,
        intent
      );

      systemPrompt = getNpcContext(
        campaignId as CampaignId,
        npcId!,
        runState,
        revealable,
        intent
      );

      if (npc.speechProfile?.vocalQuality?.includes("tinny")) {
        ttsVoice = "echo";
      }
    }

    const userPrompt = `Player said: "${transcript}"\n\nRespond appropriately.`;

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: userPrompt,
    });

    if (!text?.trim()) {
      return NextResponse.json(
        { error: "No response generated", transcript },
        { status: 500 }
      );
    }

    const audioBuffer = await synthesizeWithOpenAI(
      text.trim(),
      ttsVoice,
      openaiKey
    );

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audioBuffer.byteLength),
        "X-Transcript": encodeURIComponent(transcript),
        "X-Response-Text": encodeURIComponent(text.trim()),
      },
    });
  } catch (err) {
    logger.error("voice/talk error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Voice processing failed",
      },
      { status: 500 }
    );
  }
}
