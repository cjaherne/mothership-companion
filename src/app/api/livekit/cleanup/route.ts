/**
 * POST /api/livekit/cleanup
 *
 * Called when the user disconnects from a voice session.
 * Deletes the LiveKit room (disconnecting agent and any participants)
 * and clears the run state from the in-memory API store.
 */

import { NextRequest, NextResponse } from "next/server";
import { RoomServiceClient } from "livekit-server-sdk";
import { logger } from "@/lib/logger";
import { clearRunState } from "@/lib/run-state-store";

export async function POST(request: NextRequest) {
  const url = process.env.LIVEKIT_URL;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!url || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "LiveKit credentials not configured" },
      { status: 500 }
    );
  }

  let body: { campaignId: string; runId: string };
  try {
    body = (await request.json()) as { campaignId: string; runId: string };
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { campaignId, runId } = body;
  if (!campaignId || !runId) {
    return NextResponse.json(
      { error: "campaignId and runId required" },
      { status: 400 }
    );
  }

  const roomName = `${campaignId}__run__${runId}`;

  try {
    const httpsUrl = url.replace(/^wss:/, "https:").replace(/^ws:/, "http:");
    const roomService = new RoomServiceClient(httpsUrl, apiKey, apiSecret);
    await roomService.deleteRoom(roomName);
    logger.info("LiveKit room deleted", { roomName });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("not found") || msg.includes("does not exist")) {
      // Room may have already been cleaned up by departure timeout
      logger.debug("Room already deleted or not found", { roomName });
    } else {
      logger.error("Failed to delete LiveKit room", { roomName, error: msg });
    }
  }

  clearRunState(runId);

  return NextResponse.json({ ok: true });
}
