# ARCHITECTURE-STATE.md

> Describes current system architecture. Updated on every structural change.
> Read by Claude at session startup.

## Current Phase
SCAFFOLD — Application structure established. No AI logic yet.

## Module Map

| Path | Role | Status |
|---|---|---|
| `app/(auth)/` | Auth pages (login, signup) | Done CR-001 |
| `app/(app)/sessions/` | Session list page | Done CR-001 |
| `app/(app)/sessions/[id]/` | 3-column session shell | Done CR-001 |
| `app/api/sessions/` | Session CRUD API routes | Done CR-001 |
| `app/api/auth/signout/` | Sign-out route | Done CR-001 |
| `proxy.ts` | Auth guard (Next.js 16 proxy) | Done CR-001 |
| `lib/types/entities.ts` | TypeScript entity interfaces | Done CR-001 |
| `lib/supabase/` | Browser + server Supabase clients | Done CR-001 |
| `lib/repositories/` | Data access (session, brief state) | Done CR-001 |
| `lib/agents/` | AI agent pipeline | Not yet — CR-002 |
| `lib/services/` | Business logic | Not yet — CR-002 |
| `db/migrations/` | SQL schema + RLS | Done CR-001 (not yet applied) |

## Dependency Rules
Dependencies flow in one direction only:
API → Service → Repository → Database
Agent → Service (agents do not call repositories directly)

No circular dependencies. No direct cross-module access.

## External Dependencies
| Dependency | Version | Purpose |
|---|---|---|
| next | 16.2.6 | Framework |
| react | 19.2.4 | UI |
| @supabase/supabase-js | ^2.106.0 | DB + auth client |
| @supabase/ssr | ^0.10.3 | Server-side Supabase session handling |
| tailwindcss | ^4 | Styling |

## Tech Stack
Next.js 16 + React 19 + TypeScript 5 + Tailwind 4
Supabase (Postgres + Auth + Storage)
Vercel (hosting)

## Notable Conventions
- `proxy.ts` (not `middleware.ts`) — Next.js 16 convention
- Supabase browser client created inside event handlers (not at component level) — avoids SSR pre-render failures
- Design tokens defined in `app/globals.css` via `@theme` (Tailwind 4 convention — no tailwind.config.ts)

## Last Structural Change
2026-05-19 — CR-001: Full project scaffold implemented.
