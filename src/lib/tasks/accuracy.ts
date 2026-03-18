import type { Scenario } from "./scenarios";

export interface AccuracyConfig {
  targetAccuracy: number; // 0-1, e.g. 0.75 = AI is correct 75% of the time
  totalTrials: number;
}

/**
 * Generates a deterministic accuracy schedule for a set of trials.
 * Given N trials at X% accuracy, it pre-determines exactly which trials
 * the AI will be correct on, then shuffles the order.
 *
 * This ensures the AI is correct exactly `floor(totalTrials * targetAccuracy)`
 * times rather than relying on random chance per trial.
 */
export function generateAccuracySchedule(
  config: AccuracyConfig
): boolean[] {
  const correctCount = Math.round(config.totalTrials * config.targetAccuracy);
  const incorrectCount = config.totalTrials - correctCount;

  const schedule: boolean[] = [
    ...Array(correctCount).fill(true),
    ...Array(incorrectCount).fill(false),
  ];

  return shuffleArray(schedule);
}

/**
 * Fisher-Yates shuffle for uniform randomness.
 */
function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Determines the AI's recommendation for a given scenario and whether
 * the AI should be correct on this trial.
 */
export function getAIRecommendation(
  scenario: Scenario,
  aiShouldBeCorrect: boolean
): { recommendation: "approve" | "reject"; isCorrect: boolean } {
  if (aiShouldBeCorrect) {
    return {
      recommendation: scenario.correctAnswer,
      isCorrect: true,
    };
  }

  const incorrectAnswer =
    scenario.correctAnswer === "approve" ? "reject" : "approve";
  return {
    recommendation: incorrectAnswer,
    isCorrect: false,
  };
}

/**
 * Selects and shuffles scenarios for a participant's session.
 * Excludes practice scenarios from the main trial pool.
 */
export function selectTrialScenarios(
  allScenarios: Scenario[],
  practiceIds: string[],
  mainTrialCount: number
): { practice: Scenario[]; main: Scenario[] } {
  const practiceScenarios = practiceIds
    .map((id) => allScenarios.find((s) => s.id === id))
    .filter((s): s is Scenario => s !== undefined);

  const mainPool = allScenarios.filter((s) => !practiceIds.includes(s.id));
  const shuffledPool = shuffleArray(mainPool);
  const mainScenarios = shuffledPool.slice(0, mainTrialCount);

  return { practice: practiceScenarios, main: mainScenarios };
}
