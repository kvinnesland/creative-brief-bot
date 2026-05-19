// Export endpoint — GET /api/sessions/[id]/export
// Returns the brief as a downloadable markdown file.

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { findSessionById } from "@/lib/repositories/session-repo";
import { findBriefStateBySession } from "@/lib/repositories/brief-state-repo";

export const dynamic = "force-dynamic";

function formatBrief(
  title: string | null,
  state: {
    business_goal: string | null;
    target_audience: string | null;
    core_message: string | null;
    tone_of_voice: string | null;
    visual_direction: string | null;
    deliverables: string[] | null;
    constraints: string[] | null;
  }
): string {
  const date = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const section = (heading: string, value: string | null | undefined) =>
    value ? `## ${heading}\n${value}\n` : `## ${heading}\n_Not yet defined_\n`;

  const listSection = (heading: string, items: string[] | null | undefined) =>
    items && items.length > 0
      ? `## ${heading}\n${items.map((i) => `- ${i}`).join("\n")}\n`
      : `## ${heading}\n_Not yet defined_\n`;

  return [
    `# Creative Brief: ${title ?? "Untitled"}`,
    `_Generated ${date}_`,
    "---",
    section("Business Goal", state.business_goal),
    section("Target Audience", state.target_audience),
    section("Core Message", state.core_message),
    section("Tone of Voice", state.tone_of_voice),
    section("Visual Direction", state.visual_direction),
    listSection("Deliverables", state.deliverables),
    listSection("Constraints & Budget", state.constraints),
  ].join("\n\n");
}

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

  const markdown = formatBrief(session.title, briefState);
  const filename = `${slugify(session.title)}.md`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
