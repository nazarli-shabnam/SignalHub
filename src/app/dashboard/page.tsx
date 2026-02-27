import { getOrCreateCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CreateMeetupForm } from "./create-meetup-form";
<<<<<<< HEAD
import { DeleteMeetupButton } from "./delete-meetup-button";
import { Video, Calendar, ChevronRight, Camera, Mic, MonitorUp, MessageSquare, Circle } from "lucide-react";
=======
import { Video, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
>>>>>>> b9858d85418066245b9bd631061abc82b640b719

export default async function DashboardPage() {
  const user = await getOrCreateCurrentUser();
  if (!user) redirect("/");

  const meetups = await prisma.meetupRoom.findMany({
    where: { hostId: user.id },
    orderBy: { createdAt: "desc" },
<<<<<<< HEAD
    select: {
      id: true,
      title: true,
      allowCamera: true,
      allowMic: true,
      allowScreenShare: true,
      allowChat: true,
      allowParticipantRecording: true,
      createdAt: true,
    },
=======
    select: { id: true, title: true, createdAt: true },
>>>>>>> b9858d85418066245b9bd631061abc82b640b719
  });

  return (
    <div className="max-w-2xl mx-auto">
<<<<<<< HEAD
      <div className="flex items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl font-bold shrink-0">My Meetups</h1>
=======
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">My Meetups</h1>
>>>>>>> b9858d85418066245b9bd631061abc82b640b719
        <CreateMeetupForm />
      </div>

      {meetups.length === 0 ? (
<<<<<<< HEAD
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-10 text-center">
          <Video className="mx-auto h-12 w-12 text-zinc-700 mb-4" />
          <p className="font-medium text-zinc-300 mb-1">No meetups yet</p>
          <p className="text-sm text-zinc-500 mb-6">Create your first meetup to start broadcasting.</p>
          <CreateMeetupForm />
        </div>
      ) : (
        <ul className="space-y-2">
          {meetups.map((m) => (
            <li key={m.id} className="group">
              <div className="flex items-center rounded-lg border border-zinc-800/60 bg-zinc-900/40 hover:bg-zinc-800/40 hover:border-zinc-700/60 transition-colors">
                <Link
                  href={`/meetup/${m.id}`}
                  className="flex-1 flex items-center gap-4 p-4 min-w-0"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-500 shrink-0">
                    <Video className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-200 truncate">{m.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(m.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        {m.allowCamera && <Camera className="h-3 w-3 text-zinc-600" />}
                        {m.allowMic && <Mic className="h-3 w-3 text-zinc-600" />}
                        {m.allowScreenShare && <MonitorUp className="h-3 w-3 text-zinc-600" />}
                        {m.allowChat && <MessageSquare className="h-3 w-3 text-zinc-600" />}
                        {m.allowParticipantRecording && <Circle className="h-3 w-3 text-red-500" />}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
                </Link>
                <div className="pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DeleteMeetupButton meetupId={m.id} title={m.title} />
                </div>
              </div>
=======
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center text-zinc-400">
          <Video className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
          <p className="font-medium text-zinc-300 mb-1">No meetups yet</p>
          <p className="text-sm mb-4">Create one to start broadcasting.</p>
          <CreateMeetupForm />
        </div>
      ) : (
        <ul className="space-y-3">
          {meetups.map((m) => (
            <li key={m.id}>
              <Link
                href={`/meetup/${m.id}`}
                className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 hover:bg-zinc-800/50 hover:border-zinc-700 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600/20 text-emerald-400">
                  <Video className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{m.title}</p>
                  <p className="text-sm text-zinc-500 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3" />
                    {new Date(m.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  <span>Open →</span>
                </Button>
              </Link>
>>>>>>> b9858d85418066245b9bd631061abc82b640b719
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
