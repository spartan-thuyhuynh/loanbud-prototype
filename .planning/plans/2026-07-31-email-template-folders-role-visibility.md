# Email Template Folders & Role-Based Visibility — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **Route frontend execution to the `fe-plan-executor` agent.**

**Goal:** Replace the email templates' flat `category` string with a nested folder tree, and let admins hide folders/templates from loan officers on the Configuration page.

**Architecture:** Folders are a new tree entity (`parentId`). Each folder carries a single `visibleToLoanOfficers` boolean; templates inherit it and may override via a nullable `visibleToLoanOfficers` field. A pure resolver computes effective visibility for the logged-in role. Enforcement is scoped to the Email Templates tab only. All data flows through `store.ts` → `AppDataContext` per project convention.

**Tech Stack:** React 18 + TypeScript (strict), Vite 6, Tailwind 4 + Shadcn/Radix, Sonner toasts, `localStorage`-backed store. Vitest (added in Task 2) for the pure resolver only.

## Global Constraints

- **Scope: Email Templates tab only.** SMS/Voicemail tabs and their flat categories are untouched. (Spec: Non-Goals.)
- **Enforcement: Configuration page only.** Do NOT touch template pickers (`QuickEmailModal`, workflow step config, bulk email). (Spec: Non-Goals — "not real access control.")
- **Roles come from `src/app/config/team.ts`:** `TeamRole = "loan_officer" | "admin" | "super_admin"`. Admin & super_admin always see everything; the restriction only ever hides from `loan_officer`.
- **Single toggle, not a role matrix:** visibility is one boolean `visibleToLoanOfficers`. No multi-role UI.
- **Uncategorized default = visible to LOs.** A template with no folder and no override is visible.
- **TypeScript strict, ESLint zero-warnings:** no `any`, no unused imports. `npm run lint` must pass with 0 warnings and `npm run build` (tsc + vite) must succeed after every task.
- **Follow existing store/context patterns exactly** — new entity mirrors `loGroups` (object array with `read`/`write` + a `KEYS` entry).
- **Testing reality:** the repo has no component-test harness. TDD applies to the pure resolver module (Task 2) via Vitest. All other tasks are verified by `npm run lint`, `npm run build`, and the per-task Manual QA checklist. Do not install Testing Library/jsdom.
- **Date format for any displayed dates:** "Jun 10" (short month + day). (Not expected in this feature, but honor it if added.)

---

## File Structure

**Create:**
- `src/app/data/templateFolders.json` — seed folders (migrated from built-in email categories).
- `src/app/components/email-workflows/settings/templateVisibility.ts` — pure tree + visibility helpers (the only unit-tested module).
- `src/app/components/email-workflows/settings/templateVisibility.test.ts` — Vitest unit tests.
- `src/app/components/email-workflows/settings/FolderManagerModal.tsx` — admin folder CRUD + visibility toggle (replaces `CategoryManagerModal` usage in the email tab).
- `vitest.config.ts` — minimal Vitest config (node env).

**Modify:**
- `src/app/types/index.ts` — add `TemplateFolder`; change `AdminEmailTemplate` (`category` → `folderId`, add `visibleToLoanOfficers`).
- `src/app/data/adminEmailTemplates.json` — rewrite each template: drop `category`, add `folderId` + `visibleToLoanOfficers`.
- `src/app/data/store.ts` — add `templateFolders` store + `KEYS.templateFolders`; bump `KEYS.adminEmailTemplates` to v3.
- `src/app/contexts/AppDataContext.tsx` — folder state + CRUD handlers; `currentUserRole` state + setter; expose all in context type + provider value.
- `src/app/components/email-workflows/settings/EmailTemplatesTab.tsx` — folder-tree sidebar, role filtering, role switcher, folder select + visibility control in the form, read-only LO mode.
- `package.json` — add `"test": "vitest run"` script and `vitest` devDependency.

---

## Task 1: Data model — types, seed folders, store migration

**Files:**
- Modify: `src/app/types/index.ts:455-467`
- Create: `src/app/data/templateFolders.json`
- Modify: `src/app/data/adminEmailTemplates.json`
- Modify: `src/app/data/store.ts:20-43` (KEYS), `:185-193` (adminEmailTemplates store), add `templateFolders` store

**Interfaces:**
- Produces:
  - `TemplateFolder { id: string; name: string; parentId: string | null; visibleToLoanOfficers: boolean; createdAt: Date }`
  - `AdminEmailTemplate` now has `folderId: string | null` and `visibleToLoanOfficers: boolean | null` (replacing `category`).
  - `store.templateFolders.read(): TemplateFolder[]`, `store.templateFolders.write(data): void`
  - Seed folder ids: `fld-initial-outreach`, `fld-follow-up`, `fld-nurture`, `fld-re-engagement`, `fld-custom`

