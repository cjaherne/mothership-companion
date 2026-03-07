# Mothership Companion

Voice-interactive companion app for **Mothership** RPG Warden scenarios. Real-time voice chat with NPCs, powered by LiveKit Agents (or OpenAI Realtime API) and orchestrated via the Vercel AI SDK.

## Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React 18, Tailwind CSS |
| **Voice** | LiveKit (VAD, STT, TTS) or OpenAI Realtime API |
| **AI Backend** | Node.js, Vercel AI SDK (prompts, puzzle state, NPC logic) |

## Project Structure

```
mothership-companion/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/
│   │   │   ├── livekit/token/  # LiveKit JWT for client
│   │   │   └── ai/orchestrate/ # AI SDK prompt/puzzle logic
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── campaigns/              # Multi-campaign support
│   │   ├── types.ts            # Campaign, World, PlayerSession
│   │   ├── registry.ts         # getCampaign(), listCampaignIds()
│   │   └── warden/             # Default Warden campaign
│   ├── components/
│   │   └── VoiceSession/       # Client-side audio capture → LiveKit stream
│   ├── lib/
│   │   └── ai/                 # Orchestration helpers
│   └── types/
│       ├── npc.ts              # NPC personality profiles
│       └── puzzle.ts           # Puzzle state schema
├── agent/                      # LiveKit voice agent (runs separately)
│   ├── main.ts
│   └── README.md
└── package.json
```

## Quick Start

1. **Install dependencies**

   ```bash
   cd mothership-companion
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with LIVEKIT_* and OPENAI_API_KEY
   ```

   > **Security:** `.env.local` contains secrets and is gitignored. Never commit it. See [docs/env-setup.md](docs/env-setup.md) for details.
   > **OpenAI key:** See [docs/openai-api-key.md](docs/openai-api-key.md) for setup steps.

3. **Run the Next.js app**

   ```bash
   npm run dev
   ```

4. **Run the LiveKit agent** (in another terminal)

   ```bash
   npm run agent:dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) and click **Initialize Session** to connect.

## NPC Personality Profiles

Interfaces are defined in `src/types/npc.ts`:

- `NPCPersonalityProfile` – Archetype, traits, speech profile, knowledge scope
- `NPCInstance` – Runtime state (trust, revealed facts, emotional state)
- Archetypes: `Panicked Marine`, `Cynical Android`, `Corporate Officer`, etc.

## Puzzle State

Defined in `src/types/puzzle.ts`:

- `PuzzleState` – Status, clues, required conditions
- `GameState` – Puzzles, player knowledge, current scene (optionally scoped by `campaignId`)

## Campaigns

The app supports multiple Mothership campaigns (worlds, NPCs, players). Structure in `src/campaigns/`:

- **CampaignConfig** – id, name, world, npcIds, puzzleIds, roomName
- **World** – Locations and default scene
- **PlayerSession** – Per-campaign player state
- **Registry** – `getCampaign(id)`, `getCampaignOrDefault(id)`, `listCampaignIds()`

The token API accepts `?campaign=warden` (default). To add a campaign:

1. Create `src/campaigns/{id}/index.ts` with a `CampaignConfig`
2. Register it in `src/campaigns/registry.ts`

## Next Steps

- Define a detailed system prompt for personas, setting, theme, and NPC logic
- Wire the LiveKit agent to use `NPCPersonalityProfile` and `GameState`
- Implement agent audio playback in `VoiceSession` (attach remote track to `<audio>`)
- Add OpenAI Realtime API as an alternative voice backend
