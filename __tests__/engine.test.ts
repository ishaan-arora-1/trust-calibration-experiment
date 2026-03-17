import { describe, it, expect } from "vitest";
import {
  selectBalancedCondition,
  getRecommendationText,
  getConfidenceText,
  buildRecommendationMessage,
} from "@/lib/engine";

describe("selectBalancedCondition", () => {
  it("selects the condition with fewest participants", () => {
    const conditions = [
      { id: "a", participantCount: 5 },
      { id: "b", participantCount: 2 },
      { id: "c", participantCount: 8 },
    ];

    const result = selectBalancedCondition(conditions);
    expect(result.id).toBe("b");
  });

  it("selects among tied conditions randomly", () => {
    const conditions = [
      { id: "a", participantCount: 3 },
      { id: "b", participantCount: 3 },
      { id: "c", participantCount: 3 },
    ];

    const selectedIds = new Set<string>();
    for (let i = 0; i < 100; i++) {
      selectedIds.add(selectBalancedCondition(conditions).id);
    }
    expect(selectedIds.size).toBeGreaterThan(1);
  });

  it("throws when no conditions are provided", () => {
    expect(() => selectBalancedCondition([])).toThrow("No conditions provided");
  });

  it("handles single condition", () => {
    const conditions = [{ id: "only", participantCount: 0 }];
    expect(selectBalancedCondition(conditions).id).toBe("only");
  });
});

describe("getRecommendationText", () => {
  it("returns a non-empty string for formal approve", () => {
    const text = getRecommendationText("formal", "approve");
    expect(text).toBeTruthy();
    expect(typeof text).toBe("string");
  });

  it("returns a non-empty string for conversational reject", () => {
    const text = getRecommendationText("conversational", "reject");
    expect(text).toBeTruthy();
  });

  it("formal tone does not use first-person language", () => {
    for (let i = 0; i < 20; i++) {
      const text = getRecommendationText("formal", "approve");
      expect(text).not.toMatch(/^I /);
    }
  });

  it("conversational tone uses first-person language", () => {
    const texts = new Set<string>();
    for (let i = 0; i < 50; i++) {
      texts.add(getRecommendationText("conversational", "approve"));
    }
    const hasFirstPerson = [...texts].some(
      (t) => t.includes("I ") || t.includes("I'")
    );
    expect(hasFirstPerson).toBe(true);
  });
});

describe("getConfidenceText", () => {
  it("calibrated confidence includes a percentage", () => {
    for (let i = 0; i < 20; i++) {
      const text = getConfidenceText("calibrated", "medium");
      expect(text).toMatch(/\d+%|0\.\d+/);
    }
  });

  it("overstated confidence does NOT include a percentage", () => {
    for (let i = 0; i < 20; i++) {
      const text = getConfidenceText("overstated", "medium");
      expect(text).not.toMatch(/\d+%/);
    }
  });

  it("works for all confidence levels", () => {
    for (const level of ["high", "medium", "low"] as const) {
      expect(getConfidenceText("calibrated", level)).toBeTruthy();
      expect(getConfidenceText("overstated", level)).toBeTruthy();
    }
  });
});

describe("buildRecommendationMessage", () => {
  it("combines greeting, recommendation, and confidence into fullMessage", () => {
    const msg = buildRecommendationMessage(
      "Analysis complete.",
      "formal",
      "calibrated",
      "approve",
      "medium"
    );

    expect(msg.greeting).toBe("Analysis complete.");
    expect(msg.recommendation).toBeTruthy();
    expect(msg.confidence).toBeTruthy();
    expect(msg.fullMessage).toContain("Analysis complete.");
    expect(msg.fullMessage).toContain(msg.recommendation);
    expect(msg.fullMessage).toContain(msg.confidence);
  });

  it("handles empty greeting gracefully", () => {
    const msg = buildRecommendationMessage(
      "",
      "conversational",
      "overstated",
      "reject"
    );

    expect(msg.fullMessage).not.toMatch(/^\s/);
    expect(msg.recommendation).toBeTruthy();
  });
});
