import { NextRequest, NextResponse } from "next/server";
import { AccessToken, AgentDispatchClient } from "livekit-server-sdk";
import { logger } from "@/lib/logger";
import { getCampaignOrDefault } from "@/campaigns";

/**
 * GET /api/livekit/token
 *
 * Generates a LiveKit JWT for the client to join a room.
 * Explicitly dispatches the voice agent to the room via API.
 *
 * Query params:
 *   - campaign: campaign ID (default: warden)
 *   - participant: participant name (default: player)
 *   - room: override room name (optional; normally derived from campaign)
 */
export async function GET(request: NextRequest) {
  const url = process.env.LIVEKIT_URL;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!url || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "LiveKit credentials not configured" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("campaign");
  const runId = searchParams.get("runId");
  const participantName = searchParams.get("participant") ?? "player";

  const campaign = getCampaignOrDefault(campaignId);
  const effectiveCampaignId = campaignId ?? campaign.id;
  const roomName =
    searchParams.get("room") ??
    (runId ? `${effectiveCampaignId}__run__${runId}` : campaign.roomName);

  try {
    // Explicitly dispatch agent to room (token-based dispatch was not working for local agent)
    let dispatchOk = false;
    try {
      const httpsUrl = url.replace(/^wss:/, "https:").replace(/^ws:/, "http:");
      const dispatchClient = new AgentDispatchClient(httpsUrl, apiKey, apiSecret);
      await dispatchClient.createDispatch(roomName, "mothership-warden");
      dispatchOk = true;
    } catch (dispatchErr) {
      logger.error("Agent dispatch failed", {
        message: dispatchErr instanceof Error ? dispatchErr.message : String(dispatchErr),
      });
      // Still return token so user can connect; agent may not join
    }

    const token = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      name: participantName,
    });

    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const jwt = await token.toJwt();

    return NextResponse.json({ token: jwt, serverUrl: url });
  } catch (err) {
    logger.error("LiveKit token error", {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
