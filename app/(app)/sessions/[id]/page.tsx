// CR-002: Session detail page — server component, passes initial data to SessionShell.

import { redirect, notFound } from "next/navigation";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { findSessionById } from "@/lib/repositories/session-repo";
import { findBriefStateBySession } from "@/lib/repositories/brief-state-repo";
import { findMessagesBySession } from "@/lib/repositories/message-repo";
import { SessionShell } from "./session-shell";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SessionDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const session = await findSessionById(supabase, id);
  if (!session || session.user_id !== user.id) notFound();

  const [briefState, dbMessages] = await Promise.all([
    findBriefStateBySession(supabase, id),
    findMessagesBySession(supabase, id),
  ]);

  // Convert DB messages to the UIMessage format expected by useChat (AI SDK v6).
  const initialMessages = dbMessages.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    parts: [{ type: "text" as const, text: m.content }],
  }));

  return (
    <SessionShell
      session={session}
      initialBriefState={briefState}
      initialMessages={initialMessages}
    />
  );
}
