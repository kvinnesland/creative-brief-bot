# DECISIONS.md

> Append-only. Document every significant architectural or governance decision.

## Format
```
DATE: YYYY-MM-DD
DECISION: [short title]
CONTEXT: [why was this needed]
DECISION: [what was decided]
ALTERNATIVES CONSIDERED: [what else was evaluated]
RATIONALE: [why this option]
CONSEQUENCES: [what this enables or constrains]
DECIDED BY: human | Claude | both
```

## Decisions

DATE: 2026-05-19
DECISION: Select tech stack — Next.js 16 / Supabase / OpenAI / Vercel
CONTEXT: Tech stack needed before any implementation begins.
DECISION: Next.js App Router (TypeScript), Supabase (Postgres + Auth + Storage), OpenAI API (chat + structured outputs + Realtime API for voice), Vercel AI SDK, deployed on Vercel.
ALTERNATIVES CONSIDERED: Remix + PlanetScale; SvelteKit; Django backend with React frontend.
RATIONALE: Fastest path to a full-stack streaming AI product with voice. Vercel AI SDK has first-class streaming support. Supabase provides auth + DB + storage in one service. OpenAI Realtime API is the only viable low-latency voice option at this time.
CONSEQUENCES: Committed to OpenAI for AI (not provider-agnostic). Serverless deployment — no persistent server processes; voice relay must use WebRTC.
DECIDED BY: human

DATE: 2026-05-19
DECISION: Agent pipeline architecture (Brief Extractor → Gap Finder → Contradiction Checker → Conversation Agent)
CONTEXT: AI must do more than generate responses — it must maintain structured state and reason about it.
DECISION: Split AI responsibilities into four specialized agents orchestrated by brief-service. Each agent has a defined input/output contract. brief-service composes them sequentially per turn.
ALTERNATIVES CONSIDERED: Single monolithic prompt; LangChain agent loop.
RATIONALE: Separation of concerns makes each agent testable and replaceable. Deterministic pipeline avoids runaway agent loops. Single monolithic prompt is too hard to reason about or debug.
CONSEQUENCES: More code per turn; each agent is an OpenAI call. brief-service is the critical orchestration component.
DECIDED BY: human + Claude

