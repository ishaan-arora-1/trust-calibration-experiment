"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface InstructionsProps {
  agentName: string;
  onContinue: () => void;
}

export function Instructions({ agentName, onContinue }: InstructionsProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">How This Works</CardTitle>
          <CardDescription>
            Please read these instructions carefully before beginning
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-lg border p-4 space-y-2">
              <h3 className="font-semibold text-foreground">Your Task</h3>
              <p>
                You will review a series of <strong>loan applications</strong>.
                Each application includes an applicant profile, financial summary,
                and additional notes.
              </p>
              <p>
                Your job is to decide whether to <strong>approve</strong> or{" "}
                <strong>reject</strong> each application.
              </p>
            </div>

            <div className="rounded-lg border p-4 space-y-2">
              <h3 className="font-semibold text-foreground">AI Assistant</h3>
              <p>
                An AI assistant called <strong>{agentName}</strong> will provide a
                recommendation for each application. You can choose to{" "}
                <strong>accept</strong> the AI&apos;s recommendation or{" "}
                <strong>override</strong> it with your own decision.
              </p>
              <p>
                The AI assistant is not always correct. Use your own judgment
                alongside the AI&apos;s input.
              </p>
            </div>

            <div className="rounded-lg border p-4 space-y-2">
              <h3 className="font-semibold text-foreground">How to Respond</h3>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Read the loan application details</li>
                <li>Review the AI assistant&apos;s recommendation</li>
                <li>Click <strong>&quot;Accept AI Recommendation&quot;</strong> or <strong>&quot;Override — I Disagree&quot;</strong></li>
                <li>If you override, select your own decision (approve or reject)</li>
                <li>Optionally rate your confidence in your decision</li>
              </ol>
            </div>

            <div className="rounded-lg border p-4 space-y-2">
              <h3 className="font-semibold text-foreground">Practice First</h3>
              <p>
                You&apos;ll start with <strong>2 practice trials</strong> to get
                comfortable with the interface. After that, you&apos;ll complete{" "}
                <strong>15 main trials</strong>.
              </p>
            </div>
          </div>

          <Button onClick={onContinue} className="w-full" size="lg">
            Start Practice Trials
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