- [ ] **Step 1: Edit types.** In `src/app/types/index.ts`, replace the `AdminEmailTemplate` interface and remove `EmailTemplateCategory` (keep `SmsTemplateCategory`/`VoicemailCategory`). Add `TemplateFolder` above it:

```ts
export interface TemplateFolder {
  id: string;
  name: string;
  parentId: string | null;        // null = top-level
  visibleToLoanOfficers: boolean;
  createdAt: Date;
}

export interface AdminEmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  folderId: string | null;               // null = Uncategorized
  visibleToLoanOfficers: boolean | null; // override: null = inherit
  senderType: "brand" | "loan-officer";
  variables: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

Delete the line `export type EmailTemplateCategory = string;`.

- [ ] **Step 2: Create seed folders.** Create `src/app/data/templateFolders.json`:

```json
[
  { "id": "fld-initial-outreach", "name": "Initial Outreach", "parentId": null, "visibleToLoanOfficers": true, "createdAt": "2026-04-01T09:00:00.000Z" },
  { "id": "fld-follow-up", "name": "Follow-up", "parentId": null, "visibleToLoanOfficers": true, "createdAt": "2026-04-01T09:00:00.000Z" },
  { "id": "fld-nurture", "name": "Nurture", "parentId": null, "visibleToLoanOfficers": true, "createdAt": "2026-04-01T09:00:00.000Z" },
  { "id": "fld-re-engagement", "name": "Re-engagement", "parentId": null, "visibleToLoanOfficers": true, "createdAt": "2026-04-01T09:00:00.000Z" },
  { "id": "fld-custom", "name": "Custom", "parentId": null, "visibleToLoanOfficers": true, "createdAt": "2026-04-01T09:00:00.000Z" }
]
```

- [ ] **Step 3: Migrate template seed.** In `src/app/data/adminEmailTemplates.json`, for every template replace `"category": "<Name>"` with `"folderId": "<matching fld-id>"` and add `"visibleToLoanOfficers": null`. Mapping: Initial Outreach→`fld-initial-outreach`, Follow-up→`fld-follow-up`, Nurture→`fld-nurture`, Re-engagement→`fld-re-engagement`. Concretely: `etpl-1`→`fld-initial-outreach`, `etpl-2`→`fld-follow-up`, `etpl-3`→`fld-initial-outreach`, `etpl-4`→`fld-re-engagement`, `etpl-5`→`fld-nurture`. Example for `etpl-1` (apply the same edit to all five):

```json
{
  "id": "etpl-1",
  "name": "New Listing Claim",
  "subject": "Claim Your Listing - Fast Approval Available",
  "body": "Hi {{first_name}},\n\nI noticed your listing for {{listing_name}} and wanted to reach out personally.\n\nWe specialize in fast approvals and competitive rates. I'd love to discuss how we can help you move forward quickly.\n\nCan we schedule a quick call this week?\n\nBest regards,\nThe LoanBud Team",
  "folderId": "fld-initial-outreach",
  "visibleToLoanOfficers": null,
  "senderType": "brand",
  "variables": ["first_name", "listing_name"],
  "createdAt": "2026-04-01T09:00:00.000Z",
  "updatedAt": "2026-04-01T09:00:00.000Z"
}
```

- [ ] **Step 4: Wire the store.** In `src/app/data/store.ts`:
  - Add import near the other JSON imports: `import templateFoldersJson from "./templateFolders.json";`
  - In `KEYS`, bump `adminEmailTemplates` to `"loanbudcrm:v3:adminEmailTemplates"` (forces re-seed to the new shape) and add `templateFolders: "loanbudcrm:v1:templateFolders",`.
  - Add a `templateFolders` store block after the `adminEmailTemplates` block:

```ts
  templateFolders: {
    read: () =>
      read<TemplateFolder>(
        KEYS.templateFolders,
        templateFoldersJson as TemplateFolder[],
        ["createdAt"],
      ),
    write: (data: TemplateFolder[]) => write(KEYS.templateFolders, data),
  },
