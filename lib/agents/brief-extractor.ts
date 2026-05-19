// CR-002: Brief Extractor — extracts structured BriefState fields from conversation.
// Uses generateObject with a Zod schema for reliable structured output.
// Only fields with confidence >= CONFIDENCE_THRESHOLD are written to BriefState.

import { generateObject } from "ai";
import { z } from "zod";
import { ANALYSIS_MODEL, CONFIDENCE_THRESHOLD } from "@/lib/config/ai";
import type { BriefState, BriefStatePatch } from "@/lib/types/entities";

const extractionSchema = z.object({
  business_goal: z.object({
    value: z.string().nullable(),
    confidence: z.number().min(0).max(1),
  }),
  target_audience: z.object({
    value: z.string().nullable(),
    confidence: z.number().min(0).max(1),
  }),
  core_message: z.object({
    value: z.string().nullable(),
    confidence: z.number().min(0).max(1),
  }),
  tone_of_voice: z.object({
    value: z.string().nullable(),
    confidence: z.number().min(0).max(1),
  }),
  visual_direction: z.object({
    value: z.string().nullable(),
    confidence: z.number().min(0).max(1),
  }),
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

export async function extractBriefState(
  conversationHistory: { role: "user" | "assistant"; content: string }[],
  currentBriefState: BriefState
): Promise<BriefStatePatch> {
  const system = `You are a creative brief analyst. Extract structured information from the conversation.

Current brief state (already confirmed):
${JSON.stringify({
  business_goal: currentBriefState.business_goal,
  target_audience: currentBriefState.target_audience,
  core_message: currentBriefState.core_message,
  tone_of_voice: currentBriefState.tone_of_voice,
  visual_direction: currentBriefState.visual_direction,
  deliverables: currentBriefState.deliverables,
  constraints: currentBriefState.constraints,
}, null, 2)}

Rules:
- Only extract information that was explicitly stated in the conversation. Do not infer or assume.
- Confidence: 0.9+ = clearly stated; 0.7-0.9 = reasonably clear; 0.5-0.7 = implied; below 0.5 = do not extract.
- If a field is already filled in the current state and the user has not contradicted it, carry it forward with high confidence.
- For fields where nothing was mentioned, set value to null.
- open_questions: list any questions that arose from the conversation that still need answers.`;

  const { object } = await generateObject({
    model: ANALYSIS_MODEL,
    schema: extractionSchema,
    system,
    messages: conversationHistory.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  const patch: BriefStatePatch = {};
  const confidence_scores: Record<string, number> = {
    ...(currentBriefState.confidence_scores ?? {}),
  };

  const scalarFields = [
    "business_goal",
    "target_audience",
    "core_message",
    "tone_of_voice",
    "visual_direction",
  ] as const;

  for (const field of scalarFields) {
    const extracted = object[field];
    if (extracted.value !== null && extracted.confidence >= CONFIDENCE_THRESHOLD) {
      (patch as Record<string, unknown>)[field] = extracted.value;
      confidence_scores[field] = extracted.confidence;
    }
  }

  const arrayFields = ["deliverables", "constraints"] as const;
  for (const field of arrayFields) {
    const extracted = object[field];
    if (
      extracted.value !== null &&
      extracted.value.length > 0 &&
      extracted.confidence >= CONFIDENCE_THRESHOLD
    ) {
      (patch as Record<string, unknown>)[field] = extracted.value;
      confidence_scores[field] = extracted.confidence;
    }
  }

  if (object.open_questions.length > 0) {
    patch.confidence_scores = confidence_scores;
  } else {
    patch.confidence_scores = confidence_scores;
  }

  return { ...patch, confidence_scores };
}
