# flows.md — Business Flows

> Defines all critical user and system flows. Each flow maps to implementation in the service layer.

---

## Flow: Session Creation

Trigger: Authenticated user clicks "New Brief Session"

Steps:
1. Create BriefSession record (status: in_progress, user_id from auth context)
2. Create empty BriefState record linked to session
3. Redirect user to session page `/sessions/[id]`
4. Conversation Agent sends opening message to establish context

Error conditions:
- DB write failure: surface error, do not redirect

Related entities: BriefSession, BriefState, User
Related endpoints: POST /api/sessions

---

## Flow: Main Conversation Turn (Text)

Trigger: User submits a message in the chat interface

Steps:
1. Append user message to ConversationMessage (role: user)
2. POST to /api/chat with session_id, message content, and current BriefState
3. Run **Brief Extractor**: parse message for structured data → produce BriefState patch
4. Run **Gap Finder**: compare updated BriefState against required fields → produce list of gaps
5. Run **Contradiction Checker**: scan BriefState for conflicting values → produce list of contradictions
6. Run **Conversation Agent**: given (message history + BriefState + gaps + contradictions), generate response (stream)
7. Stream response tokens to UI as they arrive
8. On stream completion: persist assistant message, apply BriefState patch, recalculate confidence_scores
9. Push updated BriefState to live brief panel

Decision points:
- If contradiction detected: Conversation Agent surfaces it explicitly in response and asks user to resolve
- If gap detected: Conversation Agent steers toward the missing field (not bluntly — within natural conversation)
- If all BriefState sections have confidence ≥ 0.85: Conversation Agent offers to generate final brief

Error conditions:
- OpenAI API timeout or error: return user-facing error message; do not update BriefState or persist assistant message
- BriefState patch validation failure: log error, skip patch, continue conversation

Related entities: ConversationMessage, BriefState, BriefSession
Related endpoints: POST /api/chat

---

## Flow: File Upload and Context Injection

Trigger: User uploads a file (PDF, image, brand book, etc.)

Steps:
1. Validate file type and size server-side (allowed: PDF, PNG, JPG, PPTX; max: 20MB)
2. Upload file to Supabase Storage (private bucket)
3. Create Attachment record (type: file, storage_path, session_id)
4. Run file extraction: send file content to OpenAI (vision or text extraction) → produce extracted_context string
5. Persist extracted_context to Attachment record
6. Inject extracted_context into conversation as a system context message
7. Run standard conversation turn (Brief Extractor → Gap Finder → Contradiction Checker → Conversation Agent)

Decision points:
- If file type unsupported: reject with user-facing error before upload
- If extraction yields no useful content: notify user, continue without injecting context

Error conditions:
- Supabase Storage write failure: surface error, do not create Attachment record
- OpenAI extraction failure: set extracted_context to null, notify user, continue

Related entities: Attachment, ConversationMessage, BriefState
Related endpoints: POST /api/upload

---

## Flow: Voice Turn

Trigger: User speaks in voice mode (WebRTC session active)

Steps:
1. OpenAI Realtime API receives audio stream via WebRTC
2. Realtime API transcribes speech and generates response audio simultaneously
3. System receives transcript of user turn
4. System runs Brief Extractor → Gap Finder → Contradiction Checker (same as text flow)
5. Realtime API streams audio response to user
6. On turn completion: persist both user and assistant messages, update BriefState

Decision points:
- If user interrupts (barge-in): Realtime API handles truncation; system discards incomplete assistant turn
- If WebRTC connection drops: fall back to text mode, notify user

Error conditions:
- Realtime API session timeout: reconnect, notify user
- BriefState update failure: log error, continue conversation

Related entities: ConversationMessage, BriefState
Related endpoints: /api/voice (WebRTC relay)

---

## Flow: Brief Export

Trigger: User clicks "Export Brief" or Conversation Agent offers to generate final brief

Steps:
1. Validate BriefState completeness; surface any unfilled sections as warnings (do not block)
2. Run **Brief Writer**: given (BriefState + full conversation history), generate structured brief document
3. Format output as Markdown
4. Offer PDF generation: render Markdown → PDF server-side
5. Return download links for both formats

Decision points:
- If BriefState has open contradictions: warn user, include open questions section in brief
- If BriefState has low-confidence sections: flag in brief with "Needs clarification" annotation

Error conditions:
- Brief Writer fails: surface error, offer user option to copy raw BriefState instead
- PDF render fails: return Markdown only, notify user

Related entities: BriefState, ConversationMessage
Related endpoints: POST /api/export
