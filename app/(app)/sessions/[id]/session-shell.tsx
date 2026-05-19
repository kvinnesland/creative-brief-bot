"use client";

// CR-002: SessionShell — client wrapper holding live briefState in React state.
// Receives initial data from the server component, refreshes after each chat turn.

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

  const refreshBriefState = useCallback(async () => {
    try {
      const res = await fetch(`/api/sessions/${session.id}/brief-state`);
      if (res.ok) {
        const data = await res.json();
        setBriefState(data);
      }
    } catch {
      // Silently ignore — stale brief state is acceptable; UI stays consistent.
    }
  }, [session.id]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "260px minmax(0, 1fr) 380px",
        gap: "16px",
        padding: "16px",
        height: "100vh",
        backgroundColor: "var(--color-bg-app)",
      }}
    >
      {/* ── Left panel: Session navigation ── */}
      <aside className="panel flex flex-col overflow-hidden">
        <div
          className="flex-none px-5 py-4 border-b"
          style={{ borderColor: "var(--color-border)" }}
        >
          <Link
            href="/sessions"
            className="text-[18px] font-semibold block"
            style={{ color: "var(--color-text-primary)" }}
          >
            Creative Brief
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <div
            className="rounded-xl px-3 py-2 text-[14px] font-semibold"
            style={{
              backgroundColor: "var(--color-accent-soft)",
              color: "var(--color-accent)",
            }}
          >
            {session.title ?? "Untitled Brief"}
          </div>
        </nav>

        <div
          className="flex-none px-4 py-4 border-t"
          style={{ borderColor: "var(--color-border)" }}
        >
          <Link
            href="/sessions"
            className="flex items-center gap-2 text-[13px]"
            style={{ color: "var(--color-text-muted)" }}
          >
            ← All briefs
          </Link>
        </div>
      </aside>

      {/* ── Center panel: Chat ── */}
      <main className="panel flex flex-col overflow-hidden">
        <ChatInterface
          sessionId={session.id}
          onBriefStateUpdate={refreshBriefState}
          initialTitle={session.title}
          initialMessages={initialMessages}
        />
      </main>

      {/* ── Right panel: Live brief state ── */}
      <aside className="panel flex flex-col overflow-hidden">
        <BriefPanel briefState={briefState} />
      </aside>
    </div>
  );
}