```

  - Add `TemplateFolder` to the type import on line 1.

- [ ] **Step 5: Verify build.**

Run: `npm run build`
Expected: PASS. TypeScript will surface every place `category` is still referenced (e.g. `EmailTemplatesTab.tsx`, `AppDataContext.tsx`). That is expected — those are fixed in Tasks 3 & 6. If the build fails ONLY on those two files' `category`/`EmailTemplateCategory` references, proceed. If it fails elsewhere, fix here.

> Note: because Steps affect only data shape, a temporary build break in `EmailTemplatesTab.tsx`/`AppDataContext.tsx` is acceptable until Task 3/6. To keep each task independently green, do Tasks 1→3→6 in order; do not commit Task 1 alone if you require a green build at every commit. If you require green commits, fold Task 1's commit into Task 3.

- [ ] **Step 6: Commit.**

```bash
git add src/app/types/index.ts src/app/data/templateFolders.json src/app/data/adminEmailTemplates.json src/app/data/store.ts
git commit -m "feat(email-templates): add TemplateFolder entity and migrate template seed to folderId"
```

---

## Task 2: Pure visibility resolver (TDD) + Vitest setup

**Files:**
- Create: `src/app/components/email-workflows/settings/templateVisibility.ts`
- Create: `src/app/components/email-workflows/settings/templateVisibility.test.ts`
- Create: `vitest.config.ts`
- Modify: `package.json` (add `vitest` devDep + `test` script)

**Interfaces:**
- Consumes: `TemplateFolder`, `AdminEmailTemplate` (Task 1), `TeamRole` (`src/app/config/team.ts`).
- Produces:
  - `isFolderVisibleToLO(folderId: string | null, folders: TemplateFolder[]): boolean` — walks ancestors; false if the folder or any ancestor is LO-hidden; `null` folderId → `true`.
  - `resolveTemplateVisibleToLO(template: AdminEmailTemplate, folders: TemplateFolder[]): boolean` — override wins; else inherit; else (no folder) `true`.
  - `canRoleSeeTemplate(template, folders, role): boolean` — non-LO roles always `true`.
  - `canRoleSeeFolder(folder: TemplateFolder, folders, role): boolean` — non-LO roles always `true`.
  - `getDescendantFolderIds(folderId: string, folders: TemplateFolder[]): string[]` — for cycle-safe move + delete promotion.

- [ ] **Step 1: Add Vitest.**

```bash
npm install -D vitest@2
```

Add to `package.json` `"scripts"`: `"test": "vitest run"`.

- [ ] **Step 2: Create `vitest.config.ts`:**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Write the failing test** — `src/app/components/email-workflows/settings/templateVisibility.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import type { AdminEmailTemplate, TemplateFolder } from "../../../types";
import {
  isFolderVisibleToLO,
  resolveTemplateVisibleToLO,
  canRoleSeeTemplate,
  canRoleSeeFolder,
  getDescendantFolderIds,
} from "./templateVisibility";

const folders: TemplateFolder[] = [
  { id: "a", name: "A", parentId: null, visibleToLoanOfficers: true, createdAt: new Date() },
  { id: "a1", name: "A1", parentId: "a", visibleToLoanOfficers: true, createdAt: new Date() },
  { id: "h", name: "Hidden", parentId: null, visibleToLoanOfficers: false, createdAt: new Date() },
  { id: "h1", name: "Hidden child", parentId: "h", visibleToLoanOfficers: true, createdAt: new Date() },
];

function tpl(over: Partial<AdminEmailTemplate>): AdminEmailTemplate {
  return {
    id: "t", name: "T", subject: "s", body: "b",
    folderId: null, visibleToLoanOfficers: null,
    senderType: "brand", variables: [], createdAt: new Date(), updatedAt: new Date(),
    ...over,
  };
}

describe("isFolderVisibleToLO", () => {
  it("null folderId (uncategorized) is visible", () => {
    expect(isFolderVisibleToLO(null, folders)).toBe(true);
  });
  it("a visible folder under a visible parent is visible", () => {
    expect(isFolderVisibleToLO("a1", folders)).toBe(true);
  });
  it("a visible folder under a hidden parent is hidden (inheritance)", () => {
    expect(isFolderVisibleToLO("h1", folders)).toBe(false);
  });
  it("unknown folderId is treated as visible", () => {
    expect(isFolderVisibleToLO("ghost", folders)).toBe(true);
  });
});

describe("resolveTemplateVisibleToLO", () => {
  it("override Hide wins over a visible folder", () => {
    expect(resolveTemplateVisibleToLO(tpl({ folderId: "a", visibleToLoanOfficers: false }), folders)).toBe(false);
  });
  it("override Show wins over a hidden folder", () => {
    expect(resolveTemplateVisibleToLO(tpl({ folderId: "h", visibleToLoanOfficers: true }), folders)).toBe(true);
  });
  it("no override inherits the folder", () => {
    expect(resolveTemplateVisibleToLO(tpl({ folderId: "h1", visibleToLoanOfficers: null }), folders)).toBe(false);
  });
  it("no override + no folder defaults to visible", () => {
    expect(resolveTemplateVisibleToLO(tpl({ folderId: null, visibleToLoanOfficers: null }), folders)).toBe(true);
  });
});

describe("role gating", () => {
  it("admin sees a hidden template", () => {
    expect(canRoleSeeTemplate(tpl({ folderId: "h" }), folders, "admin")).toBe(true);
  });
  it("super_admin sees a hidden folder", () => {
    expect(canRoleSeeFolder(folders[2], folders, "super_admin")).toBe(true);
  });
  it("loan_officer does not see a hidden template", () => {
    expect(canRoleSeeTemplate(tpl({ folderId: "h1" }), folders, "loan_officer")).toBe(false);
  });
  it("loan_officer sees a visible template", () => {
    expect(canRoleSeeTemplate(tpl({ folderId: "a1" }), folders, "loan_officer")).toBe(true);
  });
});

