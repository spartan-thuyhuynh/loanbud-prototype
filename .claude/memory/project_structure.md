---
name: LoanBudCRM project structure
description: Full folder structure, path aliases, all component locations — updated Apr 2026
type: project
---

## Routing

Routes are defined in `src/app/router.tsx` (not App.tsx). Base path: `/loanbud-prototype/`.

| Path | Component |
|------|-----------|
| `/` | → redirect to `/applications` |
| `/applications` | `ApplicationList` |
| `/business-acquisition` | `BusinessAcquisitionList` |
| `/users` `/automations` `/questionnaires` `/configurations` | `PlaceholderView` |
| `/crm` | → redirect to `/crm/contacts` (via CRMLayout) |
| `/crm/contacts` | `ContactList` |
| `/crm/contacts/:id` | `ContactDetail` |
| `/crm/companies` `/crm/inbox` `/crm/calls` `/crm/meetings` | `PlaceholderView` |
| `/crm/tasks` | `TaskQueue` |
| `/email-workflows` | → redirect to `/email-workflows/overview` (via EmailWorkflowsLayout) |
| `/email-workflows/overview` | `Overview` |
| `/email-workflows/campaigns` | `Campaigns` |
| `/email-workflows/flow-builder` | `FlowBuilder` |
| `/email-workflows/user-segments` | `UserSegments` |
| `/email-workflows/user-segments/builder` | `SegmentsView` |
| `/email-workflows/templates` | `TemplatesView` |
| `/email-workflows/history` | `EmailHistory` |
| `/email-workflows/compose` | `ComposeEmail` |
| `/email-workflows/tasks` | `TaskQueue` |

## Component tree

`src/app/components/` organized by domain:

**`applications/`** (new)
- `ApplicationList.tsx` — loan applications data table with 8 stage tabs, search, bulk select
- `BusinessAcquisitionList.tsx` — business acquisition records table with 7 stage tabs

**`crm/`**
- `CRMSidebar.tsx`
- `ContactList.tsx` — paginated contact list with search and filters
- `ContactDetail.tsx` — 3-column detail page (contact info sidebar / email timeline + tasks center / linked listing + upcoming tasks right)

**`email-workflows/`**
- Top-level: Overview, Campaigns, CampaignDetail, CampaignManager, ComposeEmail, EmailHistory, EmailWorkflowsSidebar, FlowBuilder, SegmentsView, TaskQueue, TemplatesView, UserSegments
- Action modals: `CreateTaskModal.tsx`, `TaskActionModal.tsx`, `TaskBulkActionModal.tsx`, `TaskBulkActionsBar.tsx`
- `campaign/` — EmailTemplates, NewCampaignModal, PerformanceAnalytics, SegmentBuilder, SendCampaigns, campaign-data.ts, types.ts
- `campaign/campaign-detail/` — BulkActionModal, BulkActionsBar, CampaignContactTable, CampaignMetricsHeader, ContactFilterBar, InsightFilterCards
- `campaign/email-templates/` — TemplateEditorPanel, TemplateLibraryPanel, TemplateViewerPanel
- `campaign/segment-builder/` — FilterGroupCard, InlineToggle, SaveSegmentModal, SegmentPreviewPanel
- `campaign/send-campaigns/` — CampaignConfirmationView

**`figma/`** — ImageWithFallback

**`ui/`** — 45 Shadcn/Radix UI primitives (do not modify); custom: IconSidebar.tsx, PlaceholderView.tsx, sonner.tsx, use-mobile.ts, utils.ts

## Key shared files

- Types: `src/app/types/index.ts` (Contact, Task, TaskItem, Segment, EmailRecord, Application, BusinessAcquisitionRecord, nav unions)
- Campaign types: `src/app/components/email-workflows/campaign/types.ts`
- Data store: `src/app/data/store.ts`
- App data context: `src/app/contexts/AppDataContext.tsx`
- Navigation config: `src/app/data/navigation.ts`
- Figma imports: `src/imports/` (auto-generated, do not modify)

## Path aliases (vite.config.ts + tsconfig)

- `@` → `src/`
- `@app` → `src/app/`
- `@features` → `src/app/components/`
- `@ui` → `src/app/components/ui/`
- `@types` → `src/app/types/`
- `@data` → `src/app/data/`

**Why:** Figma Make exported a flat scaffold; refactored for scalability.
**How to apply:** New features go in a new domain folder under `src/app/components/`. Import types from `@app/types`, data from `@data/store`. Never import JSON seed files directly in components.
