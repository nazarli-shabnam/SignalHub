import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Video, Users, Hand } from "lucide-react";

export default function HomePage() {
  return (
    <div className="h-screen overflow-hidden bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="border-b border-zinc-800/60 shrink-0">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            SignalHub
          </span>
          <SignedOut>
            <div className="flex items-center gap-3">
              <Link
                href="/sign-in"
                className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="text-sm font-medium rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20"
              >
                Get started
              </Link>
            </div>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="text-sm font-medium rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20"
            >
              Dashboard
            </Link>
          </SignedIn>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-hidden flex flex-col justify-center px-6 py-6">
        <div className="max-w-5xl mx-auto w-full flex flex-col items-center gap-8 sm:gap-10">
          <section className="text-center space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Meetups that feel{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                live
              </span>
            </h1>
            <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed">
              One host broadcasts. Everyone watches in real time. Raise your
              hand to join the conversation.
            </p>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/60 hover:border-zinc-700/60 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-emerald-600/15 flex items-center justify-center text-emerald-400 mb-3">
                <Video className="w-5 h-5" />
              </div>
              <h2 className="font-semibold text-zinc-100 text-sm mb-1">
                You host, we stream
              </h2>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Camera, mic, or screen share. Your audience sees everything in
                real time.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/60 hover:border-zinc-700/60 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-400 mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h2 className="font-semibold text-zinc-100 text-sm mb-1">
                Viewers tune in
              </h2>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Share a link. Viewers join instantly -- no extra setup needed.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/60 hover:border-zinc-700/60 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-400 mb-3">
                <Hand className="w-5 h-5" />
              </div>
              <h2 className="font-semibold text-zinc-100 text-sm mb-1">
                Raise your hand
              </h2>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Viewers request the mic, host approves. Q&A stays under control.
              </p>
            </div>
          </section>

          <section className="text-center w-full max-w-xl">
            <SignedOut>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href="/sign-up"
                  className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20"
                >
                  Create free account
                </Link>
                <Link
                  href="/sign-in"
                  className="rounded-lg border border-zinc-700 px-6 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="inline-block rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20"
              >
                Go to Dashboard
              </Link>
            </SignedIn>
          </section>
        </div>
      </main>

      <footer className="shrink-0 border-t border-zinc-800/40 py-3 text-center text-xs text-zinc-600">
        Built with Next.js, LiveKit, and Clerk
      </footer>
    </div>
  );
}
