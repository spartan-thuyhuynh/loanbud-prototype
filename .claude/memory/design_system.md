---
name: LoanBudCRM design system
description: Color tokens, fonts, sidebar theme, status colors — all from theme.css and Figma
type: project
---

**Source:** `src/styles/theme.css` (CSS custom properties, light + dark mode).

## Colors

- Primary brand: `#0d5e52` (deep teal) — `--primary`
- Accent: `#fbbf24` (amber) — `--accent`
- Destructive: `#dc2626` (red) — `--destructive`
- Background: `#fafafa` — `--background`
- Card: `#ffffff` — `--card`
- Muted foreground: `#6b7280` — `--muted-foreground`
- Border: `#e5e7eb` — `--border`

## Sidebar theme

- Background: `#0d5e52` (teal) — `--sidebar`
- Active/accent: `#fbbf24` (amber) — `--sidebar-primary`
- Hover: `#0a4d44` (darker teal) — `--sidebar-accent`

## Listing / status colors

| Status | Color |
|--------|-------|
| New | #3b82f6 (blue) |
| Draft | #8b5cf6 (purple) |
| Submitted | #10b981 (green) |
| On Hold | #f59e0b (amber) |
| Declined | #ef4444 (red) |
| Closed | #64748b (slate) |

## Typography

- Sans: **Poppins** (300, 400, 500, 600, 700) — `src/styles/fonts.css`
- Mono: **DM Mono** (300, 400, 500)
- Base font-size: **16px** (`--font-size: 16px`)

## Design rules (from Figma)

- Date format: "Jun 10" (short month + day), never full ISO strings
- Max 4 items in any bottom toolbar
- Never use floating action button with bottom toolbar
- Chips always come in sets of 3 or more
- Don't use a dropdown for 2 or fewer options

## Component tokens

- Border radius: 0.5rem (base) — `--radius`
- Tailwind CSS 4 — utility-first; CSS custom properties drive the theme
- Shadcn/ui components wrap Radix primitives with these tokens applied
- Dark theme defined via `.dark` class with oklch color values
