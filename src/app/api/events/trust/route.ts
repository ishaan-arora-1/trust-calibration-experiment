import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.participantId || !body.responses || !Array.isArray(body.responses)) {
      return NextResponse.json(
        { error: "participantId and responses array are required" },
        { status: 400 }
      );
    }

    const created = await prisma.$transaction(
      body.responses.map(
        (r: { scaleName: string; itemIndex: number; itemText: string; response: number }) =>
          prisma.trustResponse.create({
            data: {
              participantId: body.participantId,
              scaleName: r.scaleName,
              itemIndex: r.itemIndex,
              itemText: r.itemText,
              response: r.response,
            },
          })
      )
    );

    return NextResponse.json({ count: created.length });
  } catch (error) {
    console.error("Error recording trust responses:", error);
    return NextResponse.json(
      { error: "Failed to record trust responses" },
      { status: 500 }
    );
  }
}
