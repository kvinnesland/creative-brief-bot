// CR-002: Central AI model configuration.
// Change model here — it applies to the entire pipeline.

import { openai } from "@ai-sdk/openai";

export const ANALYSIS_MODEL = openai("gpt-4o");
export const CONVERSATION_MODEL = openai("gpt-4o");

// Confidence threshold: BriefState fields are only written if extraction
// confidence meets this minimum. Prevents noisy/speculative data polluting the brief.
export const CONFIDENCE_THRESHOLD = 0.6;
