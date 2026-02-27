import { getOrCreateCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { User, Users, ArrowLeft } from "lucide-react";
import { CopyMeetupLinkButton } from "./copy-meetup-link-button";
import { MeetupVideoRoom } from "./meetup-video-room";

type Props = { params: Promise<{ id: string }> };

export default async function MeetupPage({ params }: Props) {
  const { id } = await params;
  const user = await getOrCreateCurrentUser();
  if (!user) notFound();

  const meetup = await prisma.meetupRoom.findUnique({
    where: { id },
    include: { host: { select: { name: true, email: true } } },
  });

  if (!meetup) notFound();

  const isHost = meetup.hostId === user.id;
  const hostLabel = meetup.host.name ?? meetup.host.email ?? "Host";
  const userName = user.name ?? user.email ?? "";

  return (
    <div className="h-dvh bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden">
      <header className="border-b border-zinc-800/60 px-4 sm:px-6 py-2.5 flex items-center gap-4 shrink-0 bg-zinc-950/80 backdrop-blur-sm">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-200 transition-colors text-sm font-medium shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Link>

        <div className="h-4 w-px bg-zinc-800 shrink-0 hidden sm:block" />

        <div className="flex-1 min-w-0 flex items-center gap-3">
          <h1 className="text-sm font-semibold truncate text-zinc-200">
            {meetup.title}
          </h1>
          <span className="text-zinc-600 text-xs shrink-0 hidden sm:inline">
            {hostLabel}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              isHost
                ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
                : "bg-zinc-800/80 text-zinc-400 ring-1 ring-zinc-700/50"
            }`}
          >
            {isHost ? (
              <User className="h-3 w-3" />
            ) : (
              <Users className="h-3 w-3" />
            )}
            {isHost ? "Host" : "Viewer"}
          </div>
          {isHost && (
            <CopyMeetupLinkButton
              meetupId={meetup.id}
              title={meetup.title}
              className="h-8 rounded-lg text-xs px-3 gap-1.5 border-zinc-700/50 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
            />
          )}
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-hidden">
        <MeetupVideoRoom meetupId={meetup.id} defaultName={userName} />
      </main>
    </div>
  );
}
