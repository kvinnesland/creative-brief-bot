# CR-006: Mobile-Responsive Layout

Status: Done
Created: 2026-05-20

## Business Goal
Make the app usable on mobile phones. The 3-column desktop layout is completely unusable on small screens — all three panels are squashed to illegible widths. Priority is the chat interface, which is the core product interaction.

## Problem Statement
`session-shell.tsx` uses a fixed CSS grid (`300px / flex / 420px`) with no responsive behaviour. At mobile widths, all three columns render simultaneously and overflow. The sessions list and auth pages are usable but not optimised.

## Proposed Solution

### Breakpoint
`640px` — aligns with the responsive spec in `specs/ui-spec.md`.

### Session shell (main work surface)
- **Desktop (≥ 640px):** unchanged — 3-column grid.
- **Mobile (< 640px):** single-column, full-height layout.
  - Show **Chat** by default (priority per product direction).
  - Bottom tab bar with two tabs: **Chat** and **Brief** — switches the visible panel.
  - **Total progress indicator** in the tab bar: a thin progress bar and percentage (e.g. "64%") above/beside the Brief tab, derived from the average of all `confidence_scores` values in `BriefState`. Updates live as the AI fills the brief. Gives the user continuous feedback without needing to switch to the Brief tab.
  - Sidebar (session nav) replaced by a simple back link in the chat header — navigates to `/sessions`.
  - Brief panel slides in from below when "Brief" tab is active (no drawer animation needed for MVP — simple show/hide is sufficient).

### Implementation approach
Given the codebase uses inline styles throughout (not Tailwind classes), mobile detection is done via a `useWindowWidth` hook in `session-shell.tsx`. This avoids a global refactor to className-based styling.

```
useWindowWidth() → number
isMobile = width < 640
```

- `session-shell.tsx` — renders either 3-column desktop layout or mobile layout based on `isMobile`
- `chat-interface.tsx` — ensure textarea, send button, and message bubbles are touch-friendly (min 44px tap targets)
- `sessions/page.tsx` — minimal changes; already a centered column, needs touch-friendly card padding

### No changes to
- API layer
- Database
- Auth pages (already centered card — inherently mobile-friendly)
- Brief panel internals (existing scroll + flex layout works fine in single column)
- Shared brief page (`/briefs/[token]`) — already a single column

## Impact Analysis

Affected Specs:
- [ ] specs/entities.md — No change
- [ ] specs/api.yaml — No change
- [ ] specs/flows.md — No change
- [ ] specs/architecture.md — No change
- [ ] specs/nfr.md — Add mobile browser support note
- [x] specs/ui-spec.md — Responsive behaviour is already documented; implementation now matches it

Affected Components:
- `app/(app)/sessions/[id]/session-shell.tsx` — core responsive layout + mobile tab bar + progress indicator
- `app/(app)/sessions/[id]/chat-interface.tsx` — touch-friendly input area
- `app/(app)/sessions/page.tsx` — touch-friendly card tap targets
- `lib/hooks/use-window-width.ts` — new. SSR-safe hook returning current window width.
- `lib/utils/brief-progress.ts` — new. Pure function `calcProgress(briefState): number` — returns 0–100 from average of confidence_scores. Returns 0 if no scores yet.

Database Impact: None.

API Impact: None.

UX Impact:
- Mobile users see chat full-screen immediately on load.
- Bottom tab bar (Chat / Brief) lets users switch context without losing state.
- "All briefs" back-navigation visible in mobile chat header.
- Brief state continues updating in the background when the Chat tab is active.

Security Impact: None.

Performance Impact:
- `useWindowWidth` listens to `window.resize` — debounced to 100ms to avoid excessive re-renders.
- Brief panel renders in the background on mobile (display: none, not unmounted) so brief state polling continues uninterrupted.

## Acceptance Criteria
- [ ] On desktop (≥ 640px): 3-column layout unchanged, no visual regression
- [ ] On mobile (< 640px): session shell shows single-column chat view by default
- [ ] Mobile bottom tab bar switches between Chat and Brief views
- [ ] Brief state updates live in background regardless of which tab is active
- [ ] All tap targets (send button, tab bar, cards) are ≥ 44px tall
- [ ] Sessions list is usable on mobile — cards readable, "New Brief" button accessible
- [ ] No horizontal scroll on any mobile view
- [ ] `npm run build` passes
- [ ] `npx tsc --noEmit` — 0 errors

## Required Tests
- [ ] Unit: `lib/hooks/use-window-width.ts` — returns 0 during SSR, correct value in browser env
- [ ] Unit: `lib/utils/brief-progress.ts` — null scores → 0%, partial scores → correct average, full scores → 100%
- [ ] Visual: validate manually on mobile viewport (Chrome devtools 390px width) — progress updates live as AI responds

## Rollback Strategy
Revert `session-shell.tsx`, `chat-interface.tsx`, `sessions/page.tsx`. Delete `lib/hooks/use-window-width.ts`. No DB or API rollback needed.

## Migration Strategy
No data migration. Pure frontend change — safe to deploy immediately.

## Risks
- JS-based breakpoint detection means there is a brief flash of the desktop layout on SSR before hydration resolves the window width. Mitigated by initialising `useWindowWidth` to `0` (treated as mobile) so mobile users never see the 3-column flash — desktop users may see a single-column flash for one frame.
- Inline-style-heavy codebase makes responsive design more verbose than Tailwind classes would be. Accepted trade-off for MVP — a future refactor to className-based styling is the right long-term fix.

## Dependencies
None. Pure frontend — no new packages required.
