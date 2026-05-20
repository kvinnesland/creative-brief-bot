// CR-001: Unit test — verifies entity type shapes compile and are self-consistent.
// If any field is missing or mis-typed vs specs/entities.md this file will fail tsc.

import { describe, it, expectTypeOf } from "vitest";
import type {
  User,
  BriefSession,
  BriefState,
  ConversationMessage,
  Attachment,
  SessionStatus,
  MessageRole,
  AttachmentType,
} from "@/lib/types/entities";

describe("Entity types", () => {
  it("User has required fields", () => {
    const u: User = { id: "uuid", email: "a@b.com", created_at: "2026-01-01T00:00:00Z" };
    expectTypeOf(u.id).toBeString();
    expectTypeOf(u.email).toBeString();
    expectTypeOf(u.created_at).toBeString();
  });

  it("BriefSession has required fields and correct status type", () => {
    const s: BriefSession = {
      id: "uuid",
      user_id: "uuid",
      title: null,
      status: "in_progress",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    };
    expectTypeOf(s.status).toEqualTypeOf<SessionStatus>();
  });

  it("BriefState nullable fields accept null", () => {
    const state: BriefState = {
      id: "uuid",
      session_id: "uuid",
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
      updated_at: "2026-01-01T00:00:00Z",
    };
    expectTypeOf(state.confidence_scores).toEqualTypeOf<Record<string, number> | null>();
  });

  it("ConversationMessage role is constrained", () => {
    const m: ConversationMessage = {
      id: "uuid",
      session_id: "uuid",
      role: "user",
      content: "hello",
      created_at: "2026-01-01T00:00:00Z",
    };
    expectTypeOf(m.role).toEqualTypeOf<MessageRole>();
  });

  it("Attachment type is constrained", () => {
    const a: Attachment = {
      id: "uuid",
      session_id: "uuid",
      type: "file",
      original_name: null,
      storage_path: null,
      url: null,
      extracted_context: null,
      created_at: "2026-01-01T00:00:00Z",
    };
    expectTypeOf(a.type).toEqualTypeOf<AttachmentType>();
  });
});
