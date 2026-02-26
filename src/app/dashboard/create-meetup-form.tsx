"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DEFAULT_ERROR = "Something went wrong. Please try again.";

export function CreateMeetupForm() {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/meetups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });
      if (res.ok) {
        const data = (await res.json()) as { id?: string };
        if (data?.id) {
          window.location.href = `/meetup/${data.id}`;
          return;
        }
        setError(DEFAULT_ERROR);
      } else {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        setError(typeof err?.error === "string" ? err.error : DEFAULT_ERROR);
      }
    } catch {
      setError("Network or server error. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Meetup title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError(null);
          }}
          className="w-48"
          maxLength={120}
          aria-invalid={!!error}
          aria-describedby={error ? "create-meetup-error" : undefined}
        />
        <Button type="submit" disabled={isSubmitting || !title.trim()}>
          {isSubmitting ? "Creating…" : "Create"}
        </Button>
      </div>
      {error && (
        <p id="create-meetup-error" className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
