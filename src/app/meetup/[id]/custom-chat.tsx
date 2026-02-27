"use client";

import { useRef, useEffect, useMemo, type KeyboardEvent } from "react";
import {
  ChatEntry,
  ChatToggle,
  useChat,
  useMaybeLayoutContext,
} from "@livekit/components-react";
import type { ChatMessage, ChatOptions } from "@livekit/components-core";

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const textarea = textareaRef.current;
    if (!textarea || textarea.value.trim() === "") return;
    await send(textarea.value);
    textarea.value = "";
    textarea.style.height = "auto";
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
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
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
    <div {...props} className="lk-chat">
      <div className="lk-chat-header">
        Messages
        {layoutContext && (
          <ChatToggle className="lk-close-button">
            <CloseIcon />
          </ChatToggle>
        )}
      </div>

      <ul className="lk-list lk-chat-messages" ref={listRef}>
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

      <form className="lk-chat-form" onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          className="lk-form-control lk-chat-form-input"
          disabled={isSending}
          placeholder="Enter a message..."
          rows={1}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
        />
        <button
          type="submit"
          className="lk-button lk-chat-form-button"
          disabled={isSending}
        >
          Send
        </button>
      </form>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
