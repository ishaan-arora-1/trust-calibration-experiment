import type { AgentTone, ConfidenceFraming } from "./types";

const FORMAL_TEMPLATES = {
  recommend_approve: [
    "Based on the available data, the recommendation is to approve this application.",
    "The analysis indicates this application meets the criteria for approval.",
    "After evaluating the provided indicators, approval is recommended.",
  ],
  recommend_reject: [
    "Based on the available data, the recommendation is to reject this application.",
    "The analysis indicates this application does not meet the criteria for approval.",
    "After evaluating the provided indicators, rejection is recommended.",
  ],
};

const CONVERSATIONAL_TEMPLATES = {
  recommend_approve: [
    "I think this one looks good — I'd say approve it.",
    "Looking at the numbers, I feel pretty good about this one. I'd approve.",
    "This seems solid to me. I'd go ahead and approve it.",
  ],
  recommend_reject: [
    "Hmm, I'm not feeling great about this one. I'd lean toward rejecting it.",
    "Looking at the details, I don't think this one makes the cut. I'd reject.",
    "I've got some concerns here. I'd say reject this one.",
  ],
};

const CALIBRATED_CONFIDENCE: Record<string, string[]> = {
  high: [
    "Estimated probability of correct classification: 85%.",
    "Model confidence: 0.85.",
    "Based on similar cases, accuracy is approximately 85%.",
  ],
  medium: [
    "Estimated probability of correct classification: 72%.",
    "Model confidence: 0.72.",
    "Based on similar cases, accuracy is approximately 72%.",
  ],
  low: [
    "Estimated probability of correct classification: 58%.",
    "Model confidence: 0.58.",
    "Based on similar cases, accuracy is approximately 58%.",
  ],
};

const OVERSTATED_CONFIDENCE: Record<string, string[]> = {
  high: [
    "I'm very confident about this one.",
    "I'm quite sure about this recommendation.",
    "This is a clear case — I'm highly confident.",
  ],
  medium: [
    "I'm fairly confident this is the right call.",
    "I feel good about this recommendation.",
    "I'm pretty sure about this one.",
  ],
  low: [
    "I still think this is the right call.",
    "I believe this recommendation is sound.",
    "I'm confident enough in this assessment.",
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getRecommendationText(
  tone: AgentTone,
  decision: "approve" | "reject"
): string {
  const key = `recommend_${decision}` as const;
  const templates =
    tone === "formal" ? FORMAL_TEMPLATES[key] : CONVERSATIONAL_TEMPLATES[key];
  return pickRandom(templates);
}

export function getConfidenceText(
  framing: ConfidenceFraming,
  level: "high" | "medium" | "low" = "medium"
): string {
  const templates =
    framing === "calibrated"
      ? CALIBRATED_CONFIDENCE[level]
      : OVERSTATED_CONFIDENCE[level];
  return pickRandom(templates);
}

export function buildRecommendationMessage(
  greeting: string,
  tone: AgentTone,
  confidenceFraming: ConfidenceFraming,
  decision: "approve" | "reject",
  confidenceLevel: "high" | "medium" | "low" = "medium"
) {
  const recommendation = getRecommendationText(tone, decision);
  const confidence = getConfidenceText(confidenceFraming, confidenceLevel);

  const parts = [greeting, recommendation, confidence].filter(Boolean);

  return {
    greeting,
    recommendation,
    confidence,
    fullMessage: parts.join(" "),
  };
}
