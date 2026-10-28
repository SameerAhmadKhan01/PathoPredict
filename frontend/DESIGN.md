# Design System: PathoPredict — Calm Instrument

## 1. Visual Theme & Atmosphere

A warm, reassuring clinical screening interface that feels like a
thoughtful consultation — not a cold dashboard or a dramatic dark cockpit.
The atmosphere is composed and patient: generous whitespace, soft surfaces,
and deliberate typography that guides the eye rather than demanding attention.

- **Density:** 5 — Balanced, breathable but not sparse
- **Variance:** 4 — Gently asymmetric, approachable structure
- **Motion:** 5 — Fluid spring-physics transitions, staggered section reveals

The emotional register is **reassuring guidance** — a nervous user who
just Googled their symptoms should feel calmer after arriving here,
not more anxious.

## 2. Color Palette & Roles

### Light Surfaces
- **Warm Linen** (`#FAF9F7`) — Primary page background canvas
- **Clean Surface** (`#FFFFFF`) — Card and container fill, elevated panels
- **Soft Shell** (`#F3F1EE`) — Subtle secondary surface, input backgrounds, hover states

### Text Hierarchy
- **Deep Graphite** (`#1A1D23`) — Primary headings and body text (never pure black)
- **Slate Prose** (`#555B67`) — Secondary text, descriptions, clinical notes
- **Quiet Gray** (`#8B919D`) — Tertiary text, metadata labels, timestamps
- **Whisper** (`#B5BAC4`) — Placeholder text, disabled states

### Functional Accent
- **Calm Blue-Slate** (`#4A6FA5`) — Single primary accent for CTAs, active states, focus rings, progress bars, links
- **Calm Blue Hover** (`#3D5E8E`) — Hover/active state for primary accent
- **Calm Blue Light** (`#EBF0F7`) — Light tint for badges, selected-state backgrounds

### Severity Colors (used ONLY for clinical meaning)
- **Alert Amber** (`#C47D1A`) — Warning-level clinical flags, moderate severity
- **Alert Amber Light** (`#FEF6E8`) — Background for amber severity badges
- **Critical Vermillion** (`#C0392B`) — Critical red-flag alerts ONLY. Never used for buttons, branding, or decoration
- **Critical Vermillion Light** (`#FDF0EE`) — Background for critical alert banners

### Structural
- **Hairline** (`#E5E2DD`) — Borders, dividers, 1px structural lines
- **Hairline Strong** (`#D1CEC8`) — Emphasized borders (focus, active)

## 3. Typography Rules

- **Display/Headlines:** `Satoshi` — Medium weight (500), tracked tight (-0.02em), controlled scale. Hierarchy through size and color, not dramatic weight swings. Sizes: 48px (hero), 36px (page title), 28px (section heading), 22px (card heading)
- **Body:** `IBM Plex Sans` — Regular weight (400), relaxed leading (1.65), max 65 characters per line. Secondary text uses Slate Prose color
- **Mono:** `JetBrains Mono` — For percentages, probability figures, clinical codes, test numbering. Weight 400-500
- **Scale discipline:** Headings use Satoshi exclusively. Body and labels use IBM Plex Sans exclusively. Numbers in data-dense contexts use JetBrains Mono. No mixing within a single text element
- **Banned:** Inter, generic serif fonts in data views, Times New Roman, Georgia

## 4. Component Stylings

### Buttons
- **Primary:** `bg-accent text-white` — Rounded corners (8px), no outer glow. Subtle translateY(-1px) + shadow lift on hover. translateY(0) on active for tactile push
- **Secondary/Ghost:** `bg-transparent border-hairline text-deep-graphite` — Border darkens to hairline-strong on hover
- **Danger (clinical only):** `bg-critical-vermillion text-white` — Reserved for destructive clinical actions
- **Disabled:** `bg-soft-shell text-whisper cursor-not-allowed`
- **Minimum touch target:** 44px height on all interactive elements

