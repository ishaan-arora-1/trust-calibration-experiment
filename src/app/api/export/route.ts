import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toCSV } from "@/lib/export";

export async function GET(req: NextRequest) {
  const format = req.nextUrl.searchParams.get("format") || "json";
  const dataType = req.nextUrl.searchParams.get("type") || "trials";

  try {
    if (dataType === "trials") {
      const trials = await prisma.trial.findMany({
        where: { isPractice: false },
        include: {
          participant: {
            select: {
              externalId: true,
              conditionId: true,
              demographics: true,
              condition: { select: { name: true, cueConfig: true } },
            },
          },
        },
        orderBy: [{ participantId: "asc" }, { trialNumber: "asc" }],
      });

      const flat = trials.map((t) => ({
        participant_id: t.participant.externalId,
        condition: t.participant.condition.name,
        trial_number: t.trialNumber,
        scenario_id: t.scenarioId,
        ai_recommendation: t.aiRecommendation,
        ai_is_correct: t.aiIsCorrect,
        correct_answer: t.correctAnswer,
        participant_decision: t.participantDecision,
        participant_override: t.participantOverride || "",
        confidence_rating: t.confidenceRating || "",
        decision_latency_ms: t.decisionLatencyMs,
        total_trial_duration_ms: t.totalTrialDurationMs,
        ai_confidence_display: t.aiConfidenceDisplay,
        timestamp: t.timestamp.toISOString(),
      }));

      if (format === "csv") {
        return new NextResponse(toCSV(flat), {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": "attachment; filename=trials_export.csv",
          },
        });
      }

      return NextResponse.json({ data: flat, count: flat.length });
    }

    if (dataType === "participants") {
      const participants = await prisma.participant.findMany({
        include: {
          condition: { select: { name: true } },
          _count: { select: { trials: true, trustResponses: true } },
        },
        orderBy: { startedAt: "asc" },
      });

      const flat = participants.map((p) => ({
        participant_id: p.externalId,
        condition: p.condition.name,
        status: p.status,
        demographics: p.demographics,
        trials_completed: p._count.trials,
        trust_responses: p._count.trustResponses,
        started_at: p.startedAt.toISOString(),
        completed_at: p.completedAt?.toISOString() || "",
      }));

      if (format === "csv") {
        return new NextResponse(toCSV(flat), {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition":
              "attachment; filename=participants_export.csv",
          },
        });
      }

      return NextResponse.json({ data: flat, count: flat.length });
    }

    if (dataType === "events") {
      const events = await prisma.event.findMany({
        include: {
          participant: { select: { externalId: true } },
        },
        orderBy: { timestamp: "asc" },
      });

      const flat = events.map((e) => ({
        participant_id: e.participant.externalId,
        event_type: e.eventType,
        payload: e.payload,
        timestamp: e.timestamp.toISOString(),
      }));

      if (format === "csv") {
        return new NextResponse(toCSV(flat), {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": "attachment; filename=events_export.csv",
          },
        });
      }

      return NextResponse.json({ data: flat, count: flat.length });
    }

    if (dataType === "trust") {
      const responses = await prisma.trustResponse.findMany({
        include: {
          participant: {
            select: {
              externalId: true,
              condition: { select: { name: true } },
            },
          },
        },
        orderBy: [{ participantId: "asc" }, { itemIndex: "asc" }],
      });

      const flat = responses.map((r) => ({
        participant_id: r.participant.externalId,
        condition: r.participant.condition.name,
        scale_name: r.scaleName,
        item_index: r.itemIndex,
        item_text: r.itemText,
        response: r.response,
        timestamp: r.timestamp.toISOString(),
      }));

      if (format === "csv") {
        return new NextResponse(toCSV(flat), {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition":
              "attachment; filename=trust_responses_export.csv",
          },
        });
      }

      return NextResponse.json({ data: flat, count: flat.length });
    }

    return NextResponse.json(
      { error: "Invalid type. Use: trials, participants, events, trust" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
