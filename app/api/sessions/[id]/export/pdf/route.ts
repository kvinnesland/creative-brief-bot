// CR-004: PDF export endpoint — GET /api/sessions/[id]/export/pdf

import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { createClient } from "@/lib/supabase/server";
import { findSessionById } from "@/lib/repositories/session-repo";
import { findBriefStateBySession } from "@/lib/repositories/brief-state-repo";
import { BriefDocument } from "@/lib/pdf/brief-pdf";

export const dynamic = "force-dynamic";

function slugify(title: string | null): string {
  if (!title) return "creative-brief";
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

export async function GET(
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

  const briefState = await findBriefStateBySession(supabase, id);
  if (!briefState) return new Response("Not Found", { status: 404 });

  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const buffer = await renderToBuffer(
    createElement(BriefDocument, {
      title: session.title ?? undefined,
      briefState,
      generatedDate,
    })
  );

  const filename = `${slugify(session.title)}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(buffer.byteLength),
    },
  });
}
