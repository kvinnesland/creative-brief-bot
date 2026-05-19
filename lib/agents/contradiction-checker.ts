// CR-002: Contradiction Checker — detects conflicting values in BriefState.
// Pure function for known pattern contradictions; AI-assisted for nuanced ones.

import { generateObject } from "ai";
import { z } from "zod";
import { ANALYSIS_MODEL } from "@/lib/config/ai";
import type { BriefState } from "@/lib/types/entities";

const contradictionSchema = z.object({
  contradictions: z.array(
    z.object({
      description: z.string(),
      fields_involved: z.array(z.string()),
    })
  ),
});

export async function findContradictions(
  briefState: BriefState,
  latestUserMessage: string
): Promise<string[]> {
  const filledFields = Object.entries({
    business_goal: briefState.business_goal,
    target_audience: briefState.target_audience,
    core_message: briefState.core_message,
    tone_of_voice: briefState.tone_of_voice,
    visual_direction: briefState.visual_direction,
    deliverables: briefState.deliverables,
    constraints: briefState.constraints,
  }).filter(([, v]) => v !== null);

  // Skip contradiction check if no fields are filled — nothing to compare against.
  if (filledFields.length < 1) return [];

  const { object } = await generateObject({
    model: ANALYSIS_MODEL,
    schema: contradictionSchema,
    system: `You are a creative strategist reviewing a creative brief for internal contradictions.

Analyze the brief fields AND the latest user message for genuine strategic contradictions — cases where two stated values are mutually exclusive or work against each other.

Only flag real contradictions, not minor tensions. Examples of genuine contradictions:
- "exclusive/luxury" tone + "budget-friendly/cheap" positioning
- "sustainable/premium brand" + "ultra-cheap price point (under €20)"
- "broad mass market" audience + "hyper-niche specialist" core message
- "minimal, clean" visual direction + "bold, maximalist, energetic" tone

IMPORTANT: Also compare the latest user message against the existing brief fields. If the latest message introduces a new value that contradicts an existing field, flag it even if the field was set in a prior turn.

Do NOT flag contradictions for minor style differences or things that can coexist.

Latest user message: "${latestUserMessage}"

Brief state:
${filledFields.map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join("\n")}`,
    prompt: "Identify any genuine strategic contradictions in this brief, including between the latest user message and existing fields.",
  });

  return object.contradictions.map((c) => c.description);
}
