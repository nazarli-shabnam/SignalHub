import { NextResponse } from "next/server";
<<<<<<< HEAD
=======
import { auth } from "@clerk/nextjs/server";
>>>>>>> b9858d85418066245b9bd631061abc82b640b719
import { getOrCreateCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AccessToken } from "livekit-server-sdk";

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const meetupId = searchParams.get("meetupId");
<<<<<<< HEAD
  const displayName = searchParams.get("displayName")?.trim() || "";
=======
>>>>>>> b9858d85418066245b9bd631061abc82b640b719

  if (!meetupId?.trim()) {
    return NextResponse.json(
      { error: "meetupId is required" },
<<<<<<< HEAD
      { status: 400 },
=======
      { status: 400 }
>>>>>>> b9858d85418066245b9bd631061abc82b640b719
    );
  }

  if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    return NextResponse.json(
      { error: "LiveKit is not configured (missing API key or secret)" },
<<<<<<< HEAD
      { status: 503 },
    );
  }

=======
      { status: 503 }
    );
  }

  const clerkUserId = await auth().then((a) => a.userId);
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

>>>>>>> b9858d85418066245b9bd631061abc82b640b719
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const meetup = await prisma.meetupRoom.findUnique({
    where: { id: meetupId.trim() },
<<<<<<< HEAD
    select: {
      id: true,
      hostId: true,
      title: true,
      allowCamera: true,
      allowMic: true,
      allowScreenShare: true,
      allowChat: true,
      allowParticipantRecording: true,
    },
=======
    select: { id: true, hostId: true, title: true },
>>>>>>> b9858d85418066245b9bd631061abc82b640b719
  });

  if (!meetup) {
    return NextResponse.json({ error: "Meetup not found" }, { status: 404 });
  }

  const roomName = `meetup-${meetup.id}`;
  const isHost = meetup.hostId === user.id;
<<<<<<< HEAD
  const canPublish = meetup.allowCamera || meetup.allowMic;
  const participantName =
    displayName || user.name || user.email || user.clerkId;

  const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: user.clerkId,
    name: participantName,
=======

  const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: clerkUserId,
    name: user.name ?? user.email ?? clerkUserId,
>>>>>>> b9858d85418066245b9bd631061abc82b640b719
    ttl: "2h",
  });

  token.addGrant({
    roomJoin: true,
    room: roomName,
<<<<<<< HEAD
    canPublish,
=======
    canPublish: isHost,
>>>>>>> b9858d85418066245b9bd631061abc82b640b719
    canSubscribe: true,
    canPublishData: true,
  });

  const jwt = await token.toJwt();

  return NextResponse.json({
    token: jwt,
    roomName,
    isHost,
<<<<<<< HEAD
    settings: {
      allowCamera: meetup.allowCamera,
      allowMic: meetup.allowMic,
      allowScreenShare: meetup.allowScreenShare,
      allowChat: meetup.allowChat,
      allowParticipantRecording: meetup.allowParticipantRecording,
    },
=======
>>>>>>> b9858d85418066245b9bd631061abc82b640b719
  });
}
