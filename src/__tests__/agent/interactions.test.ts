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
  it("demar is locked when garage explored but APC not inspected", () => {
    const runState: RunState = {
      characters: [],
      exploredLocationIds: ["garage"],
      exploredPoiIds: [],
      interactedNpcIds: [],
      npcAttributeState: {},
      playerKnowledgeFactIds: [],
      turn: 0,
    };
    const voices = getAvailableVoices(getCampaign("another-bug-hunt"), runState);
    expect(voices.npcs).not.toContain("demar");
    const context = getCampaignContextForAgent("another-bug-hunt", { runState });
    expect(context).toContain("Locked");
  });

  it("demar is unlocked when garage explored AND apc POI inspected", () => {
    const runState: RunState = {
      characters: [{ id: "c1", name: "Vasquez", traits: [], personalitySummary: "" }],
      exploredLocationIds: ["garage"],
      exploredPoiIds: ["apc"],
      interactedNpcIds: [],
      npcAttributeState: {},
      playerKnowledgeFactIds: [],
      turn: 0,
    };
    const voices = getAvailableVoices(getCampaign("another-bug-hunt"), runState);
    expect(voices.npcs).toContain("demar");
    const context = getCampaignContextForAgent("another-bug-hunt", { runState });
    expect(context).toContain("demar");
  });
});