describe("getDescendantFolderIds", () => {
  it("returns nested descendants, excluding self", () => {
    expect(getDescendantFolderIds("a", folders)).toEqual(["a1"]);
  });
  it("returns [] for a leaf", () => {
    expect(getDescendantFolderIds("a1", folders)).toEqual([]);
  });
});
```

- [ ] **Step 4: Run test to verify it fails.**

Run: `npm test`
Expected: FAIL — cannot resolve `./templateVisibility` / functions not defined.

- [ ] **Step 5: Implement** — `src/app/components/email-workflows/settings/templateVisibility.ts`:

```ts
import type { AdminEmailTemplate, TemplateFolder } from "../../../types";
import type { TeamRole } from "../../../config/team";

/** Walk ancestors; hidden if this folder or any ancestor is LO-hidden. null = uncategorized = visible. */
export function isFolderVisibleToLO(folderId: string | null, folders: TemplateFolder[]): boolean {
  if (folderId === null) return true;
  const byId = new Map(folders.map((f) => [f.id, f]));
  let current = byId.get(folderId);
  const seen = new Set<string>(); // cycle guard
  while (current && !seen.has(current.id)) {
    if (!current.visibleToLoanOfficers) return false;
    seen.add(current.id);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return true; // unknown folder id or clean walk
}

/** Override wins; else inherit from folder; else (uncategorized) visible. */
export function resolveTemplateVisibleToLO(template: AdminEmailTemplate, folders: TemplateFolder[]): boolean {
  if (template.visibleToLoanOfficers !== null) return template.visibleToLoanOfficers;
  return isFolderVisibleToLO(template.folderId, folders);
}

export function canRoleSeeTemplate(template: AdminEmailTemplate, folders: TemplateFolder[], role: TeamRole): boolean {
  if (role !== "loan_officer") return true;
  return resolveTemplateVisibleToLO(template, folders);
}

export function canRoleSeeFolder(folder: TemplateFolder, folders: TemplateFolder[], role: TeamRole): boolean {
  if (role !== "loan_officer") return true;
  return isFolderVisibleToLO(folder.id, folders);
}

/** All descendant folder ids (excludes the folder itself). */
export function getDescendantFolderIds(folderId: string, folders: TemplateFolder[]): string[] {
  const out: string[] = [];
  const children = folders.filter((f) => f.parentId === folderId);
  for (const child of children) {
    out.push(child.id, ...getDescendantFolderIds(child.id, folders));
  }
  return out;
}
```

- [ ] **Step 6: Run test to verify it passes.**

Run: `npm test`
Expected: PASS (all cases).

- [ ] **Step 7: Commit.**

```bash
git add package.json package-lock.json vitest.config.ts src/app/components/email-workflows/settings/templateVisibility.ts src/app/components/email-workflows/settings/templateVisibility.test.ts
git commit -m "feat(email-templates): add pure folder-visibility resolver with vitest coverage"
```

---

## Task 3: AppDataContext — folder state, CRUD handlers, current role

**Files:**
- Modify: `src/app/contexts/AppDataContext.tsx` — type block (`:100-124`), state (`:172-181`), handlers (near `:1903-1937` and `:2030-2047`), provider value (`:2142-2162`)

**Interfaces:**
- Consumes: `store.templateFolders` (Task 1), `TeamRole`/`CURRENT_USER_ROLE` (`config/team.ts`), `getDescendantFolderIds` (Task 2).
- Produces (added to `AppDataContextType` and provider value):
  - `templateFolders: TemplateFolder[]`
  - `currentUserRole: TeamRole`
  - `handleSetCurrentUserRole: (role: TeamRole) => void`
  - `handleCreateFolder: (name: string, parentId: string | null) => void`
  - `handleRenameFolder: (id: string, name: string) => void`
  - `handleMoveFolder: (id: string, newParentId: string | null) => void` (rejects self/descendant target)
  - `handleSetFolderVisibility: (id: string, visibleToLoanOfficers: boolean) => void`
  - `handleDeleteFolder: (id: string) => void` (promotes subfolders to the deleted folder's parent; moves its direct templates to Uncategorized)
  - `handleSetTemplateVisibility: (id: string, visibleToLoanOfficers: boolean | null) => void`
  - Existing `handleCreate/UpdateAdminEmailTemplate` continue to work — their `Omit<AdminEmailTemplate, ...>` signatures now naturally carry `folderId` + `visibleToLoanOfficers`.

- [ ] **Step 1: Imports & type.** Add `TemplateFolder` to the type import (line 3). Add `import { CURRENT_USER_ROLE, type TeamRole } from "../config/team";` near the other imports. In `AppDataContextType`, add under the "Admin config data" section:

```ts
  templateFolders: TemplateFolder[];
  currentUserRole: TeamRole;
  handleSetCurrentUserRole: (role: TeamRole) => void;
  handleCreateFolder: (name: string, parentId: string | null) => void;
  handleRenameFolder: (id: string, name: string) => void;
  handleMoveFolder: (id: string, newParentId: string | null) => void;
  handleSetFolderVisibility: (id: string, visibleToLoanOfficers: boolean) => void;
  handleDeleteFolder: (id: string) => void;
  handleSetTemplateVisibility: (id: string, visibleToLoanOfficers: boolean | null) => void;
```

Remove the now-unused email-category members if you also retire them, OR keep them (SMS/voicemail still use category handlers — keep the SMS/voicemail ones; the EMAIL category handlers become unused after Task 6 and should be removed then, not now).

- [ ] **Step 2: State.** Near line 179, add:

```ts
  const [templateFolders, setTemplateFolders] = useState<TemplateFolder[]>(store.templateFolders.read());
  const [currentUserRole, setCurrentUserRole] = useState<TeamRole>(CURRENT_USER_ROLE);
```

Add `import { getDescendantFolderIds } from "../components/email-workflows/settings/templateVisibility";` near the top imports.

- [ ] **Step 3: Folder + role handlers.** Add near the email template handlers (~line 1937):

```ts
  const persistFolders = (updated: TemplateFolder[]) => {
    setTemplateFolders(updated);
    store.templateFolders.write(updated);
  };

  const handleSetCurrentUserRole = (role: TeamRole) => setCurrentUserRole(role);

  const handleCreateFolder = (name: string, parentId: string | null) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const created: TemplateFolder = {
      id: `fld-${Date.now()}`,
      name: trimmed,
      parentId,
      visibleToLoanOfficers: true,
      createdAt: new Date(),
    };
    persistFolders([...templateFolders, created]);
  };

  const handleRenameFolder = (id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    persistFolders(templateFolders.map((f) => (f.id === id ? { ...f, name: trimmed } : f)));
  };

  const handleMoveFolder = (id: string, newParentId: string | null) => {
    if (id === newParentId) return; // no self-parent
    if (newParentId !== null && getDescendantFolderIds(id, templateFolders).includes(newParentId)) return; // no cycle
    persistFolders(templateFolders.map((f) => (f.id === id ? { ...f, parentId: newParentId } : f)));
  };

  const handleSetFolderVisibility = (id: string, visibleToLoanOfficers: boolean) => {
    persistFolders(templateFolders.map((f) => (f.id === id ? { ...f, visibleToLoanOfficers } : f)));
  };

  const handleDeleteFolder = (id: string) => {
    const target = templateFolders.find((f) => f.id === id);
    if (!target) return;
    // Promote direct subfolders to the deleted folder's parent.
    const remaining = templateFolders
      .filter((f) => f.id !== id)
      .map((f) => (f.parentId === id ? { ...f, parentId: target.parentId } : f));
    persistFolders(remaining);
    // Move this folder's direct templates to Uncategorized (folderId null).
    const updatedTemplates = adminEmailTemplates.map((t) =>
      t.folderId === id ? { ...t, folderId: null } : t,
    );
    setAdminEmailTemplates(updatedTemplates);
    store.adminEmailTemplates.write(updatedTemplates);
  };

  const handleSetTemplateVisibility = (id: string, visibleToLoanOfficers: boolean | null) => {
    const updated = adminEmailTemplates.map((t) =>
      t.id === id ? { ...t, visibleToLoanOfficers } : t,
    );
    setAdminEmailTemplates(updated);
    store.adminEmailTemplates.write(updated);
  };
