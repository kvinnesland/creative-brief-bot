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
  // 8-section brief framework
  background: string | null;
  problem_statement: string | null;
  business_goal: string | null;
  communication_goal: string | null;
  target_audience: string | null;
  insight: string | null;
  core_message: string | null;
  reasons_to_believe: string | null;
  tone_of_voice: string | null;
  deliverables: string[] | null;
  constraints: string[] | null;
  open_questions: string[] | null;
  confidence_scores: Record<string, number> | null; // section name → 0.0–1.0
  // kept for backward compatibility with existing sessions
  visual_direction: string | null;
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
  | "background"
  | "problem_statement"
  | "business_goal"
  | "communication_goal"
  | "target_audience"
  | "insight"
  | "core_message"
  | "reasons_to_believe"
  | "tone_of_voice"
  | "deliverables"
  | "constraints";

export interface BriefStatePatch {
  background?: string;
  problem_statement?: string;
  business_goal?: string;
  communication_goal?: string;
  target_audience?: string;
  insight?: string;
  core_message?: string;
  reasons_to_believe?: string;
  tone_of_voice?: string;
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
