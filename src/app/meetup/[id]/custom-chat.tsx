"use client";

import { useRef, useEffect, useMemo, useState, type KeyboardEvent } from "react";
import {
  ChatEntry,
  useChat,
  useMaybeLayoutContext,
} from "@livekit/components-react";
import type { ChatMessage, ChatOptions } from "@livekit/components-core";
import { X, Send } from "lucide-react";

type Props = React.HTMLAttributes<HTMLDivElement> & ChatOptions;

export function CustomChat({
  messageDecoder,
  messageEncoder,
  channelTopic,
  ...props
}: Props) {
  const listRef = useRef<HTMLUListElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const chatOptions: ChatOptions = useMemo(
    () => ({ messageDecoder, messageEncoder, channelTopic }),
    [messageDecoder, messageEncoder, channelTopic],
  );

  const { chatMessages, send, isSending } = useChat(chatOptions);
  const layoutContext = useMaybeLayoutContext();
  const lastReadMsgAt = useRef<ChatMessage["timestamp"]>(0);
  const [hasText, setHasText] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const textarea = textareaRef.current;
    if (!textarea || textarea.value.trim() === "") return;
    await send(textarea.value);
    textarea.value = "";
    textarea.style.height = "auto";
    setHasText(false);
    textarea.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = textareaRef.current?.closest("form");
      if (form) form.requestSubmit();
    }
  }

  function handleInput() {
    const el = textareaRef.current;
    if (!el) return;
    setHasText(el.value.trim().length > 0);
    el.style.height = "auto";
    const max = 96;
    const next = Math.min(el.scrollHeight, max);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
  }

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [chatMessages]);

  useEffect(() => {
    if (!layoutContext || chatMessages.length === 0) return;

    if (
      layoutContext.widget.state?.showChat &&
      chatMessages.length > 0 &&
      lastReadMsgAt.current !== chatMessages[chatMessages.length - 1]?.timestamp
    ) {
      lastReadMsgAt.current = chatMessages[chatMessages.length - 1]?.timestamp;
      if (layoutContext.widget.state?.unreadMessages !== 0) {
        layoutContext.widget.dispatch?.({ msg: "unread_msg", count: 0 });
      }
      return;
    }

    const unreadCount = chatMessages.filter(
      (msg) => !lastReadMsgAt.current || msg.timestamp > lastReadMsgAt.current,
    ).length;

    const { widget } = layoutContext;
    if (unreadCount > 0 && widget.state?.unreadMessages !== unreadCount) {
      widget.dispatch?.({ msg: "unread_msg", count: unreadCount });
    }
  }, [chatMessages, layoutContext?.widget]);

  return (
    <div
      {...props}
      className="flex flex-col w-80 shrink-0 border-l border-zinc-800 bg-[#0f0f11]"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/60 shrink-0">
        <h3 className="text-sm font-semibold text-zinc-200 tracking-tight">
          Messages
        </h3>
        {layoutContext && (
          <button
            type="button"
            onClick={() =>
              layoutContext.widget.dispatch?.({ msg: "toggle_chat" })
            }
            className="text-zinc-500 hover:text-zinc-200 transition-colors p-1 -mr-1 rounded-lg hover:bg-zinc-800/60"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <ul
        className="lk-list lk-chat-messages flex-1 min-h-0 overflow-y-auto"
        ref={listRef}
      >
        {chatMessages.length === 0 && (
          <li className="flex items-center justify-center h-full text-zinc-600 text-xs select-none">
            No messages yet
          </li>
        )}
        {chatMessages.map((msg, idx, all) => {
          const hideName = idx >= 1 && all[idx - 1].from === msg.from;
          const hideTimestamp =
            idx >= 1 && msg.timestamp - all[idx - 1].timestamp < 60_000;
          return (
            <ChatEntry
              key={msg.id ?? idx}
              hideName={hideName}
              hideTimestamp={hideName === false ? false : hideTimestamp}
              entry={msg}
            />
          );
        })}
      </ul>

      <form
        className="p-3 border-t border-zinc-800/60 shrink-0"
        onSubmit={handleSubmit}
      >
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            className="flex-1 rounded-xl bg-zinc-800/80 border border-zinc-700/40 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 resize-none focus:outline-none focus:border-zinc-600 transition-colors no-scrollbar"
            style={{
              minHeight: "36px",
              maxHeight: "96px",
              overflowY: "hidden",
              overflowWrap: "break-word",
              wordBreak: "break-word",
              lineHeight: "1.4",
            }}
            disabled={isSending}
            placeholder="Type a message..."
            rows={1}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
          />
          <button
            type="submit"
            disabled={isSending || !hasText}
            className={`shrink-0 h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-150 ${
              hasText && !isSending
                ? "bg-emerald-600 text-white hover:bg-emerald-500"
                : "bg-zinc-800/60 text-zinc-600"
            }`}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
