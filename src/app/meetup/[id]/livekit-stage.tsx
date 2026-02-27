"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import {
  LiveKitRoom,
  GridLayout,
  FocusLayout,
  FocusLayoutContainer,
  CarouselLayout,
  ControlBar,
  RoomAudioRenderer,
  ConnectionStateToast,
  ParticipantTile,
  LayoutContextProvider,
  useCreateLayoutContext,
  usePinnedTracks,
  useTracks,
  useDataChannel,
  useLocalParticipant,
  useMaybeTrackRefContext,
  isTrackReference,
} from "@livekit/components-react";
import type {
  TrackReferenceOrPlaceholder,
  WidgetState,
} from "@livekit/components-core";
import { isEqualTrackRef, isWeb } from "@livekit/components-core";
import { RoomEvent, Track } from "livekit-client";
import { CustomChat } from "./custom-chat";


export type MeetingSettings = {
  allowCamera: boolean;
  allowMic: boolean;
  allowScreenShare: boolean;
  allowChat: boolean;
  allowParticipantRecording: boolean;
};


const RAISE_HAND_TOPIC = "signalhub/raiseHand";

type HandPayload = {
  type: "raiseHand" | "lowerHand";
  participantIdentity: string;
  participantName?: string;
};

type RaisedHandsCtx = {
  raisedHands: Map<string, string>;
  isHandRaised: boolean;
  toggleHand: () => void;
};

const RaisedHandsContext = createContext<RaisedHandsCtx>({
  raisedHands: new Map(),
  isHandRaised: false,
  toggleHand: () => {},
});

function useRaisedHands() {
  return useContext(RaisedHandsContext);
}

function RaisedHandsProvider({ children }: { children: React.ReactNode }) {
  const { localParticipant } = useLocalParticipant();
  const [raisedHands, setRaisedHands] = useState<Map<string, string>>(
    () => new Map(),
  );
  const [isHandRaised, setIsHandRaised] = useState(false);

  const onMessage = useCallback((msg: { payload?: Uint8Array }) => {
    if (!msg.payload?.length) return;
    try {
      const data = JSON.parse(
        new TextDecoder().decode(msg.payload),
      ) as HandPayload;
      if (!data.participantIdentity) return;

      setRaisedHands((prev) => {
        const next = new Map(prev);
        if (data.type === "raiseHand")
          next.set(
            data.participantIdentity,
            data.participantName || data.participantIdentity,
          );
        else if (data.type === "lowerHand")
          next.delete(data.participantIdentity);
        if (
          next.size === prev.size &&
          [...next.keys()].every((k) => prev.has(k))
        )
          return prev;
        return next;
      });
    } catch {
      /* ignore */
    }
  }, []);

  const { send } = useDataChannel(RAISE_HAND_TOPIC, onMessage);

  const toggleHand = useCallback(() => {
    const nextState = !isHandRaised;
    const payload: HandPayload = {
      type: nextState ? "raiseHand" : "lowerHand",
      participantIdentity: localParticipant.identity,
      participantName: localParticipant.name,
    };
    send(new TextEncoder().encode(JSON.stringify(payload)), {
      reliable: true,
    });
    setIsHandRaised(nextState);
    setRaisedHands((prev) => {
      const next = new Map(prev);
      if (nextState)
        next.set(
          localParticipant.identity,
          localParticipant.name ?? localParticipant.identity,
        );
      else next.delete(localParticipant.identity);
      return next;
    });
  }, [isHandRaised, localParticipant.identity, localParticipant.name, send]);

  const value = useMemo(
    () => ({ raisedHands, isHandRaised, toggleHand }),
    [raisedHands, isHandRaised, toggleHand],
  );

  return (
    <RaisedHandsContext.Provider value={value}>
      {children}
    </RaisedHandsContext.Provider>
  );
}


function TileWithHand() {
  const trackRef = useMaybeTrackRefContext();
  const { raisedHands } = useRaisedHands();
  const identity = trackRef?.participant?.identity;
  const raised = identity ? raisedHands.has(identity) : false;

  return (
    <div className="relative">
      <ParticipantTile />
      {raised && (
        <span className="absolute top-2 right-2 text-xl leading-none select-none pointer-events-none animate-bounce-once">
          ✋
        </span>
      )}
    </div>
  );
}

type Props = {
  token: string;
  serverUrl: string;
  isHost: boolean;
  meetupId: string;
  settings: MeetingSettings;
  onError: (error: Error) => void;
  onDisconnected: () => void;
};

export default function LiveKitStage({
  token,
  serverUrl,
  isHost,
  meetupId,
  settings,
  onError,
  onDisconnected,
}: Props) {
  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      onError={onError}
      onDisconnected={onDisconnected}
      audio={settings.allowMic}
      video={settings.allowCamera}
      style={{ height: "100%" }}
    >
      <RaisedHandsProvider>
        <VideoLayout settings={settings} isHost={isHost} meetupId={meetupId} />
      </RaisedHandsProvider>
    </LiveKitRoom>
  );
}

