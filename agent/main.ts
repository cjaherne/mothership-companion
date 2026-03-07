/**
 * Mothership Companion - LiveKit Voice Agent
 *
 * Long-running process that joins LiveKit rooms and handles voice.
 * Uses VAD (Voice Activity Detection) to know when the player has stopped
 * speaking—no awkward "is it still listening?" silence.
 *
 * Run: pnpm agent:dev (development) or pnpm agent:start (production)
 *
 * Requires: LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET, OPENAI_API_KEY
 */

// Placeholder for LiveKit Agents setup.
// See: https://docs.livekit.io/agents/quickstarts/voice-agent/
// The agent will:
// 1. Connect to LiveKit and listen for room dispatch
// 2. Join rooms when "mothership-warden" agent is requested
// 3. Use STT -> LLM -> TTS pipeline (or OpenAI Realtime) for voice
// 4. Inject NPC profiles and puzzle state from the AI orchestration layer

console.log("Mothership Companion agent - scaffolding ready.");
console.log("To implement: Add @livekit/agents Worker and AgentSession.");
console.log("See agent/README.md for integration steps.");

// Parse CLI for dev/start
const args = process.argv.slice(2);
const mode = args[0] ?? "dev";
console.log(`Mode: ${mode}`);
