# CR-001: Project Scaffold

**Status:** Done
**Created:** 2026-05-19

---

## Business Goal
Establish the technical foundation of the Creative Brief Agent so that feature work (CR-002 onwards) can begin immediately without revisiting infrastructure decisions or data model choices.

## Problem Statement
No application exists yet. There is no Next.js project, no Supabase schema, no auth, and no deployable shell. All feature CRs are blocked until a running, authenticated, correctly-structured application is in place.

## Proposed Solution
Initialize the full project scaffold:

1. **Next.js 14 App Router** project with TypeScript, Tailwind CSS, and ESLint
2. **Supabase schema** — all 5 entities from `specs/entities.md` as PostgreSQL tables, with Row-Level Security policies
3. **Supabase Auth** — email/password and magic link, wired into Next.js middleware
4. **Routing structure** — auth pages, session list page, session detail page (3-column shell, no functionality)
5. **TypeScript entity types** — matching `specs/entities.md` exactly
6. **Environment config** — `.env.local.example` with all required variables documented
7. **Vercel deployment config** — `vercel.json` and `next.config.ts` production-ready

---

## Impact Analysis

### Affected Specs
- [x] specs/entities.md — all 5 entities implemented as DB tables and TS types
- [x] specs/architecture.md — module structure established; all directories created
- [x] specs/nfr.md — tech stack instantiated (Next.js 14, Supabase, Vercel)
- [x] specs/flows.md — Session Creation flow (partial: create session + redirect)
- [ ] specs/ui-spec.md — **must be partially populated before implementation begins** (design tokens + screen list required; see Dependencies)
- [ ] specs/vision.md — read-only reference; no changes
- [ ] specs/requirements.md — read-only reference; no changes
- [ ] specs/api.yaml — not yet in scope; stub only

### Affected Components

**New directories and files created:**

```
app/
  (auth)/
    login/page.tsx
    signup/page.tsx
  (app)/
    sessions/
      page.tsx                  — session list
      [id]/
        page.tsx                — session detail (3-column shell)
        layout.tsx
  api/
    sessions/
      route.ts                  — GET (list), POST (create)
    sessions/[id]/
      route.ts                  — GET (detail)
lib/
  types/
    entities.ts                 — TypeScript interfaces for all 5 entities
  repositories/
    session-repo.ts             — stub (create, findByUser, findById)
    brief-state-repo.ts         — stub (create, findBySession)
db/
  migrations/
    001_initial_schema.sql      — all 5 tables + RLS policies
middleware.ts                   — auth guard (redirect unauthenticated users)
.env.local.example
vercel.json
```

### Database Impact
**HIGH.** Creates all 5 tables from scratch:

| Table | RLS Policy |
|---|---|
| `users` | Managed by Supabase Auth; no direct RLS needed |
| `brief_sessions` | Users can only SELECT/INSERT/UPDATE/DELETE their own rows (`user_id = auth.uid()`) |
| `brief_states` | Users can only access rows where `session_id` belongs to their own session |
| `conversation_messages` | Same as brief_states |
| `attachments` | Same as brief_states |

All cross-table RLS must be validated by integration test before any other CR proceeds.

### API Impact
**LOW.** Two stub endpoints only:
- `GET /api/sessions` — returns authenticated user's sessions list
- `POST /api/sessions` — creates BriefSession + empty BriefState; returns new session ID
- `GET /api/sessions/[id]` — returns session detail (used by session page)

No AI calls. No streaming. No file handling.

### UX Impact
**MEDIUM.** Implements three screens (shell only):

| Screen | Route | State |
|---|---|---|
| Login | `/login` | Email/password form + magic link option |
| Session List | `/sessions` | Empty state + "New Brief" button |
| Session Detail | `/sessions/[id]` | 3-column layout shell — left nav, center chat placeholder, right brief state placeholder |

No interactive functionality beyond auth and session creation button.

### Security Impact
**HIGH — most critical part of this CR.**

- RLS must be verified with an explicit cross-user isolation test
- Auth middleware must redirect all unauthenticated `/app` routes to `/login`
- No user data may be accessible without a valid Supabase session token
- Environment variables (Supabase keys) must never be committed; `.env.local` is gitignored

### Performance Impact
**LOW.** No AI calls, no streaming, no file processing. Standard Next.js SSR + Supabase queries.

---

## Acceptance Criteria

- [ ] `npm run dev` starts the app without errors
- [ ] `npm run build` completes with zero TypeScript errors
- [ ] ESLint passes with zero errors
- [ ] Supabase migration `001_initial_schema.sql` creates all 5 tables cleanly
- [ ] All 5 tables have correct RLS policies applied
- [ ] User can sign up with email/password
- [ ] User can log in with email/password
- [ ] User can request a magic link and authenticate via email
- [ ] Unauthenticated user visiting `/sessions` or `/sessions/[id]` is redirected to `/login`
- [ ] Authenticated user can click "New Brief" and be redirected to a new `/sessions/[id]` page
- [ ] `POST /api/sessions` creates both a `BriefSession` and an empty `BriefState` record in one operation
- [ ] Session list at `/sessions` displays all sessions belonging to the authenticated user
- [ ] Session detail page renders 3-column layout shell (columns visible, no content yet)
- [ ] TypeScript types in `lib/types/entities.ts` match `specs/entities.md` exactly (all fields, all types)
- [ ] User A cannot fetch User B's session via `GET /api/sessions/[id]` (returns 403)

---

## Required Tests

- [ ] Unit: TypeScript compilation of `lib/types/entities.ts` (catches type drift from schema)
- [ ] Integration: Supabase Auth — signup, login, magic link flow
- [ ] Integration: RLS isolation — create two users, verify cross-user session access returns 403
- [ ] Integration: `POST /api/sessions` — creates BriefSession + BriefState atomically
- [ ] Integration: `GET /api/sessions` — returns only the authenticated user's sessions
- [ ] E2E (Playwright): Auth flow — login → redirect to /sessions → create session → redirected to /sessions/[id]

---

## Rollback Strategy
Drop all 5 tables via rollback migration (`001_rollback.sql`). Revert or delete the Next.js project. No user data exists yet — rollback is clean.

## Migration Strategy
Forward-only migration from empty database. No existing data to migrate. Run via `supabase db push` or `supabase migration up`.

## Risks

| Risk | Likelihood | Severity | Mitigation |
|---|---|---|---|
| RLS misconfiguration exposes user data | Medium | Critical | Mandatory cross-user integration test before any other CR proceeds |
| Supabase Auth / Next.js middleware session handling mismatch | Medium | High | Follow Supabase Next.js SSR auth guide exactly; use `@supabase/ssr` package |
| `specs/ui-spec.md` design tokens not agreed before implementation | High | Medium | Block implementation until tokens are defined (see Dependencies) |

## Dependencies
- **Supabase project must be created** and connection strings available (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)
- **`specs/ui-spec.md`** — populated 2026-05-19. Design tokens (colors, typography, spacing, radii), component tokens, and all three screen specs are defined. Dependency resolved.
- No other CRs depend on this CR; this CR blocks all others.

## Validation Notes
- Run `supabase db diff` after migration to confirm schema matches entities.md
- Verify RLS with explicit cross-user test: do not accept "looks right" — must be a failing then passing test
- Check `npm run build` output size — baseline should be under 200kB first-load JS for the session page
