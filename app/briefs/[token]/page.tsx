// CR-003: Public shared brief page — no auth required.

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { findSessionByShareToken } from "@/lib/repositories/session-repo";
import { findBriefStateBySession } from "@/lib/repositories/brief-state-repo";
import type { BriefState } from "@/lib/types/entities";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function SharedBriefPage({ params }: Props) {
  const { token } = await params;
  const supabase = await createClient();

  let session, briefState;
  try {
    session = await findSessionByShareToken(supabase, token);
    if (!session) notFound();
    briefState = await findBriefStateBySession(supabase, session.id);
    if (!briefState) notFound();
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "NEXT_NOT_FOUND") throw e;
    const isNotFound = e && typeof e === "object" && "digest" in e;
    if (isNotFound) throw e;
    notFound();
  }

  const generated = new Date(session.updated_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-primary)",
        padding: "60px 24px 80px",
      }}
    >
      <div style={{ maxWidth: "660px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "52px" }}>
          <p
            style={{
              fontSize: "11px",
              letterSpacing: "0.18em",
              fontWeight: 600,
              textTransform: "uppercase",
              color: "var(--accent-primary)",
              marginBottom: "16px",
              opacity: 0.9,
            }}
          >
            Creative Brief
          </p>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "40px",
              fontWeight: 500,
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
              marginBottom: "14px",
            }}
          >
            {session.title ?? "Untitled Brief"}
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-muted)",
              letterSpacing: "0.01em",
            }}
          >
            Generated {generated}
          </p>
        </div>

        {/* Brief sections */}
        <div
          style={{
            background: "var(--surface-primary)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "20px",
            overflow: "hidden",
          }}
        >
          <BriefSection label="Business goal"    value={briefState.business_goal}    first />
          <BriefSection label="Target audience"  value={briefState.target_audience} />
          <BriefSection label="Core message"     value={briefState.core_message} />
          <BriefSection label="Tone of voice"    value={briefState.tone_of_voice} />
          <BriefSection label="Visual direction" value={briefState.visual_direction} />
          {briefState.deliverables && briefState.deliverables.length > 0 && (
            <ListSection label="Deliverables" items={briefState.deliverables} />
          )}
          {briefState.constraints && briefState.constraints.length > 0 && (
            <ListSection
              label="Constraints & budget"
              items={briefState.constraints}
              last={!(briefState.deliverables && briefState.deliverables.length > 0)}
            />
          )}
        </div>

        {/* Footer */}
        <p
          style={{
            textAlign: "center",
            fontSize: "12px",
            color: "var(--text-muted)",
            marginTop: "40px",
            letterSpacing: "0.04em",
            opacity: 0.6,
          }}
        >
          Made with Creative Brief
        </p>
      </div>
    </div>
  );
}

function BriefSection({
  label,
  value,
  first,
}: {
  label: string;
  value: string | null;
  first?: boolean;
}) {
  return (
    <div
      style={{
        padding: "28px 32px",
        borderTop: first ? "none" : "1px solid var(--border-subtle)",
      }}
    >
      <p
        style={{
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: "10px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: "16px",
          lineHeight: 1.75,
          color: value ? "var(--text-primary)" : "rgba(122,122,120,0.4)",
          fontStyle: value ? "normal" : "italic",
          letterSpacing: value ? "-0.01em" : "0",
        }}
      >
        {value ?? "Not defined"}
      </p>
    </div>
  );
}

function ListSection({
  label,
  items,
  last,
}: {
  label: string;
  items: string[];
  last?: boolean;
}) {
  return (
    <div
      style={{
        padding: "28px 32px",
        borderTop: "1px solid var(--border-subtle)",
      }}
    >
      <p
        style={{
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: "12px",
        }}
      >
        {label}
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
        {items.map((item, i) => (
          <li
            key={i}
            style={{
              fontSize: "15px",
              lineHeight: 1.7,
              color: "var(--text-primary)",
              display: "flex",
              gap: "12px",
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                color: "var(--accent-primary)",
                flexShrink: 0,
                marginTop: "1px",
                opacity: 0.7,
                fontSize: "13px",
              }}
            >
              —
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
