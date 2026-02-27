import { Video } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="h-8 w-36 rounded bg-zinc-800 animate-pulse" />
        <div className="h-10 w-56 rounded bg-zinc-800 animate-pulse" />
      </div>

      <ul className="space-y-2">
        {[1, 2, 3].map((i) => (
          <li key={i}>
            <div className="flex items-center gap-4 rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600/10">
                <Video className="h-5 w-5 text-emerald-500/40" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 rounded bg-zinc-800 animate-pulse" />
                <div className="h-3 w-24 rounded bg-zinc-800/60 animate-pulse" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
