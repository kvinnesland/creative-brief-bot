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

export async function generateShareToken(
  supabase: SupabaseClient,
  id: string
): Promise<string> {
  // Use Postgres gen_random_uuid() via a DB function call to generate the token.
  const token = crypto.randomUUID();
  const { error } = await supabase
    .from("brief_sessions")
    .update({ share_token: token })
    .eq("id", id);
  if (error) throw error;
  return token;
}

export async function findSessionByShareToken(
  supabase: SupabaseClient,
  token: string
): Promise<BriefSession | null> {
  const { data, error } = await supabase
    .from("brief_sessions")
    .select()
    .eq("share_token", token)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as BriefSession;
}

export async function updateSessionTitle(
  supabase: SupabaseClient,
  id: string,
  title: string
): Promise<BriefSession> {
  const { data, error } = await supabase
    .from("brief_sessions")
    .update({ title })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as BriefSession;
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
