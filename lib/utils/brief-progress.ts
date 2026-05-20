import type { BriefState } from "@/lib/types/entities";

const BRIEF_SECTION_KEYS: (keyof BriefState)[] = [
  "background",
  "problem_statement",
  "business_goal",
  "communication_goal",
  "target_audience",
  "insight",
  "core_message",
  "reasons_to_believe",
  "tone_of_voice",
];

export function calcProgress(briefState: BriefState | null): number {
  if (!briefState?.confidence_scores) return 0;
  const scores = Object.values(briefState.confidence_scores);
  if (scores.length === 0) return 0;
  const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  return Math.round(avg * 100);
}

// Section-fill completion: counts non-null sections + non-empty lists out of 11.
// Used to keep the mobile tab bar and BriefPanel header in sync.
export function calcCompletionPct(briefState: BriefState | null): number {
  if (!briefState) return 0;
  const filled = BRIEF_SECTION_KEYS.filter((k) => briefState[k] != null).length
    + ((briefState.deliverables ?? []).length > 0 ? 1 : 0)
    + ((briefState.constraints ?? []).length > 0 ? 1 : 0);
  return Math.round((filled / 11) * 100);
}