```

- [ ] **Step 4: Provider value.** In the context provider `value={{ ... }}` (~line 2142), add: `templateFolders, currentUserRole, handleSetCurrentUserRole, handleCreateFolder, handleRenameFolder, handleMoveFolder, handleSetFolderVisibility, handleDeleteFolder, handleSetTemplateVisibility,`.

- [ ] **Step 5: Verify.**

Run: `npm run build` — Expected: the ONLY remaining errors are in `EmailTemplatesTab.tsx` (still references `category`/`emailCategories`). Fixed in Task 6.
Run: `npm run lint` — Expected: no NEW warnings from `AppDataContext.tsx` (unused `getDescendantFolderIds` etc. must be resolved — all added symbols are used).

- [ ] **Step 6: Commit.**

```bash
git add src/app/contexts/AppDataContext.tsx
git commit -m "feat(email-templates): folder CRUD handlers and current-role state in AppDataContext"
```

---

## Task 4: Folder-tree sidebar with role filtering

**Files:**
- Modify: `src/app/components/email-workflows/settings/EmailTemplatesTab.tsx`

**Interfaces:**
- Consumes: `templateFolders`, `currentUserRole`, `adminEmailTemplates` from `useAppData()`; `canRoleSeeFolder`, `canRoleSeeTemplate`, `resolveTemplateVisibleToLO` from `./templateVisibility`.
- Produces: an inline `FolderTree` render (recursive) inside the existing `TemplateSidebarShell`, plus an "Uncategorized" bucket. Selecting a template still sets `selected`.

- [ ] **Step 1: Replace the sidebar list.** Swap the current category-sorted `sortedTemplates.map(...)` block for a role-filtered folder tree. Add these helpers at module scope in `EmailTemplatesTab.tsx`:

```tsx
import { ChevronRight, ChevronDown, Folder as FolderIcon, EyeOff } from "lucide-react";
import type { TeamRole } from "../../../config/team";
import { canRoleSeeFolder, canRoleSeeTemplate, resolveTemplateVisibleToLO } from "./templateVisibility";
```

Build the tree recursively. Inside the component, after reading context, compute visible sets:

```tsx
const isAdmin = currentUserRole !== "loan_officer";

