# Mothership Companion

A voice-interactive Warden companion for **Mothership** RPG scenarios. Create characters with full Mothership stats, explore scenario briefings and maps, and talk to NPCs in real time via voice—ideal for in-person play with a shared device.

## Features

- **Character creation** — Build Mothership characters with class (Marine, Android, Scientist, Teamster), sex, stats, saves, skills, loadout, trinket, and patch. Roll random or customize. Optional AI-generated character artwork (Replicate SDXL).
- **Campaign runs** — Create new runs or resume previous sessions. Runs persist locally.
- **Briefing & maps** — Read scenario background, explore the Samsa VI planet map, drill into regions (Greta Base, Heron Station, etc.), and view location details with points of interest.
- **NPC interaction** — See NPCs in each location. Connect to the Warden or any NPC for real-time voice chat powered by LiveKit and OpenAI.
- **Rule references** — Open the Player's Survival Guide and Shipbreaker's Toolkit PDFs from the sidebar.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React 18, Tailwind CSS |
| **Voice** | LiveKit (VAD, STT, TTS), OpenAI |
| **AI** | Vercel AI SDK, OpenAI (orchestration, NPC logic) |
| **Character art** | Replicate (SDXL img2img) — optional |

## Quick Start

### 1. Install dependencies

```bash
cd mothership-companion
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and set:

| Variable | Required | Description |
|----------|----------|-------------|
| `LIVEKIT_URL` | Yes | LiveKit WebSocket URL (e.g. `wss://your-project.livekit.cloud`) |
| `LIVEKIT_API_KEY` | Yes | LiveKit API key |
| `LIVEKIT_API_SECRET` | Yes | LiveKit API secret |
| `OPENAI_API_KEY` | Yes | OpenAI API key (AI + TTS) |
| `REPLICATE_API_TOKEN` | No | For character artwork generation |

> `.env.local` is gitignored. Never commit it. See [docs/env-setup.md](docs/env-setup.md) for details.

### 3. Run the app and agent

Use **two terminals**:

**Terminal 1 — Next.js app:**
```bash
npm run dev
```

**Terminal 2 — LiveKit voice agent:**
```bash
npm run agent:dev
```

The agent must run before voice sessions work.

### 4. Open the app

Go to [http://localhost:3000](http://localhost:3000).

## How to Use

### Step 1: Select a campaign

From the sidebar or home page, choose a campaign (e.g. **Another Bug Hunt**). Create a new run or resume a previous one.

### Step 2: Create characters

On **Set up**, add player characters:

- Choose **class** (Marine, Android, Scientist, Teamster) and **sex**
- Roll or enter **stats**, **saves**, **health**, **skills**, **loadout**, **trinket**, **patch**, **credits**
- Add **traits** and **personality** for NPC interaction
- Optionally generate AI artwork (requires `REPLICATE_API_TOKEN`)

Click **Add player** for each character, then **Start session** when ready.

### Step 3: Read the briefing

- Review the **Background** (with optional TTS playback)
- Explore the **Samsa VI planet map** — click regions to drill in
- View **internal maps** (e.g. Greta Base floorplan) and **location details**
- See **NPCs in this location**

### Step 4: Talk to the Warden or NPCs

- Click **Talk to Warden** to speak with the narrator, or select an NPC and click **Connect** to talk to them
- Your mic streams to LiveKit; the agent responds with voice
- Exit the session to return to the briefing view

### Other actions

- **Rules** — Open PDFs (Player's Survival Guide, Shipbreaker's Toolkit) from the sidebar
- **Mark as Visited** — Track explored locations on maps
- **New Character** — Add characters during a run from the context menu

## Project Structure

```
mothership-companion/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/
│   │   │   ├── ai/orchestrate/   # AI SDK NPC/puzzle logic
│   │   │   ├── character-art/    # Replicate artwork generation
│   │   │   ├── livekit/token/    # LiveKit JWT for client
│   │   │   ├── run/state/        # Run state persistence
│   │   │   └── tts/              # Briefing TTS
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── campaigns/                # Campaign content
│   │   ├── another-bug-hunt/     # Distress Signals scenario
│   │   │   ├── npcs.ts
│   │   │   ├── world.ts
│   │   │   ├── items.ts
│   │   │   └── scenarios/
│   │   ├── warden/               # Default Warden campaign
│   │   ├── registry.ts
│   │   └── types.ts
│   ├── components/
│   │   ├── AddCharacterForm.tsx  # Character creation
│   │   ├── BriefingLandingPage.tsx
│   │   ├── CharacterList.tsx
│   │   ├── NpcSelector.tsx
│   │   ├── NpcVoicePanel.tsx
│   │   ├── SamsaVIMap.tsx
│   │   ├── InternalLocationMap.tsx
│   │   ├── LocationDetailMap.tsx
│   │   └── VoiceSessionView.tsx
│   ├── lib/
│   │   ├── mothership.ts         # Character creation rules
│   │   ├── mothership-skills.ts
│   │   └── runs.ts               # Run state
│   └── types/
├── agent/                        # LiveKit voice agent (runs separately)
│   ├── main.ts
│   └── README.md
└── package.json
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run agent:dev` | Start LiveKit agent (dev) |
| `npm run agent:start` | Start LiveKit agent (prod) |
| `npm test` | Run tests |

## Documentation

- [Environment setup](docs/env-setup.md) — Env vars and security
- [OpenAI API key](docs/openai-api-key.md) — Getting an API key
- [Agent README](agent/README.md) — LiveKit agent details

## License

Private project.
