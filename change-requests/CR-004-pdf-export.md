# CR-004: PDF Export

Status: Done
Created: 2026-05-19

## Business Goal
Give users a print-ready, shareable PDF of their creative brief — the format clients and collaborators actually expect.

## Problem Statement
The current markdown export is a developer convenience, not a client deliverable. A creative brief needs to leave the tool looking like a professional document.

## Proposed Solution
- New GET /api/sessions/[id]/export/pdf endpoint renders the brief to PDF server-side using @react-pdf/renderer
- Update the Export button in the brief panel to download PDF instead of markdown
- PDF design: clean light layout, Playfair Display headings, editorial section structure, branded footer

## Impact Analysis

Affected Specs:
- [ ] specs/entities.md — no change
- [x] specs/api.yaml — new GET /api/sessions/[id]/export/pdf endpoint
- [ ] specs/flows.md — no change
- [ ] specs/architecture.md — new lib/pdf/ module
- [ ] specs/nfr.md — no change
- [x] specs/ui-spec.md — Export button now targets PDF

Affected Components:
- lib/pdf/brief-pdf.tsx — new PDF document component
- app/api/sessions/[id]/export/pdf/route.ts — new endpoint
- app/(app)/sessions/[id]/brief-panel.tsx — Export button updated

Database Impact: None
API Impact: New GET endpoint; existing /export (markdown) unchanged
UX Impact: Export button downloads PDF instead of markdown
Security Impact: Same auth guard as existing export endpoint
Performance Impact: PDF render is CPU-bound server-side; acceptable for one-off export

## Acceptance Criteria
- [x] Export button downloads a PDF file
- [x] PDF contains all populated brief fields with section labels
- [x] PDF includes session title as main heading
- [x] PDF includes generation date in footer
- [x] Button is disabled when no brief content exists
- [x] Auth required — 401 if not signed in, 404 if session not owned by user

## Required Tests
- [x] Unit: BriefDocument renders without error given a populated BriefState
- [ ] Integration: GET /export/pdf returns 200 with Content-Type application/pdf (skipped — no test DB in CI)

## Rollback Strategy
Revert brief-panel.tsx to call /export (markdown). Remove the new route and lib/pdf/.

## Dependencies
@react-pdf/renderer — server-side PDF generation, no headless browser required
