// CR-002: ConversationMessage repository.

import { SupabaseClient } from "@supabase/supabase-js";
import type { ConversationMessage, MessageRole } from "@/lib/types/entities";

export async function createMessage(
  supabase: SupabaseClient,
  sessionId: string,
  role: MessageRole,
  content: string
): Promise<ConversationMessage> {
  const { data, error } = await supabase
    .from("conversation_messages")
    .insert({ session_id: sessionId, role, content })
    .select()
    .single();

  if (error) throw error;
  return data as ConversationMessage;
}

export async function findMessagesBySession(
  supabase: SupabaseClient,
  sessionId: string
): Promise<ConversationMessage[]> {
  const { data, error } = await supabase
    .from("conversation_messages")
    .select()
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ConversationMessage[];
}
