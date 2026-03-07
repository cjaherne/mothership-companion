import { getCampaignContextForAgent } from "@/campaigns/context";
import type { RunState } from "@/types/run";

describe("getCampaignContextForAgent", () => {
  it("includes Warden Narrator section for another-bug-hunt", () => {
    const context = getCampaignContextForAgent("another-bug-hunt", {});
    expect(context).toContain("## Warden Narrator");
    expect(context).toContain("Six months");
    expect(context).toContain("Greta Base");
  });

  it("includes The Company hints", () => {
    const context = getCampaignContextForAgent("another-bug-hunt", {});
    expect(context).toContain("## The Company");
    expect(context).toContain("Hint 1:");
    expect(context).toContain("reactor");
  });

  it("includes Voice Interaction Model", () => {
    const context = getCampaignContextForAgent("another-bug-hunt", {});
    expect(context).toContain("Voice Interaction Model");
    expect(context).toContain("WARDEN");
    expect(context).toContain("SCENARIO NPCs");
    expect(context).toContain("THE COMPANY");
  });

  it("shows locked NPCs when no unlock conditions met", () => {
    const runState: RunState = {
      characters: [],
      exploredLocationIds: ["airlock"],
      interactedNpcIds: [],
      npcAttributeState: {},
      playerKnowledgeFactIds: [],
      turn: 0,
    };
    const context = getCampaignContextForAgent("another-bug-hunt", {
      runState,
    });
    expect(context).toContain("Unlocked NPCs: none");
    expect(context).toContain("Locked");
    expect(context).toContain("example-survivor");
    expect(context).toContain("garage");
  });

  it("includes unlocked NPC profiles when conditions met", () => {
    const runState: RunState = {
      characters: [],
      exploredLocationIds: ["airlock", "garage"],
      interactedNpcIds: [],
      npcAttributeState: {},
      playerKnowledgeFactIds: [],
      turn: 0,
    };
    const context = getCampaignContextForAgent("another-bug-hunt", {
      runState,
    });
    expect(context).toContain("Unlocked NPCs: example-survivor");
    expect(context).toContain("Example Survivor");
    expect(context).toContain("paranoid");
  });

  it("includes player characters when present", () => {
    const runState: RunState = {
      characters: [
        {
          id: "c1",
          name: "Vasquez",
          traits: ["tactical", "paranoid"],
          personalitySummary: "Marine with a short fuse.",
        },
      ],
      exploredLocationIds: [],
      interactedNpcIds: [],
      npcAttributeState: {},
      playerKnowledgeFactIds: [],
      turn: 0,
    };
    const context = getCampaignContextForAgent("another-bug-hunt", {
      runState,
    });
    expect(context).toContain("Player characters");
    expect(context).toContain("Vasquez");
    expect(context).toContain("tactical");
    expect(context).toContain("short fuse");
  });
});
