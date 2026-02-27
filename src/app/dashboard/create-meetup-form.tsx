"use client";

import { useState } from "react";
<<<<<<< HEAD
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Mic, MonitorUp, MessageSquare, Settings2, Circle } from "lucide-react";

const DEFAULT_ERROR = "Something went wrong. Please try again.";

type MeetingSettings = {
  allowCamera: boolean;
  allowMic: boolean;
  allowScreenShare: boolean;
  allowChat: boolean;
  allowParticipantRecording: boolean;
};

const DEFAULT_SETTINGS: MeetingSettings = {
  allowCamera: true,
  allowMic: true,
  allowScreenShare: true,
  allowChat: true,
  allowParticipantRecording: false,
};

const SETTING_META: {
  key: keyof MeetingSettings;
  label: string;
  icon: React.ElementType;
}[] = [
  { key: "allowCamera", label: "Camera", icon: Camera },
  { key: "allowMic", label: "Microphone", icon: Mic },
  { key: "allowScreenShare", label: "Screen share", icon: MonitorUp },
  { key: "allowChat", label: "Chat", icon: MessageSquare },
  { key: "allowParticipantRecording", label: "Participant recording", icon: Circle },
];

export function CreateMeetupForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [settings, setSettings] = useState<MeetingSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(key: keyof MeetingSettings) {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }

=======
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DEFAULT_ERROR = "Something went wrong. Please try again.";

export function CreateMeetupForm() {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

>>>>>>> b9858d85418066245b9bd631061abc82b640b719
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/meetups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
<<<<<<< HEAD
        body: JSON.stringify({ title: title.trim(), ...settings }),
=======
        body: JSON.stringify({ title: title.trim() }),
>>>>>>> b9858d85418066245b9bd631061abc82b640b719
      });
      if (res.ok) {
        const data = (await res.json()) as { id?: string };
        if (data?.id) {
<<<<<<< HEAD
          router.push(`/meetup/${data.id}`);
=======
          window.location.href = `/meetup/${data.id}`;
>>>>>>> b9858d85418066245b9bd631061abc82b640b719
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
<<<<<<< HEAD
      <div className="flex items-center gap-2">
=======
      <div className="flex gap-2">
>>>>>>> b9858d85418066245b9bd631061abc82b640b719
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
<<<<<<< HEAD

        <button
          type="button"
          onClick={() => setShowSettings((v) => !v)}
          className={`flex items-center justify-center h-9 w-9 rounded-lg border transition-colors shrink-0 ${
            showSettings
              ? "border-emerald-600/50 bg-emerald-600/10 text-emerald-400"
              : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600"
          }`}
          title="Meeting settings"
        >
          <Settings2 className="h-4 w-4" />
        </button>

=======
>>>>>>> b9858d85418066245b9bd631061abc82b640b719
        <Button type="submit" disabled={isSubmitting || !title.trim()}>
          {isSubmitting ? "Creating…" : "Create"}
        </Button>
      </div>
<<<<<<< HEAD

      {showSettings && (
        <div className="flex items-center gap-1 flex-wrap mt-1">
          {SETTING_META.map(({ key, label, icon: Icon }) => {
            const on = settings[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggle(key)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  on
                    ? "bg-emerald-600/15 text-emerald-400 ring-1 ring-emerald-500/25"
                    : "bg-zinc-800/80 text-zinc-500 ring-1 ring-zinc-700/40 line-through"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            );
          })}
        </div>
      )}

=======
>>>>>>> b9858d85418066245b9bd631061abc82b640b719
      {error && (
        <p id="create-meetup-error" className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
