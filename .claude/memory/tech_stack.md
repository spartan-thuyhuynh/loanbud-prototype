---
name: LoanBudCRM tech stack and dependencies
description: Framework versions, key packages, build config, and notable dep choices
type: project
---

## Core

- React 18.3.1 + TypeScript (strict mode, no `any`)
- Vite 6.4.2 with `@vitejs/plugin-react` and `@tailwindcss/vite`
- Tailwind CSS 4.1.12

## UI

- Shadcn/ui (Radix UI primitives) — 45 components in `src/app/components/ui/`
- `@mui/material` 7.3.5 + `@emotion/*` — present in deps but Shadcn is preferred; MUI only if already used in a file
- `lucide-react` 0.487.0 — icon library
- `next-themes` 0.4.6 — theme toggling

## Forms & Validation

- `react-hook-form` 7.55.0

## Data Viz

- `recharts` 2.15.2
- D3 (pulled in via recharts)

## Routing

- `react-router` 7.13.0

## Drag & Drop

- `react-dnd` 16.0.1 + `react-dnd-html5-backend`

## Notifications

- `sonner` 2.0.3

## Date Handling

- `date-fns` 3.6.0
- `react-day-picker` 8.10.1

## Carousel

- `embla-carousel-react` 8.6.0
- `react-slick` 0.31.0

## Animation

- `motion` 12.23.24
- `canvas-confetti` 1.9.4

## Utilities

- `clsx` 2.1.1
- `class-variance-authority` 0.7.1
- `tailwind-merge` 3.2.0
- `cmdk` 1.1.1 (command palette)
- `vaul` 1.1.2 (drawer)
- `react-resizable-panels` 2.1.7
- `react-responsive-masonry` 2.7.1

## Build notes

- Custom Vite plugin `figmaAssetResolver()` handles `figma:asset/*` imports from Figma Make exports
- Deploy base: `/loanbud-prototype/`
- ESLint 10.2.0 with typescript-eslint 8.58.2, zero-warnings policy
