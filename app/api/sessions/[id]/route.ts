// CR-001: Session detail API — GET by id (RLS enforces ownership)

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { findSessionById } from "@/lib/repositories/session-repo";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const session = await findSessionById(supabase, id);
    if (!session) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    // RLS already enforces ownership — if session is returned it belongs to the user.
    // Extra check here as defence-in-depth.
    if (session.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(session);
  } catch {
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}
