# ui-spec.md — UI Specification

> Canonical design tokens and screen definitions.
> No UI may be implemented that is not defined here.
> All values are authoritative — Tailwind config and component styles must derive from these.

---

## Design Tokens

### Colors

```
/* App backgrounds */
--color-bg-app:           #F6F3EC   /* outer app background */
--color-surface-primary:  #FFFFFF   /* main panel / card surface */
--color-surface-secondary:#EFEAE0   /* muted surface, sidebar backgrounds */
--color-surface-elevated: #FFFFFF   /* elevated card (same as primary for MVP) */
--color-border:           #DED7CA   /* subtle dividers, panel borders, input borders */

/* Text */
--color-text-primary:     #1F2A24   /* headings, body copy */
--color-text-secondary:   #5F675F   /* supporting text, labels */
--color-text-muted:       #8A9188   /* placeholders, timestamps, meta */
--color-text-inverted:    #FFFFFF   /* text on dark/accent backgrounds */

/* Accent */
--color-accent:           #1C3B1C   /* primary CTA, active states */
--color-accent-hover:     #254D25   /* hover state for accent elements */
--color-accent-soft:      #E4EBDD   /* soft accent background, selected state */

/* Status */
--color-error:            #B42318
--color-error-soft:       #FDECEC
--color-warning:          #B7791F
--color-success:          #2F6B3F
```

### Typography

Font stack:
```css
font-family:
  Inter,
  ui-sans-serif,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

Scale:

| Token | Size / Line height | Weight | Usage |
|---|---|---|---|
| `text-page-title` | 28px / 36px | 650 | Page headings |
| `text-section-title` | 18px / 26px | 600 | Section headers, panel titles |
| `text-body` | 15px / 24px | 400 | All body copy, chat messages |
| `text-small` | 13px / 20px | 400 | Meta, timestamps, captions |
| `text-button` | 14px / 20px | 600 | Button labels |

### Spacing

```
xs:  4px
sm:  8px
md:  16px
lg:  24px
xl:  32px
2xl: 48px
```

### Border Radius

```
radius-sm:   8px    /* inputs, small elements */
radius-md:   12px   /* inputs (canonical) */
radius-lg:   20px   /* panels */
radius-xl:   24px   /* auth card */
radius-full: 999px  /* pill buttons */
```

---

## Screens

---

### Screen: Login

Route: `/login`
Purpose: Authenticate an existing user via email/password or magic link.

Layout:
- Full-screen background: `#F6F3EC`
- Centered card: 420px wide, `#FFFFFF`, border-radius 24px, padding 32px, border `1px solid #DED7CA`
- Vertically and horizontally centered on the page

Components:
- Product wordmark / logo (top of card)
- Email input (height 44px, radius 12px, border `#DED7CA`, focus border `#1C3B1C`)
- Password input (same styling as email)
- Primary button: "Sign in" (background `#1C3B1C`, text `#FFFFFF`, radius 999px, height 44px, full width)
- Divider + "Or continue with magic link" link
- Magic link email input (same styling) + "Send link" secondary button
- Link to `/signup`

States: default | loading (button disabled + spinner) | error (inline error below relevant field, color `#B42318`) | magic-link-sent (confirmation message)

---

### Screen: Sign Up

Route: `/signup`
Purpose: Register a new user.

Layout: Same centered card layout as Login.

Components:
- Email input
- Password input
- Primary button: "Create account"
- Link to `/login`

States: default | loading | error | success (redirect to `/sessions`)

---

### Screen: Session List

Route: `/sessions`
Purpose: Show all brief sessions belonging to the authenticated user. Entry point to create a new session.

Layout:
- App background: `#F6F3EC`
- Narrow centered content column (max-width 720px)
- Top navigation bar: product name + user menu (sign out)

Components:
- Page title: "Your Briefs"
- "New Brief" primary button (accent, pill, top right)
- Session list: each session as a card (`#FFFFFF`, border `#DED7CA`, radius 20px, padding 16px 20px)
  - Session title (text-section-title)
  - Status badge (in_progress / completed / archived)
  - Created date (text-small, text-muted)

States: empty (illustration + "Start your first brief" CTA) | loading | populated

---

### Screen: Session Detail (3-Column Shell)

Route: `/sessions/[id]`
Purpose: Primary work surface. Houses the conversation, live brief state, and session navigation.

Layout:

```css
.session-shell {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr) 380px;
  gap: 16px;
  padding: 16px;
  height: 100vh;
  background: #F6F3EC;
}

.panel {
  background: #FFFFFF;
  border: 1px solid #DED7CA;
  border-radius: 20px;
  overflow: hidden;
}
```

**Left panel (260px) — Session Navigation**
- Product logo / wordmark
- Session title (editable, text-section-title)
- Session list (scrollable) — each item: session title, status dot, date
- "New Brief" button at bottom
- User avatar / sign out link at bottom

**Center panel (flex) — Chat Area**
- Header: session title + status
- Message thread (scrollable): user messages right-aligned, assistant messages left-aligned
- Input area (pinned to bottom): textarea + send button + attach button + voice toggle
- Placeholder state: "Describe your project to get started"

**Right panel (380px) — Live Brief State**
- Panel title: "Brief"
- Scrollable list of brief sections:
  - Section name (text-small, text-secondary)
  - Confidence indicator (progress bar, accent color)
  - Section value (text-body) or "Not yet defined" (text-muted)
- Open questions list (text-small, warning color)
- "Export Brief" button at bottom (accent, pill, full-width) — disabled until minimum completeness reached

**Responsive behavior:**
- `< 1100px`: left sidebar collapses to icon-only or hidden (toggle button)
- `< 900px`: right brief panel becomes a bottom drawer (tap-to-expand) or accessible via tab
- `< 640px` (mobile): single-column layout, chat-first; brief state and nav accessible via bottom tabs or drawer

---

## Component Tokens (reusable)

### Primary Button
```
background:    #1C3B1C
color:         #FFFFFF
border-radius: 999px
height:        44px
padding:       0 20px
font:          text-button
hover:         background #254D25
disabled:      opacity 0.5, cursor not-allowed
```

### Secondary Button
```
background:    transparent
color:         #1F2A24
border:        1px solid #DED7CA
border-radius: 999px
height:        44px
padding:       0 20px
font:          text-button
hover:         background #EFEAE0
```

### Text Input
```
height:        44px
border-radius: 12px
border:        1px solid #DED7CA
background:    #FFFFFF
color:         #1F2A24
font:          text-body
padding:       0 14px
focus:         border-color #1C3B1C, outline none
placeholder:   color #8A9188
error:         border-color #B42318
```

### Panel
```
background:    #FFFFFF
border:        1px solid #DED7CA
border-radius: 20px
overflow:      hidden
```
