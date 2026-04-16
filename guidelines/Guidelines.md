# LoanBud CRM — Development Guidelines

## General

- Only use absolute positioning when necessary; prefer flex/grid layouts
- Keep file sizes small — extract helper functions and subcomponents into their own files when a component grows large
- No unused imports; ESLint enforces zero-warning policy
- TypeScript strict mode — no `any` types

## Design System

- Base font-size: 14px
- Date formats: always "Jun 10" style (short month + day)
- Use Shadcn UI components from `src/app/components/ui/` for all UI primitives
- Prefer Tailwind utility classes over inline styles or new CSS files
- Color tokens and typography are defined in `src/styles/theme.css`

## Component Guidelines

### Buttons
- **Primary** — main action per section; filled with brand color; one per section
- **Secondary** — supporting/alternative actions; outlined, transparent background
- **Tertiary** — least important actions; text-only, no border

### Navigation
- Icon sidebar (`IconSidebar.tsx`) handles top-level section switching
- Section-level sidebars (e.g. `CRMSidebar`, `EmailWorkflowsSidebar`) handle sub-views
- Maximum 4 items in any bottom toolbar
- Never combine a floating action button with a bottom toolbar

### Forms
- Use React Hook Form for all form state
- Validate at the field level; show inline errors below each field
- Use Shadcn `<Input>`, `<Select>`, `<Checkbox>` etc. — do not build custom form primitives

### Data & State
- All runtime data flows through `src/app/data/store.ts` — never import JSON seed files directly in components
- Use React Context for state shared across multiple components
- Local UI state (open/close, hover, active tab) stays in component state

## Email Workflows

- Views: Overview, Compose, Campaigns, User Segments, Flow Builder, Task Rules, Templates, History
- Campaign data lives in `campaigns.json`, accessed via `store.ts`
- Segment builder (`SegmentBuilderView`) is a standalone view, not a modal

## CRM

- Views: Contacts, Companies, Leads, Deals, Tickets, Orders, Listings, Segments/Lists, Inbox, Calls, Meetings, Tasks, Playbooks, Message Templates, Snippets
- Contact data lives in `contacts.json`, accessed via `store.ts`
