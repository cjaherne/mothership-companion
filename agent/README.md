# Mothership Companion Agent

LiveKit voice agent process. Runs separately from the Next.js app.

## Setup

1. Copy `.env.example` to `.env.local` in project root.
2. Set `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`.
3. Set `OPENAI_API_KEY` — see [docs/openai-api-key.md](../docs/openai-api-key.md) for how to create one.
4. If using LiveKit Cloud, add `OPENAI_API_KEY` in the project's agent/inference settings.

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
