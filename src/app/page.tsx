import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Video, Users, Hand } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800/80">
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

      <main className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
        {/* Hero */}
        <section className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Meetups that feel live
          </h1>
          <p className="text-xl text-zinc-400 max-w-xl mx-auto">
            One host, one stream. Your audience watches in real time and can
            raise their hand to join the conversation.
          </p>
        </section>

        {/* What it does */}
        <section className="mb-16 space-y-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center text-emerald-400">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-zinc-100 mb-1">You host, we stream</h2>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Start a meetup, turn on your camera and mic (or share your screen). Everyone in the room sees and hears you in real time—no dial-in codes, no extra apps.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-zinc-100 mb-1">Viewers tune in</h2>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Join with a single link. Watch the host’s stream, react in the moment. No account needed to join—only to host or to raise your hand.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
              <Hand className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-zinc-100 mb-1">Raise your hand to speak</h2>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Viewers can request to turn on their mic. The host sees the request and can let them in—so Q&amp;A and discussions stay simple and under your control.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center pt-8 border-t border-zinc-800/80">
          <p className="text-zinc-500 text-sm mb-6">
            Create a free account to host your first meetup or join one.
          </p>
          <SignedOut>
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
            <Link
              href="/dashboard"
              className="inline-block rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-500 transition-colors"
            >
              Go to Dashboard
            </Link>
          </SignedIn>
        </section>
      </main>
    </div>
  );
}
