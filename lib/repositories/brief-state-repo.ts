// CR-001: BriefState repository — Supabase queries for BriefState.
// CR-002: Added updateBriefState for pipeline patch writes.

import { SupabaseClient } from "@supabase/supabase-js";
import type { BriefState, BriefStatePatch } from "@/lib/types/entities";

export async function createBriefState(
  supabase: SupabaseClient,
  sessionId: string
): Promise<BriefState> {
  const { data, error } = await supabase
    .from("brief_states")
    .insert({ session_id: sessionId })
    .select()
    .single();

  if (error) throw error;
  return data as BriefState;
}

export async function findBriefStateBySession(
  supabase: SupabaseClient,
  sessionId: string
): Promise<BriefState | null> {
  const { data, error } = await supabase
    .from("brief_states")
    .select()
    .eq("session_id", sessionId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as BriefState;
}

export async function updateBriefState(
  supabase: SupabaseClient,
  sessionId: string,
  patch: BriefStatePatch
): Promise<BriefState> {
  const { data, error } = await supabase
    .from("brief_states")
    .update(patch)
    .eq("session_id", sessionId)
    .select()
    .single();

  if (error) throw error;
  return data as BriefState;
}
