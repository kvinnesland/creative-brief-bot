import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { findSessionsByUser, createSession } from "@/lib/repositories/session-repo";
import { createBriefState } from "@/lib/repositories/brief-state-repo";

export default async function SessionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const sessions = await findSessionsByUser(supabase, user.id);
  if (sessions.length > 0) redirect(`/sessions/${sessions[0].id}`);

  const session = await createSession(supabase, user.id);
  await createBriefState(supabase, session.id);
  redirect(`/sessions/${session.id}`);
}
