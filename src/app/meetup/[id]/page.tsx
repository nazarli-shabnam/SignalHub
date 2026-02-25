import { getOrCreateCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { User, Users, ArrowLeft, Video } from "lucide-react";
import { CopyMeetupLinkButton } from "./copy-meetup-link-button";

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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="border-b border-zinc-800 px-4 sm:px-6 py-4 flex items-center justify-between shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <Link
          href="/dashboard"
          className="text-lg font-semibold text-emerald-400 hover:text-emerald-300"
        >
          SignalHub
        </Link>
        <div className="w-20" aria-hidden />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 sm:p-8 shadow-xl">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
                  {meetup.title}
                </h1>
                <p className="text-zinc-500 text-sm mt-1">
                  {new Date(meetup.createdAt).toLocaleDateString(undefined, {
                    dateStyle: "medium",
                  })}
                  {" · "}
                  {hostLabel}
                </p>
              </div>
              <div
                className={`shrink-0 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
                  isHost
                    ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
                    : "bg-zinc-700/60 text-zinc-300 ring-1 ring-zinc-600"
                }`}
              >
                {isHost ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Users className="h-4 w-4" />
                )}
                {isHost ? "Host" : "Viewer"}
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-800/40 p-5 text-center">
              <Video className="h-10 w-10 text-zinc-500 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm">
                Video room (Phase 2) will appear here. You’re in as{" "}
                <span className="text-zinc-300 font-medium">
                  {isHost ? "Host" : "Viewer"}
                </span>
                .
              </p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard"
                className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-xl font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
              {isHost && (
                <CopyMeetupLinkButton
                  meetupId={meetup.id}
                  title={meetup.title}
                  className="flex-1 h-11 rounded-xl font-medium gap-2 border-zinc-600 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 hover:text-white"
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
