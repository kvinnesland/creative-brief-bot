// CR-002: Chat API route — streaming conversation endpoint.
// CR-003: URL context injection added.
// POST /api/chat — receives UIMessage[] from useChat, runs analysis pipeline, streams response.

import { NextRequest } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createMessage } from "@/lib/repositories/message-repo";
import { updateSessionTitle } from "@/lib/repositories/session-repo";
import { runAnalysisPipeline } from "@/lib/services/brief-service";
import { streamConversationResponse } from "@/lib/agents/conversation-agent";
import { generateSessionTitle } from "@/lib/agents/title-generator";
import { extractUrls, fetchUrlContent } from "@/lib/services/url-fetcher";

export const dynamic = "force-dynamic";

// UIMessage part shape from @ai-sdk/react (text parts only used here).
interface UIMessagePart {
  type: string;
  text?: string;
}

interface UIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  parts: UIMessagePart[];
}

function extractText(parts: UIMessagePart[]): string {
  return parts
    .filter((p) => p.type === "text" && typeof p.text === "string")
    .map((p) => p.text as string)
    .join("");
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const { sessionId, messages } = body as {
    sessionId: string;
    messages: UIMessage[];
  };

  if (!sessionId || !Array.isArray(messages) || messages.length === 0) {
    return new Response("Bad Request", { status: 400 });
  }

  // Verify session belongs to user; also fetch title to detect first turn.
  const { data: session, error: sessionError } = await supabase
    .from("brief_sessions")
    .select("id, title")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (sessionError || !session) {
    return new Response("Not Found", { status: 404 });
  }

  // Extract the last user message text.
  const userMessages = messages.filter((m) => m.role === "user");
  const lastUserMsg = userMessages.at(-1);
  const latestUserText = lastUserMsg ? extractText(lastUserMsg.parts) : "";

  if (!latestUserText.trim()) {
    return new Response("Bad Request", { status: 400 });
  }

  // Fetch URL content if the user pasted any links (runs in parallel with nothing yet).
  const urls = extractUrls(latestUserText);
  const urlContents = await Promise.all(urls.map(fetchUrlContent));
  const urlContext = urls
    .map((url, i) => urlContents[i] ? `[Content from ${url}]:\n${urlContents[i]}` : null)
    .filter(Boolean)
    .join("\n\n");

  // Persist user message to DB.
  await createMessage(supabase, sessionId, "user", latestUserText);

  // Build conversation history for the pipeline (exclude system messages).
  const conversationHistory = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: extractText(m.parts),
    }));

  // Run analysis pipeline (extraction + gap-finding + contradiction-checking).
  const { briefState, analysisResult } = await runAnalysisPipeline(
    supabase,
    sessionId,
    conversationHistory,
    latestUserText,
    urlContext || undefined
  );

  // Stream the conversation response.
  const result = streamConversationResponse(
    conversationHistory,
    briefState,
    analysisResult
  );

  // After streaming: persist assistant message and generate title on first turn.
  const isFirstTurn = (session as { title: string | null }).title === null;
  void result.text.then(async (text) => {
    await createMessage(supabase, sessionId, "assistant", text).catch(console.error);
    if (isFirstTurn) {
      generateSessionTitle(latestUserText)
        .then((title) => updateSessionTitle(supabase, sessionId, title))
        .catch(console.error);
    }
  });

  return result.toUIMessageStreamResponse();
}
