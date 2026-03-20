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

interface ConsentFormProps {
  onConsent: () => void;
}

export function ConsentForm({ onConsent }: ConsentFormProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Informed Consent</CardTitle>
          <CardDescription>
            Please read the following information before participating
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none space-y-3 text-muted-foreground">
            <h3 className="text-foreground font-semibold text-base">Purpose of this Study</h3>
            <p>
              This research examines how people interact with AI-powered decision
              assistants. You will be asked to review a series of scenarios and make
              decisions with the help of an AI assistant.
            </p>

            <h3 className="text-foreground font-semibold text-base">What You Will Do</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Answer a few brief demographic questions</li>
              <li>Complete 2 practice trials to familiarize yourself with the task</li>
              <li>Complete 15 main decision trials</li>
              <li>Answer a short survey about your experience</li>
            </ul>
            <p>The entire study takes approximately 15–20 minutes.</p>

            <h3 className="text-foreground font-semibold text-base">Risks and Benefits</h3>
            <p>
              There are no known risks beyond those of everyday computer use.
              Your participation contributes to research on human–AI interaction
              and responsible AI design.
            </p>

            <h3 className="text-foreground font-semibold text-base">Confidentiality</h3>
            <p>
              Your responses are anonymous. We collect no personally identifying
              information. Data will be stored securely and reported in aggregate
              form only.
            </p>

            <h3 className="text-foreground font-semibold text-base">Voluntary Participation</h3>
            <p>
              Your participation is completely voluntary. You may withdraw at any
              time without penalty by closing your browser window.
            </p>
          </div>

          <div className="border-t pt-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-input"
              />
              <span className="text-sm">
                I have read and understand the information above. I voluntarily
                agree to participate in this study. I am at least 18 years old.
              </span>
            </label>
          </div>

          <Button
            onClick={onConsent}
            disabled={!agreed}
            className="w-full"
            size="lg"
          >
            I Agree — Begin Study
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
