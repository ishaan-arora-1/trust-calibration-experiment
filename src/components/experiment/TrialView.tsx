"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useTimer } from "@/hooks/useTimer";
import type { TrialSetup } from "@/lib/tasks/runner";
import type { CueConfig } from "@/lib/engine/types";

interface TrialViewProps {
  trial: TrialSetup;
  cueConfig: CueConfig;
  currentIndex: number;
  totalTrials: number;
  isPracticePhase: boolean;
  onComplete: (result: TrialResult) => void;
  onInteractionEvent?: (eventType: string, payload: Record<string, unknown>) => void;
}

export interface TrialResult {
  trialNumber: number;
  scenarioId: string;
  isPractice: boolean;
  aiRecommendation: string;
  aiIsCorrect: boolean;
  correctAnswer: string;
  participantDecision: "accept" | "override";
  participantOverride?: "approve" | "reject";
  confidenceRating?: number;
  decisionLatencyMs: number;
  totalTrialDurationMs: number;
  scenarioData: Record<string, unknown>;
  aiConfidenceDisplay: string;
  interactionLog: InteractionEntry[];
}

interface InteractionEntry {
  action: string;
  timestampMs: number;
  detail?: string;
}

type TrialPhase = "scenario" | "decision_made" | "confidence";

const AVATAR_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  system: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-300", label: "AI" },
  human: { bg: "bg-blue-100 dark:bg-blue-900", text: "text-blue-700 dark:text-blue-300", label: "" },
  expert: { bg: "bg-purple-100 dark:bg-purple-900", text: "text-purple-700 dark:text-purple-300", label: "" },
};

