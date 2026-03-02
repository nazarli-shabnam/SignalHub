import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: "SignalHub — Meetup",
  description: "Real-time meetup platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased">
          <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
