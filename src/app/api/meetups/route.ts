import { NextResponse } from "next/server";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const MEETUP_TITLE_MAX_LENGTH = 120;

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

  let body: { title?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";

  if (!title) {
    return NextResponse.json(
      { error: "Title is required" },
      { status: 400 }
    );
  }

  if (title.length > MEETUP_TITLE_MAX_LENGTH) {
    return NextResponse.json(
      { error: `Title must be at most ${MEETUP_TITLE_MAX_LENGTH} characters` },
      { status: 400 }
    );
  }

  try {
    const meetup = await prisma.meetupRoom.create({
      data: {
        title,
        hostId: user.id,
        livekitRoomName: null,
      },
    });

    return NextResponse.json({
      id: meetup.id,
      title: meetup.title,
      createdAt: meetup.createdAt,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create meetup. Please try again." },
      { status: 500 }
    );
  }
}
