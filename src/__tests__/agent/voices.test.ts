import { getAvailableVoices } from "@/campaigns";
import { getCampaign } from "@/campaigns";
import type { RunState } from "@/types/run";

describe("getAvailableVoices", () => {
  it("always returns warden and company available", () => {
    const campaign = getCampaign("another-bug-hunt");
    const voices = getAvailableVoices(campaign, null);
    expect(voices.warden).toBe(true);
    expect(voices.company).toBe(true);
  });

  it("returns no unlocked NPCs when no locations explored", () => {
    const campaign = getCampaign("another-bug-hunt");
    const runState: RunState = {
      characters: [],
      exploredLocationIds: ["airlock"],
      interactedNpcIds: [],
      npcAttributeState: {},
      playerKnowledgeFactIds: [],
      turn: 0,
    };
    const voices = getAvailableVoices(campaign, runState);
    expect(voices.npcs).not.toContain("example-survivor");
    expect(voices.lockedNpcs).toContainEqual(
      expect.objectContaining({ npcId: "example-survivor" })
    );
  });

  it("unlocks example-survivor when garage explored", () => {
    const campaign = getCampaign("another-bug-hunt");
    const runState: RunState = {
      characters: [],
      exploredLocationIds: ["airlock", "garage"],
      interactedNpcIds: [],
      npcAttributeState: {},
      playerKnowledgeFactIds: [],
      turn: 0,
    };
    const voices = getAvailableVoices(campaign, runState);
    expect(voices.npcs).toContain("example-survivor");
    expect(voices.lockedNpcs).not.toContainEqual(
      expect.objectContaining({ npcId: "example-survivor" })
    );
  });

  it("unlocks example-survivor when lockers explored", () => {
    const campaign = getCampaign("another-bug-hunt");
    const runState: RunState = {
      characters: [],
      exploredLocationIds: ["airlock", "lockers"],
      interactedNpcIds: [],
      npcAttributeState: {},
      playerKnowledgeFactIds: [],
      turn: 0,
    };
    const voices = getAvailableVoices(campaign, runState);
    expect(voices.npcs).toContain("example-survivor");
  });
});
