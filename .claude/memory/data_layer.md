---
name: LoanBudCRM data layer
description: How data is stored, seeded, and accessed at runtime — localStorage + JSON seeds via store.ts and AppDataContext
type: project
---

**Fact:** All runtime data lives in `localStorage`, seeded from JSON files on first load. There is no backend or API.

`src/app/data/store.ts` is the single source of truth. It exposes a `store` object with typed read/write methods per entity. Components must go through `store` — never import JSON files directly.

## Storage keys (namespace `loanbudcrm:`)

| Key | Type |
|-----|------|
| `loanbudcrm:contacts` | Contact[] |
| `loanbudcrm:segments` | Segment[] |
| `loanbudcrm:taskItems` | TaskItem[] |
| `loanbudcrm:emailHistory` | EmailRecord[] |
| `loanbudcrm:tasks` | Task[] |
| `loanbudcrm:campaigns` | Campaign[] |
| `loanbudcrm:applications` | Application[] |
| `loanbudcrm:businessAcquisitions` | BusinessAcquisitionRecord[] |

## Store API (`store.<entity>.read() / write()`)

Each entity has `read(): T[]` and `write(data: T[]): void`. Date strings are revived to Date objects on read.

## Seed data files (`src/app/data/`)

contacts.json, segments.json, emailHistory.json, tasks.json, taskItems.json, campaigns.json, applications.json, businessAcquisitions.json

## State management — AppDataContext

`src/app/contexts/AppDataContext.tsx` (not App.tsx) holds all shared state and exposes:

**Data:** `contacts`, `emailHistory`, `tasks`, `taskItems`, `campaigns`, `applications`, `businessAcquisitions`

**Task handlers:**
- `handleCompleteTask(taskId, disposition)` — marks completed, updates tasks + taskItems
- `handleRescheduleTask(taskId, newDate)` — updates scheduledFor/dueDate
- `handleDeleteTask(taskId)` — removes from tasks + taskItems
- `handleBulkCompleteTask(taskIds, disposition)`
- `handleBulkRescheduleTask(taskIds, newDate)`
- `handleBulkDeleteTask(taskIds)`

**Contact handler:**
- `handleUpdateContact(contactId, updates: Partial<Contact>)` — merges updates and persists

**Task creation:**
- `handleCreateTask({ contactId, contactName, taskType, dueDate, objective, vmScript?, assignee? })` — creates Task + TaskItem (sourceType: "manual")

**Compose / campaign pipeline:**
- `handleCompose(params)` — creates EmailRecord(s), Task(s), TaskItem(s), and Campaign; params include recipients, subject, senderIdentity, segmentId, campaignName, reminders array

**Hook:** `useAppData()` — access context; throws if used outside AppDataProvider

## Key internals (store.ts)

- `reviveDates<T>(items, dateFields)` — converts date strings back to Date objects after JSON.parse
- `read<T>(key, fallback, dateFields)` — reads from localStorage or falls back to JSON seed
- `write<T>(key, data)` — serializes and persists to localStorage

**Why:** Frontend-only prototype; localStorage gives persistence across page reloads without a backend.
**How to apply:** When adding a new entity — add a key to KEYS in store.ts, add a getter/setter pair, add a JSON seed file, add state + handlers to AppDataContext. Never use local component state for data that needs to persist.
