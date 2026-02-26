import { getOrCreateCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CreateMeetupForm } from "./create-meetup-form";
import { Video, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const user = await getOrCreateCurrentUser();
  if (!user) redirect("/");

  const meetups = await prisma.meetupRoom.findMany({
    where: { hostId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, createdAt: true },
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">My Meetups</h1>
        <CreateMeetupForm />
      </div>

      {meetups.length === 0 ? (
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
