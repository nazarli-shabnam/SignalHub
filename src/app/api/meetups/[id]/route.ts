import { NextResponse } from "next/server";
import { getOrCreateCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "Missing meetup id" }, { status: 400 });
  }

  const meetup = await prisma.meetupRoom.findUnique({
    where: { id: id.trim() },
    select: { id: true, hostId: true },
  });

  if (!meetup) {
    return NextResponse.json({ error: "Meetup not found" }, { status: 404 });
  }

  if (meetup.hostId !== user.id) {
    return NextResponse.json(
      { error: "Only the host can delete this meetup" },
      { status: 403 },
    );
  }

  await prisma.meetupRoom.delete({ where: { id: meetup.id } });

  return NextResponse.json({ ok: true });
}
