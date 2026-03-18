import { describe, it, expect } from "vitest";
import {
  SCENARIOS,
  PRACTICE_SCENARIO_IDS,
  MAIN_TRIAL_COUNT,
  generateAccuracySchedule,
  getAIRecommendation,
  selectTrialScenarios,
  generateExperimentSession,
} from "@/lib/tasks";
import type { CueConfig } from "@/lib/engine";

describe("scenarios", () => {
  it("has at least 20 scenarios", () => {
    expect(SCENARIOS.length).toBeGreaterThanOrEqual(20);
  });

  it("all scenarios have unique IDs", () => {
    const ids = SCENARIOS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("each scenario has a correct answer of approve or reject", () => {
    for (const s of SCENARIOS) {
      expect(["approve", "reject"]).toContain(s.correctAnswer);
    }
  });

  it("has a mix of approve and reject correct answers", () => {
    const approvals = SCENARIOS.filter((s) => s.correctAnswer === "approve");
    const rejections = SCENARIOS.filter((s) => s.correctAnswer === "reject");
    expect(approvals.length).toBeGreaterThan(5);
    expect(rejections.length).toBeGreaterThan(5);
  });

  it("practice scenarios exist in the scenario pool", () => {
    for (const id of PRACTICE_SCENARIO_IDS) {
      expect(SCENARIOS.find((s) => s.id === id)).toBeDefined();
    }
  });
});

describe("generateAccuracySchedule", () => {
  it("produces the correct number of trials", () => {
    const schedule = generateAccuracySchedule({
      targetAccuracy: 0.75,
      totalTrials: 20,
    });
    expect(schedule.length).toBe(20);
  });

  it("has the right number of correct trials", () => {
    const schedule = generateAccuracySchedule({
      targetAccuracy: 0.75,
      totalTrials: 20,
    });
    const correctCount = schedule.filter(Boolean).length;
    expect(correctCount).toBe(15);
  });

  it("shuffles the order (not all trues first)", () => {
    let foundDifferent = false;
    for (let i = 0; i < 10; i++) {
      const schedule = generateAccuracySchedule({
        targetAccuracy: 0.5,
        totalTrials: 10,
      });
      const firstHalf = schedule.slice(0, 5);
      const allTrue = firstHalf.every(Boolean);
      const allFalse = firstHalf.every((v) => !v);
      if (!allTrue && !allFalse) {
        foundDifferent = true;
        break;
      }
    }
    expect(foundDifferent).toBe(true);
  });

  it("handles 100% accuracy", () => {
    const schedule = generateAccuracySchedule({
      targetAccuracy: 1.0,
      totalTrials: 10,
    });
    expect(schedule.every(Boolean)).toBe(true);
  });

  it("handles 0% accuracy", () => {
    const schedule = generateAccuracySchedule({
      targetAccuracy: 0,
      totalTrials: 10,
    });
    expect(schedule.every((v) => !v)).toBe(true);
  });
});

describe("getAIRecommendation", () => {
  const approveScenario = SCENARIOS.find((s) => s.correctAnswer === "approve")!;
  const rejectScenario = SCENARIOS.find((s) => s.correctAnswer === "reject")!;

  it("returns the correct answer when AI should be correct", () => {
    const result = getAIRecommendation(approveScenario, true);
    expect(result.recommendation).toBe("approve");
    expect(result.isCorrect).toBe(true);
  });

  it("returns the opposite when AI should be incorrect", () => {
    const result = getAIRecommendation(approveScenario, false);
    expect(result.recommendation).toBe("reject");
    expect(result.isCorrect).toBe(false);
  });

  it("works for reject scenarios too", () => {
    expect(getAIRecommendation(rejectScenario, true).recommendation).toBe("reject");
    expect(getAIRecommendation(rejectScenario, false).recommendation).toBe("approve");
  });
});

describe("selectTrialScenarios", () => {
  it("separates practice and main scenarios", () => {
    const { practice, main } = selectTrialScenarios(
      SCENARIOS,
      PRACTICE_SCENARIO_IDS,
      MAIN_TRIAL_COUNT
    );

    expect(practice.length).toBe(PRACTICE_SCENARIO_IDS.length);
    expect(main.length).toBe(MAIN_TRIAL_COUNT);

    const mainIds = main.map((s) => s.id);
    for (const id of PRACTICE_SCENARIO_IDS) {
      expect(mainIds).not.toContain(id);
    }
  });

  it("shuffles main scenarios", () => {
    const orders = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const { main } = selectTrialScenarios(
        SCENARIOS,
        PRACTICE_SCENARIO_IDS,
        MAIN_TRIAL_COUNT
      );
      orders.add(main.map((s) => s.id).join(","));
    }
    expect(orders.size).toBeGreaterThan(1);
  });
});

describe("generateExperimentSession", () => {
  const testCueConfig: CueConfig = {
    agentName: "Test Agent",
    agentTone: "formal",
    confidenceFraming: "calibrated",
    agentGreeting: "Analysis complete.",
    agentAvatar: "system",
  };

  it("generates a complete session", () => {
    const session = generateExperimentSession(testCueConfig);
    expect(session.totalTrials).toBe(
      session.practiceTrialCount + session.mainTrialCount
    );
    expect(session.practiceTrialCount).toBe(2);
    expect(session.mainTrialCount).toBe(15);
  });

  it("marks practice and main trials correctly", () => {
    const session = generateExperimentSession(testCueConfig);
    const practice = session.trials.filter((t) => t.isPractice);
    const main = session.trials.filter((t) => !t.isPractice);
    expect(practice.length).toBe(2);
    expect(main.length).toBe(15);
  });

  it("AI accuracy is approximately 75% for main trials", () => {
    const session = generateExperimentSession(testCueConfig, 0.75);
    const main = session.trials.filter((t) => !t.isPractice);
    const correctCount = main.filter((t) => t.aiIsCorrect).length;
    expect(correctCount).toBe(Math.round(15 * 0.75));
  });

  it("trial numbers are sequential", () => {
    const session = generateExperimentSession(testCueConfig);
    for (let i = 0; i < session.trials.length; i++) {
      expect(session.trials[i].trialNumber).toBe(i + 1);
    }
  });

  it("each trial has an AI message", () => {
    const session = generateExperimentSession(testCueConfig);
    for (const trial of session.trials) {
      expect(trial.aiMessage.fullMessage).toBeTruthy();
      expect(trial.aiMessage.recommendation).toBeTruthy();
    }
  });
});
