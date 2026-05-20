# CURRENT-STATE.md

> Updated at the end of every session. Read by Claude at startup.

## Current Phase
VOICE + AI QUALITY — Core product loops complete. This session added voice conversation, tightened AI behaviour (single question, review phase, off-topic guard), fixed the brief extractor language bug, and updated the PDF export to cover all 11 sections.

## Current Objectives
1. Validate voice conversation on iOS Safari and Android Chrome in the wild
2. Decide on next product direction (onboarding flow, team sharing, analytics)

## Current Branch
master

## Blockers
None.

## Active Change Requests
- CR-001: Project Scaffold — Status: Done
- CR-002: Core Conversation Pipeline — Status: Done
- CR-003: Shareable Brief Links + Export — Status: Done
- CR-004: PDF Export — Status: Done
- CR-005: Domain-Restricted Signup — Status: Done
- CR-006: Mobile-Responsive Layout — Status: Done

## Recently Modified Systems (Session 8 — 2026-05-20)

### AI conversation improvements (multiple commits)
- lib/agents/conversation-agent.ts — ABSOLUTT REGEL: one question per turn; off-topic guard; review-and-confirm phase when all sections filled; full-sentence formatting in review
- lib/agents/brief-extractor.ts — Extracted field values must be written in Norwegian (bokmål)

### PDF export fix (commit 7df75b7)
- lib/pdf/brief-pdf.tsx — All 11 sections included in correct order with Norwegian labels; removed visual_direction; "Ikke definert ennå" placeholder
- tests/unit/brief-pdf.test.tsx — Updated fixture to cover all new fields

### Auto-focus textarea (commit dd65617)
- app/(app)/sessions/[id]/chat-interface.tsx — textarea.focus() when isStreaming → false

### Voice input (commit 0a55eb7)
- lib/hooks/use-speech-recognition.ts — Web Speech API hook (nb-NO), exposes state/toggle/start/onEnd
- app/(app)/sessions/[id]/chat-interface.tsx — Stemme toggle in header, voice mode cycle, TTS via speechSynthesis, status bar (Lytter/Tenker/Venter), Android Chrome primer

### Voice bug fixes (commits 13ae302, 41d6d69)
- TTS switched from onFinish param to useEffect watching isStreaming (more reliable)
- Android Chrome: silent SpeechSynthesisUtterance primed on button click to unlock API

### Cleanup (commit 00a3ff2)
- Removed standalone MicButton and "Mikrofon for tale" hint from input field

## Validation Status
- `npx tsc --noEmit` — 0 errors (2026-05-20, Session 8)
- `npx vitest run tests/unit` — all PASS (2026-05-20, Session 8)
- Deployed to Vercel: creative-brief-bot.vercel.app — auto-deploy via GitHub (master)

## Known Limitations
- No rate limiting
- No multi-user / team sharing
- Voice TTS quality depends on OS/browser — best on iOS/macOS, variable on Windows/Android
- Voice mode not tested on iOS Safari (SpeechRecognition requires webkit prefix, handled in hook)
- Web Speech API unavailable in Firefox — Stemme button hidden automatically

## Next Recommended Actions
1. Test voice mode on iOS Safari and Android Chrome — confirm full cycle works
2. Consider onboarding flow (first-time user guidance)
3. Consider team/sharing features (invite colleague to review brief)
4. Add rate limiting if traffic grows
