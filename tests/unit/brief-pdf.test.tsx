// CR-004: Unit tests for BriefDocument PDF component.

import { describe, it, expect } from "vitest";
import { renderToBuffer } from "@react-pdf/renderer";
import { BriefDocument } from "@/lib/pdf/brief-pdf";
import type { BriefState } from "@/lib/types/entities";

function makeBriefState(overrides: Partial<BriefState> = {}): BriefState {
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
          business_goal: "Increase brand awareness",
          target_audience: "18–35 urban creatives",
          core_message: "Creativity without limits",
          tone_of_voice: "Bold and playful",
          visual_direction: "Clean and minimal",
          deliverables: ["Social media campaign", "Brand guide"],
          constraints: ["Budget: $10,000", "4-week timeline"],
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
