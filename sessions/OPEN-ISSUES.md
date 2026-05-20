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

ISSUE-004
Status: Open
Priority: Medium
Area: lib/agents/conversation-agent.ts — review phase
Description: The review-and-confirm phase activates when gaps = 0, but the extractor confidence threshold (0.6) may allow sections to fill with low-quality data, triggering review prematurely. No minimum quality gate before entering review mode.
Blocker for: Nothing critical — product still usable
Opened: 2026-05-20

ISSUE-005
Status: Open
Priority: Low
Area: lib/hooks/use-speech-recognition.ts + chat-interface.tsx
Description: Voice mode TTS and STT not tested on iOS Safari. SpeechRecognition uses webkit prefix (handled in hook), but speechSynthesis behaviour on iOS may differ. Android Chrome primer fix deployed but unverified in production.
Blocker for: Nothing critical — voice is progressive enhancement
Opened: 2026-05-20

## Resolved Issues (Session 8)

(No new issues resolved this session — all work was features/improvements.)

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
