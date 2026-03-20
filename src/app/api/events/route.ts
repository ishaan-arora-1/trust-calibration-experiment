import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.participantId || !body.eventType) {
      return NextResponse.json(
        { error: "participantId and eventType are required" },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        participantId: body.participantId,
        eventType: body.eventType,
        payload: JSON.stringify(body.payload || {}),
      },
    });

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Error logging event:", error);
    return NextResponse.json(
      { error: "Failed to log event" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const participantId = req.nextUrl.searchParams.get("participantId");

  if (!participantId) {
    return NextResponse.json(
      { error: "participantId query parameter required" },
      { status: 400 }
    );
  }

  const events = await prisma.event.findMany({
    where: { participantId },
    orderBy: { timestamp: "asc" },
  });

  return NextResponse.json({ events });
}