const visibleFolders = templateFolders.filter((f) => canRoleSeeFolder(f, templateFolders, currentUserRole));
const visibleTemplates = adminEmailTemplates.filter((t) => canRoleSeeTemplate(t, templateFolders, currentUserRole));

const rootFolders = visibleFolders.filter((f) => f.parentId === null);
const childrenOf = (id: string) => visibleFolders.filter((f) => f.parentId === id);
const templatesInFolder = (id: string) => visibleTemplates.filter((t) => t.folderId === id);
const uncategorized = visibleTemplates.filter((t) => t.folderId === null);
```

- [ ] **Step 2: Expand/collapse state + recursive render.** Add `const [expanded, setExpanded] = useState<Set<string>>(() => new Set(templateFolders.map((f) => f.id)));` (default all open). Render each folder node and its templates; show the `EyeOff` badge only when `isAdmin` and the node is LO-hidden:

```tsx
function renderFolder(folderId: string, depth: number): React.ReactNode {
  const folder = visibleFolders.find((f) => f.id === folderId)!;
  const open = expanded.has(folderId);
  const loHidden = isAdmin && !canRoleSeeFolder(folder, templateFolders, "loan_officer");
  return (
    <div key={folderId}>
      <button
        onClick={() => setExpanded((s) => { const n = new Set(s); n.has(folderId) ? n.delete(folderId) : n.add(folderId); return n; })}
        className="w-full flex items-center gap-1.5 px-3 py-2 text-left hover:bg-background/60"
        style={{ paddingLeft: 12 + depth * 14 }}
      >
        {open ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
        <FolderIcon className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground truncate flex-1">{folder.name}</span>
        {loHidden && <EyeOff className="w-3 h-3 text-muted-foreground/70" aria-label="Hidden from loan officers" />}
      </button>
      {open && (
        <>
          {childrenOf(folderId).map((c) => renderFolder(c.id, depth + 1))}
          {templatesInFolder(folderId).map((t) => renderTemplateRow(t, depth + 1))}
        </>
      )}
    </div>
  );
}
```

`renderTemplateRow(t, depth)` is the existing per-template `<button>` block (keep its selected/hover styling), with `style={{ paddingLeft: 12 + depth * 14 }}` and, when `isAdmin && !resolveTemplateVisibleToLO(t, templateFolders)`, an `EyeOff` icon after the name. Remove the old category badge (`{t.category}` no longer exists).

- [ ] **Step 3: Assemble sidebar body.**

```tsx
{rootFolders.map((f) => renderFolder(f.id, 0))}
{uncategorized.length > 0 && (
  <div>
    <div className="px-3 py-2 text-[11px] uppercase tracking-wide text-muted-foreground">Uncategorized</div>
    {uncategorized.map((t) => renderTemplateRow(t, 1))}
  </div>
)}
```

Delete the now-unused `sortedTemplates` computation.

- [ ] **Step 4: Verify.**

Run: `npm run build` then `npm run lint` — Expected: PASS (0 warnings). If `category`/`emailCategories` references remain, they are removed in Task 6; if the build still errors on them, temporarily keep the category modal wired until Task 6 (do Task 6 next).

- [ ] **Step 5: Manual QA.** `npm run dev`, open Configuration → Email Templates. Expected: templates nested under their folders; "Uncategorized" only appears if a template has no folder; selecting a template opens its detail on the right.

- [ ] **Step 6: Commit.**

```bash
git add src/app/components/email-workflows/settings/EmailTemplatesTab.tsx
git commit -m "feat(email-templates): folder-tree sidebar with role-filtered visibility"
```

---

## Task 5: Folder manager modal (admin CRUD + visibility toggle)

**Files:**
- Create: `src/app/components/email-workflows/settings/FolderManagerModal.tsx`
- Modify: `src/app/components/email-workflows/settings/EmailTemplatesTab.tsx` (swap the "Template Categories" button + modal for "Manage Folders")

**Interfaces:**
- Consumes: `templateFolders`, `handleCreateFolder`, `handleRenameFolder`, `handleMoveFolder`, `handleSetFolderVisibility`, `handleDeleteFolder`.
- Produces: `<FolderManagerModal open onOpenChange folders onCreate onRename onMove onSetVisibility onDelete />`.

- [ ] **Step 1: Build the modal.** Create `FolderManagerModal.tsx` modeled on `CategoryManagerModal.tsx` (same `Dialog` shell, add/rename/delete-confirm patterns) with these additions per row: a parent selector (native `<select>` of other folders + "— Top level —", excluding self and descendants via `getDescendantFolderIds`) calling `onMove`, and a Radix `Switch` (`../../ui/switch`) bound to `visibleToLoanOfficers` calling `onSetVisibility`. Props:

```tsx
interface FolderManagerModalProps {
  open: boolean;
  folders: TemplateFolder[];
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string, parentId: string | null) => void;
  onRename: (id: string, name: string) => void;
  onMove: (id: string, newParentId: string | null) => void;
  onSetVisibility: (id: string, visible: boolean) => void;
  onDelete: (id: string) => void;
}
```

New-folder row: a text input + a parent `<select>` (default Top level) + "Add" calling `onCreate(name, parentId)`. Show folders indented by depth for readability. Delete confirm copy: "Templates in this folder move to Uncategorized; subfolders move up one level." Use `toast.success`/`toast.error` mirroring `CategoryManagerModal`.

- [ ] **Step 2: Wire into the tab.** In `EmailTemplatesTab.tsx`: replace the `onCategories`/`CategoryManagerModal` usage. Rename the sidebar button label to "Manage Folders" (the `onCategories` prop of `TemplateSidebarShell` still triggers it — reuse it, or rename to `onManageFolders`). Render `<FolderManagerModal ... />` instead of `<CategoryManagerModal ... />`. The "Manage Folders" button and modal are shown only when `isAdmin`.

- [ ] **Step 3: Verify.**

Run: `npm run build` && `npm run lint` — Expected: PASS, 0 warnings.

- [ ] **Step 4: Manual QA.** As admin: create a subfolder, rename it, move it under another folder (confirm you cannot move a folder into its own descendant — the select omits them), toggle "Visible to Loan Officers" off (the tree shows an `EyeOff` badge on it), delete a folder (its templates land in Uncategorized; subfolders move up). 

- [ ] **Step 5: Commit.**

```bash
git add src/app/components/email-workflows/settings/FolderManagerModal.tsx src/app/components/email-workflows/settings/EmailTemplatesTab.tsx
git commit -m "feat(email-templates): folder manager modal with move and LO-visibility toggle"
```

---

## Task 6: Template form (folder select + visibility override), role switcher, read-only LO mode

**Files:**
- Modify: `src/app/components/email-workflows/settings/EmailTemplatesTab.tsx`
- Modify: `src/app/contexts/AppDataContext.tsx` (remove now-unused EMAIL category handlers/state + type members)

**Interfaces:**
- Consumes: `templateFolders`, `currentUserRole`, `handleSetCurrentUserRole`, `handleSetTemplateVisibility`, existing create/update handlers.
- Produces: form state carries `folderId: string | null` + `visibilityOverride: "inherit" | "show" | "hide"`; header role switcher; LO read-only detail.

- [ ] **Step 1: Rework form state.** Replace `emptyForm`'s `category` with `folderId: null as string | null` and add `visibility: "inherit" as "inherit" | "show" | "hide"`. In `TemplateForm`, replace the Category `<Select>` with a Folder `<Select>` whose items are `templateFolders` (indent by depth) plus a "No folder (Uncategorized)" option mapped to `""`↔`null`. Add a Visibility `<Select>` with `inherit`/`show`/`hide`. Map on save: `visibleToLoanOfficers = visibility === "inherit" ? null : visibility === "show"`.

```tsx
// value <-> null bridging for the folder select
value={form.folderId ?? "__none__"}
onValueChange={(v) => onChange({ folderId: v === "__none__" ? null : v })}
// ...
<SelectItem value="__none__">No folder (Uncategorized)</SelectItem>
{templateFolders.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
```

- [ ] **Step 2: Save/edit wiring.** `handleCreate` passes `{ ...newForm-mapped, folderId, visibleToLoanOfficers }` to `handleCreateAdminEmailTemplate` (drop `category`). `openEdit` seeds `folderId` from `selected.folderId` and `visibility` from `selected.visibleToLoanOfficers` (`null`→"inherit", `true`→"show", `false`→"hide"). `handleEditConfirmSave` includes `folderId` + `visibleToLoanOfficers` in the update payload.

- [ ] **Step 3: Role switcher in header.** In the tab header row, when rendering, add a small inline control (visible always — it's a demo affordance):

```tsx
<div className="flex items-center gap-2">
  <span className="text-[11px] text-muted-foreground">View as</span>
  <Select value={currentUserRole} onValueChange={(v) => handleSetCurrentUserRole(v as TeamRole)}>
    <SelectTrigger className="h-7 w-40 text-xs"><SelectValue /></SelectTrigger>
    <SelectContent>
      <SelectItem value="admin">Admin</SelectItem>
      <SelectItem value="super_admin">Super Admin</SelectItem>
      <SelectItem value="loan_officer">Loan Officer</SelectItem>
    </SelectContent>
  </Select>
</div>
```

- [ ] **Step 4: Read-only LO mode.** When `!isAdmin`: hide the "New Template", "Manage Folders" buttons, and the detail-panel Edit/Delete actions (pass an `isAdmin`/`readOnly` flag into `TemplateSidebarShell` and `TemplateDetailHeader`, or conditionally render them). If a previously-`selected` template becomes invisible after switching to LO view, clear it: `useEffect(() => { if (selected && !canRoleSeeTemplate(selected, templateFolders, currentUserRole)) setSelected(null); }, [currentUserRole, selected, templateFolders]);`.

- [ ] **Step 5: Remove dead email-category code.** Delete `emailCategories` state, `handleAddEmailCategory`/`handleDeleteEmailCategory`/`handleRenameEmailCategory`, their type members, and provider entries from `AppDataContext.tsx`. Delete `store.emailCategories` + `KEYS.emailCategories` from `store.ts`. Leave SMS/voicemail category code intact. (Do NOT delete `CategoryManagerModal.tsx` — `SmsTemplatesTab`/`VoicemailScriptsTab` still use it.)

- [ ] **Step 6: Verify.**

Run: `npm run build` && `npm run lint` && `npm test` — Expected: all PASS, 0 lint warnings, resolver tests green.

- [ ] **Step 7: Manual QA (the acceptance demo).** `npm run dev`:
  1. As **Admin**: create a template in a folder; set its visibility to "Hide from LOs"; note the `EyeOff` badge.
  2. Hide a whole folder via Manage Folders; its subtree shows badges.
  3. Switch **View as → Loan Officer**: the hidden folder/template disappear; New Template/Manage Folders/Edit/Delete are gone; the layout is read-only.
  4. Switch back to **Admin**: everything returns.
  5. Confirm `QuickEmailModal` (compose email from a contact) still lists ALL templates — proving the config-page-only scope held.

- [ ] **Step 8: Commit.**

```bash
git add src/app/components/email-workflows/settings/EmailTemplatesTab.tsx src/app/contexts/AppDataContext.tsx src/app/data/store.ts
git commit -m "feat(email-templates): folder+visibility template form, role switcher, LO read-only mode"
```

---

## Self-Review

**Spec coverage:**
- Folders replace categories, nested tree → Task 1 (types/seed) + Task 4 (tree UI) ✓
- Templates can be uncategorized (`folderId: null`) → Task 1 + Task 4 (Uncategorized bucket) ✓
- Single "Visible to Loan Officers?" toggle, admins see all → Task 2 (resolver) + Task 5 (folder toggle) + Task 6 (override) ✓
- Resolution: override → inherit → default visible → Task 2 (unit-tested) ✓
- Config-page-only enforcement; pickers untouched → Global Constraints + Task 6 Step 7.5 QA ✓
- Authority: admin CRUD + sees all; LO read-only → Task 5 (admin gating) + Task 6 Step 4 ✓
- Delete → Uncategorized, subfolders promoted → Task 3 `handleDeleteFolder` ✓
- Migration in seed/store → Task 1 ✓
- Role switcher demo affordance → Task 6 Step 3 ✓
- Email-only scope; SMS/voicemail keep categories → Global Constraints + Task 6 Step 5 (keep SMS/VM) ✓

**Placeholder scan:** No TBD/TODO; every code step has concrete code. ✓

**Type consistency:** `folderId`/`visibleToLoanOfficers` names, `TemplateFolder` shape, and handler signatures match across Tasks 1/2/3/6. `getDescendantFolderIds` defined in Task 2, consumed in Task 3 & Task 5. ✓

**Known ordering caveat:** Task 1 alone leaves a temporary build break in `EmailTemplatesTab`/`AppDataContext` until Tasks 3 & 6 land. Documented in Task 1 Step 5 — if green-at-every-commit is required, execute 1→3→4→5→6 without pausing on Task 1's commit, or fold Task 1 into Task 3.
