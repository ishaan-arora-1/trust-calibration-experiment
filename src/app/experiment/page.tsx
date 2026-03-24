"use client";

import { useExperiment } from "@/hooks/useExperiment";
import { ConsentForm } from "@/components/experiment/ConsentForm";
import { DemographicsForm } from "@/components/experiment/DemographicsForm";
import { Instructions } from "@/components/experiment/Instructions";
import { TrialView } from "@/components/experiment/TrialView";
import type { TrialResult } from "@/components/experiment/TrialView";
import { Debrief } from "@/components/experiment/Debrief";
import { useState, useCallback } from "react";

export default function ExperimentPage() {
  const experiment = useExperiment();
  const [loading, setLoading] = useState(false);

  const handleInteractionEvent = useCallback(
    (eventType: string, payload: Record<string, unknown>) => {
      experiment.logEvent(eventType, payload);
    },
    [experiment]
  );

  const handleConsent = () => {
    experiment.setPhase("demographics");
  };

  const handleDemographics = async (demographics: Record<string, string>) => {
    setLoading(true);
    try {
      await experiment.initializeParticipant(demographics);
      await experiment.logEvent("experiment_started");
    } catch (err) {
      console.error("Failed to initialize:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInstructionsContinue = () => {
    experiment.setPhase("practice");
    experiment.logEvent("instructions_completed");
  };

  const handleTrialComplete = async (result: TrialResult) => {
    await experiment.recordTrial({
      trialNumber: result.trialNumber,
      scenarioId: result.scenarioId,
      isPractice: result.isPractice,
      scenarioData: result.scenarioData,
      aiRecommendation: result.aiRecommendation,
      aiConfidenceDisplay: result.aiConfidenceDisplay,
      aiIsCorrect: result.aiIsCorrect,
      correctAnswer: result.correctAnswer,
      participantDecision: result.participantDecision,
      participantOverride: result.participantOverride,
      confidenceRating: result.confidenceRating,
      decisionLatencyMs: result.decisionLatencyMs,
      totalTrialDurationMs: result.totalTrialDurationMs,
    });

    await experiment.logEvent("trial_completed", {
      trialNumber: result.trialNumber,
      decision: result.participantDecision,
      latencyMs: result.decisionLatencyMs,
      interactionCount: result.interactionLog.length,
      hadRevision: result.interactionLog.some(
        (e) => e.action === "decision_revision" || e.action === "decision_change_requested"
      ),
    });

    if (result.interactionLog.length > 0) {
      await experiment.logEvent("trial_interactions", {
        trialNumber: result.trialNumber,
        interactions: result.interactionLog,
      });
    }

    experiment.advanceTrial();
  };

  const handleSurveyComplete = async (
    responses: { scaleName: string; itemIndex: number; itemText: string; response: number }[]
  ) => {
    if (experiment.participantId) {
      await fetch("/api/events/trust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId: experiment.participantId,
          responses,
        }),
      });
    }

    await experiment.updateParticipant({ status: "completed" });
    await experiment.logEvent("experiment_completed");
    experiment.setPhase("debrief");
  };

  // Dynamically import TrustSurvey only when needed to avoid circular issues
  const renderSurvey = () => {
    const TrustSurvey = require("@/components/survey/TrustSurvey").TrustSurvey;
    return <TrustSurvey onComplete={handleSurveyComplete} />;
  };

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-xl font-semibold tracking-tight">
            Decision Making Study
          </h1>
          {experiment.participantId && (
            <p className="text-xs text-muted-foreground mt-1">
              Session: {experiment.externalId}
            </p>
          )}
        </header>

        {/* Phase rendering */}
        {experiment.phase === "loading" && (
          <div className="text-center py-20">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Setting up your session...</p>
          </div>
        )}

        {experiment.phase === "consent" && (
          <ConsentForm onConsent={handleConsent} />
        )}

        {experiment.phase === "demographics" && (
          <DemographicsForm onSubmit={handleDemographics} loading={loading} />
        )}

        {experiment.phase === "instructions" && experiment.cueConfig && (
          <Instructions
            agentName={experiment.cueConfig.agentName}
            onContinue={handleInstructionsContinue}
          />
        )}

        {(experiment.phase === "practice" || experiment.phase === "experiment") &&
          experiment.currentTrial &&
          experiment.cueConfig &&
          experiment.session && (
            <TrialView
              key={experiment.currentTrial.trialNumber}
              trial={experiment.currentTrial}
              cueConfig={experiment.cueConfig}
              currentIndex={experiment.currentTrialIndex}
              totalTrials={experiment.session.totalTrials}
              isPracticePhase={experiment.phase === "practice"}
              onComplete={handleTrialComplete}
              onInteractionEvent={handleInteractionEvent}
            />
          )}

        {experiment.phase === "survey" && renderSurvey()}

        {experiment.phase === "debrief" && experiment.externalId && (
          <Debrief externalId={experiment.externalId} />
        )}
      </div>
    </main>
  );
}
