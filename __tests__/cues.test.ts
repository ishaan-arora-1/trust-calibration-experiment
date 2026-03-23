import { describe, it, expect } from "vitest";
import { buildRecommendationMessage } from "@/lib/engine/cues";

describe("buildRecommendationMessage with different condition configs", () => {
  it("control condition produces formal, calibrated messages", () => {
    const msg = buildRecommendationMessage(
      "Analysis complete.",
      "formal",
      "calibrated",
      "approve",
      "medium"
    );

    expect(msg.fullMessage).toContain("Analysis complete.");
    expect(msg.confidence).toMatch(/\d+%|0\.\d+/);
    expect(msg.recommendation).not.toMatch(/^I /);
  });

  it("humanlike condition produces conversational, overstated messages", () => {
    const msg = buildRecommendationMessage(
      "Hey! I took a look at this one.",
      "conversational",
      "overstated",
      "reject",
      "medium"
    );

    expect(msg.fullMessage).toContain("Hey!");
    expect(msg.confidence).not.toMatch(/\d+%/);
  });

  it("authority condition produces formal, overstated messages", () => {
    const msg = buildRecommendationMessage(
      "Based on my analysis of the data:",
      "formal",
      "overstated",
      "approve",
      "high"
    );

    expect(msg.fullMessage).toContain("Based on my analysis");
    expect(msg.confidence).not.toMatch(/\d+%/);
  });

  it("messages differ across repeated calls (randomized templates)", () => {
    const messages = new Set<string>();
    for (let i = 0; i < 30; i++) {
      const msg = buildRecommendationMessage(
        "",
        "formal",
        "calibrated",
        "approve",
        "medium"
      );
      messages.add(msg.recommendation);
    }
    expect(messages.size).toBeGreaterThan(1);
  });
});
