import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Video, Users, Hand } from "lucide-react";

export default function HomePage() {
  return (
    <div className="h-screen overflow-hidden bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="border-b border-zinc-800/80 shrink-0">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <span className="text-xl font-semibold text-emerald-400">
            SignalHub
          </span>
          <SignedOut>
            <div className="flex gap-3">
              <Link
                href="/sign-in"
                className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="text-sm font-medium rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500 transition-colors"
              >
                Create account
              </Link>
            </div>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="text-sm font-medium rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500 transition-colors"
            >
              Dashboard
            </Link>
          </SignedIn>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-hidden flex flex-col justify-center px-6 py-4">
        <div className="max-w-4xl mx-auto w-full flex flex-col items-center gap-6 sm:gap-8">
          {/* Hero — compact */}
          <section className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1.5">
              Meetups that feel live
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 max-w-lg mx-auto">
              One host, one stream. Audience watches in real time and can raise their hand to join.
            </p>
          </section>

          {/* Features — 3 columns so they fit in one row */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
            <div className="flex gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
              <div className="shrink-0 w-8 h-8 rounded-lg bg-emerald-600/20 flex items-center justify-center text-emerald-400">
                <Video className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-zinc-100 text-sm mb-0.5">You host, we stream</h2>
                <p className="text-zinc-500 text-xs leading-snug">
                  Camera, mic, or screen share. Everyone sees you in real time.
                </p>
              </div>
            </div>
            <div className="flex gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
              <div className="shrink-0 w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-zinc-100 text-sm mb-0.5">Viewers tune in</h2>
                <p className="text-zinc-500 text-xs leading-snug">
                  One link. No account needed to watch—only to host or raise hand.
                </p>
              </div>
            </div>
            <div className="flex gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
              <div className="shrink-0 w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                <Hand className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-zinc-100 text-sm mb-0.5">Raise your hand</h2>
                <p className="text-zinc-500 text-xs leading-snug">
                  Viewers request mic; host approves. Q&A under your control.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center pt-2 border-t border-zinc-800/80 w-full max-w-xl">
            <SignedOut>
              <p className="text-zinc-500 text-xs sm:text-sm mb-3">
                Create a free account to host or join a meetup.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href="/sign-up"
                  className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
                >
                  Get started
                </Link>
                <Link
                  href="/sign-in"
                  className="rounded-lg border border-zinc-600 px-5 py-2.5 text-sm font-medium text-zinc-100 hover:bg-zinc-800 transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </SignedOut>
            <SignedIn>
              <p className="text-zinc-500 text-sm">
                You’re signed in. Use the Dashboard button above.
              </p>
            </SignedIn>
          </section>
        </div>
      </main>
    </div>
  );
}