export function TrialView({
  trial,
  cueConfig,
  currentIndex,
  totalTrials,
  isPracticePhase,
  onComplete,
  onInteractionEvent,
}: TrialViewProps) {
  const [phase, setPhase] = useState<TrialPhase>("scenario");
  const [decision, setDecision] = useState<"accept" | "override" | null>(null);
  const [overrideChoice, setOverrideChoice] = useState<"approve" | "reject" | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const interactionLog = useRef<InteractionEntry[]>([]);
  const hoverStart = useRef<number | null>(null);

  const decisionTimer = useTimer();
  const trialTimer = useTimer();

  useEffect(() => {
    decisionTimer.start();
    trialTimer.start();
    setPhase("scenario");
    setDecision(null);
    setOverrideChoice(null);
    setConfidence(null);
    interactionLog.current = [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trial.trialNumber]);

  const logInteraction = useCallback(
    (action: string, detail?: string) => {
      const entry: InteractionEntry = {
        action,
        timestampMs: trialTimer.elapsed(),
        detail,
      };
      interactionLog.current.push(entry);
      onInteractionEvent?.(action, {
        trialNumber: trial.trialNumber,
        detail,
        timestampMs: entry.timestampMs,
      });
    },
    [trial.trialNumber, trialTimer, onInteractionEvent]
  );

  const handleButtonHoverStart = useCallback(
    (button: string) => {
      hoverStart.current = trialTimer.elapsed();
      logInteraction("decision_hover_start", button);
    },
    [logInteraction, trialTimer]
  );

  const handleButtonHoverEnd = useCallback(
    (button: string) => {
      if (hoverStart.current !== null) {
        const durationMs = trialTimer.elapsed() - hoverStart.current;
        logInteraction("decision_hover_end", `${button}:${durationMs}ms`);
        hoverStart.current = null;
      }
    },
    [logInteraction, trialTimer]
  );

  const handleAccept = useCallback(() => {
    if (decision === "override") {
      logInteraction("decision_revision", "override->accept");
    }
    setDecision("accept");
    setOverrideChoice(null);
    logInteraction("decision_accept");
    setPhase("confidence");
  }, [decision, logInteraction]);

  const handleOverride = useCallback(() => {
    if (decision === "accept") {
      logInteraction("decision_revision", "accept->override");
    }
    setDecision("override");
    logInteraction("decision_override_start");
  }, [decision, logInteraction]);

  const handleOverrideChoice = useCallback(
    (choice: "approve" | "reject") => {
      setOverrideChoice(choice);
      logInteraction("override_choice", choice);
      setPhase("confidence");
    },
    [logInteraction]
  );

  const handleSubmit = useCallback(() => {
    if (!decision) return;

    logInteraction("trial_submit");

    const result: TrialResult = {
      trialNumber: trial.trialNumber,
      scenarioId: trial.scenario.id,
      isPractice: trial.isPractice,
      aiRecommendation: trial.aiRecommendation,
      aiIsCorrect: trial.aiIsCorrect,
      correctAnswer: trial.scenario.correctAnswer,
      participantDecision: decision,
      participantOverride: overrideChoice ?? undefined,
      confidenceRating: confidence ?? undefined,
      decisionLatencyMs: decisionTimer.elapsed(),
      totalTrialDurationMs: trialTimer.elapsed(),
      scenarioData: trial.scenario as unknown as Record<string, unknown>,
      aiConfidenceDisplay: trial.aiMessage.confidence,
      interactionLog: [...interactionLog.current],
    };

    onComplete(result);
  }, [decision, overrideChoice, confidence, trial, decisionTimer, trialTimer, onComplete, logInteraction]);

  const progressPercent = ((currentIndex + 1) / totalTrials) * 100;
  const scenario = trial.scenario;
  const avatarStyle = AVATAR_STYLES[cueConfig.agentAvatar] || AVATAR_STYLES.system;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="space-y-1">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            {isPracticePhase ? (
              <Badge variant="secondary">Practice</Badge>
            ) : (
              `Trial ${currentIndex + 1} of ${totalTrials}`
            )}
          </span>
          <span>{Math.round(progressPercent)}% complete</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{scenario.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {scenario.applicantProfile}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-0.5">
                  <p className="text-muted-foreground">Annual Income</p>
                  <p className="font-medium">{scenario.financialSummary.annualIncome}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-muted-foreground">Credit Score</p>
                  <p className="font-medium">{scenario.financialSummary.creditScore}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-muted-foreground">Debt-to-Income</p>
                  <p className="font-medium">{scenario.financialSummary.debtToIncomeRatio}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-muted-foreground">Employment</p>
                  <p className="font-medium">{scenario.financialSummary.employmentLength}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-muted-foreground">Loan Amount</p>
                  <p className="font-medium">{scenario.financialSummary.loanAmount}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-muted-foreground">Purpose</p>
                  <p className="font-medium">{scenario.financialSummary.loanPurpose}</p>
                </div>
              </div>

              {scenario.additionalNotes && (
                <>
                  <Separator />
                  <div className="text-sm">
                    <p className="text-muted-foreground mb-1">Additional Notes</p>
                    <p>{scenario.additionalNotes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div
                  className={`h-8 w-8 rounded-full ${avatarStyle.bg} flex items-center justify-center text-sm font-bold ${avatarStyle.text}`}
                >
                  {avatarStyle.label || cueConfig.agentName.charAt(0)}
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">
                    {cueConfig.agentName}
                  </CardTitle>
                  {cueConfig.roleSource && cueConfig.roleSource !== "unspecified" && (
                    <p className="text-xs text-muted-foreground">
                      {cueConfig.roleSource === "algorithm"
                        ? "Algorithmic Analysis"
                        : "Expert-Trained Model"}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">
                {trial.aiMessage.fullMessage}
              </p>
              <div className="mt-3">
                <Badge
                  variant={
                    trial.aiRecommendation === "approve"
                      ? "default"
                      : "destructive"
                  }
                >
                  Recommends:{" "}
                  {trial.aiRecommendation === "approve" ? "Approve" : "Reject"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-3">
              {phase === "scenario" && (
                <>
                  <p className="text-sm font-medium text-center mb-3">
                    What is your decision?
                  </p>
                  <Button
                    onClick={handleAccept}
                    onMouseEnter={() => handleButtonHoverStart("accept")}
                    onMouseLeave={() => handleButtonHoverEnd("accept")}
                    className="w-full"
                    size="lg"
                    variant="default"
                  >
                    Accept AI Recommendation
                  </Button>
                  <Button
                    onClick={handleOverride}
                    onMouseEnter={() => handleButtonHoverStart("override")}
                    onMouseLeave={() => handleButtonHoverEnd("override")}
                    className="w-full"
                    size="lg"
                    variant="outline"
                  >
                    Override — I Disagree
                  </Button>
                </>
              )}

              {phase === "scenario" && decision === "override" && !overrideChoice && (
                <div className="pt-2 space-y-2">
                  <p className="text-sm text-center text-muted-foreground">
                    Select your decision:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleOverrideChoice("approve")}
                      onMouseEnter={() => handleButtonHoverStart("override_approve")}
                      onMouseLeave={() => handleButtonHoverEnd("override_approve")}
                      variant="outline"
                      className="border-green-300 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-950"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleOverrideChoice("reject")}
                      onMouseEnter={() => handleButtonHoverStart("override_reject")}
                      onMouseLeave={() => handleButtonHoverEnd("override_reject")}
                      variant="outline"
                      className="border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              )}

              {phase === "confidence" && (
                <div className="space-y-3">
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium">
                      Decision recorded:{" "}
                      <Badge variant="secondary">
                        {decision === "accept"
                          ? `Accepted (${trial.aiRecommendation})`
                          : `Override (${overrideChoice})`}
                      </Badge>
                    </p>
                    {phase === "confidence" && decision && (
                      <button
                        onClick={() => {
                          logInteraction("decision_change_requested");
                          setPhase("scenario");
                        }}
                        className="text-xs text-muted-foreground underline hover:text-foreground transition-colors"
                      >
                        Change my decision
                      </button>
                    )}
                  </div>

                  <Separator />

                  <p className="text-sm text-center text-muted-foreground">
                    How confident are you in this decision? (optional)
                  </p>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        onClick={() => {
                          setConfidence(val);
                          logInteraction("confidence_selected", String(val));
                        }}
                        className={`w-10 h-10 rounded-full text-sm font-medium border transition-all ${
                          confidence === val
                            ? "bg-primary text-primary-foreground border-primary scale-110"
                            : "border-input hover:bg-accent"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground px-1">
                    <span>Not confident</span>
                    <span>Very confident</span>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    className="w-full"
                    size="lg"
                  >
                    {isPracticePhase ? "Next Practice Trial" : "Next Trial"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
