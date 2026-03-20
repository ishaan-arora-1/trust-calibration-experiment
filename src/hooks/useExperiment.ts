"use client";

import { useState, useCallback } from "react";
import type { CueConfig } from "@/lib/engine/types";
import type { ExperimentSession, TrialSetup } from "@/lib/tasks/runner";

export type ExperimentPhase =
  | "loading"
  | "consent"
  | "demographics"
  | "instructions"
  | "practice"
  | "experiment"
  | "survey"
  | "debrief";

interface ExperimentState {
  phase: ExperimentPhase;
  participantId: string | null;
  externalId: string | null;
  conditionName: string | null;
  cueConfig: CueConfig | null;
  session: ExperimentSession | null;
  currentTrialIndex: number;
}

export function useExperiment() {
  const [state, setState] = useState<ExperimentState>({
    phase: "consent",
    participantId: null,
    externalId: null,
    conditionName: null,
    cueConfig: null,
    session: null,
    currentTrialIndex: 0,
  });

  const initializeParticipant = useCallback(async (demographics?: Record<string, string>) => {
    setState((s) => ({ ...s, phase: "loading" }));

    const res = await fetch("/api/participants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ demographics }),
    });

    if (!res.ok) throw new Error("Failed to create participant");
    const data = await res.json();

    setState((s) => ({
      ...s,
      participantId: data.participantId,
      externalId: data.externalId,
      conditionName: data.conditionName,
      cueConfig: data.cueConfig,
      session: data.session,
      phase: "instructions",
    }));

    return data;
  }, []);

  const setPhase = useCallback((phase: ExperimentPhase) => {
    setState((s) => ({ ...s, phase }));
  }, []);

  const advanceTrial = useCallback(() => {
    setState((s) => {
      const nextIndex = s.currentTrialIndex + 1;
      const totalTrials = s.session?.trials.length ?? 0;

      if (nextIndex >= totalTrials) {
        return { ...s, currentTrialIndex: nextIndex, phase: "survey" };
      }

      const nextTrial = s.session?.trials[nextIndex];
      const wasInPractice = s.session?.trials[s.currentTrialIndex]?.isPractice;
      const nextIsPractice = nextTrial?.isPractice;

      if (wasInPractice && !nextIsPractice) {
        return { ...s, currentTrialIndex: nextIndex, phase: "experiment" };
      }

      return { ...s, currentTrialIndex: nextIndex };
    });
  }, []);

  const currentTrial: TrialSetup | null =
    state.session?.trials[state.currentTrialIndex] ?? null;

  const logEvent = useCallback(
    async (eventType: string, payload: Record<string, unknown> = {}) => {
      if (!state.participantId) return;
      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId: state.participantId,
          eventType,
          payload,
        }),
      });
    },
    [state.participantId]
  );

  const updateParticipant = useCallback(
    async (data: Record<string, unknown>) => {
      if (!state.participantId) return;
      await fetch(`/api/participants/${state.participantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    [state.participantId]
  );

  const recordTrial = useCallback(
    async (trialData: Record<string, unknown>) => {
      if (!state.participantId) return;
      await fetch("/api/events/trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId: state.participantId,
          ...trialData,
        }),
      });
    },
    [state.participantId]
  );

  return {
    ...state,
    currentTrial,
    initializeParticipant,
    setPhase,
    advanceTrial,
    logEvent,
    updateParticipant,
    recordTrial,
  };
}
