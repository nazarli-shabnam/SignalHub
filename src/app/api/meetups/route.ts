import { NextResponse } from "next/server";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const MEETUP_TITLE_MAX_LENGTH = 120;

<<<<<<< HEAD
const SETTINGS_FIELDS = [
  "allowCamera",
  "allowMic",
  "allowScreenShare",
  "allowChat",
  "allowParticipantRecording",
] as const;

type SettingsKey = (typeof SETTINGS_FIELDS)[number];

function parseBool(v: unknown, fallback: boolean): boolean {
  if (typeof v === "boolean") return v;
  return fallback;
}

=======
>>>>>>> b9858d85418066245b9bd631061abc82b640b719
export async function GET() {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const meetups = await prisma.meetupRoom.findMany({
    where: { hostId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
<<<<<<< HEAD
      allowCamera: true,
      allowMic: true,
      allowScreenShare: true,
      allowChat: true,
      allowParticipantRecording: true,
=======
>>>>>>> b9858d85418066245b9bd631061abc82b640b719
      createdAt: true,
    },
  });

  return NextResponse.json(meetups);
}

export async function POST(request: Request) {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

<<<<<<< HEAD
  let body: Record<string, unknown>;
=======
  let body: { title?: unknown };
>>>>>>> b9858d85418066245b9bd631061abc82b640b719
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
<<<<<<< HEAD
      { status: 400 },
=======
      { status: 400 }
>>>>>>> b9858d85418066245b9bd631061abc82b640b719
    );
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";

  if (!title) {
    return NextResponse.json(
      { error: "Title is required" },
<<<<<<< HEAD
      { status: 400 },
=======
      { status: 400 }
>>>>>>> b9858d85418066245b9bd631061abc82b640b719
    );
  }

  if (title.length > MEETUP_TITLE_MAX_LENGTH) {
    return NextResponse.json(
      { error: `Title must be at most ${MEETUP_TITLE_MAX_LENGTH} characters` },
<<<<<<< HEAD
      { status: 400 },
    );
  }

  const settings: Record<SettingsKey, boolean> = {
    allowCamera: parseBool(body.allowCamera, true),
    allowMic: parseBool(body.allowMic, true),
    allowScreenShare: parseBool(body.allowScreenShare, true),
    allowChat: parseBool(body.allowChat, true),
    allowParticipantRecording: parseBool(body.allowParticipantRecording, false),
  };

=======
      { status: 400 }
    );
  }

>>>>>>> b9858d85418066245b9bd631061abc82b640b719
  try {
    const meetup = await prisma.meetupRoom.create({
      data: {
        title,
<<<<<<< HEAD
        ...settings,
=======
>>>>>>> b9858d85418066245b9bd631061abc82b640b719
        hostId: user.id,
        livekitRoomName: null,
      },
    });

    return NextResponse.json({
      id: meetup.id,
      title: meetup.title,
<<<<<<< HEAD
      ...settings,
=======
>>>>>>> b9858d85418066245b9bd631061abc82b640b719
      createdAt: meetup.createdAt,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create meetup. Please try again." },
<<<<<<< HEAD
      { status: 500 },
=======
      { status: 500 }
>>>>>>> b9858d85418066245b9bd631061abc82b640b719
    );
  }
}
