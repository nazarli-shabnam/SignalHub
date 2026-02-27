import { NextResponse } from "next/server";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { RoomServiceClient } from "livekit-server-sdk";

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;

function getLiveKitHost(): string | null {
  const url =
    process.env.LIVEKIT_URL ?? process.env.NEXT_PUBLIC_LIVEKIT_URL;
  if (!url?.trim()) return null;
  return url.trim().replace(/^wss:/i, "https:");
}

export async function POST(request: Request) {
  if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    return NextResponse.json(
      { error: "LiveKit is not configured" },
      { status: 503 },
    );
  }

  const hostUrl = getLiveKitHost();
  if (!hostUrl) {
    return NextResponse.json(
      { error: "LiveKit URL is not configured" },
      { status: 503 },
    );
  }

  const user = await getOrCreateCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { meetupId?: unknown; participantIdentity?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const meetupId =
    typeof body.meetupId === "string" ? body.meetupId.trim() : "";
  const participantIdentity =
    typeof body.participantIdentity === "string"
      ? body.participantIdentity.trim()
      : "";

  if (!meetupId || !participantIdentity) {
    return NextResponse.json(
      { error: "meetupId and participantIdentity are required" },
      { status: 400 },
    );
  }

  const meetup = await prisma.meetupRoom.findUnique({
    where: { id: meetupId },
    select: { id: true, hostId: true },
  });

  if (!meetup) {
    return NextResponse.json({ error: "Meetup not found" }, { status: 404 });
  }

  if (meetup.hostId !== user.id) {
    return NextResponse.json(
      { error: "Only the host can grant mic permission" },
      { status: 403 },
    );
  }

  const roomName = `meetup-${meetup.id}`;

  try {
    const roomService = new RoomServiceClient(
      hostUrl,
      LIVEKIT_API_KEY,
      LIVEKIT_API_SECRET,
    );

    await roomService.updateParticipant(roomName, participantIdentity, {
      permission: {
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("grant-mic error:", err);
    return NextResponse.json(
      { error: "Failed to grant mic. The participant may have left." },
      { status: 500 },
    );
  }
}
