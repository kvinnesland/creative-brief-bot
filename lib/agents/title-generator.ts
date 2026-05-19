// CR-002: Title Generator — generates a short session title from the first user message.

import { generateText } from "ai";
import { ANALYSIS_MODEL } from "@/lib/config/ai";

export async function generateSessionTitle(firstUserMessage: string): Promise<string> {
  const { text } = await generateText({
    model: ANALYSIS_MODEL,
    system:
      "Generate a short title (3–5 words, no punctuation, no quotes) for a creative brief session based on the user's message. Return only the title, nothing else.",
    prompt: firstUserMessage,
  });
  return text.trim().slice(0, 60);
}
