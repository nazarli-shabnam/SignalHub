import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-semibold text-emerald-400">
          SignalHub
        </Link>
        <UserButton afterSignOutUrl="/" />
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
