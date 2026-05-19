// CR-002: Conversation Agent — streaming response generator.
// Takes analysis context and generates a natural, directive response via streamText.

import { streamText } from "ai";
import { CONVERSATION_MODEL } from "@/lib/config/ai";
import type { BriefState, BriefStateField, AnalysisResult } from "@/lib/types/entities";

const FIELD_LABELS: Record<BriefStateField, string> = {
  business_goal: "business goal",
  target_audience: "target audience",
  core_message: "core message",
  tone_of_voice: "tone of voice",
  visual_direction: "visual direction",
  deliverables: "deliverables",
  constraints: "constraints and budget",
};

function buildSystemPrompt(
  briefState: BriefState,
  analysisResult: AnalysisResult
): string {
  const { gaps, contradictions } = analysisResult;

  const filledFields = Object.entries({
    business_goal: briefState.business_goal,
    target_audience: briefState.target_audience,
    core_message: briefState.core_message,
    tone_of_voice: briefState.tone_of_voice,
    visual_direction: briefState.visual_direction,
    deliverables: briefState.deliverables,
    constraints: briefState.constraints,
  })
    .filter(([, v]) => v !== null && v !== undefined)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join("\n");

  const gapList =
    gaps.length > 0
      ? gaps.map((g) => FIELD_LABELS[g]).join(", ")
      : "none — brief is complete";

  const contradictionSection =
    contradictions.length > 0
      ? `\nContradictions detected:\n${contradictions.map((c) => `- ${c}`).join("\n")}`
      : "";

  return `You are a creative strategist helping a client develop a structured creative brief through conversation.

Your role: guide the conversation naturally toward a complete brief. Ask one focused question at a time. Be warm but direct — you are a professional, not a chatbot.

Current brief state:
${filledFields || "(nothing captured yet)"}

Missing fields: ${gapList}${contradictionSection}

Rules:
- If contradictions exist, address them gently before asking about gaps.
- If gaps exist, ask about the most important missing field. Prioritize: business_goal → target_audience → core_message → tone_of_voice → visual_direction → deliverables → constraints.
- If the brief is complete and no contradictions exist, confirm completeness and ask if the client wants to refine anything.
- Do not list all missing fields at once. One question per turn.
- Do not repeat information the client just gave you unless clarifying a contradiction.
- Keep responses concise: 2–4 sentences max, then one clear question.`;
}

export function streamConversationResponse(
  conversationHistory: { role: "user" | "assistant"; content: string }[],
  briefState: BriefState,
  analysisResult: AnalysisResult
) {
  const system = buildSystemPrompt(briefState, analysisResult);

  return streamText({
    model: CONVERSATION_MODEL,
    system,
    messages: conversationHistory.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });
}
