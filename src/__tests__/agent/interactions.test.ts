/**
 * Agent interaction scenarios
 *
 * Validates that context supports expected interaction types:
 * - Warden (narration)
 * - The Company (hints)
 * - Scenario NPCs (dialogue, fact reveal)
 */

import { getCampaignContextForAgent } from "@/campaigns/context";
import { getAvailableVoices } from "@/campaigns";
import { getCampaign } from "@/campaigns";
import type { RunState } from "@/types/run";

describe("Warden interaction", () => {
  it("context supports narration request - contains opening narrative", () => {
    const context = getCampaignContextForAgent("another-bug-hunt", {});
    expect(context).toMatch(/WARDEN.*always available/);
    expect(context).toContain("Deliver this at session start");
    expect(context).toContain("Six months");
  });
});

describe("Company interaction", () => {
  it("context supports hint request - contains escalating hints", () => {
    const context = getCampaignContextForAgent("another-bug-hunt", {});
    expect(context).toMatch(/THE COMPANY.*always available/);
    expect(context).toContain("When players ask for a hint");
    expect(context).toContain("Hint 1:");
    expect(context).toContain("Hint 2:");
  });
});

describe("NPC interaction", () => {
  it("context excludes locked NPC from dialogue when not unlocked", () => {
    const runState: RunState = {
      characters: [],
      exploredLocationIds: ["airlock"],
      interactedNpcIds: [],
      npcAttributeState: {},
      playerKnowledgeFactIds: [],
      turn: 0,
    };
    const voices = getAvailableVoices(getCampaign("another-bug-hunt"), runState);
    expect(voices.npcs).not.toContain("example-survivor");
    const context = getCampaignContextForAgent("another-bug-hunt", { runState });
    expect(context).not.toMatch(/Unlocked NPCs: example-survivor/);
  });

  it("context includes NPC facts when unlocked - puzzle info can be revealed", () => {
    const runState: RunState = {
      characters: [{ id: "c1", name: "Vasquez", traits: [], personalitySummary: "" }],
      exploredLocationIds: ["airlock", "garage"],
      interactedNpcIds: [],
      npcAttributeState: {},
      playerKnowledgeFactIds: [],
      turn: 0,
    };
    const context = getCampaignContextForAgent("another-bug-hunt", { runState });
    expect(context).toContain("example-survivor");
    expect(context).toContain("power_sequence");
    expect(context).toContain("carcinid_garage");
    expect(context).toContain("garage");
    expect(context).toContain("reactor");
  });
});
