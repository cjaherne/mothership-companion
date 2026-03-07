/**
 * POST /api/log
 *
 * Client-side error reporting. Writes to logs/error.log for triage.
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { level = "error", message, meta } = body as {
      level?: string;
      message: string;
      meta?: unknown;
    };
    if (typeof message !== "string") {
      return NextResponse.json({ error: "message required" }, { status: 400 });
    }
    if (level === "error") {
      logger.error(`[client] ${message}`, meta);
    } else if (level === "warn") {
      logger.warn(`[client] ${message}`, meta);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
