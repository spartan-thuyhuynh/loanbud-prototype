# LoanBud CRM Phase 1 Prototype

React SPA prototype for Loanbud Feature Demo

## Getting Started

```bash
npm i           # install dependencies
npm run dev     # start dev server (http://localhost:5173)
npm run build   # production build
npm run lint    # ESLint (zero-warnings policy)
```

## Tech Stack

- **React 18** + **TypeScript** (strict mode)
- **Vite 6** — bundler
- **Tailwind CSS 4** + **Shadcn/ui** (Radix UI primitives)
- **React Router 7** — client-side routing
- **React Hook Form** — form state
- **Recharts** + **D3** — data visualizations
- **React DnD** — drag and drop
- **Sonner** — toast notifications

## Project Structure

```
src/
  app/
    App.tsx                        # Root component, routing, nav structure
    types/index.ts                 # Shared TypeScript interfaces & view types
    data/
      store.ts                     # localStorage-backed data store (runtime source of truth)
      contacts.json                # Seed: CRM contacts
      segments.json                # Seed: user segments
      tasks.json                   # Seed: tasks
      taskItems.json               # Seed: task queue items
      emailHistory.json            # Seed: email send history
      campaigns.json               # Seed: email campaigns
    components/
      ui/                          # Shadcn UI primitives (avoid modifying)
      crm/                         # CRM feature components
      email-workflows/             # Email workflow feature components
      figma/                       # Figma-generated component stubs
  styles/
    theme.css                      # Design tokens (colors, typography)
    fonts.css                      # Font imports
```

## Features

### CRM

Contact management with views for Contacts, Companies, Leads, Deals, Tickets, Orders, Listings, Inbox, Calls, Meetings, Tasks, Playbooks, Message Templates, and Snippets.

### Email Workflows

Campaign management with Overview, Compose, Campaigns, User Segments, Flow Builder, Task Rules, Templates, and History views.

## Data & State

All data is client-side — no backend or database. `store.ts` seeds `localStorage` from JSON files on first load and exposes typed getters/setters for each entity. Use React Context for state shared across components.
