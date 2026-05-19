// CR-002: Unit tests for gap-finder.

import { describe, it, expect } from "vitest";
import { findGaps } from "@/lib/agents/gap-finder";
import type { BriefState } from "@/lib/types/entities";

function makeState(overrides: Partial<BriefState> = {}): BriefState {
  return {
    id: "test-id",
    session_id: "session-id",
    business_goal: null,
    target_audience: null,
    core_message: null,
    tone_of_voice: null,
    visual_direction: null,
    deliverables: null,
    constraints: null,
    open_questions: null,
    confidence_scores: null,
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

describe("findGaps", () => {
  it("returns all required fields when brief is empty", () => {
    const gaps = findGaps(makeState());
    expect(gaps).toHaveLength(7);
  });

  it("returns no gaps when all fields are filled", () => {
    const gaps = findGaps(
      makeState({
        business_goal: "Increase brand awareness",
        target_audience: "18–35 urban creatives",
        core_message: "Creativity without limits",
        tone_of_voice: "Bold and playful",
        visual_direction: "Clean and minimal",
        deliverables: ["Social media campaign"],
        constraints: ["Budget: $10,000"],
      })
    );
    expect(gaps).toHaveLength(0);
  });

  it("treats empty arrays as gaps", () => {
    const gaps = findGaps(makeState({ deliverables: [], constraints: [] }));
    expect(gaps).toContain("deliverables");
    expect(gaps).toContain("constraints");
  });

  it("does not treat filled arrays as gaps", () => {
    const gaps = findGaps(makeState({ deliverables: ["Logo design"] }));
    expect(gaps).not.toContain("deliverables");
  });

  it("returns only the missing fields", () => {
    const gaps = findGaps(
      makeState({
        business_goal: "Launch a new product",
        target_audience: "Tech enthusiasts",
      })
    );
    expect(gaps).not.toContain("business_goal");
    expect(gaps).not.toContain("target_audience");
    expect(gaps).toContain("core_message");
    expect(gaps).toContain("tone_of_voice");
  });
});
