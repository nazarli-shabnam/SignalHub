"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link2 } from "lucide-react";

const COPIED_RESET_MS = 2000;
const COPY_ERROR_RESET_MS = 3000;

type CopyStatus = "idle" | "copied" | "error";

type Props = {
  meetupId: string;
  title: string;
  className?: string;
};

export function CopyMeetupLinkButton({ meetupId, title, className }: Props) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, []);

  function clearPendingTimeout() {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  function handleCopy() {
    clearPendingTimeout();
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/meetup/${meetupId}`
        : "";
    if (!url) return;

    navigator.clipboard
      .writeText(url)
      .then(() => {
        setStatus("copied");
        timeoutRef.current = setTimeout(() => {
          setStatus("idle");
          timeoutRef.current = null;
        }, COPIED_RESET_MS);
      })
      .catch(() => {
        setStatus("error");
        timeoutRef.current = setTimeout(() => {
          setStatus("idle");
          timeoutRef.current = null;
        }, COPY_ERROR_RESET_MS);
      });
  }

  const label =
    status === "copied" ? "Copied!" : status === "error" ? "Couldn't copy" : "Copy link";

  return (
    <Button
      variant="outline"
      onClick={handleCopy}
      className={cn("gap-2", className)}
      aria-live="polite"
      aria-label={title ? `${label}: ${title}` : label}
    >
      <Link2 className="h-4 w-4" />
      {label}
    </Button>
  );
}
