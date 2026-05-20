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

None.

## Resolved Issues (Session 7)

ISSUE-003
Status: Resolved
Priority: Low
Area: Infrastructure / Vercel
Description: Vercel was not connected to GitHub for auto-deploy.
Blocker for: Nothing critical
Opened: 2026-05-20
Resolved: 2026-05-20 — Connected GitHub repo via Vercel Settings → Git. Production environment confirmed tracking master branch.

## Resolved Issues (Sessions 1–6)

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
