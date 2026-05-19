# CR-002: Core Conversation Pipeline

**Status:** Done
**Created:** 2026-05-19

---

## Business Goal
Make the product functional. Right now the session detail page is a static shell. CR-002 wires up streaming AI chat, the agent pipeline that extracts and reasons about brief data, live brief state updates, and message persistence — turning the scaffold into a working product.

## Problem Statement
The center chat panel has no input functionality. The right brief panel never updates. No AI calls are made. A user can create a session but cannot do anything with it. CR-001 built the room; CR-002 turns the lights on.

## Proposed Solution

Implement the full per-turn pipeline as defined in `specs/flows.md` (Main Conversation Turn):

**Two-call architecture per turn:**
1. **Analysis call** (structured output, non-streaming): runs Brief Extractor + Gap Finder + Contradiction Checker in a single OpenAI call. Returns a structured patch for BriefState plus lists of gaps and contradictions.
2. **Conversation call** (streaming): Conversation Agent uses the analysis result to generate a natural, contextually aware response with follow-up questions. Streams tokens to the UI.

This limits each turn to 2 OpenAI calls while keeping agent responsibilities separate.

**New modules (all per `specs/architecture.md`):**
- `lib/agents/brief-extractor.ts` — structured output schema + prompt
- `lib/agents/gap-finder.ts` — gap detection logic
- `lib/agents/contradiction-checker.ts` — contradiction detection logic
- `lib/agents/conversation-agent.ts` — streaming response generator
- `lib/services/brief-service.ts` — orchestrates the 2-call pipeline per turn
- `lib/repositories/message-repo.ts` — ConversationMessage CRUD
- `app/api/chat/route.ts` — streaming POST endpoint
- `app/(app)/sessions/[id]/chat-interface.tsx` — client component: message thread + input
- `app/(app)/sessions/[id]/brief-panel.tsx` — client component: live brief state (polled/updated after each turn)

**Session detail page** (`app/(app)/sessions/[id]/page.tsx`) split into server shell + client components. Server component loads initial state; client components handle real-time interaction.

---

## Impact Analysis

### Affected Specs
- [x] specs/flows.md — implements "Main Conversation Turn" flow exactly
- [x] specs/architecture.md — adds agent + service modules; must update Module Map
- [x] specs/entities.md — ConversationMessage and BriefState written/read
- [x] specs/ui-spec.md — chat area and brief panel become interactive; no new token definitions needed
- [x] specs/api.yaml — `POST /api/chat` defined 2026-05-19
- [ ] specs/nfr.md — read-only reference (streaming latency target already defined)
- [ ] specs/vision.md — read-only reference
- [ ] specs/requirements.md — FR-001, FR-005, FR-006, FR-007, FR-008 all addressed here

### Affected Components

**New:**
```
app/
  api/
    chat/
      route.ts                       — POST, streaming (Vercel AI SDK streamText)
  (app)/
    sessions/[id]/
      chat-interface.tsx             — client: message thread + textarea + send
      brief-panel.tsx                — client: live brief state display

lib/
  agents/
    brief-extractor.ts               — structured output: extract BriefState patch from message
    gap-finder.ts                    — identify unfilled BriefState fields
    contradiction-checker.ts         — detect conflicting values
    conversation-agent.ts            — streaming response + follow-up questions
  services/
    brief-service.ts                 — orchestrate pipeline; update BriefState in DB
  repositories/
    message-repo.ts                  — create + findBySession for ConversationMessage
```

**Modified:**
```
app/(app)/sessions/[id]/page.tsx     — pass initial data to client components
```

### Database Impact
**MEDIUM.**
- `conversation_messages` — INSERT on every user message and assistant turn
- `brief_states` — UPDATE after every AI turn (patching fields + confidence_scores + open_questions)
- No schema changes. All tables exist from CR-001.

### API Impact
**HIGH — new streaming endpoint.**

`POST /api/chat`
```
Request:  { session_id: string, message: string }
Response: text/event-stream (Vercel AI SDK data stream protocol)
Side effects:
  - Persists user ConversationMessage before streaming
  - Runs analysis call (Brief Extractor + Gap Finder + Contradiction Checker)
  - Updates BriefState in DB
  - Streams Conversation Agent response
  - Persists assistant ConversationMessage on stream completion
```

Authentication: required (Supabase session cookie). Session ownership validated before any AI call.
Rate limit: 60 requests/min per user (enforced at route level).

### UX Impact
**HIGH — first functional interaction in the product.**