DATE: 2026-05-19
DECISION: Design system — premium editorial palette, Inter, 3-column shell
CONTEXT: UI must be implemented consistently from day one. Tokens defined before first UI CR.
DECISION: App background #F6F3EC (warm off-white), accent #1C3B1C (dark green), system font (Inter), panel radius 20px, pill buttons (radius 999px). 3-column shell: 260px / flex / 380px with 16px gaps and outer padding.
ALTERNATIVES CONSIDERED: Pure white (#FFFFFF) background; blue accent; custom display font.
RATIONALE: Warm off-white background gives premium, editorial feel without being sterile. Dark green accent is calm and professional — avoids "tech startup blue". System font keeps MVP fast and avoids font loading complexity.
CONSEQUENCES: All UI components must use tokens from specs/ui-spec.md. No ad-hoc color values in components.
DECIDED BY: human

DATE: 2026-05-19
DECISION: Initialize Supabase client inside event handlers, not at component level
CONTEXT: Next.js 16 pre-renders Client Components to static HTML at build time. @supabase/ssr createBrowserClient throws if NEXT_PUBLIC_ env vars are absent during build — which they are in CI and on developer machines before env setup.
DECISION: Create the Supabase browser client inside each event handler function, not as a component-level const. This avoids calling createBrowserClient during SSR/pre-rendering.
ALTERNATIVES CONSIDERED: export const dynamic = 'force-dynamic' (did not prevent the SSR pass); useEffect initialization (more complex, async state).
RATIONALE: Simplest fix with no runtime cost. Browser client creation is fast and instantaneous — no need to cache it across renders.
CONSEQUENCES: Every auth event handler creates a new client instance. Acceptable for auth flows (low frequency). Pattern must be followed for any future client components that need Supabase.
DECIDED BY: Claude

DATE: 2026-05-19
DECISION: Use proxy.ts (not middleware.ts) for Next.js 16 auth guard
CONTEXT: Next.js 16 deprecated middleware.ts and renamed the convention to proxy.ts. The export function must also be named proxy, not middleware.
DECISION: Use proxy.ts with export function proxy() following the Next.js 16 convention.
ALTERNATIVES CONSIDERED: Keep middleware.ts (works with deprecation warning; may break in future major version).
RATIONALE: Follow current convention to avoid future breaking change.
CONSEQUENCES: Any docs or tutorials referencing middleware.ts need mental translation. Function name in proxy.ts is proxy, not middleware.
DECIDED BY: Claude

DATE: 2026-05-19
DECISION: Adopt governed AI-native repository structure
CONTEXT: AI-assisted development across multiple sessions requires explicit session continuity, change traceability, and governance to prevent architectural drift.
DECISION: Implement full governance structure with CLAUDE.md, session orchestration, CR system, review system, and agent roles.
ALTERNATIVES CONSIDERED: Ad-hoc prompting; rules-only approach.
RATIONALE: Ad-hoc prompting loses context between sessions. Explicit structure makes AI behavior deterministic and auditable.
CONSEQUENCES: All changes require a CR. Sessions start and end with orchestration file updates.
DECIDED BY: human

DATE: 2026-05-19
DECISION: Full dark premium editorial visual redesign
CONTEXT: Original beige/light theme felt generic, startup-SaaS, and template-like. Product ambition is a luxury creative operating system for serious creative strategists.
DECISION: Replace entire design system with dark surfaces (#0D0D0D base), warm muted gold accent (#D4AF37), Playfair Display serif headings paired with Inter body, 3-column shell resized to 300px / flex / 420px with 20px gaps, cinematic glass-effect assistant messages, gold-tinted user messages, thin 2px progress bar with gold glow.
ALTERNATIVES CONSIDERED: Keeping light theme with richer tokens; partial dark mode via prefers-color-scheme; blue-grey dark palette.
RATIONALE: Gold + dark surfaces conveys exclusivity, editorial intelligence, and calm focus. Playfair Display creates immediate typographic differentiation. The emotional target ("This is where serious creative thinking happens") required a full systemic shift, not incremental polish.
CONSEQUENCES: specs/ui-spec.md is now out of sync with implementation — should be updated before next UI CR. All future components must use CSS custom properties from globals.css, not hardcoded values.
DECIDED BY: human

DATE: 2026-05-20
DECISION: Use @react-pdf/renderer (server-side) for PDF export, not headless browser
CONTEXT: CR-004 required a print-ready PDF export of the creative brief. Two main approaches: server-side React-to-PDF rendering vs. headless Chromium (Puppeteer/Playwright).
DECISION: @react-pdf/renderer declared as serverExternalPackage in next.config.ts. BriefDocument is a server-only React component rendered via renderToBuffer in the API route. Light editorial PDF design (A4, Times-Roman headings, Helvetica body, gold bullet accents).
ALTERNATIVES CONSIDERED: Puppeteer/Playwright screenshot-to-PDF (would require headless browser in serverless — incompatible with Vercel); react-to-print (client-side only, browser print dialog).
RATIONALE: @react-pdf/renderer runs in Node.js with no browser dependency, makes a clean PDF (not a screenshot), and works inside Vercel serverless functions. Produces deterministic output suitable for client delivery.
CONSEQUENCES: PDF design is decoupled from the app's dark theme — intentionally uses a clean light layout (client-facing document vs. tool UI). Font options limited to PDF-safe fonts (Helvetica, Times-Roman, Courier) unless custom fonts are registered.
DECIDED BY: Claude

DATE: 2026-05-20
DECISION: Extract SessionCard to a "use client" component
CONTEXT: Visual redesign (Session 4) added onMouseEnter/onMouseLeave hover handlers directly to SessionCard inside sessions/page.tsx (a server component). React 19 throws a runtime error when a server component contains event handler props — this caused /sessions to 500.
DECISION: Extract SessionCard and StatusBadge to app/(app)/sessions/session-card.tsx with "use client" directive. page.tsx remains a server component responsible only for data fetching and layout.
ALTERNATIVES CONSIDERED: Add "use client" to page.tsx (would lose server-side data fetching and redirect); use CSS :hover instead of JS handlers (viable, but requires refactor to className-based styling).
RATIONALE: Cleanest split — server component handles auth + data, client component handles interactivity. Aligns with Next.js App Router best practice.
CONSEQUENCES: Pattern to follow for any future interactive list items or cards. page.tsx is now purely a server component.
DECIDED BY: Claude
