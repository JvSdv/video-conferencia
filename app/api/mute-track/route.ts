import { NextRequest, NextResponse } from "next/server";
import { RoomServiceClient } from "livekit-server-sdk";

export async function POST(req: NextRequest) {
  const { room, identity, trackSid, muted } = await req.json();

  if (!room || !identity || !trackSid || typeof muted !== "boolean") {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const apiKey = process.env.LIVEKIT_API_KEY!;
  const apiSecret = process.env.LIVEKIT_API_SECRET!;
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL!;

  const roomService = new RoomServiceClient(wsUrl, apiKey, apiSecret);

  try {
    await roomService.mutePublishedTrack(room, identity, trackSid, muted);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}