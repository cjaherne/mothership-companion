/**
 * Mothership Companion - LiveKit Voice Agent
 *
 * Long-running process that joins LiveKit rooms and handles voice.
 * Uses the planned STT → LLM → TTS pipeline (echo mode for initial testing).
 *
 * Run: npm run agent:dev (development) or npm run agent:start (production)
 *
 * Requires: LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET, OPENAI_API_KEY
 * (OpenAI key is used by LiveKit Cloud Inference for the LLM)
 */

import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { cli, ServerOptions } from "@livekit/agents";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env.local from project root (parent of agent/)
config({ path: path.resolve(__dirname, "../.env.local") });

cli.runApp(
  new ServerOptions({
    agent: path.join(__dirname, "entrypoint.ts"),
    agentName: "mothership-warden",
  })
);