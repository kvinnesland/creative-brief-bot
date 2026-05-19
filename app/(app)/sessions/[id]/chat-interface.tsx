"use client";

// CR-002: Chat interface — useChat hook (AI SDK v6), message thread, textarea.
// In v6, api/body are configured via DefaultChatTransport on the transport option.

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect, useMemo } from "react";

interface UIMessage {
  id: string;
  role: "user" | "assistant";
  parts: { type: "text"; text: string }[];
}

interface Props {
  sessionId: string;
  onBriefStateUpdate: () => void;
  initialTitle: string | null;
  initialMessages: UIMessage[];
}

export function ChatInterface({ sessionId, onBriefStateUpdate, initialTitle, initialMessages }: Props) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { sessionId },
      }),
    [sessionId]
  );

  const { messages, status, sendMessage } = useChat({
    transport,
    messages: initialMessages,
    onFinish: () => {
      onBriefStateUpdate();
    },
  });

  const isStreaming = status === "streaming" || status === "submitted";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function submit() {
    if (!input.trim() || isStreaming) return;
    sendMessage({ text: input });
    setInput("");
  }

  const isEmpty = messages.length === 0;

  return (
    <>
      {/* Header */}
      <div
        className="flex-none px-5 py-4 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <h1
          className="text-[18px] font-semibold"
          style={{ color: "var(--color-text-primary)" }}
        >
          {initialTitle ?? "New Brief"}
        </h1>
        <p className="text-[13px] mt-0.5" style={{ color: "var(--color-text-muted)" }}>
          {isStreaming ? "Thinking…" : "In progress"}
        </p>
      </div>

      {/* Message thread */}
      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-4">
        {isEmpty ? (
          <div className="flex-1 flex items-center justify-center">
            <p
              className="text-[15px] text-center max-w-sm"
              style={{ color: "var(--color-text-muted)" }}
            >
              Describe your project to get started. The AI will ask follow-up
              questions and build your brief in real time.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const text = m.parts
              ?.filter((p) => p.type === "text")
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("") ?? "";

            return (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="max-w-[80%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed"
                  style={
                    m.role === "user"
                      ? {
                          backgroundColor: "var(--color-accent)",
                          color: "var(--color-text-inverted)",
                          borderBottomRightRadius: "6px",
                        }
                      : {
                          backgroundColor: "var(--color-surface-secondary)",
                          color: "var(--color-text-primary)",
                          borderBottomLeftRadius: "6px",
                        }
                  }
                >
                  <span style={{ whiteSpace: "pre-wrap" }}>{text}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div
        className="flex-none px-4 py-4 border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div
          className="flex items-end gap-3 rounded-xl px-4 py-3"
          style={{
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface-secondary)",
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Describe your project…"
            rows={1}
            disabled={isStreaming}
            className="flex-1 resize-none bg-transparent text-[15px] outline-none"
            style={{
              color: "var(--color-text-primary)",
              maxHeight: "120px",
            }}
          />
          <button
            onClick={submit}
            disabled={!input.trim() || isStreaming}
            className="h-9 rounded-full px-4 text-[14px] font-semibold flex-none transition-opacity"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "var(--color-text-inverted)",
              opacity: !input.trim() || isStreaming ? 0.4 : 1,
            }}
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}
