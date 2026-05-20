import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { findSessionsByUser } from "@/lib/repositories/session-repo";
import NewBriefButton from "./new-brief-button";
import { SessionCard } from "./session-card";

export default async function SessionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const sessions = await findSessionsByUser(supabase, user.id);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
      {/* Top nav */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          height: "60px",
          borderBottom: "1px solid var(--border-subtle)",
          backgroundColor: "var(--surface-primary)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "18px",
            fontWeight: 500,
            color: "var(--text-primary)",
            letterSpacing: "-0.01em",
          }}
        >
          Creative Brief
        </span>
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
            }}
          >
            Sign out
          </button>
        </form>
      </nav>

      <main style={{ maxWidth: "680px", margin: "0 auto", padding: "56px 24px" }}>
        {/* Page header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "40px",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "11px",
                letterSpacing: "0.14em",
                fontWeight: 600,
                textTransform: "uppercase",
                color: "var(--text-muted)",
                marginBottom: "8px",
              }}
            >
              Your workspace
            </p>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "34px",
                fontWeight: 500,
                lineHeight: 1.2,
                letterSpacing: "-0.03em",
                color: "var(--text-primary)",
              }}
            >
              Briefs
            </h1>
          </div>
          <NewBriefButton />
        </div>

        {sessions.length === 0 ? (
          <EmptyState />
        ) : (
          <ul style={{ display: "flex", flexDirection: "column", gap: "10px", listStyle: "none", padding: 0, margin: 0 }}>
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 0",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          border: "1px solid var(--border-strong)",
          borderRadius: "12px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
          <rect x="3" y="3" width="14" height="14" rx="2" />
          <path d="M7 10h6M10 7v6" />
        </svg>
      </div>
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "20px",
          fontWeight: 500,
          color: "var(--text-primary)",
          marginBottom: "8px",
          letterSpacing: "-0.01em",
        }}
      >
        No briefs yet
      </p>
      <p
        style={{
          fontSize: "14px",
          color: "var(--text-muted)",
          marginBottom: "28px",
          lineHeight: 1.6,
        }}
      >
        Start a conversation to build your first creative brief.
      </p>
      <NewBriefButton />
    </div>
  );
}
