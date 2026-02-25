"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CreateMeetupForm() {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/meetups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        window.location.href = `/meetup/${data.id}`;
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "Failed to create meetup");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        placeholder="Meetup title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-48"
        maxLength={120}
      />
      <Button type="submit" disabled={isSubmitting || !title.trim()}>
        {isSubmitting ? "Creating…" : "Create"}
      </Button>
    </form>
  );
}
