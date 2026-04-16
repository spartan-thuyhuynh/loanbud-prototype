# LoanBud CRM

## Project Overview

LoanBud CRM Phase 1 Prototype — React SPA for loan management.

- Frontend-only (no backend, no DB); all data is client-side mock data in `src/app/data/seeds.ts`
- Figma-originated project: components reflect the design system

## Tech Stack

- React 18 + TypeScript (strict mode)
- Vite 6 (bundler)
- Tailwind CSS 4 + Shadcn/ui (Radix UI primitives)
- React Router 7
- React Hook Form
- Recharts + D3 (data viz)
- React DnD (drag and drop)
- Sonner (toasts)

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — ESLint (zero-warnings policy)

## Key Source Paths

- `src/app/App.tsx` — root component, routing, nav structure
- `src/app/components/ui/` — Shadcn UI primitives (do not modify unless necessary)
- `src/app/components/crm/` — CRM feature components
- `src/app/components/email-workflows/` — Email workflow feature components
- `src/app/types/index.ts` — shared TypeScript interfaces
- `src/app/data/seeds.ts` — mock data

## Coding Conventions

- Use existing Shadcn UI components from `src/app/components/ui/` — don't reach for MUI unless already in use in that file
- Prefer Tailwind utility classes over inline styles or new CSS files
- No absolute positioning unless strictly necessary; use flex/grid layouts
- Keep components focused; extract helpers/subcomponents to their own files when a file grows large
- TypeScript strict — no `any`, no unused imports (ESLint enforces zero warnings)
- Date format: "Jun 10" style (short month + day)

## State Management

- React Context API for shared state (no Redux, no Zustand)
- No backend calls — all data flows from `seeds.ts` or local component state
