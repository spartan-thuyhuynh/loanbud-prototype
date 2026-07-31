# Increment: Drag-to-Reorganize + Inline Folder Management (remove Manage Folders modal)

**Goal:** In the Email Templates config tree, let admins (1) drag templates between folders and drag folders to re-parent, and (2) create/rename/delete folders and toggle LO-visibility inline in the tree — removing the separate "Manage Folders" modal entirely.

**Approved design decisions:**
- Draggable: **templates AND folders** (template→folder = move; folder→folder = re-parent). **Move-only, no ordering** (no new data field).
- Remove the **Manage Folders** button + `FolderManagerModal.tsx`. All folder ops move inline into the tree: create (`+ New Folder` + per-folder add-subfolder), rename (double-click / ✎), delete (🗑 + confirm), **Visible-to-Loan-Officers** (👁/👁‍🗨 toggle — this is the role-restriction control; it MUST survive the modal removal).
- **Admin-only.** Loan-officer view stays read-only: no drag, no drop, no inline controls (unchanged from today).
- Scope unchanged: config-page-only; template pickers elsewhere untouched.

**Tech:** react-dnd 16 + react-dnd-html5-backend (already used in `WorkflowBoard.tsx` — mirror that pattern: `useDrag<DragItem, unknown, {isDragging}>`, `useDrop<DragItem, unknown, {isOver,canDrop}>`, module-scope drag-type constants, one `DndProvider` with `HTML5Backend`).

## Global constraints
- **Package manager: npm.** No yarn; no `packageManager` field.
- **Type gate (build does NOT type-check):** `npx tsc -p tsconfig.typecheck.json`. Baseline is currently **66** src errors, all pre-existing. This increment must add **0** new errors; `EmailTemplatesTab.tsx` and the new tree file must be 0-error. Deleting `FolderManagerModal.tsx` is fine (nothing else imports it). `noUnusedLocals`/`noUnusedParameters` are ON.
- `npm test` must stay 16/16 (resolver unaffected).
- Consume existing context handlers; don't reimplement. Reuse `getDescendantFolderIds` + `canRoleSeeFolder`/`canRoleSeeTemplate`/`resolveTemplateVisibleToLO` from `./templateVisibility`.
- Do NOT touch `CategoryManagerModal.tsx` (SMS/Voicemail still use it) or the SMS/Voicemail tabs.

## File structure
- **Modify** `src/app/contexts/AppDataContext.tsx` — add `handleMoveTemplateToFolder`.
- **Create** `src/app/components/email-workflows/settings/EmailTemplateFolderTree.tsx` — the DnD-enabled, inline-managed tree (extracted `FolderNode`/`TemplateNode` — hooks require real components, not render-in-parent functions).
- **Modify** `src/app/components/email-workflows/settings/EmailTemplatesTab.tsx` — use the new tree; remove FolderManagerModal usage + the `folderModalOpen` state; repurpose the shell's second button to `+ New Folder`.
- **Delete** `src/app/components/email-workflows/settings/FolderManagerModal.tsx`.

---

## Task 1: `handleMoveTemplateToFolder` context handler

**Files:** Modify `src/app/contexts/AppDataContext.tsx` (type block, handlers area near the other email-template handlers, provider `value`).

**Interfaces — Produces:** `handleMoveTemplateToFolder: (templateId: string, folderId: string | null) => void` on `AppDataContextValue`.

- [ ] Add to the `AppDataContextValue` interface (near `handleSetFolderVisibility`):
```ts
  handleMoveTemplateToFolder: (templateId: string, folderId: string | null) => void;
```
- [ ] Add the handler (near `handleDeleteFolder`):
```ts
  const handleMoveTemplateToFolder = (templateId: string, folderId: string | null) => {
    const updated = adminEmailTemplates.map((t) => (t.id === templateId ? { ...t, folderId } : t));
    setAdminEmailTemplates(updated);
    store.adminEmailTemplates.write(updated);
  };
```
- [ ] Add `handleMoveTemplateToFolder,` to the provider `value`.
- [ ] Verify `npx tsc -p tsconfig.typecheck.json` total stays 66 (handler used after Task 2; if verifying this step alone, an unused-warning is acceptable until Task 2 wires it — but commit Tasks 1+2 together so the gate is clean).

---

## Task 2: DnD + inline-managed folder tree

**Files:** Create `EmailTemplateFolderTree.tsx`; modify `EmailTemplatesTab.tsx`; delete `FolderManagerModal.tsx`.

