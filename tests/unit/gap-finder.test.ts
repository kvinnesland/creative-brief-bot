import { describe, it, expect } from "vitest";
import { findGaps } from "@/lib/agents/gap-finder";
import type { BriefState } from "@/lib/types/entities";

function makeState(overrides: Partial<BriefState> = {}): BriefState {
  return {
    id: "test-id",
    session_id: "session-id",
    background: null,
    problem_statement: null,
    business_goal: null,
    communication_goal: null,
    target_audience: null,
    insight: null,
    core_message: null,
    reasons_to_believe: null,
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

const ALL_FILLED: Partial<BriefState> = {
  background: "Fjellreven er kjent for ekspedisjonsutstyr",
  problem_statement: "Oppfattes som for tungt for hverdagsturer",
  business_goal: "Øke salg av hverdagsbekledning med 15 %",
  communication_goal: "Flytte oppfatning fra ekspedisjonsmerke til hverdagsmerke",
  target_audience: "Urbane småbarnsforeldre som ønsker mer tid ute",
  insight: "Folk vil ut, men logistikken og dørstokkmila vinner",
  core_message: "Naturen starter der asfalten slutter",
  reasons_to_believe: "Vardag-serien — lett, fleksibel, like slitesterk",
  tone_of_voice: "Inspirerende, ujålete og inviterende",
  deliverables: ["Sosiale medier (video)", "OOH nær kollektivknutepunkter"],
  constraints: ["Budsjett: 2M NOK", "Logo + slagordet 'Forever Nature' obligatorisk"],
};

describe("findGaps", () => {
  it("returns all 11 required fields when brief is empty", () => {
    const gaps = findGaps(makeState());
    expect(gaps).toHaveLength(11);
  });

  it("returns no gaps when all fields are filled", () => {
    const gaps = findGaps(makeState(ALL_FILLED));
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
    const gaps = findGaps(makeState({
      background: "Kontekst satt",
      business_goal: "Øke salg",
      target_audience: "Urbane yrkesaktive",
    }));
    expect(gaps).not.toContain("background");
    expect(gaps).not.toContain("business_goal");
    expect(gaps).not.toContain("target_audience");
    expect(gaps).toContain("problem_statement");
    expect(gaps).toContain("insight");
    expect(gaps).toContain("core_message");
  });

  it("visual_direction is not a required field", () => {
    const gaps = findGaps(makeState(ALL_FILLED));
    expect(gaps).not.toContain("visual_direction");
  });
});
