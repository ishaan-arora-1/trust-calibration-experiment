"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DebriefProps {
  externalId: string;
}

export function Debrief({ externalId }: DebriefProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Thank You!</CardTitle>
          <CardDescription>
            You have completed the study
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-lg border p-4 text-center space-y-2">
            <p className="text-sm text-muted-foreground">Your completion code</p>
            <Badge variant="secondary" className="text-lg px-4 py-1.5 font-mono">
              {externalId}
            </Badge>
            <p className="text-xs text-muted-foreground">
              Please save this code for your records
            </p>
          </div>

          <div className="space-y-3 text-sm text-muted-foreground">
            <h3 className="font-semibold text-foreground">About This Study</h3>
            <p>
              This study examined how different aspects of AI assistant design —
              such as its name, communication style, and how it expresses
              confidence — influence how people interact with AI recommendations.
            </p>
            <p>
              You were randomly assigned to one of several conditions where
              these design elements varied. The AI assistant&apos;s recommendations
              were pre-programmed and were <strong>correct approximately 75% of
              the time</strong>. This allowed us to study how people calibrate
              their trust when the AI is sometimes wrong.
            </p>
            <p>
              Our research goal is to understand when people appropriately rely
              on AI recommendations versus when they might over-trust or
              under-trust AI systems. These findings can inform more responsible
              AI interface design.
            </p>

            <h3 className="font-semibold text-foreground pt-2">Questions?</h3>
            <p>
              If you have any questions about this research, please contact the
              research team at{" "}
              <a
                href="mailto:human-ai@cern.ch"
                className="text-primary underline"
              >
                human-ai@cern.ch
              </a>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
