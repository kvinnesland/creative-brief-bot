// CR-001: Session repository — Supabase queries for BriefSession.
// No business logic here; callers are responsible for auth context.

import { SupabaseClient } from "@supabase/supabase-js";
import type { BriefSession, SessionStatus } from "@/lib/types/entities";

export async function createSession(
  supabase: SupabaseClient,
  userId: string
): Promise<BriefSession> {
  const { data, error } = await supabase
    .from("brief_sessions")
    .insert({ user_id: userId, status: "in_progress" as SessionStatus })
    .select()
    .single();

  if (error) throw error;
  return data as BriefSession;
}

export async function findSessionsByUser(
  supabase: SupabaseClient,
  userId: string
): Promise<BriefSession[]> {
  const { data, error } = await supabase
    .from("brief_sessions")
    .select()
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as BriefSession[];
}

export async function findSessionById(
  supabase: SupabaseClient,
  id: string
): Promise<BriefSession | null> {
  const { data, error } = await supabase
    .from("brief_sessions")
    .select()
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw error;
  }
  return data as BriefSession;
}
