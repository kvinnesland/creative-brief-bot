import { generateObject } from "ai";
import { z } from "zod";
import { ANALYSIS_MODEL, CONFIDENCE_THRESHOLD } from "@/lib/config/ai";
import type { BriefState, BriefStatePatch } from "@/lib/types/entities";

const fieldSchema = z.object({
  value: z.string().nullable(),
  confidence: z.number().min(0).max(1),
});

const extractionSchema = z.object({
  background: fieldSchema,
  problem_statement: fieldSchema,
  business_goal: fieldSchema,
  communication_goal: fieldSchema,
  target_audience: fieldSchema,
  insight: fieldSchema,
  core_message: fieldSchema,
  reasons_to_believe: fieldSchema,
  tone_of_voice: fieldSchema,
  deliverables: z.object({
    value: z.array(z.string()).nullable(),
    confidence: z.number().min(0).max(1),
  }),
  constraints: z.object({
    value: z.array(z.string()).nullable(),
    confidence: z.number().min(0).max(1),
  }),
  open_questions: z.array(z.string()),
});

const SCALAR_FIELDS = [
  "background",
  "problem_statement",
  "business_goal",
  "communication_goal",
  "target_audience",
  "insight",
  "core_message",
  "reasons_to_believe",
  "tone_of_voice",
] as const;

export async function extractBriefState(
  conversationHistory: { role: "user" | "assistant"; content: string }[],
  currentBriefState: BriefState,
  urlContext?: string
): Promise<BriefStatePatch> {
  const urlSection = urlContext
    ? `\nReference content fetched from URLs shared by the user:\n${urlContext}\n`
    : "";

  const system = `You are a creative brief analyst. Extract structured information from the conversation into the 8 sections of a professional creative brief.

Field definitions:
- background: Brand/product context and why this project is happening now.
- problem_statement: The specific communication barrier in the audience's mind — a perception, attitude or behavior standing in the way. NOT a business problem.
- business_goal: The measurable business outcome (e.g. increase sales by 15%).
- communication_goal: What the audience should think, feel or do after seeing the campaign.
- target_audience: Who we're talking to — defined by behavior, attitudes and motivations, not just demographics.
- insight: The human truth that connects the audience's need with the brand's solution. The creative spark.
- core_message: The single most important thing to say. One sentence. Not a list.
- reasons_to_believe: The rational or emotional proof that makes the core message credible.
- tone_of_voice: Personality, feeling, style. How should the brand show up?
- deliverables: Specific outputs required (channels, formats, assets).
- constraints: Budget, deadlines, mandatory brand elements.

Current brief state (already confirmed — carry forward with high confidence unless contradicted):
${JSON.stringify({
  background: currentBriefState.background,
  problem_statement: currentBriefState.problem_statement,
  business_goal: currentBriefState.business_goal,
  communication_goal: currentBriefState.communication_goal,
  target_audience: currentBriefState.target_audience,
  insight: currentBriefState.insight,
  core_message: currentBriefState.core_message,
  reasons_to_believe: currentBriefState.reasons_to_believe,
  tone_of_voice: currentBriefState.tone_of_voice,
  deliverables: currentBriefState.deliverables,
  constraints: currentBriefState.constraints,
}, null, 2)}
${urlSection}
Rules:
- Only extract information explicitly stated in the conversation or URL content. Do not infer.
- Confidence: 0.9+ = clearly stated; 0.7–0.9 = reasonably clear; 0.5–0.7 = implied; below 0.5 = do not extract.
- open_questions: any unresolved questions that surfaced in the conversation.`;

  const { object } = await generateObject({
    model: ANALYSIS_MODEL,
    schema: extractionSchema,
    system,
    messages: conversationHistory.map((m) => ({ role: m.role, content: m.content })),
  });

  const patch: BriefStatePatch = {};
  const confidence_scores: Record<string, number> = {
    ...(currentBriefState.confidence_scores ?? {}),
  };

  for (const field of SCALAR_FIELDS) {
    const extracted = object[field];
    if (extracted.value !== null && extracted.confidence >= CONFIDENCE_THRESHOLD) {
      (patch as Record<string, unknown>)[field] = extracted.value;
      confidence_scores[field] = extracted.confidence;
    }
  }

  for (const field of ["deliverables", "constraints"] as const) {
    const extracted = object[field];
    if (extracted.value !== null && extracted.value.length > 0 && extracted.confidence >= CONFIDENCE_THRESHOLD) {
      patch[field] = extracted.value;
      confidence_scores[field] = extracted.confidence;
    }
  }

  if (object.open_questions.length > 0) {
    patch.confidence_scores = { ...confidence_scores };
  }

  return { ...patch, confidence_scores };
}
