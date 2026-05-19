// CR-002: BriefService — orchestrates the per-turn agent pipeline.
// Runs extraction, gap-finding, and contradiction-checking in parallel,
// then merges the patch into BriefState and returns the full AnalysisResult.

import type { SupabaseClient } from "@supabase/supabase-js";
import { extractBriefState } from "@/lib/agents/brief-extractor";
import { findGaps } from "@/lib/agents/gap-finder";
import { findContradictions } from "@/lib/agents/contradiction-checker";
import { updateBriefState, findBriefStateBySession } from "@/lib/repositories/brief-state-repo";
import type { BriefState, BriefStatePatch, AnalysisResult } from "@/lib/types/entities";

export async function runAnalysisPipeline(
  supabase: SupabaseClient,
  sessionId: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[],
  latestUserMessage: string,
  urlContext?: string
): Promise<{ briefState: BriefState; analysisResult: AnalysisResult }> {
  const currentBriefState = await findBriefStateBySession(supabase, sessionId);
  if (!currentBriefState) throw new Error(`No brief state found for session ${sessionId}`);

  // Run extraction and contradiction-checking in parallel.
  const [patch, contradictions] = await Promise.all([
    extractBriefState(conversationHistory, currentBriefState, urlContext),
    findContradictions(currentBriefState, latestUserMessage),
  ]);

  // Merge patch into DB — only write if there are actual changes.
  const hasPatch =
    Object.keys(patch).filter((k) => k !== "confidence_scores").length > 0 ||
    Object.keys(patch.confidence_scores ?? {}).length > 0;

  let updatedBriefState = currentBriefState;
  if (hasPatch) {
    updatedBriefState = await updateBriefState(supabase, sessionId, patch);
  }

  const gaps = findGaps(updatedBriefState);

  return {
    briefState: updatedBriefState,
    analysisResult: { patch, gaps, contradictions },
  };
}
