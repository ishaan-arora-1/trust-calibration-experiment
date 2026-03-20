import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const required = [
      "participantId",
      "trialNumber",
      "scenarioId",
      "aiRecommendation",
      "aiIsCorrect",
      "correctAnswer",
      "participantDecision",
      "decisionLatencyMs",
      "totalTrialDurationMs",
    ];

    for (const field of required) {
      if (body[field] === undefined) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const trial = await prisma.trial.create({
      data: {
        participantId: body.participantId,
        trialNumber: body.trialNumber,
        scenarioId: body.scenarioId,
        isPractice: body.isPractice || false,
        scenarioData: JSON.stringify(body.scenarioData || {}),
        aiRecommendation: body.aiRecommendation,
        aiConfidenceDisplay: body.aiConfidenceDisplay || "",
        aiIsCorrect: body.aiIsCorrect,
        correctAnswer: body.correctAnswer,
        participantDecision: body.participantDecision,
        participantOverride: body.participantOverride || null,
        confidenceRating: body.confidenceRating || null,
        decisionLatencyMs: body.decisionLatencyMs,
        totalTrialDurationMs: body.totalTrialDurationMs,
      },
    });

    await prisma.participant.update({
      where: { id: body.participantId },
      data: { currentTrial: body.trialNumber },
    });

    return NextResponse.json({ trial });
  } catch (error) {
    console.error("Error recording trial:", error);
    return NextResponse.json(
      { error: "Failed to record trial" },
      { status: 500 }
    );
  }
}
