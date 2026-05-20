"use client";
// CR-006: Mobile-responsive shell. Desktop: 3-column grid. Mobile (<640px): single-column + bottom tab bar.

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChatInterface } from "./chat-interface";
import { BriefPanel } from "./brief-panel";
import type { BriefState, BriefSession } from "@/lib/types/entities";
import { useWindowWidth } from "@/lib/hooks/use-window-width";
import { calcCompletionPct } from "@/lib/utils/brief-progress";
import Link from "next/link";

interface UIMessage {
  id: string;
  role: "user" | "assistant";
  parts: { type: "text"; text: string }[];
}

interface Props {
  session: BriefSession;
  initialBriefState: BriefState | null;
  initialMessages: UIMessage[];
}

export function SessionShell({ session, initialBriefState, initialMessages }: Props) {
  const router = useRouter();
  const [briefState, setBriefState] = useState<BriefState | null>(initialBriefState);
  const [title, setTitle] = useState<string | null>(session.title);
  const [activeTab, setActiveTab] = useState<"chat" | "brief">("chat");
  const [allSessions, setAllSessions] = useState<BriefSession[]>([]);
  const [creatingBrief, setCreatingBrief] = useState(false);
  const [hoveredSessionId, setHoveredSessionId] = useState<string | null>(null);
  const width = useWindowWidth();
  const isMobile = width < 640;

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => (r.ok ? r.json() : []))
      .then(setAllSessions)
      .catch(() => {});
  }, [session.id]);

  const createNewBrief = useCallback(async () => {
    if (creatingBrief) return;
    setCreatingBrief(true);
    try {
      const res = await fetch("/api/sessions", { method: "POST" });
      if (!res.ok) throw new Error();
      const newSession = await res.json();
      router.push(`/sessions/${newSession.id}`);
    } catch {
      setCreatingBrief(false);
    }
  }, [creatingBrief, router]);

  const refreshBriefState = useCallback(async () => {
    try {
      const [briefRes, sessionRes] = await Promise.all([
        fetch(`/api/sessions/${session.id}/brief-state`),
        fetch(`/api/sessions/${session.id}`),
      ]);
      if (briefRes.ok) setBriefState(await briefRes.json());
      if (sessionRes.ok) {
        const s = await sessionRes.json();
        if (s.title) setTitle(s.title);
      }
    } catch {
      // Stale state is acceptable — UI stays consistent.
    }
  }, [session.id]);

  const progress = calcCompletionPct(briefState);

  if (isMobile) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100dvh",
          backgroundColor: "var(--bg-primary)",
          overflow: "hidden",
        }}
      >
        {/* Content area — both panels always mounted so brief polling continues uninterrupted */}
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: activeTab === "chat" ? "flex" : "none",
              flexDirection: "column",
              background: "var(--surface-primary)",
            }}
          >
            <ChatInterface
              sessionId={session.id}
              onBriefStateUpdate={refreshBriefState}
              initialTitle={title}
              initialMessages={initialMessages}
              backHref="/sessions"
            />
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: activeTab === "brief" ? "flex" : "none",
              flexDirection: "column",
              background: "var(--surface-primary)",
              overflowY: "auto",
            }}
          >
            <BriefPanel sessionId={session.id} briefState={briefState} />
          </div>
        </div>

        {/* Bottom tab bar */}
        <nav
          style={{
            display: "flex",
            borderTop: "1px solid var(--border-subtle)",
            backgroundColor: "var(--surface-primary)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
            flexShrink: 0,
          }}
        >
          {/* Chat tab */}
          <button
            onClick={() => setActiveTab("chat")}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "56px",
              border: "none",
              background: "none",
              cursor: "pointer",
              gap: "4px",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke={activeTab === "chat" ? "var(--accent-primary)" : "var(--text-muted)"}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 3h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6l-3 3V4a1 1 0 0 1 1-1z" />
            </svg>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: activeTab === "chat" ? "var(--accent-primary)" : "var(--text-muted)",
              }}
            >
              Chat
            </span>
          </button>

          {/* Divider */}
          <div style={{ width: "1px", background: "var(--border-subtle)", margin: "10px 0" }} />

          {/* Brief tab with progress indicator */}
          <button
            onClick={() => setActiveTab("brief")}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "56px",
              border: "none",
              background: "none",
              cursor: "pointer",
              gap: "5px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <svg
                width="15"
                height="15"
                viewBox="0 0 16 16"
                fill="none"
                stroke={activeTab === "brief" ? "var(--accent-primary)" : "var(--text-muted)"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="12" height="12" rx="2" />
                <path d="M5 6h6M5 9h4" />
              </svg>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: activeTab === "brief" ? "var(--accent-primary)" : "var(--text-muted)",
                }}
              >
                Brief
              </span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: progress > 0 ? "var(--accent-primary)" : "var(--text-muted)",
                  minWidth: "28px",
                }}
              >
                {progress}%
              </span>
            </div>
            {/* Thin gold progress bar */}
            <div
              style={{
                width: "64px",
                height: "2px",
                borderRadius: "1px",
                background: "var(--border-subtle)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: "var(--accent-primary)",
                  borderRadius: "1px",
                  transition: "width 600ms ease",
                  boxShadow: progress > 0 ? "0 0 6px rgba(212,175,55,0.4)" : "none",
                }}
              />
            </div>
          </button>
        </nav>
      </div>
    );
  }

  // ── Desktop layout (unchanged) ──
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "300px minmax(0, 1fr) 420px",
        gap: "20px",
        padding: "20px",
        height: "100vh",
        backgroundColor: "var(--bg-primary)",
        boxSizing: "border-box",
      }}
    >
      {/* ── Left panel: Sidebar ── */}
      <aside
        style={{
          background: "var(--surface-primary)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "16px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{ padding: "20px 20px 14px", borderBottom: "1px solid var(--border-subtle)" }}>
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "16px",
              fontWeight: 500,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
              display: "block",
            }}
          >
            Creative Brief
          </span>
        </div>

        {/* Ny brief */}
        <div style={{ padding: "12px 12px 4px" }}>
          <button
            onClick={createNewBrief}
            disabled={creatingBrief}
            style={{
              width: "100%",
              height: "34px",
              borderRadius: "999px",
              border: "1px solid rgba(212,175,55,0.25)",
              background: "var(--accent-soft)",
              color: "var(--accent-primary)",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.04em",
              cursor: creatingBrief ? "default" : "pointer",
              opacity: creatingBrief ? 0.6 : 1,
              transition: "background 150ms ease",
            }}
          >
            {creatingBrief ? "Oppretter…" : "+ Ny brief"}
          </button>
        </div>

        {/* Sessions list */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "8px 12px 12px" }}>
          <p
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              padding: "8px 10px 6px",
            }}
          >
            Aktiv
          </p>
          <div
            style={{
              borderRadius: "10px",
              padding: "9px 12px",
              background: "var(--accent-soft)",
              border: "1px solid rgba(212,175,55,0.15)",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--accent-primary)",
                lineHeight: 1.4,
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {title ?? "Uten tittel"}
            </p>
          </div>

          {allSessions.filter((s) => s.id !== session.id).length > 0 && (
            <>
              <p
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  padding: "16px 10px 6px",
                }}
              >
                Tidligere sesjoner
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                {allSessions
                  .filter((s) => s.id !== session.id)
                  .map((s) => (
                    <Link
                      key={s.id}
                      href={`/sessions/${s.id}`}
                      style={{
                        display: "block",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        fontSize: "13px",
                        color: hoveredSessionId === s.id ? "var(--text-primary)" : "var(--text-secondary)",
                        background: hoveredSessionId === s.id ? "var(--surface-secondary)" : "transparent",
                        textDecoration: "none",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        transition: "background 120ms ease, color 120ms ease",
                      }}
                      onMouseEnter={() => setHoveredSessionId(s.id)}
                      onMouseLeave={() => setHoveredSessionId(null)}
                    >
                      {s.title ?? "Uten tittel"}
                    </Link>
                  ))}
              </div>
            </>
          )}
        </nav>

        {/* Sign out */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border-subtle)" }}>
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              style={{
                background: "none",
                border: "none",
                fontSize: "13px",
                color: "var(--text-muted)",
                cursor: "pointer",
                letterSpacing: "0.01em",
                padding: 0,
              }}
            >
              Logg ut
            </button>
          </form>
        </div>
      </aside>

      {/* ── Center panel: Chat ── */}
      <main
        style={{
          background: "var(--surface-primary)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "16px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ChatInterface
          sessionId={session.id}
          onBriefStateUpdate={refreshBriefState}
          initialTitle={title}
          initialMessages={initialMessages}
        />
      </main>

      {/* ── Right panel: Brief ── */}
      <aside
        style={{
          background: "var(--surface-primary)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "16px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <BriefPanel sessionId={session.id} briefState={briefState} />
      </aside>
    </div>
  );
}
