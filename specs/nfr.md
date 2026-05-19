# nfr.md — Non-Functional Requirements

## Performance
- Voice mode end-to-end latency: ≤ 500ms p95 (including barge-in / interruption handling)
- Chat streaming first token: ≤ 300ms p95
- Page load (initial, desktop): ≤ 2s on standard broadband connection
- BriefState update round-trip: ≤ 1s after each AI turn
- Concurrent sessions (MVP target): ≥ 50 simultaneous users

## Security
- Authentication: Supabase Auth — email/password and magic link
- Authorization: Supabase Row-Level Security (RLS) — users can only read/write their own rows
- Rate limiting: 60 AI requests per minute per user (enforced at API route level)
- Encryption at rest: AES-256 (Supabase default)
- Encryption in transit: TLS 1.3
- File uploads: validated for type and size server-side before processing; stored in private Supabase Storage bucket

## Availability
- Uptime target: 99.5% (MVP — Vercel + Supabase hosted)
- RTO (Recovery Time Objective): 1 hour
- RPO (Recovery Point Objective): 15 minutes

## Observability
- Logging: structured JSON (Vercel function logs + custom application logs)
- Error tracking: Sentry (or Vercel error monitoring)
- Tracing: OpenTelemetry — post-MVP
- Alerting: Vercel alerts for sustained error rate > 1%

## Tech Stack
- Runtime: Node.js 20 (Next.js 14+ App Router, TypeScript)
- Database: PostgreSQL 15 via Supabase
- Frontend: Next.js, React, TypeScript, Tailwind CSS
- AI: OpenAI API (chat completions + structured outputs), OpenAI Realtime API (voice via WebRTC)
- State / streaming: Vercel AI SDK (useChat, streaming helpers)
- Auth + Storage: Supabase Auth, Supabase Storage
- Cloud / hosting: Vercel (frontend + serverless API routes)
- CI/CD: GitHub Actions

## Browser Support
- Desktop: Chrome, Firefox, Safari, Edge (latest two major versions)
- Mobile: Chrome on Android, Safari on iOS (latest two major versions)
- Voice mode requires WebRTC support — not available in all environments
