# requirements.md — Requirements

> Every requirement must trace to a spec, a CR, and eventually to code.

## Functional Requirements

### Conversation Interface
FR-001: User can engage in streaming text chat with the AI agent
FR-002: System renders AI responses in Markdown
FR-003: System maintains full conversation history per session
FR-004: User can start multiple independent brief sessions

### Voice Mode
FR-005: User can speak naturally to the agent and receive voice responses (OpenAI Realtime API)
FR-006: Voice mode supports interruption / barge-in
FR-007: Voice mode works on both desktop and mobile browsers

### File Upload
FR-008: User can upload files (PDF, PNG, JPG, PPTX, brand books, previous briefs, moodboards)
FR-009: AI extracts relevant context from uploaded files and incorporates it into the brief_state

### Reference Analysis
FR-010: User can share a URL or screenshot as a reference
FR-011: AI analyses the reference for visual style, tone, and strategic direction and incorporates findings into the brief_state

### Brief State
FR-012: System maintains a structured brief_state object per session, updated after every AI turn
FR-013: brief_state tracks: business_goal, target_audience, core_message, tone_of_voice, visual_direction, deliverables, constraints, open_questions, confidence_scores
FR-014: User can view the live brief state at all times (right-hand panel), including per-section confidence scores and open questions

### AI Reasoning
FR-015: AI asks contextual follow-up questions (few per turn, context-aware, non-repetitive)
FR-016: AI detects gaps in brief_state and steers conversation toward missing information
FR-017: AI detects contradictions between goals or requirements and surfaces them explicitly
FR-018: AI challenges weak or unclear strategic positions with specific counter-questions

### Brief Generation and Export
FR-019: System generates a final structured creative brief: executive summary, deliverables, open questions, recommended next steps
FR-020: User can export the brief as Markdown
FR-021: User can export the brief as PDF

### Authentication
FR-022: User must authenticate before accessing sessions (email/password or magic link via Supabase Auth)
FR-023: Each user can only access their own sessions (row-level isolation)

## Non-Functional Requirements

See `specs/nfr.md` for full detail.

NFR-001: Voice mode end-to-end latency ≤ 500ms p95 (including barge-in)
NFR-002: Chat streaming first token ≤ 300ms p95
NFR-003: AI outputs are structured and deterministic — no hallucinated data, no irreversible autonomous actions
NFR-004: All data encrypted in transit (TLS 1.3) and at rest (AES-256)
NFR-005: Available on desktop and mobile browsers without native app install
NFR-006: User sessions are fully isolated — no data leakage between users

## Out of Scope
- Multi-agent autonomy
- CRM, project management, and team collaboration integrations
- Billing and subscription management
- Notion export (post-MVP)
- Complex automated downstream workflows
- Analytics dashboards for agencies
