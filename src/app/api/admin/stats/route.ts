import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [
      totalParticipants,
      completedParticipants,
      totalTrials,
      conditions,
    ] = await Promise.all([
      prisma.participant.count(),
      prisma.participant.count({ where: { status: "completed" } }),
      prisma.trial.count({ where: { isPractice: false } }),
      prisma.condition.findMany({
        where: { isActive: true },
        include: {
          _count: {
            select: {
              participants: true,
            },
          },
        },
      }),
    ]);

    const conditionStats = conditions.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      participantCount: c._count.participants,
    }));

    const recentParticipants = await prisma.participant.findMany({
      orderBy: { startedAt: "desc" },
      take: 10,
      include: { condition: { select: { name: true } } },
    });

    const avgLatency = await prisma.trial.aggregate({
      _avg: { decisionLatencyMs: true },
      where: { isPractice: false },
    });

    const trialDecisions = await prisma.trial.groupBy({
      by: ["participantDecision"],
      _count: true,
      where: { isPractice: false },
    });

    const acceptCount =
      trialDecisions.find((d) => d.participantDecision === "accept")?._count ?? 0;
    const overrideCount =
      trialDecisions.find((d) => d.participantDecision === "override")?._count ?? 0;
    const totalDecisions = acceptCount + overrideCount;

    return NextResponse.json({
      totalParticipants,
      completedParticipants,
      abandonedParticipants: totalParticipants - completedParticipants,
      totalTrials,
      conditionStats,
      recentParticipants: recentParticipants.map((p) => ({
        id: p.id,
        externalId: p.externalId,
        condition: p.condition.name,
        status: p.status,
        startedAt: p.startedAt,
        completedAt: p.completedAt,
        currentTrial: p.currentTrial,
      })),
      overallReliance:
        totalDecisions > 0
          ? Math.round((acceptCount / totalDecisions) * 100)
          : null,
      avgLatencyMs: Math.round(avgLatency._avg.decisionLatencyMs ?? 0),
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
