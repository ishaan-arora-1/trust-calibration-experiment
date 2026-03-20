"use client";

import { useState, useEffect, useCallback } from "react";
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
}

type TrialPhase = "scenario" | "decision_made" | "confidence";

export function TrialView({
  trial,
  cueConfig,
  currentIndex,
  totalTrials,
  isPracticePhase,
  onComplete,
}: TrialViewProps) {
  const [phase, setPhase] = useState<TrialPhase>("scenario");
  const [decision, setDecision] = useState<"accept" | "override" | null>(null);
  const [overrideChoice, setOverrideChoice] = useState<"approve" | "reject" | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);

  const decisionTimer = useTimer();
  const trialTimer = useTimer();

  useEffect(() => {
    decisionTimer.start();
    trialTimer.start();
    setPhase("scenario");
    setDecision(null);
    setOverrideChoice(null);
    setConfidence(null);
  }, [trial.trialNumber, decisionTimer, trialTimer]);

  const handleAccept = useCallback(() => {
    setDecision("accept");
    setPhase("confidence");
  }, []);

  const handleOverride = useCallback(() => {
    setDecision("override");
  }, []);

  const handleOverrideChoice = useCallback((choice: "approve" | "reject") => {
    setOverrideChoice(choice);
    setPhase("confidence");
  }, []);

  const handleSubmit = useCallback(() => {
    if (!decision) return;

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
    };

    onComplete(result);
  }, [decision, overrideChoice, confidence, trial, decisionTimer, trialTimer, onComplete]);

  const progressPercent = ((currentIndex + 1) / totalTrials) * 100;
  const scenario = trial.scenario;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Progress bar */}
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
        {/* Scenario Card (left / top) */}
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

        {/* AI Recommendation + Decision Panel (right / bottom) */}
        <div className="lg:col-span-2 space-y-4">
          {/* AI Recommendation */}
          <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-bold text-blue-700 dark:text-blue-300">
                  {cueConfig.agentAvatar === "system"
                    ? "AI"
                    : cueConfig.agentName.charAt(0)}
                </div>
                <CardTitle className="text-sm font-semibold">
                  {cueConfig.agentName}
                </CardTitle>
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

          {/* Decision Buttons */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              {phase === "scenario" && (
                <>
                  <p className="text-sm font-medium text-center mb-3">
                    What is your decision?
                  </p>
                  <Button
                    onClick={handleAccept}
                    className="w-full"
                    size="lg"
                    variant="default"
                  >
                    Accept AI Recommendation
                  </Button>
                  <Button
                    onClick={handleOverride}
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
                      variant="outline"
                      className="border-green-300 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-950"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleOverrideChoice("reject")}
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
                  </div>

                  <Separator />

                  <p className="text-sm text-center text-muted-foreground">
                    How confident are you in this decision? (optional)
                  </p>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        onClick={() => setConfidence(val)}
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