function VideoLayout({
  settings,
  isHost,
  meetupId,
}: {
  settings: MeetingSettings;
  isHost: boolean;
  meetupId: string;
}) {
  const [widgetState, setWidgetState] = useState<WidgetState>({
    showChat: false,
    unreadMessages: 0,
    showSettings: false,
  });
  const lastAutoFocusRef =
    useRef<TrackReferenceOrPlaceholder | null>(null);

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    {
      updateOnlyOn: [RoomEvent.ActiveSpeakersChanged],
      onlySubscribed: false,
    },
  );

  const layoutContext = useCreateLayoutContext();
  const rawFocusTrack = usePinnedTracks(layoutContext)?.[0];

  const focusTrack = useMemo(() => {
    if (!rawFocusTrack) return undefined;
    const exists = tracks.some((t) => isEqualTrackRef(t, rawFocusTrack));
    return exists ? rawFocusTrack : undefined;
  }, [rawFocusTrack, tracks]);

  const carouselTracks = useMemo(() => {
    if (!focusTrack) return tracks;
    return tracks.filter((t) => !isEqualTrackRef(t, focusTrack));
  }, [tracks, focusTrack]);

  const focusKey = focusTrack
    ? `${focusTrack.participant.identity}_${focusTrack.source}`
    : "";

  const screenShareTracks = useMemo(
    () =>
      tracks
        .filter(isTrackReference)
        .filter((t) => t.publication.source === Track.Source.ScreenShare),
    [tracks],
  );

  const screenShareKey = useMemo(
    () =>
      screenShareTracks
        .map((r) => `${r.publication.trackSid}_${r.publication.isSubscribed}`)
        .join(),
    [screenShareTracks],
  );

  useEffect(() => {
    if (
      screenShareTracks.some((t) => t.publication.isSubscribed) &&
      lastAutoFocusRef.current === null
    ) {
      layoutContext.pin.dispatch?.({
        msg: "set_pin",
        trackReference: screenShareTracks[0],
      });
      lastAutoFocusRef.current = screenShareTracks[0];
    } else if (
      lastAutoFocusRef.current &&
      !screenShareTracks.some(
        (t) =>
          t.publication.trackSid ===
          lastAutoFocusRef.current?.publication?.trackSid,
      )
    ) {
      layoutContext.pin.dispatch?.({ msg: "clear_pin" });
      lastAutoFocusRef.current = null;
    }

    if (rawFocusTrack && !focusTrack) {
      layoutContext.pin.dispatch?.({ msg: "clear_pin" });
      lastAutoFocusRef.current = null;
    } else if (focusTrack && !isTrackReference(focusTrack)) {
      const updated = tracks.find(
        (t) =>
          t.participant.identity === focusTrack.participant.identity &&
          t.source === focusTrack.source,
      );
      if (updated !== focusTrack && isTrackReference(updated)) {
        layoutContext.pin.dispatch?.({
          msg: "set_pin",
          trackReference: updated,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenShareKey, focusTrack?.publication?.trackSid, rawFocusTrack, focusTrack]);

  if (!isWeb()) return null;

  const canRecord = isHost || settings.allowParticipantRecording;
  const micDisabled = !settings.allowMic;

  return (
    <div className="lk-video-conference">
      <RecordingBanner />
      <LayoutContextProvider
        value={layoutContext}
        onWidgetChange={setWidgetState}
      >
        <div className="lk-video-conference-inner">
          {!focusTrack ? (
            <div className="lk-grid-layout-wrapper">
              <GridLayout tracks={tracks}>
                <TileWithHand />
              </GridLayout>
            </div>
          ) : (
            <div className="lk-focus-layout-wrapper">
              <FocusLayoutContainer>
                <CarouselLayout key={focusKey} tracks={carouselTracks}>
                  <TileWithHand />
                </CarouselLayout>
                {focusTrack && <FocusLayout trackRef={focusTrack} />}
              </FocusLayoutContainer>
            </div>
          )}
          <div className="relative">
            <ControlBar
              controls={{
                camera: settings.allowCamera,
                microphone: settings.allowMic,
                screenShare: settings.allowScreenShare,
                chat: settings.allowChat,
              }}
            />
            <div className="absolute right-3 top-0 bottom-0 flex items-center gap-1 z-10">
              {canRecord && <RecordButton />}
              <RaiseHandBarButton />
            </div>
          </div>
        </div>
        {settings.allowChat && (
          <CustomChat
            style={{
              display: widgetState.showChat ? "grid" : "none",
            }}
          />
        )}
      </LayoutContextProvider>
      {micDisabled && isHost && (
        <GrantMicPanel meetupId={meetupId} />
      )}
      <RoomAudioRenderer />
      <ConnectionStateToast />
    </div>
  );
}

function RaiseHandBarButton() {
  const { isHandRaised, toggleHand } = useRaisedHands();

  return (
    <button
      type="button"
      onClick={toggleHand}
      title={isHandRaised ? "Lower hand" : "Raise hand"}
      className={`lk-button lk-button-toggle flex items-center justify-center rounded-md h-10 w-10 transition-colors ${
        isHandRaised
          ? "bg-sky-500/15 ring-2 ring-sky-400/60 hover:bg-sky-500/25 text-zinc-100"
          : "text-zinc-400 hover:bg-[var(--lk-control-hover-bg)] hover:text-zinc-100"
      }`}
    >
      <span className="text-lg leading-none">🤚</span>
    </button>
  );
}

function GrantMicPanel({ meetupId }: { meetupId: string }) {
  const { raisedHands } = useRaisedHands();
  const { localParticipant } = useLocalParticipant();
  const [granting, setGranting] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const hands = Array.from(raisedHands.entries()).filter(
    ([identity]) => identity !== localParticipant.identity,
  );

  if (hands.length === 0) return null;

  async function handleGrant(identity: string) {
    if (granting) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setGranting(identity);
    try {
      await fetch("/api/livekit/grant-mic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetupId, participantIdentity: identity }),
        signal: controller.signal,
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
    } finally {
      setGranting(null);
    }
  }

  return (
    <div className="absolute top-14 right-4 z-50 w-64">
      <div className="rounded-xl border border-zinc-700/60 bg-zinc-900/95 shadow-2xl p-3 backdrop-blur-md">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">
          Requests to speak
          <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 text-[10px] font-bold">
            {hands.length}
          </span>
        </p>
        <ul className="space-y-1.5 max-h-48 overflow-y-auto">
          {hands.map(([identity, displayName]) => (
            <li
              key={identity}
              className="flex items-center gap-2 rounded-lg bg-zinc-800/60 px-2.5 py-1.5"
            >
              <span className="flex-1 truncate text-sm text-zinc-200">
                {displayName}
              </span>
              <button
                type="button"
                onClick={() => handleGrant(identity)}
                disabled={granting === identity}
                className="shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
              >
                {granting === identity ? "…" : "Accept"}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const RECORDING_TOPIC = "signalhub/recording";

type RecordingPayload = {
  type: "recordingStarted" | "recordingStopped";
  participantName: string;
};

function getMediaRecorderMimeType(): string {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return "";
}

function RecordButton() {
  const { localParticipant } = useLocalParticipant();
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const onRecordingMessage = useCallback(() => {}, []);
  const { send } = useDataChannel(RECORDING_TOPIC, onRecordingMessage);

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
    setRecording(false);

    send(
      new TextEncoder().encode(
        JSON.stringify({
          type: "recordingStopped",
          participantName: localParticipant.name ?? localParticipant.identity,
        } satisfies RecordingPayload),
      ),
      { reliable: true },
    );
  }, [localParticipant.identity, localParticipant.name, send]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;

      const mimeType = getMediaRecorderMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeType || "video/webm",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `SignalHub-Recording-${new Date().toISOString().replace(/[:.]/g, "-")}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        chunksRef.current = [];
      };

      stream.getVideoTracks()[0].addEventListener("ended", stopRecording);

      recorder.start(1000);
      setRecording(true);

      send(
        new TextEncoder().encode(
          JSON.stringify({
            type: "recordingStarted",
            participantName:
              localParticipant.name ?? localParticipant.identity,
          } satisfies RecordingPayload),
        ),
        { reliable: true },
      );
    } catch {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, [localParticipant.identity, localParticipant.name, send, stopRecording]);

  useEffect(() => {
    return () => {
      recorderRef.current?.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <button
      type="button"
      onClick={recording ? stopRecording : startRecording}
      title={recording ? "Stop recording" : "Record meeting"}
      className={`lk-button lk-button-toggle flex items-center justify-center rounded-md h-10 w-10 transition-colors ${
        recording
          ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
          : "text-zinc-400 hover:bg-[var(--lk-control-hover-bg)] hover:text-zinc-100"
      }`}
    >
      {recording ? (
        <span className="block h-3.5 w-3.5 rounded-sm bg-red-500" />
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
        </svg>
      )}
    </button>
  );
}

function RecordingBanner() {
  const [recorder, setRecorder] = useState<string | null>(null);

  const onMessage = useCallback((msg: { payload?: Uint8Array }) => {
    if (!msg.payload?.length) return;
    try {
      const data = JSON.parse(
        new TextDecoder().decode(msg.payload),
      ) as RecordingPayload;
      if (data.type === "recordingStarted") {
        setRecorder(data.participantName || "Someone");
      } else if (data.type === "recordingStopped") {
        setRecorder(null);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useDataChannel(RECORDING_TOPIC, onMessage);

  if (!recorder) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-1.5 bg-red-950/60 border-b border-red-900/40 text-red-300 text-xs font-medium shrink-0 z-50">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
      </span>
      This meeting is being recorded by {recorder}
    </div>
  );
}
