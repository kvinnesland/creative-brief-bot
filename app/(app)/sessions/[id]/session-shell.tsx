"use client";

import { useState, useCallback } from "react";
import { ChatInterface } from "./chat-interface";
import { BriefPanel } from "./brief-panel";
import type { BriefState, BriefSession } from "@/lib/types/entities";
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
  const [briefState, setBriefState] = useState<BriefState | null>(initialBriefState);
  const [title, setTitle] = useState<string | null>(session.title);

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
        {/* Sidebar header */}
        <div
          style={{
            padding: "20px 20px 16px",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <Link
            href="/sessions"
            style={{ textDecoration: "none" }}
          >
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
          </Link>
        </div>

        {/* Active brief item */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
          <p
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              padding: "4px 10px 8px",
            }}
          >
            Active
          </p>
          <div
            style={{
              borderRadius: "10px",
              padding: "10px 12px",
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
              }}
            >
              {title ?? "Untitled Brief"}
            </p>
          </div>
        </nav>

        {/* Sidebar footer */}
        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <Link
            href="/sessions"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              color: "var(--text-muted)",
              textDecoration: "none",
              transition: "color 180ms ease",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)")}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M9 2L4 7l5 5" />
            </svg>
            All briefs
          </Link>
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
