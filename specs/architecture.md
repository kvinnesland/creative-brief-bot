# architecture.md — System Architecture

> Defines module structure, dependency rules, and architectural decisions.
> Claude reads this to understand what is allowed and forbidden.

## Layering Model

```
UI Layer         — app/(routes)/**  — Pages, components, client state
API Layer        — app/api/**       — Route handlers, request validation, response mapping
Agent Layer      — lib/agents/**    — AI agent orchestration (Conversation, Extractor, Gap Finder, Contradiction Checker, Brief Writer)
Service Layer    — lib/services/**  — Business logic (session management, brief generation, file processing)
Repository Layer — lib/repositories/** — Data access (Supabase queries only)
Database Layer   — Supabase (PostgreSQL + RLS + Storage)
```

Rule: Dependencies flow downward only. No layer may import from a layer above it.

## Module Map

| Module | Responsibility |
|---|---|
| `app/(auth)` | Login, signup, magic link pages |
| `app/(app)/sessions` | Session list, new session creation |
| `app/(app)/sessions/[id]` | Main 3-column brief session UI |
| `app/api/sessions` | CRUD for BriefSessions |
| `app/api/chat` | Streaming chat endpoint (POST) |
| `app/api/voice` | OpenAI Realtime API relay (WebRTC) |
| `app/api/upload` | File upload handler → Supabase Storage |
| `lib/agents/conversation-agent` | Leads the conversation; generates next question and response |
| `lib/agents/brief-extractor` | Extracts structured data from user messages → updates BriefState |
| `lib/agents/gap-finder` | Identifies unfilled BriefState fields |
| `lib/agents/contradiction-checker` | Detects conflicting values in BriefState |
| `lib/agents/brief-writer` | Generates final structured brief from BriefState + history |
| `lib/services/session-service` | Creates, updates, and retrieves BriefSessions |
| `lib/services/brief-service` | Orchestrates agent pipeline per chat turn; manages BriefState |
| `lib/services/file-service` | Handles file upload, extraction, and context injection |
| `lib/services/export-service` | Generates Markdown and PDF exports |
| `lib/repositories/session-repo` | Supabase queries for BriefSession |
| `lib/repositories/brief-state-repo` | Supabase queries for BriefState |
| `lib/repositories/message-repo` | Supabase queries for ConversationMessage |
| `lib/repositories/attachment-repo` | Supabase queries for Attachment |
| `lib/types` | Shared TypeScript types and entity interfaces |
| `db/migrations` | Supabase SQL migration files |

## Agent Pipeline (per chat turn)

```
User message →
  Brief Extractor         (update BriefState fields)
  → Gap Finder            (identify missing fields)
  → Contradiction Checker (detect conflicts)
  → Conversation Agent    (generate response + follow-up questions)
  → Stream to UI + update BriefState + push to live panel
```

Each agent is a function with a defined input/output contract. Agents do not call each other directly — the `brief-service` orchestrates the pipeline.

## Forbidden Imports

- `lib/repositories/**` must not import from `lib/services/**` or `lib/agents/**`
- `lib/agents/**` must not import from `app/**` (UI layer)
- `lib/services/**` must not import from `app/**` (UI layer)
- `lib/types` may be imported by any layer
- No circular dependencies permitted at any layer

## External Dependencies

| Dependency | Version | Purpose |
|---|---|---|
| `next` | ^14.x | Framework, App Router, server actions |
| `react` | ^18.x | UI |
| `typescript` | ^5.x | Type safety |
| `tailwindcss` | ^3.x | Styling |
| `ai` (Vercel AI SDK) | ^3.x | Streaming chat, useChat hook |
| `openai` | ^4.x | Chat completions, structured outputs, Realtime API |
| `@supabase/supabase-js` | ^2.x | Auth, database, storage |

## Architectural Decisions

See `sessions/DECISIONS.md` for the full log.
