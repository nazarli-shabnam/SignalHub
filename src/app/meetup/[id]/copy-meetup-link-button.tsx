"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link2 } from "lucide-react";

type Props = {
  meetupId: string;
  title: string;
  className?: string;
};

export function CopyMeetupLinkButton({ meetupId, title, className }: Props) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/meetup/${meetupId}`
        : "";
    void navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Button
      variant="outline"
      onClick={handleCopy}
      className={cn("gap-2", className)}
    >
      <Link2 className="h-4 w-4" />
      {copied ? "Copied!" : "Copy link"}
    </Button>
  );
}
