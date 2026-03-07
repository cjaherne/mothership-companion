/**
 * Mothership Companion - Agent Entrypoint
 *
 * Voice agent that joins LiveKit rooms. Uses the planned STT → LLM → TTS pipeline.
 * Echo mode: repeats what the user says to prove the integration works.
 */

import { defineAgent } from "@livekit/agents";
import { voice } from "@livekit/agents";
import type { JobContext, JobProcess } from "@livekit/agents";
import * as openai from "@livekit/agents-plugin-openai";
import * as silero from "@livekit/agents-plugin-silero";
import { logger } from "./logger";

/** Echo agent: listens and repeats what the user says. */
class EchoAgent extends voice.Agent {
  constructor() {
    super({
      instructions: `You are an echo agent. Your only job is to repeat exactly what the user said, word for word.
Keep responses very short—just the echo, nothing else. No greetings, no commentary, no punctuation like asterisks.`,
    });
  }
}

export default defineAgent({
  prewarm: async (proc: JobProcess) => {
    proc.userData.vad = await silero.VAD.load();
  },
  entry: async (ctx: JobContext) => {
    logger.info("Job received", { room: ctx.job.room?.name, jobId: ctx.job.id });
    const vad = ctx.proc.userData.vad as silero.VAD;
    try {
      const session = new voice.AgentSession({
        stt: "deepgram/nova-3",
        llm: new openai.LLM({ model: "gpt-4o-mini" }),
        tts: new openai.TTS({ model: "tts-1", voice: "alloy" }),
        vad,
        turnDetection: "stt",
        voiceOptions: { preemptiveGeneration: true },
      });

      session.on(voice.AgentSessionEventTypes.UserStateChanged, (ev) => {
        logger.debug("User state changed", {
          oldState: ev.oldState,
          newState: ev.newState,
        });
      });
      session.on(voice.AgentSessionEventTypes.AgentStateChanged, (ev) => {
        logger.info(`Agent: ${ev.newState}`, {
          oldState: ev.oldState,
          newState: ev.newState,
          ts: new Date().toISOString(),
        });
      });
      session.on(voice.AgentSessionEventTypes.UserInputTranscribed, (ev) => {
        logger.debug("User input transcribed", {
          transcript: ev.transcript,
          isFinal: ev.isFinal,
        });
      });
      session.on(voice.AgentSessionEventTypes.SpeechCreated, (ev) => {
        logger.debug("Speech handle created", { speechId: ev.handle?.id });
      });
      session.on(voice.AgentSessionEventTypes.Error, (ev) => {
        logger.error("Agent session error event", {
          message: ev.error?.message,
          stack: ev.error?.stack,
        });
      });

      ctx.room.on("participantConnected", (p: { identity: string }) => {
        logger.debug("Participant connected", { identity: p.identity });
      });
      ctx.room.on("trackSubscribed", (track: { kind: string }, _pub: unknown, participant: { identity: string }) => {
        if (track.kind === "audio") {
          logger.debug("Audio track subscribed", { identity: participant.identity });
        }
      });

      const agent = new EchoAgent();
      await session.start({
        agent,
        room: ctx.room,
        inputOptions: {
          participantIdentity: "player",
        },
      });
      logger.info("Session started", { room: ctx.job.room?.name });

      await ctx.connect();
      logger.info("Connection established", {
        remoteCount: ctx.room.remoteParticipants.size,
        participantIdentities: [...ctx.room.remoteParticipants.keys()],
      });

      await session.generateReply({
        instructions: "Greet the user briefly and say you are ready to echo what they say.",
      });
      logger.debug("Greeting generation completed");
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
