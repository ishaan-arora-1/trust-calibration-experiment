"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const TRUST_SCALE_ITEMS = [
  { text: "The AI assistant was reliable.", scaleName: "trust_in_automation" },
  { text: "I could trust the AI assistant's recommendations.", scaleName: "trust_in_automation" },
  { text: "I felt confident in the AI assistant's judgments.", scaleName: "trust_in_automation" },
  { text: "The AI assistant was competent at the task.", scaleName: "trust_in_automation" },
  { text: "I could depend on the AI assistant.", scaleName: "trust_in_automation" },
  { text: "The AI assistant was predictable.", scaleName: "trust_in_automation" },
  { text: "I was suspicious of the AI assistant's recommendations.", scaleName: "trust_in_automation" },
];

const LIKERT_LABELS = [
  "Strongly Disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly Agree",
];

interface TrustSurveyProps {
  onComplete: (
    responses: {
      scaleName: string;
      itemIndex: number;
      itemText: string;
      response: number;
    }[]
  ) => void;
}

export function TrustSurvey({ onComplete }: TrustSurveyProps) {
  const [responses, setResponses] = useState<Record<number, number>>({});

  const allAnswered = TRUST_SCALE_ITEMS.every((_, i) => responses[i] !== undefined);

  const handleSubmit = () => {
    const formatted = TRUST_SCALE_ITEMS.map((item, i) => ({
      scaleName: item.scaleName,
      itemIndex: i,
      itemText: item.text,
      response: responses[i],
    }));
    onComplete(formatted);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Post-Task Survey</CardTitle>
          <CardDescription>
            Please rate your agreement with each statement based on your
            experience during the task.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {TRUST_SCALE_ITEMS.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <p className="text-sm font-medium">
                {idx + 1}. {item.text}
              </p>
              <div className="flex gap-1 sm:gap-2">
                {LIKERT_LABELS.map((label, val) => (
                  <button
                    key={val}
                    onClick={() =>
                      setResponses((r) => ({ ...r, [idx]: val + 1 }))
                    }
                    className={`flex-1 py-2 px-1 text-xs rounded-md border transition-colors ${
                      responses[idx] === val + 1
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-input hover:bg-accent"
                    }`}
                    title={label}
                  >
                    <span className="hidden sm:inline">{label}</span>
                    <span className="sm:hidden">{val + 1}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-between text-xs text-muted-foreground pt-2">
            <span>1 = Strongly Disagree</span>
            <span>5 = Strongly Agree</span>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="w-full"
            size="lg"
          >
            Submit Survey & Complete Study
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
