import { NextRequest, NextResponse } from "next/server";
import { RoomServiceClient } from "livekit-server-sdk";

export async function POST(req: NextRequest) {
  const { room, identity } = await req.json();

  if (!room || !identity) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const apiKey = process.env.LIVEKIT_API_KEY!;
  const apiSecret = process.env.LIVEKIT_API_SECRET!;
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL!;

  const roomService = new RoomServiceClient(wsUrl, apiKey, apiSecret);

  try {
    await roomService.removeParticipant(room, identity);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}