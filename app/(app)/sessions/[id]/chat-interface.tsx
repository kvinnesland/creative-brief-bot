"use client";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat", body: { sessionId } }),
    [sessionId]
  );

  const { messages, status, sendMessage } = useChat({
    transport,
    messages: initialMessages,
    onFinish: () => { onBriefStateUpdate(); },
  });

  const isStreaming = status === "streaming" || status === "submitted";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function submit() {
    if (!input.trim() || isStreaming) return;
    sendMessage({ text: input });
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  }

  const isEmpty = messages.length === 0;

  return (
    <>
      {/* Header */}
      <div
        style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid var(--border-subtle)",
          flexShrink: 0,
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "20px",
            fontWeight: 500,
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
            lineHeight: 1.2,
          }}
        >
          {initialTitle ?? "New Brief"}
        </h1>
        <p
          style={{
            fontSize: "12px",
            marginTop: "4px",
            color: isStreaming ? "var(--accent-primary)" : "var(--text-muted)",
            letterSpacing: "0.01em",
            transition: "color 300ms ease",
          }}
        >
          {isStreaming ? "Thinking…" : "In progress"}
        </p>
      </div>

      {/* Message thread */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {isEmpty ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "40px 0",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "1px",
                background: "linear-gradient(90deg, transparent, var(--border-strong), transparent)",
                marginBottom: "24px",
              }}
            />
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "18px",
                fontWeight: 400,
                color: "var(--text-secondary)",
                maxWidth: "280px",
                lineHeight: 1.6,
                letterSpacing: "-0.01em",
              }}
            >
              Describe your project to begin.
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "var(--text-muted)",
                maxWidth: "260px",
                lineHeight: 1.6,
                marginTop: "10px",
              }}
            >
              The brief will build itself as the conversation unfolds.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const text = m.parts
              ?.filter((p) => p.type === "text")
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("") ?? "";

            return (
              <MessageBubble key={m.id} role={m.role} text={text} />
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div
        style={{
          padding: "16px 20px 20px",
          borderTop: "1px solid var(--border-subtle)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "12px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "16px",
            padding: "12px 14px",
            transition: "border-color 180ms ease",
          }}
          onFocusCapture={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-strong)")}
          onBlurCapture={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-subtle)")}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Describe your project…"
            rows={1}
            disabled={isStreaming}
            style={{
              flex: 1,
              resize: "none",
              background: "transparent",
              fontSize: "14px",
              outline: "none",
              border: "none",
              color: "var(--text-primary)",
              lineHeight: 1.6,
              maxHeight: "120px",
              overflow: "auto",
              fontFamily: "var(--font-sans)",
            }}
          />
          <SendButton onClick={submit} disabled={!input.trim() || isStreaming} />
        </div>
        <p
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            textAlign: "center",
            marginTop: "10px",
            letterSpacing: "0.02em",
          }}
        >
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </>
  );
}

function MessageBubble({ role, text }: { role: "user" | "assistant"; text: string }) {
  const isUser = role === "user";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        alignItems: "flex-end",
        gap: "10px",
      }}
    >
      {!isUser && (
        <div
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "6px",
            background: "var(--accent-soft)",
            border: "1px solid rgba(212,175,55,0.2)",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--accent-primary)",
            }}
          />
        </div>
      )}

      <div
        style={{
          maxWidth: "78%",
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          padding: "12px 16px",
          fontSize: "14px",
          lineHeight: 1.7,
          ...(isUser
            ? {
                background: "linear-gradient(180deg, rgba(212,175,55,0.22) 0%, rgba(212,175,55,0.14) 100%)",
                border: "1px solid rgba(212,175,55,0.2)",
                color: "var(--text-primary)",
              }
            : {
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(12px)",
                color: "var(--text-secondary)",
              }),
        }}
      >
        <span style={{ whiteSpace: "pre-wrap" }}>{text}</span>
      </div>
    </div>
  );
}

function SendButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "34px",
        height: "34px",
        borderRadius: "10px",
        border: "none",
        flexShrink: 0,
        cursor: disabled ? "default" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: disabled
          ? "rgba(255,255,255,0.05)"
          : hovered
          ? "var(--accent-hover)"
          : "var(--accent-primary)",
        transition: "background 180ms ease, box-shadow 180ms ease",
        boxShadow: !disabled && hovered ? "0 0 16px rgba(212,175,55,0.3)" : "none",
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        stroke={disabled ? "var(--text-muted)" : "#111111"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 7h10M7 2l5 5-5 5" />
      </svg>
    </button>
  );
}
