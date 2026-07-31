# Email Template Configuration — Folders & Role-Based Visibility

**Date:** 2026-07-31
**Status:** Design — approved for spec review
**Scope:** Email Templates tab of the Configuration page (`EmailTemplatesTab.tsx`) only

---

## Problem

The email template configuration page organizes templates with a single **flat `category`** string
(managed via `CategoryManagerModal`). Two gaps:

1. **No hierarchy.** As templates grow, a flat category list stops scaling — there's no way to group
   related categories (e.g. "Outreach → Cold / Warm") or reflect how teams actually think about them.
2. **No visibility control.** Every template is visible to everyone who opens the page. There's no way
   to keep certain templates (e.g. internal fee-waiver scripts) out of a loan officer's view.

## Proposed Solution

Replace the flat category with a **nested folder tree** and attach a **role-based visibility toggle**
to folders, inherited by the templates inside them.

### Folder model

- Folders **replace** flat categories entirely. A folder is a tree node (`parentId` → nesting).
- Folders exist for exactly two purposes: **organizing** templates and **carrying a visibility
  restriction** that templates inherit. Nothing more.
- A template may live **outside any folder** (`folderId: null`) — the "Uncategorized" case.

### Visibility model — a single toggle

The authority decision is: **admins & super-admins always see every template.** The restriction can
therefore only ever act on the `loan_officer` role. A full three-role matrix would be theater (the
admin/super_admin boxes are always checked and un-uncheckable), so visibility collapses to one control:

> **"Visible to Loan Officers?"** — a boolean, per folder, with a per-template override.

If true multi-role granularity is needed later, the boolean can grow to `visibleToRoles: TeamRole[]`
without reworking the tree.

### Effective visibility resolution (per template)

Resolved top-down for the **loan_officer** role only (admins/super_admins bypass — always visible):

1. Template has an explicit override (`Show` / `Hide`) → **use it** (wins always).
2. Else, template has a folder → **inherit**: walk up ancestors; if **any** ancestor folder is
   LO-hidden, the template is LO-hidden.
3. Else (no override **and** no folder) → **default: visible to loan officers.**

The template's `visibleToLoanOfficers` field is both the folder override *and* the standalone value for
uncategorized templates — no extra field needed.

### Authority model

| Role | Capabilities |
| --- | --- |
| `loan_officer` | Read-only. Sees only permitted folders/templates (hidden nodes are simply absent). |
| `admin` | Full CRUD on folders + templates; sets visibility; **sees everything** (hidden items badged). |
| `super_admin` | Same as admin. |

Deleting a folder does **not** cascade-delete its templates — they move to Uncategorized.

## Data Model

New entity (`src/app/types/index.ts`):

```ts
export interface TemplateFolder {
  id: string;
  name: string;
  parentId: string | null;         // null = top-level; nesting forms the tree
  visibleToLoanOfficers: boolean;  // the single restriction toggle
  createdAt: Date;
}
```

Change to `AdminEmailTemplate`:

```ts
export interface AdminEmailTemplate {
  // ...existing fields (id, name, subject, body, senderType, variables, createdAt, updatedAt)
  folderId: string | null;               // REPLACES `category: string`
  visibleToLoanOfficers: boolean | null; // NEW — override: null = inherit, true = Show, false = Hide
}
```

`EmailTemplateCategory` type and the `category` field are removed from the email path. (SMS/Voicemail
retain their own category types — out of scope, see below.)

## UI

### Sidebar — folder tree (replaces category-sorted flat list)

- Expand/collapse folder nodes; templates render as leaves within their folder.
- A virtual **"Uncategorized"** bucket at the bottom holds `folderId: null` templates. It is not a real
  folder (no toggle, cannot be deleted/renamed) — just a bin.
- **Admin view:** full tree; LO-hidden folders and templates carry a muted eye-off badge.
- **Loan-officer view:** read-only, already filtered — hidden nodes are absent.

### Folder management (admin only)

Replace the "Template Categories" button with **"Manage Folders"**:

- Create (pick parent), rename, move (re-parent), delete.
- Single **"Visible to Loan Officers"** toggle per folder.
- Delete moves the folder's templates to Uncategorized (no orphan cascade).

### Template form

- `Category` select → **`Folder` select** (tree dropdown; includes a "No folder" option).
- New **Visibility** control: `Inherit from folder` / `Show to LOs` / `Hide from LOs`
  (→ override = `null` / `true` / `false`). Not shown in the LO read-only view.

### Demo affordance — role switcher

`CURRENT_USER_ROLE` (`src/app/config/team.ts`) is a hardcoded constant, so the LO experience is
invisible when running the prototype. Add a small **role switcher** (admin ↔ loan_officer) in the
Email Templates tab header so the restriction can be demonstrated live. Prototype-only affordance.

## Migration (one-time, in `store.ts` seed)

- Each existing flat email category → a **top-level folder**, `visibleToLoanOfficers: true`.
- Each template's `category` string → the matching `folderId`; `visibleToLoanOfficers` override = `null`
  (inherit).
- Existing data simply re-homes into folders; nothing breaks.

## State & Handlers

- `store.ts`: add `TemplateFolder` getters/setters seeded from a new `templateFolders` source; migrate
  templates' `category` → `folderId` on first load.
- `AppDataContext`: add folder CRUD handlers (`handleCreateFolder`, `handleRenameFolder`,
  `handleMoveFolder`, `handleDeleteFolder`, `handleSetFolderVisibility`) and template handlers for
  `folderId` + visibility override. Expose current role + a `handleSetCurrentRole` for the switcher.
- A pure helper `resolveTemplateVisibility(template, folders, role)` implements the resolution rules and
  is unit-testable in isolation.

## Out of Scope (Non-Goals)

- **Not real access control.** Enforcement is **config-page-only** for Phase 1. Template *pickers*
  (QuickEmailModal, workflow step config, bulk email) are unchanged and still show all templates. A
  "hidden" template is still usable elsewhere; visibility here = decluttering the admin view.
- **Email Templates only.** SMS and Voicemail tabs keep their flat categories.
- No multi-role matrix (single LO toggle only).
- No per-user or ownership-based visibility (roles only).
- No folder visibility applied to who can *send* (`senderType` is unrelated and untouched).

## Trade-offs

- **Single toggle vs role matrix:** simpler UI and honest to the chosen access model, at the cost of
  granularity that isn't needed today. Mitigated by the boolean→array growth path.
- **Config-page-only enforcement:** fast and low-risk, but visibility is organizational, not security.
  Explicitly documented so no one mistakes it for access control.
- **Delete → Uncategorized (no cascade):** safe (never loses templates) but can leave a pile of loose
  templates after aggressive folder cleanup. Acceptable for a prototype.

## Success Criteria

- Templates can be organized into nested folders; existing categories migrate without data loss.
- An admin can hide a folder (or a single template) from loan officers via one toggle/override.
- With the role switcher set to `loan_officer`, hidden folders/templates disappear from the tree; set to
  `admin`, everything is visible with hidden items badged.
- Template pickers elsewhere are visibly unchanged (proves scope boundary held).

## Open Questions

None blocking. (No source PRD was available — the link originally provided pointed to RFC-009 / Lead
Source Pyramid, unrelated. This design was derived directly from the two stated requirements.)
