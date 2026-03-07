import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

/**
 * GET /api/livekit/token
 *
 * Generates a LiveKit JWT for the client to join a room.
 * The room name is used to dispatch the appropriate voice agent.
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
  const roomName = searchParams.get("room") ?? "mothership-warden";
  const participantName = searchParams.get("participant") ?? "player";

  try {
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
    console.error("LiveKit token error:", err);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
