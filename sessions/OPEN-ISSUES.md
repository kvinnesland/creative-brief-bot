# OPEN-ISSUES.md

> Updated at the end of every session.

## Format
```
ISSUE-XXX
Status: Open | In Progress | Resolved
Priority: High | Medium | Low
Area: [module or system]
Description: [what is the problem]
Blocker for: [what cannot proceed until resolved]
Opened: YYYY-MM-DD
```

## Open Issues

ISSUE-003
Status: Open
Priority: Low
Area: Infrastructure / Vercel
Description: Vercel is not connected to GitHub for auto-deploy. Every push requires a manual `vercel --prod` or the production site falls behind.
Blocker for: Nothing critical — manual deploy works fine
Opened: 2026-05-20

## Resolved Issues

ISSUE-001
Status: Resolved
Priority: High
Area: specs/
Description: Product vision and requirements not yet defined.
Blocker for: All feature work
Opened: 2026-05-19
Resolved: 2026-05-19 — All spec files written (vision, requirements, entities, architecture, flows, nfr)

ISSUE-002
Status: Resolved
Priority: Medium
Area: app/(app)/sessions/[id]/
Description: Message history did not survive page refresh — useChat state was in-memory only.
Blocker for: Usable product experience
Opened: 2026-05-19
Resolved: 2026-05-19 — DB messages hydrated into useChat initialMessages on page load (commit 0bbf786)
