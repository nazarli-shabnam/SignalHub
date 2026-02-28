import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800/60 px-6 py-3.5 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent"
        >
          SignalHub
        </Link>
        <UserButton afterSignOutUrl="/" />
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