### Cards
- **Default:** `bg-white rounded-xl border border-hairline` — Rounded corners at 12px. Subtle shadow: `0 1px 3px rgba(26,29,35,0.04), 0 1px 2px rgba(26,29,35,0.02)`. Used only when elevation serves hierarchy
- **Elevated (primary results):** Same + increased shadow: `0 4px 12px rgba(26,29,35,0.06), 0 1px 3px rgba(26,29,35,0.04)` + extra internal padding (32-40px)
- **High-density areas:** Replace cards with border-top dividers and whitespace separation

### Inputs
- **Container:** `bg-soft-shell rounded-lg border border-hairline` — Focus ring in accent blue (2px). No floating labels
- **Label:** Above input, IBM Plex Sans 13px, Slate Prose color, 6px margin-bottom
- **Placeholder:** Whisper color, italic
- **Error:** Below input, Critical Vermillion, 12px

### Loaders
- **Skeletal shimmer** matching exact layout dimensions — no circular spinners. Shimmer uses a left-to-right gradient sweep on opacity (0.4 → 0.7 → 0.4). Shape matches the content it replaces (rectangle for text, circle for avatars)

### Empty States
- Centered composition with Quiet Gray text, actionable suggestion text, and a subtle illustration or icon

### Badges & Pills
- **Default:** `bg-soft-shell text-slate-prose rounded-md px-2.5 py-1 text-xs`
- **Active/Selected:** `bg-calm-blue-light text-accent border border-accent/20 rounded-md`
- **Critical:** `bg-critical-light text-critical-vermillion rounded-md` — used ONLY for medical severity
- **Severity dot:** Small 6px circle in severity color, placed before label text

## 5. Layout Principles

- **Max-width containment:** 1120px centered, with 24px mobile padding and 32px desktop padding
- **Grid-first architecture:** CSS Grid over Flexbox math. No `calc()` percentage hacks
- **Section spacing:** `clamp(3rem, 6vw, 5rem)` between major page sections
- **Internal card padding:** 24px mobile, 32-40px desktop
- **Single-column collapse:** All multi-column layouts collapse below 768px. No exceptions
- **No horizontal scroll:** Overflow on mobile is a critical failure
- **Typography line length:** Max 65ch for body text paragraphs
- **Content breathing room:** Minimum 16px gap between adjacent cards/elements

## 6. Motion & Interaction

- **Spring physics default:** `transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)` — weighty, slightly bouncy feel
- **Page entrance:** Each section fades up with 80ms stagger delay using `opacity: 0 → 1` + `translateY(12px → 0)`. Duration: 400ms per element
- **Button interaction:** `transform: translateY(-1px)` on hover, `translateY(0)` on active (tactile press)
- **Card hover:** Subtle shadow increase + 1px translateY lift, 200ms transition
- **Progress bars:** Animate width with 600ms ease-out on mount
- **Performance:** Animate exclusively via `transform` and `opacity`. Never animate `top`, `left`, `width`, `height` for layout — use `scaleX` for progress bars
- **Reduced motion:** Respect `prefers-reduced-motion: reduce` — disable all animations, show final state immediately

## 7. Anti-Patterns (Banned)

- No emojis anywhere in the interface
- No `Inter` font
- No pure black (`#000000`) — use Deep Graphite (`#1A1D23`)
- No neon/outer glow shadows
- No oversaturated accents (saturation below 65%)
- No `//` separator formatting (`SYSTEM // 2024`, `CH-01 // 1200ms`)
- No fabricated data or statistics (no made-up percentages, latencies, or calibration scores)
- No AI copywriting cliches ("Elevate", "Seamless", "Unleash", "Next-Gen")
- No filler UI text ("Scroll to explore", "Swipe down", bouncing chevrons)
- No generic circular spinners — use skeletal loaders
- No 3-column equal card layouts — use asymmetric grid or zig-zag
- No custom mouse cursors
- No overlapping elements — clean spatial separation always
- Red (`#C0392B`) is NEVER used for buttons, branding, or decoration — only for critical medical alerts
- No centered hero sections — use left-aligned or split layouts
