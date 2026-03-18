import {
  SCENARIOS,
  PRACTICE_SCENARIO_IDS,
  MAIN_TRIAL_COUNT,
  PRACTICE_TRIAL_COUNT,
} from "./scenarios";
import type { Scenario } from "./scenarios";
import {
  generateAccuracySchedule,
  getAIRecommendation,
  selectTrialScenarios,
} from "./accuracy";
import type { CueConfig } from "@/lib/engine/types";
import { buildRecommendationMessage } from "@/lib/engine/cues";

export interface TrialSetup {
  trialNumber: number;
  isPractice: boolean;
  scenario: Scenario;
  aiRecommendation: "approve" | "reject";
  aiIsCorrect: boolean;
  aiMessage: {
    greeting: string;
    recommendation: string;
    confidence: string;
    fullMessage: string;
  };
}

export interface ExperimentSession {
  trials: TrialSetup[];
  totalTrials: number;
  practiceTrialCount: number;
  mainTrialCount: number;
}

/**
 * Generates a complete experiment session for a participant, including
 * practice and main trials with pre-determined AI accuracy.
 */
export function generateExperimentSession(
  cueConfig: CueConfig,
  targetAccuracy: number = 0.75
): ExperimentSession {
  const { practice, main } = selectTrialScenarios(
    SCENARIOS,
    PRACTICE_SCENARIO_IDS,
    MAIN_TRIAL_COUNT
  );

  const mainAccuracySchedule = generateAccuracySchedule({
    targetAccuracy,
    totalTrials: main.length,
  });

  const trials: TrialSetup[] = [];

  practice.forEach((scenario, idx) => {
    const ai = getAIRecommendation(scenario, true);
    const confidenceLevel = ai.isCorrect ? "high" : "low";
    const aiMessage = buildRecommendationMessage(
      cueConfig.agentGreeting,
      cueConfig.agentTone as "formal" | "conversational",
      cueConfig.confidenceFraming as "calibrated" | "overstated",
      ai.recommendation,
      confidenceLevel
    );

    trials.push({
      trialNumber: idx + 1,
      isPractice: true,
      scenario,
      aiRecommendation: ai.recommendation,
      aiIsCorrect: ai.isCorrect,
      aiMessage,
    });
  });

  main.forEach((scenario, idx) => {
    const aiShouldBeCorrect = mainAccuracySchedule[idx];
    const ai = getAIRecommendation(scenario, aiShouldBeCorrect);
    const confidenceLevel = ai.isCorrect ? "high" : "medium";
    const aiMessage = buildRecommendationMessage(
      cueConfig.agentGreeting,
      cueConfig.agentTone as "formal" | "conversational",
      cueConfig.confidenceFraming as "calibrated" | "overstated",
      ai.recommendation,
      confidenceLevel
    );

    trials.push({
      trialNumber: PRACTICE_TRIAL_COUNT + idx + 1,
      isPractice: false,
      scenario,
      aiRecommendation: ai.recommendation,
      aiIsCorrect: ai.isCorrect,
      aiMessage,
    });
  });

  return {
    trials,
    totalTrials: trials.length,
    practiceTrialCount: practice.length,
    mainTrialCount: main.length,
  };
}
