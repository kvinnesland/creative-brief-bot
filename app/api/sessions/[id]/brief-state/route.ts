// CR-002: GET /api/sessions/[id]/brief-state — returns current BriefState for a session.
// Used by the client to refresh the brief panel after each chat turn.

import { NextRequest } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { findBriefStateBySession } from "@/lib/repositories/brief-state-repo";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Verify session belongs to user.
  const { data: session, error: sessionError } = await supabase
    .from("brief_sessions")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (sessionError || !session) {
    return new Response("Not Found", { status: 404 });
  }

  const briefState = await findBriefStateBySession(supabase, id);
  return Response.json(briefState);
}
