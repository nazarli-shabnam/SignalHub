"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import "@livekit/components-styles";

const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL;
const DISPLAY_NAME_KEY = "signalhub:displayName";

const LiveKitStage = dynamic(() => import("./livekit-stage"), { ssr: false });

function getSavedName(fallback: string): string {
  if (typeof window === "undefined") return fallback;
  try {
    return localStorage.getItem(DISPLAY_NAME_KEY) || fallback;
  } catch {
    return fallback;
  }
}

function saveName(name: string) {
  try {
    localStorage.setItem(DISPLAY_NAME_KEY, name);
  } catch {
    // storage unavailable
  }
}

type MeetingSettings = {
  allowCamera: boolean;
  allowMic: boolean;
  allowScreenShare: boolean;
  allowChat: boolean;
  allowParticipantRecording: boolean;
};

type TokenState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; token: string; roomName: string; isHost: boolean; settings: MeetingSettings }
  | { status: "error"; message: string };

type Props = {
  meetupId: string;
  defaultName: string;
};

export function MeetupVideoRoom({ meetupId, defaultName }: Props) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(defaultName);
  const joinedNameRef = useRef("");
  const [joined, setJoined] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const saved = getSavedName("");
    if (saved) setDisplayName(saved);
  }, []);
  const [leaving, setLeaving] = useState(false);
  const [tokenState, setTokenState] = useState<TokenState>({ status: "idle" });
  const [connectionError, setConnectionError] = useState<string | null>(null);

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const name = displayName.trim();
    if (!name) return;
    saveName(name);
    joinedNameRef.current = name;
    setJoined(true);
  }

  useEffect(() => {
    if (!joined) return;

    if (!meetupId?.trim()) {
      setTokenState({ status: "error", message: "Missing meetup." });
      return;
    }
    if (!LIVEKIT_URL?.trim()) {
      setTokenState({
        status: "error",
        message: "Video is not configured. Contact the host to enable it.",
      });
      return;
    }

    let cancelled = false;
    setTokenState({ status: "loading" });
    setConnectionError(null);

    const params = new URLSearchParams({
      meetupId: meetupId.trim(),
      displayName: joinedNameRef.current,
    });

    fetch(`/api/livekit/token?${params}`)
      .then(async (res) => {
        if (cancelled) return;
        const data = await res.json().catch(() => ({}));
        const msg = typeof data?.error === "string" ? data.error : null;

        if (res.ok && data?.token) {
          setTokenState({
            status: "ready",
            token: data.token,
            roomName: data.roomName ?? `meetup-${meetupId}`,
            isHost: Boolean(data.isHost),
            settings: {
              allowCamera: data.settings?.allowCamera !== false,
              allowMic: data.settings?.allowMic !== false,
              allowScreenShare: data.settings?.allowScreenShare !== false,
              allowChat: data.settings?.allowChat !== false,
              allowParticipantRecording: data.settings?.allowParticipantRecording === true,
            },
          });
          return;
        }

        const fallback: Record<number, string> = {
          401: "Please sign in to join the video room.",
          404: "Meetup not found.",
          503: "Video is not configured. Contact the host to enable it.",
        };
        setTokenState({
          status: "error",
          message: msg ?? fallback[res.status] ?? "Could not join the video room. Please try again.",
        });
      })
      .catch(() => {
        if (!cancelled) {
          setTokenState({
            status: "error",
            message: "Network error. Check your connection and try again.",
          });
        }
      });

    return () => { cancelled = true; };
  }, [joined, meetupId]);

  const handleError = useCallback((error: Error) => {
    setConnectionError(error?.message ?? "Connection error. Please try again.");
  }, []);

  const handleDisconnected = useCallback(() => {
    setLeaving(true);
  }, []);

  useEffect(() => {
    if (leaving) router.push("/dashboard");
  }, [leaving, router]);

  // Pre-join lobby
  if (!joined) {
    return (
      <div className="h-full flex items-center justify-center bg-zinc-950 p-6">
        <form
          onSubmit={handleJoin}
          className="w-full max-w-xs flex flex-col items-center gap-5"
        >
          <div className="w-20 h-20 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-3xl font-bold text-zinc-400">
            {displayName.trim() ? displayName.trim()[0].toUpperCase() : "?"}
          </div>

          <div className="w-full space-y-2">
            <label htmlFor="display-name" className="block text-sm font-medium text-zinc-300">
              Your name
            </label>
            <Input
              id="display-name"
              type="text"
              placeholder="Enter your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={60}
              autoFocus
              className="w-full bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
            />
          </div>

          <Button
            type="submit"
            disabled={!displayName.trim()}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl"
          >
            Join meeting
          </Button>
        </form>
      </div>
    );
  }

  if (tokenState.status === "idle" || tokenState.status === "loading") {
    return (
      <div className="h-full flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent mb-3" aria-hidden />
          <p className="text-zinc-400 text-sm">Connecting to video room…</p>
        </div>
      </div>
    );
  }

  if (tokenState.status === "error") {
    return (
      <div className="h-full flex items-center justify-center bg-zinc-950 p-6">
        <div className="rounded-xl border border-amber-900/50 bg-amber-950/30 p-6 text-center max-w-sm">
          <p className="text-amber-400 text-sm font-medium mb-1">Could not join video</p>
          <p className="text-zinc-400 text-sm" role="alert">{tokenState.message}</p>
        </div>
      </div>
    );
  }

  const { token, isHost, settings } = tokenState;

  if (leaving) {
    return (
      <div className="h-full flex items-center justify-center bg-zinc-950">
        <p className="text-zinc-400 text-sm">Leaving meeting…</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      {connectionError && (
        <div className="px-4 py-2 bg-amber-950/50 border-b border-amber-900/50 text-amber-400 text-sm shrink-0" role="alert">
          {connectionError}
        </div>
      )}
      <div className="flex-1 min-h-0" data-lk-theme="default">
        <LiveKitStage
          token={token}
          serverUrl={LIVEKIT_URL!}
          isHost={isHost}
          meetupId={meetupId}
          settings={settings}
          onError={handleError}
          onDisconnected={handleDisconnected}
        />
      </div>
    </div>
  );
}
