import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Video, Users, Hand } from "lucide-react";

export default function HomePage() {
  return (
    <div className="h-screen overflow-hidden bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Header — single Dashboard when signed in */}
      <header className="border-b border-zinc-800/80 shrink-0">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
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

      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 sm:py-8 pb-10">
          {/* Hero */}
          <section className="text-center mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Meetups that feel live
            </h1>
            <p className="text-lg text-zinc-400 max-w-xl mx-auto">
              One host, one stream. Your audience watches in real time and can
              raise their hand to join the conversation.
            </p>
          </section>

          {/* What it does — compact */}
          <section className="space-y-5 sm:space-y-6 mb-8">
            <div className="flex gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-emerald-600/20 flex items-center justify-center text-emerald-400">
                <Video className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-zinc-100 text-sm sm:text-base mb-0.5">You host, we stream</h2>
                <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed">
                  Start a meetup, turn on your camera and mic (or share your screen). Everyone in the room sees and hears you in real time.
                </p>
              </div>
            </div>
            <div className="flex gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-zinc-100 text-sm sm:text-base mb-0.5">Viewers tune in</h2>
                <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed">
                  Join with a single link. Watch the host’s stream. No account needed to join—only to host or to raise your hand.
                </p>
              </div>
            </div>
            <div className="flex gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                <Hand className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-zinc-100 text-sm sm:text-base mb-0.5">Raise your hand to speak</h2>
                <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed">
                  Viewers can request to turn on their mic. The host sees the request and can let them in—Q&A stays simple and under your control.
                </p>
              </div>
            </div>
          </section>

          {/* CTA — only when signed out; signed in has single Dashboard in header */}
          <section className="text-center pt-6 border-t border-zinc-800/80">
            <SignedOut>
              <p className="text-zinc-500 text-sm mb-4">
                Create a free account to host your first meetup or join one.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/sign-up"
                  className="rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-500 transition-colors"
                >
                  Get started
                </Link>
                <Link
                  href="/sign-in"
                  className="rounded-lg border border-zinc-600 px-6 py-3 font-medium text-zinc-100 hover:bg-zinc-800 transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </SignedOut>
            <SignedIn>
              <p className="text-zinc-500 text-sm">
                You’re signed in. Use the Dashboard button above to get started.
              </p>
            </SignedIn>
          </section>
        </div>
      </main>
    </div>
  );
}
