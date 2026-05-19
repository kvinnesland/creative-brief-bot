// CR-003: Public shared brief page — no auth required.
// Readable by anyone with the share token.

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
    // notFound() throws internally — re-throw it; swallow real DB errors as 404.
    if (e instanceof Error && e.message === "NEXT_NOT_FOUND") throw e;
    const isNotFound = e && typeof e === "object" && "digest" in e;
    if (isNotFound) throw e;
    notFound();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-bg-app)",
        padding: "40px 24px",
      }}
    >
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        {/* Header */}
        <div className="mb-8">
          <p className="text-[13px] mb-2" style={{ color: "var(--color-text-muted)" }}>
            Creative Brief
          </p>
          <h1
            className="text-[32px] font-[650] leading-tight tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            {session.title ?? "Untitled Brief"}
          </h1>
          <p className="text-[14px] mt-2" style={{ color: "var(--color-text-muted)" }}>
            Generated{" "}
            {new Date(session.updated_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Brief sections */}
        <div className="panel p-8 flex flex-col gap-8">
          <BriefSection label="Business goal" value={briefState.business_goal} />
          <BriefSection label="Target audience" value={briefState.target_audience} />
          <BriefSection label="Core message" value={briefState.core_message} />
          <BriefSection label="Tone of voice" value={briefState.tone_of_voice} />
          <BriefSection label="Visual direction" value={briefState.visual_direction} />
          {briefState.deliverables && briefState.deliverables.length > 0 && (
            <ListSection label="Deliverables" items={briefState.deliverables} />
          )}
          {briefState.constraints && briefState.constraints.length > 0 && (
            <ListSection label="Constraints & budget" items={briefState.constraints} />
          )}
        </div>

        <p className="text-center text-[12px] mt-8" style={{ color: "var(--color-text-muted)" }}>
          Made with Creative Brief Agent
        </p>
      </div>
    </div>
  );
}

function BriefSection({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p
        className="text-[12px] font-semibold uppercase tracking-widest mb-2"
        style={{ color: "var(--color-text-muted)" }}
      >
        {label}
      </p>
      <p
        className="text-[16px] leading-relaxed"
        style={{ color: value ? "var(--color-text-primary)" : "var(--color-text-muted)" }}
      >
        {value ?? "Not yet defined"}
      </p>
    </div>
  );
}

function ListSection({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p
        className="text-[12px] font-semibold uppercase tracking-widest mb-2"
        style={{ color: "var(--color-text-muted)" }}
      >
        {label}
      </p>
      <ul className="flex flex-col gap-1">
        {items.map((item, i) => (
          <li key={i} className="text-[16px] leading-relaxed flex gap-2" style={{ color: "var(--color-text-primary)" }}>
            <span style={{ color: "var(--color-text-muted)" }}>—</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
