import { canRevealFact } from "@/campaigns/another-bug-hunt/fact-utils";
import { exampleSurvivorProfile } from "@/campaigns/another-bug-hunt/scenarios/1-distress-signals/npcs/example-survivor";

describe("canRevealFact", () => {
  it("returns false when fact already revealed", () => {
    const result = canRevealFact(
      exampleSurvivorProfile,
      "power_sequence",
      { fear: 0.5, stress: 0.5, affability: 0.6 },
      ["power_sequence"]
    );
    expect(result).toBe(false);
  });

  it("returns false when NPC does not know fact", () => {
    const result = canRevealFact(
      exampleSurvivorProfile,
      "unknown_fact",
      { fear: 0.5, stress: 0.5, affability: 0.9 },
      []
    );
    expect(result).toBe(false);
  });

  it("returns true when affability meets threshold for minor fact", () => {
    const result = canRevealFact(
      exampleSurvivorProfile,
      "power_sequence",
      { fear: 0.5, stress: 0.5, affability: 0.5 },
      []
    );
    expect(result).toBe(true);
  });

  it("returns false when affability below shareMinor threshold", () => {
    const result = canRevealFact(
      exampleSurvivorProfile,
      "power_sequence",
      { fear: 0.5, stress: 0.5, affability: 0.2 },
      []
    );
    expect(result).toBe(false);
  });

  it("gates major facts by shareMajor threshold", () => {
    const resultLow = canRevealFact(
      exampleSurvivorProfile,
      "carcinid_garage",
      { fear: 0.5, stress: 0.5, affability: 0.4 },
      []
    );
    const resultHigh = canRevealFact(
      exampleSurvivorProfile,
      "carcinid_garage",
      { fear: 0.5, stress: 0.5, affability: 0.7 },
      []
    );
    expect(resultLow).toBe(false);
    expect(resultHigh).toBe(true);
  });
});
