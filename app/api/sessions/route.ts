// CR-001: Sessions API — GET (list), POST (create session + brief state)

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSession, findSessionsByUser } from "@/lib/repositories/session-repo";
import { createBriefState } from "@/lib/repositories/brief-state-repo";

export async function GET() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sessions = await findSessionsByUser(supabase, user.id);
    return NextResponse.json(sessions);
  } catch {
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

export async function POST() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const session = await createSession(supabase, user.id);
    await createBriefState(supabase, session.id);
    return NextResponse.json(session, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
