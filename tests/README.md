# Test Harness

## Overview

The test harness has two parts:

1. **UI tests** – Component tests for Sidebar, RunSetupView, etc. (Jest + React Testing Library)
2. **Agent tests** – Logic and interaction tests for Warden, Company, NPCs, fact reveal (Jest)

## Running Tests

```bash
npm test              # Run all tests
npm run test:ui       # UI tests only
npm run test:agent    # Agent tests only
```

## Agent Test Structure

### Voices (`__tests__/agent/voices.test.ts`)

- Validates `getAvailableVoices` – which NPCs are unlocked based on run state
- Location-based unlock conditions (e.g. example-survivor unlocks when garage or lockers explored)

### Context (`__tests__/agent/context.test.ts`)

- Validates `getCampaignContextForAgent` output
- Warden narrative present
- Company hints present
- Voice interaction model documented
- Player characters included when present
- Unlocked NPC profiles when conditions met

### Fact Reveal (`__tests__/agent/fact-reveal.test.ts`)

- Validates `canRevealFact` – attribute-based gating for information
- Minor vs major facts, affability thresholds
- Already-revealed facts are not re-shared

### Interactions (`__tests__/agent/interactions.test.ts`)

- Scenario-based: Warden, Company, NPC dialogue
- Ensures context supports each interaction type
- Puzzle information unlockable when NPC unlocked and attributes met (non-deterministic in live LLM; we test the gating logic)

## Adding Test Cases

**UI tests:** Add a `.test.tsx` file in `src/components/__tests__/` next to the component. Use React Testing Library's `render`, `screen`, `fireEvent`.

**Agent tests:** Add a `.test.ts` file in `src/__tests__/agent/` or extend existing files. Use `RunState` to simulate game states (explored locations, characters, NPC attributes, player knowledge).
