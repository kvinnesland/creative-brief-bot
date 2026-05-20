// CR-004: Unit tests for BriefDocument PDF component.

import { describe, it, expect } from "vitest";
import { renderToBuffer } from "@react-pdf/renderer";
import { BriefDocument } from "@/lib/pdf/brief-pdf";
import type { BriefState } from "@/lib/types/entities";

function makeBriefState(overrides: Partial<BriefState> = {}): BriefState {
  return {
    id: "test",
    session_id: "session",
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

describe("BriefDocument", () => {
  it("renders to a non-empty PDF buffer given an empty brief state", async () => {
    const buffer = await renderToBuffer(
      <BriefDocument
        title="Test Brief"
        briefState={makeBriefState()}
        generatedDate="20 May 2026"
      />
    );
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(100);
  });

  it("renders to a non-empty PDF buffer given a fully populated brief state", async () => {
    const buffer = await renderToBuffer(
      <BriefDocument
        title="Full Brief"
        briefState={makeBriefState({
          background: "Fjordkraft er en norsk strømleverandør.",
          problem_statement: "Kundene oppfatter alle leverandører som like og velger på pris.",
          business_goal: "10% nye kunder innen Q4",
          communication_goal: "Målgruppen skal se Fjordkraft som det åpenbare valget.",
          target_audience: "Småbarnsfamilier, 30–45 år, opptatt av bærekraft",
          insight: "De vil ta det riktige valget, men beslutningstrøtthet vinner.",
          core_message: "Fjordkraft — kraften til å velge riktig",
          reasons_to_believe: "100% norsk vannkraft, lokal kundeservice",
          tone_of_voice: "Varm, tydelig, ikke belærende",
          deliverables: ["TV-kampanje", "Digitale annonser"],
          constraints: ["Budsjett: 5 MNOK", "Lansering september"],
        })}
        generatedDate="20 May 2026"
      />
    );
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(100);
  });

  it("renders without error when title is omitted", async () => {
    const buffer = await renderToBuffer(
      <BriefDocument
        briefState={makeBriefState({ business_goal: "Launch a product" })}
        generatedDate="20 May 2026"
      />
    );
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(100);
  });
});
