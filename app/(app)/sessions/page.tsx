import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { findSessionsByUser } from "@/lib/repositories/session-repo";
import type { BriefSession } from "@/lib/types/entities";
import NewBriefButton from "./new-brief-button";

export default async function SessionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const sessions = await findSessionsByUser(supabase, user.id);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-bg-app)" }}
    >
      {/* Top nav */}
      <nav
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{
          backgroundColor: "var(--color-surface-primary)",
          borderColor: "var(--color-border)",
        }}
      >
        <span
          className="text-[18px] font-semibold"
          style={{ color: "var(--color-text-primary)" }}
        >
          Creative Brief
        </span>
        <form action="/api/auth/signout" method="post">
          <button
            type="submit"
            className="text-[13px]"
            style={{ color: "var(--color-text-muted)" }}
          >
            Sign out
          </button>
        </form>
      </nav>

      <main className="mx-auto max-w-[720px] px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1
            className="text-[28px] font-[650] leading-9"
            style={{ color: "var(--color-text-primary)" }}
          >
            Your Briefs
          </h1>
          <NewBriefButton />
        </div>

        {sessions.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="flex flex-col gap-3">
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function SessionCard({ session }: { session: BriefSession }) {
  const date = new Date(session.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <li>
      <Link
        href={`/sessions/${session.id}`}
        className="block rounded-2xl p-5 transition-colors hover:opacity-80"
        style={{
          backgroundColor: "var(--color-surface-primary)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="flex items-center justify-between">
          <span
            className="text-[18px] font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            {session.title ?? "Untitled Brief"}
          </span>
          <StatusBadge status={session.status} />
        </div>
        <p
          className="mt-1 text-[13px]"
          style={{ color: "var(--color-text-muted)" }}
        >
          {date}
        </p>
      </Link>
    </li>
  );
}

function StatusBadge({ status }: { status: BriefSession["status"] }) {
  const styles: Record<BriefSession["status"], React.CSSProperties> = {
    in_progress: { backgroundColor: "var(--color-accent-soft)", color: "var(--color-accent)" },
    completed:   { backgroundColor: "#DCFCE7", color: "var(--color-success)" },
    archived:    { backgroundColor: "var(--color-surface-secondary)", color: "var(--color-text-muted)" },
  };
  const labels: Record<BriefSession["status"], string> = {
    in_progress: "In progress",
    completed: "Completed",
    archived: "Archived",
  };

  return (
    <span
      className="rounded-full px-3 py-1 text-[12px] font-semibold"
      style={styles[status]}
    >
      {labels[status]}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className="mb-4 text-[40px]"
        style={{ color: "var(--color-border)" }}
        aria-hidden
      >
        ◻
      </div>
      <p
        className="text-[18px] font-semibold mb-1"
        style={{ color: "var(--color-text-primary)" }}
      >
        No briefs yet
      </p>
      <p
        className="text-[15px] mb-6"
        style={{ color: "var(--color-text-muted)" }}
      >
        Start your first brief to begin.
      </p>
      <NewBriefButton />
    </div>
  );
}
