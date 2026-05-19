# ARCHITECTURE-STATE.md

> Describes current system architecture. Updated on every structural change.
> Read by Claude at session startup.

## Current Phase
FEATURE-COMPLETE MVP — Full conversation pipeline, brief management, export, sharing, and premium UI deployed.

## Module Map

| Path | Role | Status |
|---|---|---|
| `app/(auth)/` | Auth pages (login, signup) | Done CR-001 |
| `app/(app)/sessions/` | Session list page | Done CR-001 |
| `app/(app)/sessions/[id]/` | 3-column session shell (300px / flex / 420px) | Done CR-001, CR-002 |
| `app/briefs/[token]/` | Public shared brief page (no auth) | Done CR-003 |
| `app/api/sessions/` | Session CRUD API routes | Done CR-001 |
| `app/api/sessions/[id]/brief-state/` | GET brief state for client polling | Done CR-002 |
| `app/api/sessions/[id]/export/` | GET markdown export | Done CR-003 |
| `app/api/sessions/[id]/share/` | POST generate share token + URL | Done CR-003 |
| `app/api/chat/` | POST streaming chat endpoint | Done CR-002 |
| `app/api/auth/signout/` | Sign-out route | Done CR-001 |
| `proxy.ts` | Auth guard (Next.js 16 proxy) | Done CR-001 |
| `lib/types/entities.ts` | TypeScript entity interfaces | Done CR-001 |
| `lib/supabase/` | Browser + server Supabase clients | Done CR-001 |
| `lib/config/ai.ts` | OpenAI model config, CONFIDENCE_THRESHOLD | Done CR-002 |
| `lib/agents/brief-extractor.ts` | generateObject extraction pipeline | Done CR-002 |
| `lib/agents/gap-finder.ts` | Pure function gap detection | Done CR-002 |
| `lib/agents/contradiction-checker.ts` | generateObject contradiction detection | Done CR-002 |
| `lib/agents/conversation-agent.ts` | streamText response generator | Done CR-002 |
| `lib/services/brief-service.ts` | Pipeline orchestration (extractor + gap + contradiction) | Done CR-002 |
| `lib/repositories/session-repo.ts` | Session CRUD + findSessionByShareToken | Done CR-001, CR-003 |
| `lib/repositories/brief-state-repo.ts` | Brief state read/write | Done CR-001, CR-002 |
| `lib/repositories/message-repo.ts` | Message persistence + hydration | Done CR-002 |
| `db/migrations/` | SQL schema + RLS policies + rollback | Done CR-001 |

## Dependency Rules
Dependencies flow in one direction only:

```
API → Service → Repository → Database
Agent → Service  (agents do not call repositories directly)
```

No circular dependencies. No direct cross-module access.

## External Dependencies
| Dependency | Version | Purpose |
|---|---|---|
| next | 16.2.6 | Framework |
| react | 19.2.4 | UI |
| @supabase/supabase-js | ^2.106.0 | DB + auth client |
| @supabase/ssr | ^0.10.3 | Server-side Supabase session handling |
| tailwindcss | ^4 | Styling |
| ai (Vercel AI SDK) | v6 | Streaming, useChat, DefaultChatTransport |
| @ai-sdk/react | — | useChat hook |
| @ai-sdk/openai | — | OpenAI provider |

## Tech Stack
Next.js 16 + React 19 + TypeScript 5 + Tailwind 4
Supabase (Postgres + Auth)
Vercel (hosting)
OpenAI (GPT-4o via AI SDK)

## Design System
Dark premium editorial theme:
- Background: `#0D0D0D` / surfaces `#111111 / #181818 / #232323`
- Accent: `#D4AF37` (warm muted gold)
- Typography: Playfair Display (headings) + Inter (body) via `next/font/google`
- 3-column shell: 300px / flexible / 420px, 20px gaps + padding
- Tokens in `app/globals.css` via CSS custom properties + `@theme` (Tailwind 4)

## Notable Conventions
- `proxy.ts` (not `middleware.ts`) — Next.js 16 convention
- Supabase browser client created inside event handlers (not at component level) — avoids SSR pre-render failures
- Design tokens defined in `app/globals.css` via `@theme` (Tailwind 4 — no tailwind.config.ts)
- All inline styles reference CSS custom properties (not raw hex values) for theme consistency

## Last Structural Change
2026-05-19 — Full visual redesign: dark premium editorial aesthetic, Playfair Display typography, gold accent system.
