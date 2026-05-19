// CR-001: Entity types — mirrors specs/entities.md exactly.
// Update this file only via a CR that also updates specs/entities.md.

export type SessionStatus = "in_progress" | "completed" | "archived";

export type MessageRole = "user" | "assistant";

export type AttachmentType = "file" | "url";

export interface User {
  id: string;
  email: string;
  created_at: string; // ISO 8601
}

export interface BriefSession {
  id: string;
  user_id: string;
  title: string | null;
  status: SessionStatus;
  created_at: string;
  updated_at: string;
}

export interface BriefState {
  id: string;
  session_id: string;
  business_goal: string | null;
  target_audience: string | null;
  core_message: string | null;
  tone_of_voice: string | null;
  visual_direction: string | null;
  deliverables: string[] | null;
  constraints: string[] | null;
  open_questions: string[] | null;
  confidence_scores: Record<string, number> | null; // section name → 0.0–1.0
  updated_at: string;
}

export interface ConversationMessage {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
}

// CR-002: Agent pipeline types — not persisted directly; used during per-turn processing.

export type BriefStateField =
  | "business_goal"
  | "target_audience"
  | "core_message"
  | "tone_of_voice"
  | "visual_direction"
  | "deliverables"
  | "constraints";

export interface BriefStatePatch {
  business_goal?: string;
  target_audience?: string;
  core_message?: string;
  tone_of_voice?: string;
  visual_direction?: string;
  deliverables?: string[];
  constraints?: string[];
  confidence_scores?: Record<string, number>;
}

export interface AnalysisResult {
  patch: BriefStatePatch;
  gaps: BriefStateField[];
  contradictions: string[];
}

export interface Attachment {
  id: string;
  session_id: string;
  type: AttachmentType;
  original_name: string | null;
  storage_path: string | null;
  url: string | null;
  extracted_context: string | null;
  created_at: string;
}
