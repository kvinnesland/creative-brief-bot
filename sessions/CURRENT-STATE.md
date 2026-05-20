# CURRENT-STATE.md

> Updated at the end of every session. Read by Claude at startup.

## Current Phase
FEATURE-COMPLETE MVP — All core product loops implemented and deployed.
The app has a functional AI conversation pipeline, live brief panel, message hydration,
session titling, markdown + PDF export, shareable brief links, and a full premium dark-theme redesign.

## Current Objectives
1. Decide on next feature direction (voice input, team sharing, onboarding flow)
2. Create CR for next feature once direction is decided

## Current Branch
master

## Blockers
None.

## Active Change Requests
- CR-001: Project Scaffold — Status: Done
- CR-002: Core Conversation Pipeline — Status: Done
- CR-003: Shareable Brief Links + Export — Status: Done
- CR-004: PDF Export — Status: Done

## Recently Modified Systems (Session 3+)

### Message hydration fix (commit 0bbf786)
- app/(app)/sessions/[id]/page.tsx — passes initialMessages to SessionShell
- lib/repositories/message-repo.ts — findMessagesBySession used for hydration

### Auto-generate session title (commit 1be31ec)
- app/api/chat/route.ts — generates title from first user message turn

### Export brief as markdown (commit 0bc2f80)
- app/api/sessions/[id]/export/route.ts — GET endpoint, streams .md file
- app/(app)/sessions/[id]/brief-panel.tsx — Export button wired up

### URL context injection + shareable brief links (commit 74bc034, CR-003)
- app/api/sessions/[id]/share/route.ts — POST generates share token, returns URL
- app/briefs/[token]/page.tsx — public read-only brief page (no auth)
- lib/repositories/session-repo.ts — findSessionByShareToken

### DB error handling (commit 06c01b2)
- app/briefs/[token]/page.tsx — notFound() on DB errors instead of 500

### Visual redesign (commit 18b6646)
- app/globals.css — full dark token system (#0D0D0D, #D4AF37 gold, layered surfaces)
- app/layout.tsx — Playfair Display + Inter via next/font/google
- app/(auth)/login/page.tsx — cinematic dark auth card
- app/(auth)/signup/page.tsx — cinematic dark auth card
- app/(app)/sessions/page.tsx — dark editorial sessions list
- app/(app)/sessions/new-brief-button.tsx — gold pill button
- app/(app)/sessions/[id]/session-shell.tsx — dark 3-column shell (300/flex/420, 20px gaps)
- app/(app)/sessions/[id]/chat-interface.tsx — glass assistant bubbles, gold user bubbles
- app/(app)/sessions/[id]/brief-panel.tsx — thin gold progress bar, uppercase labels
- app/briefs/[token]/page.tsx — premium public brief layout

## Validation Status
- `npm run build` — PASS (2026-05-20, Session 5)
- `npx tsc --noEmit` — 0 errors (2026-05-20)
- `npx vitest run tests/unit` — 13/13 PASS (2026-05-20)
- Deployed to Vercel: creative-brief-bot.vercel.app — LIVE (commit faf8a3b)

## Known Limitations (acceptable for MVP)
- No rate limiting (noted for future Redis implementation)
- No voice input (planned future CR)
- No multi-user / team sharing
- Vercel not wired to GitHub for auto-deploy — requires manual `vercel --prod`

## Recently Modified Systems (Session 5)

### PDF export (CR-004, commits e00de3e + 0dd25da)
- lib/pdf/brief-pdf.tsx — BriefDocument @react-pdf/renderer component
- app/api/sessions/[id]/export/pdf/route.ts — GET endpoint, server-side render to PDF
- app/(app)/sessions/[id]/brief-panel.tsx — Export button (was pre-stubbed, now live)
- tests/unit/brief-pdf.test.tsx — 3 unit tests

### Sessions 500 bugfix (commit faf8a3b)
- app/(app)/sessions/session-card.tsx — new "use client" component (extracted from page.tsx)
- app/(app)/sessions/page.tsx — removed event handlers from server component

## Next Recommended Actions
1. Decide on next feature: voice input, team sharing, or onboarding flow
2. Wire Vercel to GitHub for auto-deploy (eliminates manual deploy step)
3. Create CR for chosen next feature
