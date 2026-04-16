# LoanBud CRM

## Project Overview

LoanBud CRM Phase 1 Prototype — React SPA for loan management.

- Frontend-only (no backend, no DB); all data lives in JSON seed files under `src/app/data/`
- `src/app/data/store.ts` manages reads/writes via `localStorage`, seeded from JSON files on first load
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
- `src/app/components/crm/` — CRM feature components (CRMSidebar, ContactList, etc.)
- `src/app/components/email-workflows/` — Email workflow feature components
- `src/app/types/index.ts` — shared TypeScript interfaces and view/section union types
- `src/app/data/store.ts` — localStorage-backed data store (source of truth at runtime)
- `src/app/data/*.json` — seed data files: contacts, segments, tasks, taskItems, emailHistory, campaigns

## Coding Conventions

- Use existing Shadcn UI components from `src/app/components/ui/` — don't reach for MUI unless already in use in that file
- Prefer Tailwind utility classes over inline styles or new CSS files
- No absolute positioning unless strictly necessary; use flex/grid layouts
- Keep components focused; extract helpers/subcomponents to their own files when a file grows large
- TypeScript strict — no `any`, no unused imports (ESLint enforces zero warnings)
- Date format: "Jun 10" style (short month + day)

## State Management

- React Context API for shared state (no Redux, no Zustand)
- No backend calls — all data flows from `store.ts` (which seeds from JSON files) or local component state
- `store.ts` exposes typed getters/setters per entity; always go through it rather than importing JSON directly
