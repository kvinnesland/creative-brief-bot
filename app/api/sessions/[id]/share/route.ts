// CR-003: Share endpoint — POST /api/sessions/[id]/share
// Generates a share token and returns the public brief URL.

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { findSessionById, generateShareToken } from "@/lib/repositories/session-repo";

export const dynamic = "force-dynamic";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const session = await findSessionById(supabase, id);
  if (!session || session.user_id !== user.id)
    return new Response("Not Found", { status: 404 });

  const token = await generateShareToken(supabase, id);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return Response.json({ url: `${siteUrl}/briefs/${token}` });
}