### 2a. `EmailTemplateFolderTree.tsx`

Export `EmailTemplateFolderTree` and internally define `FolderNode` + `TemplateNode`. Props the tree needs (pass explicitly — do NOT define these components inside `EmailTemplatesTab`'s render, or they remount every keystroke and break drag/focus):

```ts
interface FolderTreeProps {
  folders: TemplateFolder[];
  templates: AdminEmailTemplate[];
  currentUserRole: TeamRole;
  selectedId: string | null;
  onSelectTemplate: (t: AdminEmailTemplate) => void;
  onMoveTemplate: (templateId: string, folderId: string | null) => void; // handleMoveTemplateToFolder
  onMoveFolder: (id: string, newParentId: string | null) => void;         // handleMoveFolder
  onCreateFolder: (name: string, parentId: string | null) => void;        // handleCreateFolder
  onRenameFolder: (id: string, name: string) => void;                     // handleRenameFolder
  onDeleteFolder: (id: string) => void;                                   // handleDeleteFolder
  onSetFolderVisibility: (id: string, visible: boolean) => void;          // handleSetFolderVisibility
}
```

**Module constants:**
```ts
const TEMPLATE_DRAG = "email-template";
const FOLDER_DRAG = "email-folder";
type TemplateDragItem = { kind: "template"; id: string };
type FolderDragItem = { kind: "folder"; id: string };
```

**Role gate:** `const isAdmin = currentUserRole !== "loan_officer";`. When `!isAdmin`, render the SAME read-only tree that exists today (role-filtered, no drag sources, no drop targets, no inline controls, no + New Folder). Reuse `canRoleSeeFolder`/`canRoleSeeTemplate`/`resolveTemplateVisibleToLO` for filtering + eye-off badges exactly as the current `EmailTemplatesTab` does.

**TemplateNode (admin):** `useDrag<TemplateDragItem, unknown, {isDragging}>({ type: TEMPLATE_DRAG, item: { kind: "template", id: t.id }, collect })`. Apply `dragRef` to the row; dim to `opacity-50` while `isDragging`. Preserve the existing row markup (name, subject, selected/hover styling, eye-off badge, `paddingLeft` by depth) and click-to-select. LO: same row without `useDrag`.

**FolderNode (admin):** it is BOTH a drag source and a drop target.
- `useDrag<FolderDragItem, unknown, {isDragging}>({ type: FOLDER_DRAG, item: { kind: "folder", id: folder.id }, collect })`.
- `useDrop<TemplateDragItem | FolderDragItem, unknown, {isOver,canDrop}>({ accept: [TEMPLATE_DRAG, FOLDER_DRAG], canDrop, drop, collect })`:
  - `canDrop(item)`: template → always true; folder → `item.id !== folder.id && !getDescendantFolderIds(item.id, folders).includes(folder.id)` (no self, no descendant → no cycle).
  - `drop(item, monitor)`: `if (monitor.didDrop()) return;` (a nested child already handled it). Then template → `onMoveTemplate(item.id, folder.id)` + `toast.success("Template moved.")`; folder → `onMoveFolder(item.id, folder.id)` + `toast.success("Folder moved.")`.
  - Highlight the folder row when `isOver && canDrop` (e.g. `ring-1 ring-primary/50 bg-primary/5`).
- Compose refs: `dragRef(dropRef(el))` on the folder header element.
- Header keeps chevron expand/collapse, folder icon, name, eye-off badge (admin, when LO-hidden).

**Inline controls on FolderNode (admin, show on hover — `group`/`group-hover`):** a row of small icon-buttons, each `onClick` calling `e.stopPropagation()` first so it doesn't toggle expand or start a drag:
- **＋ add subfolder** (`Plus`): reveal an inline `<input>` as a child row (parentId = this folder); Enter → `onCreateFolder(name.trim(), folder.id)` (ignore empty), Esc/blur → cancel. Expand the folder when adding.
- **✎ rename** (`Pencil`) OR double-click the name: swap the name for an inline `<input>` pre-filled with the current name; Enter → `onRenameFolder(folder.id, name.trim())` (ignore empty/unchanged), Esc → cancel.
- **👁 / 👁‍🗨 visibility** (`Eye` when visible / `EyeOff` when hidden): `onSetFolderVisibility(folder.id, !folder.visibleToLoanOfficers)`. Tooltip "Visible to loan officers" / "Hidden from loan officers".
- **🗑 delete** (`Trash2`): inline confirm (reuse the "Delete? Yes/No" inline pattern already in `TemplateDetailHeader`); confirm → `onDeleteFolder(folder.id)` + `toast`.

Manage inline-edit state inside `FolderNode` with local `useState` (`mode: "idle" | "rename" | "addChild" | "confirmDelete"` + a draft string). Autofocus the input.

**Root + Uncategorized drop zones (admin):** Wrap the whole tree list in a root `useDrop` accepting both types whose `drop(item, monitor)` runs only `if (!monitor.didDrop())`: template → `onMoveTemplate(item.id, null)`; folder → `onMoveFolder(item.id, null)` (move to top level). The "Uncategorized" section header is naturally covered by this root zone; label it a drop target visually (highlight on `isOver && canDrop`). This gives "drag out to top-level / Uncategorized".

**DndProvider:** wrap the tree's returned JSX in `<DndProvider backend={HTML5Backend}>`. (EmailTemplatesTab is not inside any other DndProvider, so no nested-backend conflict.) Only mount the provider/DnD for admins; the LO branch returns the plain read-only tree.

### 2b. `EmailTemplatesTab.tsx`

- [ ] Remove the `FolderManagerModal` import, the `folderModalOpen` state, and the `<FolderManagerModal .../>` block.
- [ ] Replace the inline `renderFolder`/`renderTemplateRow` + the sidebar children with `<EmailTemplateFolderTree ... />`, passing the role-filtered data and the handlers (including the new `handleMoveTemplateToFolder`). Keep the `allFoldersWithDepth` computation — the template create/edit FORM still uses its folder `<Select>` (drag is an addition, not a replacement, for filing from the form).
- [ ] Repurpose the shell's second button to **New Folder**: `categoriesLabel="New Folder"`, `onCategories={...}` → triggers top-level inline create. Simplest: lift a `startCreateRoot` signal to the tree (e.g. pass a `createRootNonce`/callback), OR keep the "+ New Folder" control INSIDE `EmailTemplateFolderTree` (a button at the top of the list) and stop passing `onCategories` for email — instead hide the shell's second button for email by not providing it. **Chosen:** render "+ New Folder" inside the tree (admin only) and drop the shell's second button for the email tab (pass a no-op-free path: leave `onCategories` unused). Confirm the shell still renders fine with only "New Template".
  - Note: `TemplateSidebarShell` requires `onCategories`. To avoid changing the shared shell, either keep passing a handler that focuses the tree's inline create, or make `onCategories` optional in the shell (small, backward-compatible change: `onCategories?: () => void` and render the button only when provided). Making it optional is clean and non-breaking for SMS/Voicemail (they still pass it). Do that.
- [ ] Keep the "View as" role switcher, the create/edit template modals, LO read-only behavior, and the selection-clear `useEffect` exactly as-is.

- [ ] **Delete** `FolderManagerModal.tsx`.

### Verify
- [ ] `npx tsc -p tsconfig.typecheck.json` → total ≤ 66, `EmailTemplateFolderTree.tsx` + `EmailTemplatesTab.tsx` = 0 errors, no NEW error files.
- [ ] `npm test` → 16/16.
- [ ] `grep -rn FolderManagerModal src/` → empty.
- [ ] `npm run dev` if feasible; else reason through the acceptance checklist below.

### Acceptance (admin)
1. Drag a template onto a different folder → it moves there (toast); drag it onto Uncategorized/top area → `folderId` cleared.
2. Drag a folder onto another folder → it nests; dragging a folder onto its own descendant is refused (no-op, not highlighted).
3. `+ New Folder` creates a top-level folder via inline name entry; per-folder ＋ adds a subfolder.
4. Double-click / ✎ renames inline; 🗑 deletes (confirm) with templates falling to Uncategorized + subfolders promoted; 👁/👁‍🗨 toggles LO-visibility (eye-off badge appears, and the folder disappears in LO view).
5. Switch **View as → Loan Officer**: no drag handles, no inline controls, no + New Folder; hidden folders/templates absent; read-only.
6. No "Manage Folders" button anywhere; `QuickEmailModal`/workflow step pickers still list all templates.

### Commit
Two commits: (1) `feat(email-templates): add handleMoveTemplateToFolder handler`; (2) `feat(email-templates): drag-to-reorganize + inline folder management, remove folder modal`.
