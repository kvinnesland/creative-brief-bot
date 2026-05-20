// CR-006: Derive overall brief completion (0–100) from confidence_scores average.
import type { BriefState } from "@/lib/types/entities";

export function calcProgress(briefState: BriefState | null): number {
  if (!briefState?.confidence_scores) return 0;
  const scores = Object.values(briefState.confidence_scores);
  if (scores.length === 0) return 0;
  const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  return Math.round(avg * 100);
}
