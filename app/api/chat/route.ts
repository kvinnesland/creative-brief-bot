// CR-002: Chat API route — streaming conversation endpoint.
// POST /api/chat — receives UIMessage[] from useChat, runs analysis pipeline, streams response.

import { NextRequest } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createMessage } from "@/lib/repositories/message-repo";
import { runAnalysisPipeline } from "@/lib/services/brief-service";
import { streamConversationResponse } from "@/lib/agents/conversation-agent";

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

  // Verify session belongs to user.
  const { data: session, error: sessionError } = await supabase
    .from("brief_sessions")
    .select("id")
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
    latestUserText
  );

  // Stream the conversation response.
  const result = streamConversationResponse(
    conversationHistory,
    briefState,
    analysisResult
  );

  // Persist assistant response after streaming completes.
  void result.text.then((text) => {
    createMessage(supabase, sessionId, "assistant", text).catch(console.error);
  });

  return result.toUIMessageStreamResponse();
}
