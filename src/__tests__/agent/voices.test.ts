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

  it("keeps demar locked when garage explored but APC POI not inspected", () => {
    const campaign = getCampaign("another-bug-hunt");
    const runState: RunState = {
      characters: [],
      exploredLocationIds: ["garage"],
      exploredPoiIds: [],
      interactedNpcIds: [],
      npcAttributeState: {},
      playerKnowledgeFactIds: [],
      turn: 0,
    };
    const voices = getAvailableVoices(campaign, runState);
    expect(voices.npcs).not.toContain("demar");
    expect(voices.lockedNpcs).toContainEqual(
      expect.objectContaining({ npcId: "demar" })
    );
  });

  it("unlocks demar when garage explored AND apc POI inspected", () => {
    const campaign = getCampaign("another-bug-hunt");
    const runState: RunState = {
      characters: [],
      exploredLocationIds: ["garage"],
      exploredPoiIds: ["apc"],
      interactedNpcIds: [],
      npcAttributeState: {},
      playerKnowledgeFactIds: [],
      turn: 0,
    };
    const voices = getAvailableVoices(campaign, runState);
    expect(voices.npcs).toContain("demar");
    expect(voices.lockedNpcs).not.toContainEqual(
      expect.objectContaining({ npcId: "demar" })
    );
  });

  it("unlocks maas when the-metamorphosis explored (prologue)", () => {
    const campaign = getCampaign("another-bug-hunt");
    const runState: RunState = {
      characters: [],
      exploredLocationIds: ["the-metamorphosis"],
      exploredPoiIds: [],
      interactedNpcIds: [],
      npcAttributeState: {},
      playerKnowledgeFactIds: [],
      turn: 0,
    };
    const voices = getAvailableVoices(campaign, runState);
    expect(voices.npcs).toContain("maas");
  });
});
