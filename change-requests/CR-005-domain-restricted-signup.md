# CR-005: Domain-Restricted Signup

Status: Done
Created: 2026-05-20

## Business Goal
Limit account creation to employees at pre-approved organisations. Initially restricted to `@bas.no`. Prevents unauthorised external users from creating accounts while the product is in internal use.

## Problem Statement
Currently any email address can create an account via the signup page. `supabase.auth.signUp()` is called directly from the client with no server-side domain validation, meaning the restriction cannot be enforced reliably client-side alone.

## Proposed Solution
1. **Client-side (UX):** Validate the email domain in `handleSignup` before submitting. Show a clear inline error if the domain is not allowed. Fail fast — do not hit the network at all.
2. **Server-side (security gate):** Create a new API route `POST /api/auth/signup` that validates the domain before calling the Supabase Admin API's `createUser`. The signup page calls this route instead of calling Supabase directly.
3. **DB-backed allowlist:** Allowed domains stored in a `allowed_domains` Postgres table (columns: `id`, `domain`, `created_at`). The signup API route queries this table at request time. Seeded with `@bas.no` on migration. No env var or redeploy required to add new domains — a future backoffice UI will manage this table directly.

Client-side validation is UX only. Server-side validation is the security gate — it cannot be bypassed.

### Future: Backoffice
A planned backoffice page (separate CR) will provide a UI for adding, listing, and removing allowed domains from the `allowed_domains` table. CR-005 intentionally builds the data layer in a way that makes this straightforward: the backoffice only needs CRUD on one table.

## Impact Analysis

Affected Specs:
- [ ] specs/entities.md — No change
- [ ] specs/api.yaml — New endpoint: POST /api/auth/signup
- [ ] specs/flows.md — Auth/signup flow updated (client now calls API route, not Supabase directly)
- [ ] specs/architecture.md — No structural change
- [ ] specs/nfr.md — Security section: add domain allowlist requirement
- [ ] specs/ui-spec.md — No change (error state already styled)

Affected Components:
- `app/(auth)/signup/page.tsx` — Add client-side domain check; change `supabase.auth.signUp()` call to `fetch('/api/auth/signup', ...)`
- `app/api/auth/signup/route.ts` — New. Server-side domain validation + Supabase Admin `createUser`
- `lib/auth/domain-allowlist.ts` — New. `isAllowedDomain(email, supabase): Promise<boolean>` — queries `allowed_domains` table.
- `db/migrations/003_allowed_domains.sql` — New table + RLS + seed row for `@bas.no`

Database Impact:
New table `allowed_domains`:
```sql
id         uuid primary key default gen_random_uuid()
domain     text not null unique  -- e.g. 'bas.no' (without @)
created_at timestamptz default now()
```
RLS: readable by service role only (not exposed to authenticated users). Seeded with `bas.no`.
No changes to existing tables.

API Impact:
- New: `POST /api/auth/signup` — accepts `{ email, password }`, validates domain, calls Supabase Admin `createUser`, returns `{ ok: true }` or `{ error: string }`.
- `SUPABASE_SERVICE_ROLE_KEY` required in server env (already present if deployed, check `.env.local` for local dev).
- Existing Supabase signout route is unaffected.

UX Impact:
- If domain not allowed: inline error below the email field — "This email domain is not authorised. Please use your @bas.no address."
- No other UX changes. Form, layout, and styles unchanged.

Security Impact:
- **Positive:** Closes the open registration. External actors cannot create accounts.
- **Defence in depth:** Client check is UX; server check is the real gate — cannot be bypassed via curl or devtools.
- **Risk:** `SUPABASE_SERVICE_ROLE_KEY` used server-side only, never exposed to client. Must not be added to any `NEXT_PUBLIC_` variable.

Performance Impact:
Negligible. One extra API hop on signup (low-frequency path).

## Acceptance Criteria
- [ ] A user with an `@bas.no` email can successfully create an account
- [ ] A user with any other email domain sees the inline error and no account is created
- [ ] Submitting directly to Supabase (bypassing the signup page) is blocked server-side
- [ ] Allowed domains are read from the `allowed_domains` DB table at request time — no env var or redeploy required to add new domains
- [ ] `npm run build` passes
- [ ] `npx tsc --noEmit` — 0 errors

## Required Tests
- [ ] Unit: `lib/auth/domain-allowlist.ts` — `isAllowedDomain` with allowed domain, disallowed domain, malformed email (mocked DB response)
- [ ] Unit: `app/api/auth/signup/route.ts` — rejects missing fields, rejects disallowed domain (no Supabase call), accepts allowed domain (mocked DB + mocked Supabase Admin)

## Rollback Strategy
Revert `app/(auth)/signup/page.tsx` to call `supabase.auth.signUp()` directly. Delete `app/api/auth/signup/route.ts` and `lib/auth/domain-allowlist.ts`. Run `db/migrations/003_allowed_domains_rollback.sql` to drop the table.

## Migration Strategy
No existing users are affected. Existing accounts created before this CR remain valid.

## Risks
- If `SUPABASE_SERVICE_ROLE_KEY` is missing from Vercel env, the new signup route will fail (500). Must verify env var is present before deploying.
- DB query on every signup attempt — acceptable at this scale (signup is a very low-frequency path).

## Dependencies
- `SUPABASE_SERVICE_ROLE_KEY` must be set in Vercel environment and `.env.local`
- No new npm packages required (`@supabase/supabase-js` Admin API is already available)
- Migration `003_allowed_domains.sql` must be applied to Supabase before deploying
- Future CR (backoffice) will build the admin UI for managing this table — CR-005 intentionally keeps the data layer simple and UI-ready
