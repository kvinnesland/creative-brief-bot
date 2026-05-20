"use client";

import Link from "next/link";
import { useState } from "react";
import type { BriefSession } from "@/lib/types/entities";

export function SessionCard({ session }: { session: BriefSession }) {
  const [hovered, setHovered] = useState(false);

  const date = new Date(session.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <li>
      <Link
        href={`/sessions/${session.id}`}
        style={{ textDecoration: "none", display: "block" }}
      >
        <div
          style={{
            background: hovered ? "var(--surface-secondary)" : "var(--surface-primary)",
            border: `1px solid ${hovered ? "var(--border-strong)" : "var(--border-subtle)"}`,
            borderRadius: "14px",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "border-color 180ms ease, background 180ms ease",
            cursor: "pointer",
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "17px",
                fontWeight: 500,
                color: "var(--text-primary)",
                letterSpacing: "-0.01em",
                marginBottom: "4px",
              }}
            >
              {session.title ?? "Untitled Brief"}
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                letterSpacing: "0.01em",
              }}
            >
              {date}
            </p>
          </div>
          <StatusBadge status={session.status} />
        </div>
      </Link>
    </li>
  );
}

function StatusBadge({ status }: { status: BriefSession["status"] }) {
  const configs: Record<BriefSession["status"], { bg: string; color: string; label: string }> = {
    in_progress: { bg: "var(--accent-soft)", color: "var(--accent-primary)", label: "In progress" },
    completed:   { bg: "rgba(39,174,96,0.1)", color: "#4CAF7D", label: "Completed" },
    archived:    { bg: "rgba(255,255,255,0.04)", color: "var(--text-muted)", label: "Archived" },
  };
  const { bg, color, label } = configs[status];

  return (
    <span
      style={{
        borderRadius: "999px",
        padding: "4px 12px",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        backgroundColor: bg,
        color,
        flexShrink: 0,
      }}
    >
      {label}
    </span>
  );
}
