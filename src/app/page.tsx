"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { v4 as uuidv4 } from "uuid";

/*
 * Two conditions differing in agent name + tone:
 *   A ("system")  — formal tone, generic name "AI System"
 *   B ("humanlike") — conversational tone, human name "Alex"
 */

const CONDITIONS = {
  A: {
    name: "AI System",
    tone: "formal" as const,
    recommend: (decision: string) =>
      `Based on the applicant's financial profile, the recommendation is to ${decision} this loan application. Confidence level: high.`,
  },
  B: {
    name: "Alex",
    tone: "conversational" as const,
    recommend: (decision: string) =>
      `Hey, I've looked over this application and I'd suggest we ${decision} it. I'm fairly confident about this one!`,
  },
};

const SCENARIO = {
  title: "Loan Application — Home Renovation",
  applicant: "Sarah Chen, 34, Software Engineer",
  financials: {
    "Annual Income": "$92,000",
    "Credit Score": "718",
    "Debt-to-Income": "28%",
    "Employment": "4 years",
    "Loan Amount": "$35,000",
    "Purpose": "Home renovation",
  },
  notes:
    "Applicant has a stable employment history with moderate credit. Recent credit inquiry from an auto dealer 3 months ago. No missed payments in the last 2 years.",
  aiRecommendation: "approve",
};

type Phase = "start" | "task" | "done";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("start");
  const [condition, setCondition] = useState<"A" | "B" | null>(null);
  const [logged, setLogged] = useState(false);
  const startTime = useRef<number>(0);
  const participantId = useRef<string>("");

  const beginExperiment = useCallback(() => {
    const assigned = Math.random() < 0.5 ? "A" : "B";
    setCondition(assigned as "A" | "B");
    participantId.current = uuidv4();
    startTime.current = performance.now();
    setPhase("task");
  }, []);

  const handleDecision = useCallback(
    async (decision: "accept" | "reject") => {
      if (!condition) return;
      const latencyMs = Math.round(performance.now() - startTime.current);

      const logEntry = {
        participant_id: participantId.current,
        condition: condition === "A" ? "system_formal" : "humanlike_conversational",
        decision,
        timestamp: new Date().toISOString(),
        latency_ms: latencyMs,
      };

      await fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logEntry),
      });

      setLogged(true);
      setPhase("done");
    },
    [condition]
  );

  const cond = condition ? CONDITIONS[condition] : null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      {phase === "start" && (
        <div className="max-w-lg text-center space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">
            AI Trust Experiment
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            You will review a loan application and receive a recommendation from
            an AI assistant. Decide whether to accept or reject the AI&apos;s
            recommendation.
          </p>
          <Button onClick={beginExperiment} size="lg">
            Start
          </Button>
        </div>
      )}

      {phase === "task" && cond && (
        <div className="max-w-3xl w-full space-y-4">
          <h2 className="text-xl font-semibold text-center">
            Review the application and make your decision
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Applicant profile */}
            <Card className="md:col-span-3">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{SCENARIO.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {SCENARIO.applicant}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {Object.entries(SCENARIO.financials).map(([key, val]) => (
                    <div key={key} className="space-y-0.5">
                      <p className="text-muted-foreground">{key}</p>
                      <p className="font-medium">{val}</p>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="text-sm">
                  <p className="text-muted-foreground mb-1">
                    Additional Notes
                  </p>
                  <p>{SCENARIO.notes}</p>
                </div>
              </CardContent>
            </Card>

            {/* AI recommendation + decision buttons */}
            <div className="md:col-span-2 space-y-4">
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        condition === "A"
                          ? "bg-slate-100 text-slate-600"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {condition === "A" ? "AI" : "A"}
                    </div>
                    <CardTitle className="text-sm">{cond.name}</CardTitle>
                    <Badge variant="secondary" className="text-[10px]">
                      {cond.tone}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">
                    {cond.recommend(SCENARIO.aiRecommendation)}
                  </p>
                  <div className="mt-3">
                    <Badge>Recommends: Approve</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 space-y-3">
                  <p className="text-sm font-medium text-center">
                    What is your decision?
                  </p>
                  <Button
                    onClick={() => handleDecision("accept")}
                    className="w-full"
                    size="lg"
                  >
                    Accept AI Recommendation
                  </Button>
                  <Button
                    onClick={() => handleDecision("reject")}
                    className="w-full"
                    size="lg"
                    variant="outline"
                  >
                    Reject — I Disagree
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {phase === "done" && (
        <div className="max-w-lg text-center space-y-4">
          <h2 className="text-2xl font-bold">Thank you!</h2>
          <p className="text-muted-foreground">
            Your response has been recorded.
          </p>
          {logged && (
            <p className="text-xs text-muted-foreground">
              Log saved to{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-[11px]">
                experiment_log.json
              </code>
            </p>
          )}
          <div className="pt-2 flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setPhase("start");
                setCondition(null);
                setLogged(false);
              }}
            >
              Try Again
            </Button>
            <Button
              variant="secondary"
              onClick={() => window.open("/api/log", "_blank")}
            >
              View Log (JSON)
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
