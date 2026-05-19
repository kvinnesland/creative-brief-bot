# CR-003: Shareable Brief Links + Export

**Status:** Done
**Created:** 2026-05-19

---

## Business Goal
Allow users to share their creative brief with clients and collaborators without requiring them to create an account, and to export the brief as a standalone markdown document.

## Problem Statement
Briefs were trapped inside the app — no way to show a client the output, no way to hand off the document. This blocked the core use case: using the app as the starting point of a real creative engagement.

## Proposed Solution
1. Generate a unique share token per session (stored in DB)
2. Expose a public `/briefs/[token]` page that renders the brief without auth
3. Add a Share button to the brief panel that copies the public URL to clipboard
4. Add an Export button that downloads the brief as a `.md` file

## Impact Analysis

Affected Specs:
- [x] specs/entities.md — BriefSession gains `share_token` field
- [x] specs/api.yaml — POST /api/sessions/[id]/share, GET /api/sessions/[id]/export
- [ ] specs/flows.md — no change needed
- [ ] specs/architecture.md — no structural change
- [ ] specs/nfr.md — no change
- [x] specs/ui-spec.md — Share + Export buttons in brief panel footer

Affected Components:
- `lib/repositories/session-repo.ts` — findSessionByShareToken
- `app/api/sessions/[id]/share/route.ts` — new endpoint
- `app/api/sessions/[id]/export/route.ts` — new endpoint
- `app/briefs/[token]/page.tsx` — new public page
- `app/(app)/sessions/[id]/brief-panel.tsx` — Share + Export buttons

Database Impact: share_token column on sessions table (UUID, nullable, indexed)
API Impact: Two new endpoints — POST share, GET export
UX Impact: Two new action buttons in brief panel footer
Security Impact: Public page reads only fields present in BriefState — no user PII exposed. Share token is UUID (unguessable). No auth required on public page by design.
Performance Impact: Negligible

## Acceptance Criteria
- [x] Clicking Share generates a token if none exists, copies the public URL to clipboard
- [x] Public /briefs/[token] renders the brief with no login required
- [x] DB errors on public page return 404, not 500
- [x] Clicking Export downloads a .md file with all populated brief fields
- [x] Both buttons are disabled when no brief content exists

## Required Tests
- [ ] Unit: share token generation is idempotent
- [ ] Integration: GET /briefs/[token] returns 404 for unknown token

## Rollback Strategy
Remove the two new API routes and the public page. share_token column can remain (nullable, no impact).

## Risks
- Share links are permanent once generated — no expiry or revocation in MVP
- Markdown export has no PDF fallback — clients who need PDF must convert manually
