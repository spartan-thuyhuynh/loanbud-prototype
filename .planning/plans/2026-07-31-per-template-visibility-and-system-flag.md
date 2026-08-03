# Per-Template Visibility (detail screen) + System Flag + List Cleanup — Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use `- [ ]` checkboxes.

**Goal:** Move email-template visibility to a **per-template Public / Admin-only** control in the detail screen; add a **System** flag that hides a template from all manual-send pickers; and remove all visibility UI from the list table.

**Architecture:** Visibility already resolves correctly (`templateVisibility.ts`: admin/super_admin see all; loan_officer sees a template only when `visibleToLoanOfficers` resolves true). We stop *editing* visibility on the list and instead edit it per-template in the editor page as a 2-way **Public (`true`) / Admin only (`false`)** choice (default Public). Folders become organize-only (always Public); the folder visibility toggle + its list column are removed. A new `isSystem` boolean filters templates out of the manual-send dropdowns (`QuickEmailModal`, `StepConfigForm`) while leaving them in the config list.

**Tech Stack:** React 18, React Router 7, Tailwind/Shadcn, existing `AppDataContext` + `templateVisibility.ts`, Vitest.

## Global Constraints
- **Package manager: npm.** No yarn; never add/keep a `packageManager` field (corepack re-adds it → `git checkout -- package.json`).
- **Type gate (build does NOT type-check):** `npx tsc -p tsconfig.typecheck.json`. Establish the current baseline count at task start (repo is not type-clean); each task must add **0 new** errors and keep edited files 0-error. `noUnusedLocals`/`noUnusedParameters` ON. (If `tsconfig.typecheck.json` is missing on this fresh branch, create it — same content as used previously: the app compilerOptions + `noEmit`, `ignoreDeprecations: "6.0"`, `include: ["src"]`, no project references.)
- **`npm run build` succeeds; `npm test` stays green** (currently 23).
- **Reuse the resolver** (`canRoleSeeTemplate`/`resolveTemplateVisibleToLO`) — do NOT change its semantics. Admin-only = `visibleToLoanOfficers: false`; Public = `true`; legacy `null` still resolves to Public via the (always-Public) folder default.
- Role-based *filtering* of the config list stays (loan_officer must not see admin-only templates). Only the visibility *editing/display controls* are removed from the list.
- Unlayer editor integration is unchanged; don't touch it beyond adding sidebar fields.

## File Structure
- **Modify** `src/app/types/index.ts` — add `isSystem?: boolean` to `AdminEmailTemplate`.
- **Modify** `src/app/data/store.ts` — bump `KEYS.adminEmailTemplates` to v6.
- **Modify** `src/app/components/email-workflows/settings/EmailTemplateEditorPage.tsx` — add Visibility (Public/Admin only) + System controls to the right sidebar; persist both.
- **Modify** `src/app/components/email-workflows/settings/EmailTemplateTable.tsx` — remove the "Visible to LOs" column, per-row visible/hidden display, and the folder eye-toggle; add a small "System" badge.
- **Modify** `src/app/components/email-workflows/QuickEmailModal.tsx` and `src/app/components/email-workflows/StepConfigForm.tsx` — filter out `isSystem` templates from their dropdowns.

---

## Task 1: `isSystem` field + detail-screen Visibility & System controls

**Files:** `types/index.ts`, `store.ts`, `EmailTemplateEditorPage.tsx`.

**Interfaces — Produces:** `AdminEmailTemplate.isSystem?: boolean`; editor page persists `visibleToLoanOfficers` (true/false) and `isSystem`.

- [ ] **Step 1: Type.** In `types/index.ts` `AdminEmailTemplate`, add:
```ts
  /** System templates are managed in config but hidden from manual-send pickers. */
  isSystem?: boolean;
```

- [ ] **Step 2: Store bump.** `store.ts`: `KEYS.adminEmailTemplates` → `"loanbudcrm:v6:adminEmailTemplates"`. (Seed templates have no `isSystem` → treated as non-system; no seed edit needed.)

- [ ] **Step 3: Editor page state.** In `EmailTemplateEditorPage.tsx` inner component, add state seeded from `existing`:
```ts
const [visibility, setVisibility] = useState<"public" | "admin">(
  existing?.visibleToLoanOfficers === false ? "admin" : "public"
);
const [isSystem, setIsSystem] = useState<boolean>(existing?.isSystem ?? false);
```

- [ ] **Step 4: Persist on save.** In the save payload, set:
```ts
visibleToLoanOfficers: visibility === "public",
isSystem,
```
(Replace the current `visibleToLoanOfficers: existing?.visibleToLoanOfficers ?? null` line.)

- [ ] **Step 5: Sidebar UI.** In the right settings sidebar (after Subject, before/around Placeholders), add two controls, admin-editable only (`!readOnly`), using existing Shadcn `Select`/`Switch` + `FieldLabel`:
  - **Visibility** — a `Select` (or two-button segmented control) with options **Public** (`public`) and **Admin only** (`admin`), bound to `visibility`/`setVisibility`. Helper text: "Admin only hides this template from loan officers."
  - **System email** — a `Switch` (`../../ui/switch`) bound to `isSystem`/`setIsSystem`, label "System email", helper text: "System templates can't be sent manually (hidden from Quick Email + workflow pickers)."
  For loan_officer (`readOnly`), render these as static text (e.g. "Public" / "Admin only", "System: Yes/No") — no inputs.

