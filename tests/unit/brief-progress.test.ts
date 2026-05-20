// CR-006: Unit tests for calcProgress.

import { describe, it, expect } from "vitest";
import { calcProgress } from "@/lib/utils/brief-progress";
import type { BriefState } from "@/lib/types/entities";

function makeState(scores: Record<string, number> | null): BriefState {
  return {
    id: "test",
    session_id: "session",
    business_goal: null,
    target_audience: null,
    core_message: null,
    tone_of_voice: null,
    visual_direction: null,
    deliverables: null,
    constraints: null,
    open_questions: null,
    confidence_scores: scores,
    updated_at: new Date().toISOString(),
  };
}

describe("calcProgress", () => {
  it("returns 0 for null briefState", () => {
    expect(calcProgress(null)).toBe(0);
  });

  it("returns 0 when confidence_scores is null", () => {
    expect(calcProgress(makeState(null))).toBe(0);
  });

  it("returns 0 when confidence_scores is empty", () => {
    expect(calcProgress(makeState({}))).toBe(0);
  });

  it("returns correct average for partial scores", () => {
    expect(calcProgress(makeState({ business_goal: 0.8, target_audience: 0.6 }))).toBe(70);
  });

  it("returns 100 for all-complete scores", () => {
    expect(calcProgress(makeState({ business_goal: 1.0, target_audience: 1.0 }))).toBe(100);
  });

  it("rounds to nearest integer", () => {
    // (0.333 + 0.667) / 2 = 0.5 → 50
    expect(calcProgress(makeState({ a: 0.333, b: 0.667 }))).toBe(50);
  });
});
