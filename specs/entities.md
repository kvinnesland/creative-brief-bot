# entities.md — Data Entities

> Source of truth for all data models. No entity may appear in code that is not defined here.

---

## Entity: User

Description: An authenticated user of the system.

Fields:
- id: uuid (required, PK)
- email: string (required, unique)
- created_at: timestamp (required, ISO 8601)

Relations:
- has_many: BriefSession

Indexes:
- email (unique)

---

## Entity: BriefSession

Description: A single briefing conversation between a user and the AI agent.

Fields:
- id: uuid (required, PK)
- user_id: uuid (required, FK → User)
- title: string (optional, auto-generated from first exchange)
- status: enum [in_progress, completed, archived] (required, default: in_progress)
- created_at: timestamp (required)
- updated_at: timestamp (required)

Relations:
- belongs_to: User
- has_many: ConversationMessage
- has_many: Attachment
- has_one: BriefState

Indexes:
- user_id
- status

---

## Entity: BriefState

Description: The live structured state of the creative brief, updated after every AI turn.

Fields:
- id: uuid (required, PK)
- session_id: uuid (required, FK → BriefSession, unique)
- business_goal: string (nullable)
- target_audience: string (nullable)
- core_message: string (nullable)
- tone_of_voice: string (nullable)
- visual_direction: string (nullable)
- deliverables: string[] (nullable)
- constraints: string[] (nullable)
- open_questions: string[] (nullable)
- confidence_scores: json (nullable) — map of section name → float 0.0–1.0
- updated_at: timestamp (required)

Relations:
- belongs_to: BriefSession

Indexes:
- session_id (unique)

---

## Entity: ConversationMessage

Description: A single message in a brief session conversation.

Fields:
- id: uuid (required, PK)
- session_id: uuid (required, FK → BriefSession)
- role: enum [user, assistant] (required)
- content: string (required)
- created_at: timestamp (required)

Relations:
- belongs_to: BriefSession

Indexes:
- session_id
- created_at

---

## Entity: Attachment

Description: A file or URL reference uploaded by the user during a session.

Fields:
- id: uuid (required, PK)
- session_id: uuid (required, FK → BriefSession)
- type: enum [file, url] (required)
- original_name: string (nullable) — original filename for file uploads
- storage_path: string (nullable) — Supabase Storage path, only for type=file
- url: string (nullable) — only for type=url
- extracted_context: string (nullable) — AI-extracted summary used as context
- created_at: timestamp (required)

Relations:
- belongs_to: BriefSession

Indexes:
- session_id
