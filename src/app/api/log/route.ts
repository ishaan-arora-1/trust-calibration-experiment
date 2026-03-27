import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const LOG_FILE = path.join(process.cwd(), "experiment_log.json");

async function readLog(): Promise<unknown[]> {
  try {
    const raw = await fs.readFile(LOG_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  try {
    const entry = await request.json();
    const log = await readLog();
    log.push(entry);
    await fs.writeFile(LOG_FILE, JSON.stringify(log, null, 2));
    return NextResponse.json({ success: true, totalEntries: log.length });
  } catch (error) {
    console.error("Logging error:", error);
    return NextResponse.json({ error: "Failed to log" }, { status: 500 });
  }
}

export async function GET() {
  const log = await readLog();
  return NextResponse.json(log);
}
