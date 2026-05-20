"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSpeechRecognition } from "@/lib/hooks/use-speech-recognition";

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
  backHref?: string;
}

export function ChatInterface({ sessionId, onBriefStateUpdate, initialTitle, initialMessages, backHref }: Props) {
  const [input, setInput] = useState("");
  const [voiceMode, setVoiceMode] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const voiceModeRef = useRef(false);
  const pendingSubmitRef = useRef("");

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat", body: { sessionId } }),
    [sessionId]
  );

  // Speak text via SpeechSynthesis, then call onDone.
  function speak(text: string, onDone: () => void) {
    if (typeof window === "undefined" || !window.speechSynthesis) { onDone(); return; }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "nb-NO";
    utt.rate = 1.05;
    utt.onend = onDone;
    utt.onerror = onDone;
    // Voices may not be loaded yet — wait for them if needed.
    const trySpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const nbVoice = voices.find((v) => v.lang.startsWith("nb") || v.lang.startsWith("no"));
      if (nbVoice) utt.voice = nbVoice;
      window.speechSynthesis.speak(utt);
    };
    if (window.speechSynthesis.getVoices().length > 0) {
      trySpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = () => { trySpeak(); };
    }
  }

  const { messages, status, sendMessage } = useChat({
    transport,
    messages: initialMessages,
    onFinish: () => { onBriefStateUpdate(); },
  });

  const isStreaming = status === "streaming" || status === "submitted";
  const lastSpokenIdRef = useRef<string | null>(null);

  // Keep ref in sync so callbacks always see current value.
  useEffect(() => { voiceModeRef.current = voiceMode; }, [voiceMode]);

  // When streaming ends in voice mode, read the last assistant message aloud.
  useEffect(() => {
    if (isStreaming || !voiceMode) return;
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant || lastAssistant.id === lastSpokenIdRef.current) return;
    lastSpokenIdRef.current = lastAssistant.id;
    const text = lastAssistant.parts
      ?.filter((p) => p.type === "text")
      .map((p) => (p.type === "text" ? p.text : ""))
      .join("") ?? "";
    if (text) speak(text, () => { if (voiceModeRef.current) speechStart(); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStreaming, voiceMode]);

  const { state: speechState, toggle: toggleSpeech, start: speechStart } = useSpeechRecognition({
    onResult: (transcript) => {
      if (voiceModeRef.current) {
        // In voice mode: auto-send immediately.
        pendingSubmitRef.current = transcript;
        setInput(transcript);
      } else {
        setInput((prev) => (prev ? prev + " " + transcript : transcript));
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height =
            Math.min(textareaRef.current.scrollHeight, 120) + "px";
        }
      }
    },
    onEnd: () => {
      if (voiceModeRef.current && pendingSubmitRef.current.trim()) {
        const text = pendingSubmitRef.current;
        pendingSubmitRef.current = "";
        setInput("");
        sendMessage({ text });
      }
    },
  });

  function toggleVoiceMode() {
    const next = !voiceMode;
    setVoiceMode(next);
    voiceModeRef.current = next;
    if (next) {
      window.speechSynthesis?.cancel();
      speechStart();
    } else {
      window.speechSynthesis?.cancel();
      if (speechState === "listening") toggleSpeech();
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isStreaming && !voiceMode) {
      textareaRef.current?.focus();
    }
  }, [isStreaming, voiceMode]);

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
          padding: "16px 20px 14px",
          borderBottom: "1px solid var(--border-subtle)",
          flexShrink: 0,
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
        }}
      >
        {backHref && (
          <Link
            href={backHref}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              flexShrink: 0,
              marginTop: "2px",
              color: "var(--text-muted)",
              textDecoration: "none",
            }}
            aria-label="All briefs"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 3L5 8l5 5" />
            </svg>
          </Link>
        )}
        <div style={{ flex: 1 }}>
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
            {initialTitle ?? "Ny brief"}
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
            {isStreaming ? "Tenker…" : "Pågår"}
          </p>
        </div>
        {speechState !== "unavailable" && (
          <button
            onClick={toggleVoiceMode}
            title={voiceMode ? "Avslutt stemmesamtale" : "Start stemmesamtale"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "20px",
              border: voiceMode ? "1px solid rgba(212,175,55,0.5)" : "1px solid var(--border-subtle)",
              background: voiceMode ? "rgba(212,175,55,0.1)" : "transparent",
              color: voiceMode ? "var(--accent-primary)" : "var(--text-muted)",
              fontSize: "12px",
              cursor: "pointer",
              letterSpacing: "0.02em",
              transition: "all 180ms ease",
              flexShrink: 0,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4.5" y="1" width="5" height="8" rx="2.5" />
              <path d="M2 7.5a5 5 0 0 0 10 0" />
              <line x1="7" y1="12.5" x2="7" y2="11" />
            </svg>
            {voiceMode ? "Stemme på" : "Stemme"}
          </button>
        )}
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
              Beskriv prosjektet ditt for å starte.
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
              Briefen bygger seg opp etter hvert som samtalen utfolder seg.
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

      {/* Voice mode status bar */}
      {voiceMode && (
        <div
          style={{
            padding: "8px 20px",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            background: "rgba(212,175,55,0.04)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: speechState === "listening" ? "var(--accent-primary)" : "var(--text-muted)",
              animation: speechState === "listening" ? "pulse 1.4s ease-in-out infinite" : "none",
            }}
          />
          <span style={{ fontSize: "12px", color: "var(--text-muted)", letterSpacing: "0.02em" }}>
            {isStreaming ? "Tenker…" : speechState === "listening" ? "Lytter…" : "Venter…"}
          </span>
        </div>
      )}

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
            placeholder="Beskriv prosjektet ditt…"
            rows={1}
            autoFocus
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
          {speechState !== "unavailable" && (
            <MicButton state={speechState} onClick={toggleSpeech} disabled={isStreaming} />
          )}
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
          Enter for å sende · Shift+Enter for ny linje{speechState !== "unavailable" ? " · Mikrofon for tale" : ""}
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
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
                backdropFilter: "blur(12px)",
                color: "var(--text-primary)",
              }),
        }}
      >
        <span style={{ whiteSpace: "pre-wrap" }}>{text}</span>
      </div>
    </div>
  );
}

function MicButton({ state, onClick, disabled }: { state: "idle" | "listening"; onClick: () => void; disabled: boolean }) {
  const isListening = state === "listening";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={isListening ? "Stopp opptak" : "Tal inn svar"}
      style={{
        width: "36px",
        height: "36px",
        borderRadius: "8px",
        border: isListening ? "1px solid rgba(212,175,55,0.4)" : "1px solid var(--border-subtle)",
        flexShrink: 0,
        cursor: disabled ? "default" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: isListening ? "rgba(212,175,55,0.12)" : "transparent",
        transition: "background 180ms ease, border-color 180ms ease",
        animation: isListening ? "pulse 1.4s ease-in-out infinite" : "none",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={isListening ? "var(--accent-primary)" : "var(--text-muted)"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4.5" y="1" width="5" height="8" rx="2.5" />
        <path d="M2 7.5a5 5 0 0 0 10 0" />
        <line x1="7" y1="12.5" x2="7" y2="11" />
      </svg>
    </button>
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
        width: "44px",
        height: "44px",
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