- [ ] **Step 6: Verify.** `npx tsc -p tsconfig.typecheck.json` — no new errors, `EmailTemplateEditorPage` 0. `npm run build` + `npm test` (23) green. Manual (if browser): open a template → Visibility + System controls show current values; changing + Save persists (reopen reflects them).

- [ ] **Step 7: Commit** — `feat(email-templates): per-template visibility (public/admin-only) + system flag in editor`.

---

## Task 2: Remove visibility UI from the list table (+ System badge)

**Files:** `EmailTemplateTable.tsx`.

- [ ] **Step 1: Remove the column.** Delete the `<th>…Visible to LOs…</th>` header (line ~522) and the corresponding template-row `<td>` cell that renders the Visible/Hidden text (the `Eye`/`EyeOff` "Visible"/"Hidden" span, lines ~136-138). Keep the row's other cells; adjust any `colSpan` on the folder group-header row to the new column count.
- [ ] **Step 2: Remove the folder eye-toggle.** In `FolderGroupRow`, remove the visibility toggle button (the `Eye`/`EyeOff` button calling `onSetFolderVisibility`, lines ~325-332) and the `onSetFolderVisibility` prop threading. Remove the now-unused `onSetFolderVisibility` prop from the component's props and the `<FolderGroupRow ... onSetFolderVisibility=... />` call site (~line 496). Leave the context handler `handleSetFolderVisibility` in `AppDataContext` (harmless, out of scope) — just stop passing/using it here; if that leaves an unused import/destructure in this file, remove those to satisfy `noUnusedLocals`.
- [ ] **Step 3: Remove now-moot LO-hidden badges** driven by folder visibility (the folder-row `loHidden` `EyeOff` badge, ~line 300, and the `resolveTemplateVisibleToLO`-derived row badge if it only fed the removed column). If `resolveTemplateVisibleToLO`/`Eye`/`EyeOff` imports become unused after this, remove them. (Role-based *filtering* via `canRoleSeeFolder`/`canRoleSeeTemplate` STAYS — do not remove that.)
- [ ] **Step 4: Add a System badge.** On template rows where `template.isSystem`, show a small muted badge "System" next to the name (so admins can tell system templates apart in the config list). Use the existing `Badge` or a `text-[10px]` pill.
- [ ] **Step 5: Verify.** `npx tsc -p tsconfig.typecheck.json` — no new errors, `EmailTemplateTable` 0; `npm run build` + `npm test` (23) + `npm run lint` (0 warnings). Confirm the table renders with no visibility column/toggle and the role-view filtering still hides admin-only templates when "View as → Loan Officer".
- [ ] **Step 6: Commit** — `refactor(email-templates): remove visibility controls from template list, add system badge`.

---

## Task 3: Hide system templates from manual-send pickers

**Files:** `QuickEmailModal.tsx`, `StepConfigForm.tsx`.

- [ ] **Step 1: QuickEmailModal.** Where it maps `adminEmailTemplates` into the template dropdown/list, filter out system templates: use `adminEmailTemplates.filter((t) => !t.isSystem)` as the source for the selectable options. (Find the exact mapping — search for `adminEmailTemplates` in the file — and apply the filter at that source, once.)
- [ ] **Step 2: StepConfigForm.** Same: the email-step template `<Select>` maps `adminEmailTemplates` (around line ~257); change the mapped source to `adminEmailTemplates.filter((t) => !t.isSystem)`. If an already-selected step references a now-filtered (system) template id, still render its name for the existing selection (don't crash) — but new selections only offer non-system templates.
- [ ] **Step 3: Verify.** `npx tsc -p tsconfig.typecheck.json` no new errors; `npm run build` + `npm test` (23). Manual (if browser): mark a template System in the editor + Save; confirm it disappears from the Quick Email dropdown and the workflow email-step dropdown, but still appears in the config list.
- [ ] **Step 4: Commit** — `feat(email-templates): hide system templates from manual-send pickers`.

---

## Self-Review
- Per-template Public/Admin-only in detail → Task 1 ✓
- System flag + hidden from manual pickers → Task 1 (field/control) + Task 3 (filtering) ✓
- Remove visibility UI from list → Task 2 ✓
- Admin-only = admin+super_admin see, loan_officer hidden → unchanged resolver (Task 1 writes true/false) ✓
- Folders organize-only, always Public → Task 2 removes folder toggle; resolver's folder default (true) already yields Public ✓
- Role-based list filtering preserved (not a "visibility control") → Task 2 keeps `canRoleSee*` ✓

**Open/minor:** `TemplateFolder.visibleToLoanOfficers` + `handleSetFolderVisibility` become vestigial (field stays at default true; handler unused) — left in place to keep scope tight; a follow-up could remove them. `visibility` uses a 2-state Public/Admin-only (no separate "Inherit") because folders are always Public, so Inherit would be indistinguishable from Public.
