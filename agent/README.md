# Mothership Companion Agent

LiveKit voice agent process. Runs separately from the Next.js app.

## Setup

1. Copy `.env.example` to `.env.local` in project root.
2. Set `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `OPENAI_API_KEY`.
3. Run `pnpm download-files` if using Silero VAD / turn detection (see LiveKit docs).

## Development

```bash
pnpm agent:dev
```

## Production

```bash
pnpm agent:start
```

## Integration with Next.js

- The Next.js app fetches a token from `/api/livekit/token` and connects the client to a room.
- This agent is dispatched by LiveKit when a room requests the `mothership-warden` agent.
- The agent can call the Next.js `/api/ai/orchestrate` endpoint for puzzle logic and NPC state, or use its own LLM with injected prompts.

## References

- [LiveKit Agents Voice Quickstart](https://docs.livekit.io/agents/quickstarts/voice-agent/)
- [LiveKit Node.js Starter](https://github.com/livekit-examples/agent-starter-node)
