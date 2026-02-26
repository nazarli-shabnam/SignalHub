import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AccessToken } from "livekit-server-sdk";

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const meetupId = searchParams.get("meetupId");

  if (!meetupId?.trim()) {
    return NextResponse.json(
      { error: "meetupId is required" },
      { status: 400 }
    );
  }

  if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    return NextResponse.json(
      { error: "LiveKit is not configured (missing API key or secret)" },
      { status: 503 }
    );
  }

  const clerkUserId = await auth().then((a) => a.userId);
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getOrCreateCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const meetup = await prisma.meetupRoom.findUnique({
    where: { id: meetupId.trim() },
    select: { id: true, hostId: true, title: true },
  });

  if (!meetup) {
    return NextResponse.json({ error: "Meetup not found" }, { status: 404 });
  }

  const roomName = `meetup-${meetup.id}`;
  const isHost = meetup.hostId === user.id;

  const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: clerkUserId,
    name: user.name ?? user.email ?? clerkUserId,
    ttl: "2h",
  });

  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: isHost,
    canSubscribe: true,
    canPublishData: true,
  });

  const jwt = await token.toJwt();

  return NextResponse.json({
    token: jwt,
    roomName,
    isHost,
  });
}
