/**
 * Mothership Companion - Agent Entrypoint
 *
 * Voice agent that joins LiveKit rooms. Uses STT → LLM → TTS pipeline.
 * When active NPC is set (e.g. Maas), embodies that NPC with campaign context.
 * Fallback: echo mode for testing.
 */

import { defineAgent } from "@livekit/agents";
import { voice } from "@livekit/agents";
import type { JobContext, JobProcess } from "@livekit/agents";
import * as openai from "@livekit/agents-plugin-openai";
import * as silero from "@livekit/agents-plugin-silero";
import { TrackKind } from "@livekit/rtc-node";
import { logger } from "./logger";

const APP_URL = process.env.APP_URL || "http://localhost:3000";

async function fetchRunState(runId: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`${APP_URL}/api/run/state?runId=${encodeURIComponent(runId)}`);
    if (!res.ok) return null;
    return (await res.json()) as Record<string, unknown>;
  } catch (e) {
    logger.error("Failed to fetch run state", { runId, error: String(e) });
    return null;
  }
}

function parseRoomContext(roomName: string | undefined): { campaignId: string; runId: string } | null {
  if (!roomName || !roomName.includes("__run__")) return null;
  const parts = roomName.split("__run__");
  if (parts.length !== 2) return null;
  return { campaignId: parts[0], runId: parts[1] };
}

export default defineAgent({
  prewarm: async (proc: JobProcess) => {
    proc.userData.vad = await silero.VAD.load();
  },
  entry: async (ctx: JobContext) => {
    logger.info("Job received", { room: ctx.job.room?.name, jobId: ctx.job.id });
    const vad = ctx.proc.userData.vad as silero.VAD;

    const roomCtx = parseRoomContext(ctx.job.room?.name);
    let runState: Record<string, unknown> | null = null;
    let campaignContext = "";
    let activeNpcId: string | undefined;
    let greetingMessage: string | undefined;
    let ttsVoice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" = "alloy";

    if (roomCtx) {
      runState = await fetchRunState(roomCtx.runId);
      if (runState) {
        activeNpcId = runState.activeNpcId as string | undefined;
      }

      try {
        const { getCampaignContextForAgent } = await import("../src/campaigns/context");
        const { getNpcProfile } = await import("../src/campaigns/another-bug-hunt/npcs");
        const { getCampaign } = await import("../src/campaigns/registry");
        const WARDEN_NARRATOR_ID = "warden-narrator";

        campaignContext = getCampaignContextForAgent(roomCtx.campaignId, {
          activeNpcId: activeNpcId ?? null,
          runState: runState as unknown as import("../src/types/run").RunState,
          scenarioId: null,
        });

        if (activeNpcId === WARDEN_NARRATOR_ID) {
          const campaign = getCampaign(roomCtx.campaignId);
          if (campaign.wardenNarrator?.narrative) {
            greetingMessage = `Deliver the Warden Narrator opening. Atmospheric, authoritative. Set the scene.\n\n${campaign.wardenNarrator.narrative}`;
          }
        } else if (activeNpcId) {
          const npc = getNpcProfile(activeNpcId);
          if (npc?.greetingMessage) {
            greetingMessage = npc.greetingMessage;
          }
          if (npc?.speechProfile?.vocalQuality?.includes("tinny")) {
            ttsVoice = "echo";
          }
        }
      } catch (e) {
        logger.error("Failed to load campaign context", { error: String(e) });
      }
    }

    const isWarden = activeNpcId === "warden-narrator";
    const instructions =
      campaignContext && activeNpcId
        ? isWarden
          ? `You are the Warden Narrator—the omniscient voice of this Mothership RPG session. Authoritative, atmospheric, builds tension. Deliver narration and scene-setting when players ask. No asterisks or stage directions. Keep responses concise for voice.

${campaignContext}`
          : `You are roleplaying as the NPC "${activeNpcId}" in a Mothership RPG session. Stay in character at all times. Speak only as this NPC. Use natural, conversational dialogue—no asterisks or stage directions. Keep responses concise for voice (2-4 sentences typically).

${campaignContext}`
        : `You are an echo agent. Repeat exactly what the user said, word for word. Keep responses very short. No greetings, no commentary.`;

    try {
      const session = new voice.AgentSession({
        stt: "deepgram/nova-3",
        llm: new openai.LLM({ model: "gpt-4o-mini" }),
        tts: new openai.TTS({ model: "tts-1", voice: ttsVoice }),
        vad,
        turnDetection: "stt",
        voiceOptions: { preemptiveGeneration: true },
      });

      session.on(voice.AgentSessionEventTypes.UserStateChanged, (ev) => {
        logger.debug("User state changed", { oldState: ev.oldState, newState: ev.newState });
      });
      session.on(voice.AgentSessionEventTypes.AgentStateChanged, (ev) => {
        logger.info(`Agent: ${ev.newState}`, {
          oldState: ev.oldState,
          newState: ev.newState,
          ts: new Date().toISOString(),
        });
      });
      session.on(voice.AgentSessionEventTypes.UserInputTranscribed, (ev) => {
        logger.debug("User input transcribed", { transcript: ev.transcript, isFinal: ev.isFinal });
      });
      session.on(voice.AgentSessionEventTypes.SpeechCreated, (ev) => {
        logger.debug("Speech handle created", { speechId: ev.speechHandle?.id });
      });
      session.on(voice.AgentSessionEventTypes.Error, (ev) => {
        const err = ev.error;
        logger.error("Agent session error event", {
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        });
      });

      ctx.room.on("participantConnected", (p: { identity: string }) => {
        logger.debug("Participant connected", { identity: p.identity });
      });
      ctx.room.on("trackSubscribed", (track, _pub, participant) => {
        if (track?.kind === TrackKind.KIND_AUDIO) {
          logger.debug("Audio track subscribed", { identity: participant.identity });
        }
      });

      const agent = new voice.Agent({ instructions });
      await session.start({
        agent,
        room: ctx.room,
        inputOptions: { participantIdentity: "player" },
      });
      logger.info("Session started", { room: ctx.job.room?.name, activeNpcId });

      await ctx.connect();
      logger.info("Connection established", {
        remoteCount: ctx.room.remoteParticipants.size,
        participantIdentities: Array.from(ctx.room.remoteParticipants.keys()),
      });

      if (greetingMessage) {
        await session.generateReply({
          instructions: `Deliver this as your opening. Speak it in character. Adapt the briefing to your personality—dismissive, corporate, unconcerned with the crew. Cover all the information but in your own annoying way. Do not use asterisks or stage directions. Keep it concise for voice (break into 2-3 parts if long).\n\n${greetingMessage}`,
        });
        logger.debug("NPC greeting delivered");
      } else if (!activeNpcId) {
        await session.generateReply({
          instructions: "Greet the user briefly and say you are ready to echo what they say.",
        });
        logger.debug("Echo greeting completed");
      }
    } catch (err) {
      logger.error("Agent session error", {
        room: ctx.job.room?.name,
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      });
      throw err;
    }
  },
});
