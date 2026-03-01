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
  useMaybeLayoutContext,
  useTrackToggle,
  useDisconnectButton,
  useMediaDeviceSelect,
  isTrackReference,
} from "@livekit/components-react";
import type {
  TrackReferenceOrPlaceholder,
  WidgetState,
} from "@livekit/components-core";
import { isEqualTrackRef, isWeb } from "@livekit/components-core";
import { RoomEvent, Track } from "livekit-client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  MessageSquare,
  PhoneOff,
  ChevronDown,
  Hand,
} from "lucide-react";
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
    <div className="relative w-full h-full min-h-0 min-w-0">
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
        <div className="flex flex-1 min-h-0 overflow-hidden">
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
            <CustomControlBar settings={settings} canRecord={canRecord} />
          </div>
          {settings.allowChat && (
            <CustomChat
              style={{
                display: widgetState.showChat ? "flex" : "none",
              }}
            />
          )}
        </div>
      </LayoutContextProvider>
      {micDisabled && isHost && (
        <GrantMicPanel meetupId={meetupId} />
      )}
      <RoomAudioRenderer />
      <ConnectionStateToast />
    </div>
  );
}

const ctrlBtn =
  "flex items-center justify-center gap-1.5 h-9 rounded-xl text-[13px] font-medium transition-all duration-150 select-none whitespace-nowrap";
const ctrlPill = `${ctrlBtn} px-3.5`;
const ctrlOn = "bg-zinc-700/80 text-white hover:bg-zinc-600/80";
const ctrlOff =
  "bg-transparent text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200";

function BarDivider() {
  return <div className="w-px h-5 bg-zinc-600/40 mx-1 shrink-0" />;
}

function MediaButton({
  icon,
  label,
  enabled,
  toggleProps,
  tooltip,
  devices,
  onDeviceSelect,
  deviceLabel,
}: {
  icon: React.ReactNode;
  label: string;
  enabled: boolean;
  toggleProps: React.ButtonHTMLAttributes<HTMLButtonElement>;
  tooltip: string;
  devices: MediaDeviceInfo[];
  onDeviceSelect: (deviceId: string) => void;
  deviceLabel: string;
}) {
  const { className: _, ...restToggle } = toggleProps;
  return (
    <div
      className={`flex items-center w-24 shrink-0 rounded-xl transition-colors duration-150 ${
        enabled ? ctrlOn : ctrlOff
      }`}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className={`${ctrlBtn} flex-1 min-w-0 px-2`} {...restToggle}>
            {icon}
            <span className="truncate">{label}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">{tooltip}</TooltipContent>
      </Tooltip>
      {devices.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="h-9 w-5 flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity pr-0.5"
            >
              <ChevronDown className="h-2.5 w-2.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            side="top"
            className="max-h-64 overflow-y-auto subtle-scrollbar"
          >
            {devices.map((d, i) => (
              <DropdownMenuItem
                key={d.deviceId}
                onClick={() => onDeviceSelect(d.deviceId)}
              >
                {d.label || `${deviceLabel} ${i + 1}`}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

function CustomControlBar({
  settings,
  canRecord,
}: {
  settings: MeetingSettings;
  canRecord: boolean;
}) {
  const layoutContext = useMaybeLayoutContext();
  const micToggle = useTrackToggle({ source: Track.Source.Microphone });
  const camToggle = useTrackToggle({ source: Track.Source.Camera });
  const screenShareToggle = useTrackToggle({
    source: Track.Source.ScreenShare,
  });
  const { buttonProps: leaveButtonProps } = useDisconnectButton({});
  const { className: _leaveCn, ...leaveProps } = leaveButtonProps;
  const micDevices = useMediaDeviceSelect({ kind: "audioinput" });
  const camDevices = useMediaDeviceSelect({ kind: "videoinput" });

  const showChat = layoutContext?.widget.state?.showChat ?? false;
  const unreadCount = layoutContext?.widget.state?.unreadMessages ?? 0;
  const showUnreadDot = unreadCount > 0;
  const toggleChat = () =>
    layoutContext?.widget.dispatch?.({ msg: "toggle_chat" });

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/40 p-1.5 shadow-2xl shadow-black/50">
      {settings.allowMic && (
        <MediaButton
          icon={
            micToggle.enabled ? (
              <Mic className="h-4 w-4" />
            ) : (
              <MicOff className="h-4 w-4" />
            )
          }
          label="Mic"
          enabled={micToggle.enabled}
          toggleProps={micToggle.buttonProps}
          tooltip="Toggle microphone"
          devices={micDevices.devices}
          onDeviceSelect={(id) => micDevices.setActiveMediaDevice(id)}
          deviceLabel="Microphone"
        />
      )}

      {settings.allowCamera && (
        <MediaButton
          icon={
            camToggle.enabled ? (
              <Video className="h-4 w-4" />
            ) : (
              <VideoOff className="h-4 w-4" />
            )
          }
          label="Cam"
          enabled={camToggle.enabled}
          toggleProps={camToggle.buttonProps}
          tooltip="Toggle camera"
          devices={camDevices.devices}
          onDeviceSelect={(id) => camDevices.setActiveMediaDevice(id)}
          deviceLabel="Camera"
        />
      )}

      {settings.allowScreenShare && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className={`${ctrlBtn} w-24 shrink-0 px-3 justify-center ${
                screenShareToggle.enabled ? ctrlOn : ctrlOff
              }`}
              {...screenShareToggle.buttonProps}
            >
              <MonitorUp className="h-4 w-4 shrink-0" />
              <span>Screen</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">Share screen</TooltipContent>
        </Tooltip>
      )}

      <BarDivider />

      {settings.allowChat && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className={`${ctrlPill} relative ${showChat ? ctrlOn : ctrlOff}`}
              onClick={toggleChat}
              aria-pressed={showChat}
              aria-label={showUnreadDot ? "Chat (unread messages)" : "Chat"}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Chat</span>
              {showUnreadDot && (
                <span
                  className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 ring-2 ring-zinc-900/80"
                  aria-hidden
                />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">Chat</TooltipContent>
        </Tooltip>
      )}

      <RaiseHandBarButton />
      {canRecord && <RecordButton />}

      <BarDivider />

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`${ctrlPill} bg-red-600/90 text-white hover:bg-red-500`}
            {...leaveProps}
          >
            <PhoneOff className="h-4 w-4" />
            <span>Leave</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">Leave meeting</TooltipContent>
      </Tooltip>
    </div>
  );
}

function RaiseHandBarButton() {
  const { isHandRaised, toggleHand } = useRaisedHands();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={toggleHand}
          className={`${ctrlPill} ${
            isHandRaised
              ? "bg-sky-500/15 ring-1 ring-sky-400/50 hover:bg-sky-500/25 text-white"
              : ctrlOff
          }`}
        >
          <Hand className="h-4 w-4" />
          <span>Hand</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">Raise hand</TooltipContent>
    </Tooltip>
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
        <ul className="space-y-1.5 max-h-48 overflow-y-auto subtle-scrollbar">
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
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          className={`${ctrlPill} ${
            recording
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              : ctrlOff
          }`}
        >
          {recording ? (
            <span className="block h-3 w-3 rounded-sm bg-red-500 shrink-0" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
            </svg>
          )}
          <span>{recording ? "Stop" : "Rec"}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{recording ? "Stop recording" : "Record meeting"}</TooltipContent>
    </Tooltip>
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
