import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { assignCondition } from "@/lib/engine";
import { generateExperimentSession } from "@/lib/tasks";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const demographics = body.demographics || {};

    const assignment = await assignCondition();

    const participantCode = `P-${uuidv4().slice(0, 8).toUpperCase()}`;

    const participant = await prisma.participant.create({
      data: {
        externalId: participantCode,
        conditionId: assignment.conditionId,
        demographics: JSON.stringify(demographics),
        status: "consent",
        userAgent: req.headers.get("user-agent") || "",
      },
    });

    const session = generateExperimentSession(assignment.cueConfig);

    return NextResponse.json({
      participantId: participant.id,
      externalId: participant.externalId,
      conditionName: assignment.conditionName,
      cueConfig: assignment.cueConfig,
      session,
    });
  } catch (error) {
    console.error("Error creating participant:", error);
    return NextResponse.json(
      { error: "Failed to create participant" },
      { status: 500 }
    );
  }
}