- **Center panel**: message thread renders prior messages on load; new messages stream in with a typing cursor; user textarea + send button active
- **Right panel**: brief state sections update after each AI turn; confidence bars animate to new values; open questions list refreshes
- **Loading states**: send button disabled + spinner while streaming; brief panel shows "Updating…" indicator during pipeline run
- **Error states**: inline error if AI call fails; session remains intact, user can retry

### Security Impact
**HIGH.**
- Session ownership must be verified before running pipeline: `session.user_id === auth.uid()` checked in route handler
- User message sanitized (max 4000 chars; strip null bytes) before being sent to OpenAI
- OpenAI API key server-side only (`OPENAI_API_KEY`, never `NEXT_PUBLIC_`)
- Rate limiting: simple per-user counter in the route handler (Redis in future; in-memory Map for MVP)

### Performance Impact
**HIGH — first OpenAI calls in the product.**
- 2 OpenAI calls per turn: analysis (non-streaming, ~500–800ms) + conversation (streaming, first token ~300ms)
- Target: first streamed token to user ≤ 1200ms total (analysis + conversation agent startup)
- BriefState DB update is fire-and-forget after stream starts (does not block streaming)

---

## Acceptance Criteria

- [ ] User can type a message and press Send (or Enter)
- [ ] AI response streams in real time, word by word, in the chat panel
- [ ] User and assistant messages persist — present on page refresh
- [ ] If user mentions a target audience (e.g. "we target women aged 25-40"), `brief_states.target_audience` is updated in the DB
- [ ] If user mentions a business goal, `brief_states.business_goal` is updated
- [ ] Right panel brief state reflects DB state after each turn (updated within 1s of stream completion)
- [ ] Confidence score for a filled section is > 0 and rendered as a progress bar
- [ ] If a contradiction is detected (e.g. "exclusive" + "affordable"), the AI explicitly names it in the response
- [ ] If a gap exists (unfilled sections), the AI steers the conversation toward it naturally
- [ ] Session ownership verified: authenticated user cannot send messages to another user's session (returns 403)
- [ ] Send button disabled while streaming; re-enabled on completion or error
- [ ] If OpenAI returns an error, a user-facing message appears in the chat and the session is not corrupted
- [ ] `POST /api/chat` returns 401 for unauthenticated requests
- [ ] `OPENAI_API_KEY` is never exposed to the client bundle (`NEXT_PUBLIC_` is forbidden for this key)

---

## Required Tests

- [ ] Unit: Brief Extractor — given a sample message, returns correct BriefState patch (mock OpenAI)
- [ ] Unit: Gap Finder — given a partially filled BriefState, returns correct list of missing fields
- [ ] Unit: Contradiction Checker — given contradictory BriefState values, flags them correctly
- [ ] Unit: `brief-service` — pipeline called in correct order with correct inputs (mock agents)
- [ ] Integration: `POST /api/chat` — authenticated request streams a response and updates BriefState in DB
- [ ] Integration: `POST /api/chat` — unauthenticated request returns 401
- [ ] Integration: `POST /api/chat` — wrong session_id (different user's session) returns 403

---

## Rollback Strategy
No schema changes — rollback is revert of the new files and route. BriefState and ConversationMessage rows written during testing can be deleted via Supabase dashboard. No irreversible changes.

## Migration Strategy
No DB migration needed. All tables exist. Add `OPENAI_API_KEY` to `.env.local` before implementation.

## Risks

| Risk | Likelihood | Severity | Mitigation |
|---|---|---|---|
| Brief Extractor extracts noisy/wrong data → corrupts brief state | Medium | High | Structured output schema with strict types; confidence score gating (only write fields with confidence ≥ 0.6) |
| Analysis call latency too high → poor UX | Medium | Medium | Stream conversation response while analysis runs in parallel (if possible); show skeleton in brief panel during update |
| OpenAI rate limits under load | Low | Medium | Vercel AI SDK has built-in retry; user-level rate limiting prevents bursts |
| BriefState update race condition (concurrent turns) | Low | Medium | Enforce one active stream per session at a time (disable Send during streaming) |

## Dependencies
- CR-001 must be Done and DB migration applied ✅
- `OPENAI_API_KEY` must be added to `.env.local` before running `npm run dev`
- `specs/api.yaml` — updated 2026-05-19 ✅
- Vercel AI SDK (`ai` package) must be installed

## Validation Notes
- Test extraction with at least 3 sample messages covering: clear statement, vague statement, contradiction
- Verify `OPENAI_API_KEY` is absent from browser bundle: run `npm run build` and grep the `.next/static` output
- Verify BriefState rows update correctly by reading from Supabase dashboard after test turns
