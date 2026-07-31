# Email Template — Grouped Table List + Separate Editor Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Route FE execution to `fe-plan-executor` / general-purpose subagents.

**Goal:** Replace the narrow folder-tree sidebar with a **full-width grouped table** (folders = collapsible group-header rows, drag rows between groups) and move template create/edit to a **separate route** with a **WYSIWYG HTML editor**, a **namespaced grouped placeholders panel**, and a folder selector.

**Architecture:** Builds on the existing folder + role-visibility feature (handlers in `AppDataContext`, pure resolver in `templateVisibility.ts`). The list view swaps the tree component for a grouped table that reuses the same folder handlers, role filtering, and drag semantics. The detail becomes real routes (`/email-workflows/templates/new` and `/:id`) rendering an editor page built on TipTap. Placeholders become a namespaced catalog (`{{contact.first_name}}`) with the seed migrated to match.

**Tech Stack:** React 18 + React Router 7.13 (`useNavigate`/`useParams`, mirroring `user-segments/:id` → `SegmentDetail`), TipTap 2 (`@tiptap/react` + `@tiptap/starter-kit`) for WYSIWYG, react-dnd 16 (already used), Tailwind + Shadcn, `store.ts`/`AppDataContext`, Vitest for pure logic.

## Global Constraints

- **Package manager: npm.** No yarn; never add a `packageManager` field (corepack re-adds it — discard with `git checkout -- package.json` if it reappears).
- **Type gate (build does NOT type-check):** `npx tsc -p tsconfig.typecheck.json`. Current baseline is **66** pre-existing `src/**` errors. Every task must add **0** new errors; new/edited feature files must be 0-error. `noUnusedLocals`/`noUnusedParameters` are ON. Confirm total ≤ 66 and no NEW error files after each task.
- **`npm test` must stay green** (Vitest). Add tests for pure logic (placeholder catalog/regex/migration).
- **Reuse, don't reimplement:** context handlers `handleCreateAdminEmailTemplate`/`handleUpdateAdminEmailTemplate`/`handleDeleteAdminEmailTemplate`, `handleCreateFolder`/`handleRenameFolder`/`handleMoveFolder`/`handleSetFolderVisibility`/`handleDeleteFolder`/`handleMoveTemplateToFolder`, `currentUserRole`/`handleSetCurrentUserRole`; resolver `canRoleSeeFolder`/`canRoleSeeTemplate`/`resolveTemplateVisibleToLO`/`getDescendantFolderIds` from `./templateVisibility`.
- **Role rules unchanged:** admin/super_admin manage + see all (hidden items badged); loan_officer read-only, hidden items absent. Config-page-only scope: template pickers elsewhere (`QuickEmailModal`, `StepConfigForm`) stay untouched.
- **"Category" in the detail = the Folder selector** (we replaced flat category with folders; do NOT reintroduce a separate category field).
- **Self-contained:** TipTap is an npm dependency bundled by Vite (fine). No CDN/external runtime.
- Date display format: "Jun 10" (short month + day).

---

## File Structure

- **Create** `src/app/components/email-workflows/settings/placeholderCatalog.ts` — namespaced placeholder catalog + `extractPlaceholders` + `migratePlaceholders` + `plainTextToHtml`.
- **Create** `src/app/components/email-workflows/settings/placeholderCatalog.test.ts` — unit tests.
- **Create** `src/app/components/email-workflows/settings/HtmlEditor.tsx` — TipTap WYSIWYG wrapper with an imperative `insertText` for placeholder insertion.
- **Create** `src/app/components/email-workflows/settings/EmailTemplateEditorPage.tsx` — the routed detail/editor page (new + edit).
- **Create** `src/app/components/email-workflows/settings/PlaceholdersPanel.tsx` — grouped click-to-copy/insert panel (matches the provided image).
- **Create** `src/app/components/email-workflows/settings/EmailTemplateTable.tsx` — grouped table list (folder group rows + inline controls + DnD + role filter).
- **Modify** `src/app/data/adminEmailTemplates.json` — migrate tokens to namespaced + bodies to HTML; bump `KEYS.adminEmailTemplates` to v4 in `store.ts`.
- **Modify** `src/app/router.tsx` — add `templates/new` + `templates/:id` routes.
- **Modify** `src/app/components/email-workflows/settings/EmailTemplatesTab.tsx` — render `EmailTemplateTable` instead of the tree + right-panel + modals; navigation to routes.
- **Delete** `src/app/components/email-workflows/settings/EmailTemplateFolderTree.tsx` (its DnD + inline-folder logic is re-homed into `EmailTemplateTable.tsx`).
- **Modify** `package.json` — add TipTap deps.

---

## Task 1: Namespaced placeholder catalog + seed migration

**Files:**
- Create `src/app/components/email-workflows/settings/placeholderCatalog.ts`
- Create `src/app/components/email-workflows/settings/placeholderCatalog.test.ts`
- Modify `src/app/data/adminEmailTemplates.json`
- Modify `src/app/data/store.ts` (bump `KEYS.adminEmailTemplates`)

**Interfaces — Produces:**
- `PLACEHOLDER_GROUPS: { label: string; tokens: { token: string; label: string }[] }[]`
- `extractPlaceholders(text: string): string[]` — returns namespaced tokens found (dot-aware).
- `migratePlaceholders(text: string): string` — rewrites legacy flat tokens to namespaced.
- `plainTextToHtml(text: string): string` — wraps `\n\n`-separated blocks in `<p>`, single `\n` → `<br>`.

- [ ] **Step 1: Write the failing test** — `placeholderCatalog.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { extractPlaceholders, migratePlaceholders, plainTextToHtml, PLACEHOLDER_GROUPS } from "./placeholderCatalog";

describe("extractPlaceholders", () => {
  it("finds dotted, de-duplicated tokens", () => {
    expect(extractPlaceholders("Hi {{contact.first_name}} {{contact.first_name}} at {{company.name}}"))
      .toEqual(["contact.first_name", "company.name"]);
  });
  it("returns [] when none", () => {
    expect(extractPlaceholders("no tokens here")).toEqual([]);
  });
});

describe("migratePlaceholders", () => {
  it("rewrites legacy flat tokens to namespaced", () => {
    expect(migratePlaceholders("Hi {{first_name}}, re {{listing_name}}"))
      .toBe("Hi {{contact.first_name}}, re {{listing.name}}");
  });
  it("leaves already-namespaced tokens alone", () => {
    expect(migratePlaceholders("{{contact.email}}")).toBe("{{contact.email}}");
  });
});

describe("plainTextToHtml", () => {
  it("wraps blocks in <p> and single newlines as <br>", () => {
    expect(plainTextToHtml("Hi there,\n\nWelcome\nLine2"))
      .toBe("<p>Hi there,</p><p>Welcome<br>Line2</p>");
  });
});

describe("PLACEHOLDER_GROUPS", () => {
  it("contains the CONTACT group with full_name first (matches the design)", () => {
    const contact = PLACEHOLDER_GROUPS.find((g) => g.label === "CONTACT");
    expect(contact?.tokens[0].token).toBe("contact.full_name");
  });
});
```

- [ ] **Step 2: Run test to verify it fails** — `npm test` → FAIL (module not found).

- [ ] **Step 3: Implement** — `placeholderCatalog.ts`:

```ts
/**
 * Namespaced placeholder catalog. CONTACT group mirrors the design spec image exactly.
 * COMPANY/LISTING are provisional (the design image was truncated at COMPANY) — adjust freely.
 */
export interface PlaceholderGroup {
  label: string;
  tokens: { token: string; label: string }[];
}

const t = (token: string, label: string) => ({ token, label });

export const PLACEHOLDER_GROUPS: PlaceholderGroup[] = [
  {
    label: "CONTACT",
    tokens: [
      t("contact.full_name", "Full name"), t("contact.first_name", "First name"),
      t("contact.last_name", "Last name"), t("contact.email", "Email"),
      t("contact.status", "Status"), t("contact.phone", "Phone"),
      t("contact.role", "Role"), t("contact.address", "Address"),
      t("contact.city", "City"), t("contact.state", "State"), t("contact.zip_code", "Zip code"),
    ],
  },
  {
    label: "COMPANY",
    tokens: [t("company.name", "Company name"), t("company.industry", "Industry"), t("company.website", "Website")],
  },
  {
    label: "LISTING",
    tokens: [t("listing.name", "Listing name"), t("listing.status", "Listing status")],
  },
];

/** Legacy flat token → namespaced token. Only the tokens present in the seed need entries. */
const LEGACY_MAP: Record<string, string> = {
  first_name: "contact.first_name",
  last_name: "contact.last_name",
  email: "contact.email",
  listing_name: "listing.name",
};

const TOKEN_RE = /\{\{\s*([\w.]+)\s*\}\}/g;

export function extractPlaceholders(text: string): string[] {
  return [...new Set([...text.matchAll(TOKEN_RE)].map((m) => m[1]))];
}

export function migratePlaceholders(text: string): string {
  return text.replace(TOKEN_RE, (_full, name: string) => {
    const mapped = LEGACY_MAP[name] ?? (name.includes(".") ? name : name);
    return `{{${mapped}}}`;
  });
}

export function plainTextToHtml(text: string): string {
  return text
    .split(/\n\n+/)
    .map((block) => `<p>${block.replace(/\n/g, "<br>")}</p>`)
    .join("");
}
```

- [ ] **Step 4: Run test to verify it passes** — `npm test` → all pass.

- [ ] **Step 5: Migrate the seed JSON.** In `src/app/data/adminEmailTemplates.json`, for every template: rewrite `subject` and `body` tokens per `LEGACY_MAP` (`{{first_name}}`→`{{contact.first_name}}`, `{{listing_name}}`→`{{listing.name}}`), convert each `body` from plain text to HTML (`plainTextToHtml` output form — wrap paragraphs in `<p>`, newlines `<br>`), and set `variables` to the namespaced tokens. Example (`etpl-2`):

```json
{
  "id": "etpl-2",
  "name": "Day 3 Follow-up",
  "subject": "Quick follow-up on {{listing.name}}",
  "body": "<p>Hi {{contact.first_name}},</p><p>I wanted to follow up on my previous message about {{listing.name}}.</p><p>Have you had a chance to consider our offer? We'd love to help you move forward.</p><p>Best,<br>LoanBud Team</p>",
  "folderId": "fld-follow-up",
  "visibleToLoanOfficers": null,
  "senderType": "brand",
  "variables": ["contact.first_name", "listing.name"],
  "createdAt": "2026-04-01T09:00:00.000Z",
  "updatedAt": "2026-04-01T09:00:00.000Z"
}
```

Apply the equivalent rewrite to all five templates.

- [ ] **Step 6: Bump the store key** so the new seed shape reseeds. In `src/app/data/store.ts`, change `KEYS.adminEmailTemplates` to `"loanbudcrm:v4:adminEmailTemplates"`.

- [ ] **Step 7: Verify** — `npm test` green; `npx tsc -p tsconfig.typecheck.json` total ≤ 66, `placeholderCatalog*` 0 errors.

- [ ] **Step 8: Commit** — `git add` the catalog, test, JSON, store; `git commit -m "feat(email-templates): namespaced placeholder catalog + seed migration to HTML bodies"`.

---

## Task 2: TipTap WYSIWYG `HtmlEditor` component

**Files:**
- Modify `package.json` (add deps)
- Create `src/app/components/email-workflows/settings/HtmlEditor.tsx`

**Interfaces — Produces:**
- `HtmlEditor` (default export) with props `{ value: string; onChange: (html: string) => void; editorRef?: React.MutableRefObject<{ insertText: (text: string) => void } | null> }`.

- [ ] **Step 1: Add TipTap** — `npm install @tiptap/react@2 @tiptap/starter-kit@2 @tiptap/pm@2` (then, if corepack rewrote it, `git checkout -- package.json` is NOT needed here since we intend the package.json dep change — but do remove any `packageManager` field it added).

- [ ] **Step 2: Implement** — `HtmlEditor.tsx`:

```tsx
import { useEffect, useImperativeHandle } from "react";
import type React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered } from "lucide-react";

export interface HtmlEditorHandle {
  insertText: (text: string) => void;
}

export default function HtmlEditor({
  value,
  onChange,
  editorRef,
}: {
  value: string;
  onChange: (html: string) => void;
  editorRef?: React.MutableRefObject<HtmlEditorHandle | null>;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: { attributes: { class: "prose prose-sm max-w-none min-h-[300px] p-4 focus:outline-none" } },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value, false);
  }, [value, editor]);

  useImperativeHandle(editorRef, () => ({
    insertText: (text: string) => editor?.chain().focus().insertContent(text).run(),
  }), [editor]);

  if (!editor) return null;

  const btn = (active: boolean) =>
    `p-1.5 rounded hover:bg-muted ${active ? "bg-muted text-primary" : "text-muted-foreground"}`;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-1 border-b border-border px-2 py-1.5">
        <button type="button" className={btn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="w-4 h-4" /></button>
        <button type="button" className={btn(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="w-4 h-4" /></button>
        <button type="button" className={btn(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="w-4 h-4" /></button>
        <button type="button" className={btn(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="w-4 h-4" /></button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
```

- [ ] **Step 3: Verify** — `npx tsc -p tsconfig.typecheck.json` → `HtmlEditor.tsx` 0 errors, total ≤ 66. (If `@tiptap/*` types are missing, ensure the install succeeded and `skipLibCheck` is on — it is.) `npm run build` succeeds (bundles TipTap).

- [ ] **Step 4: Commit** — `git commit -m "feat(email-templates): add TipTap HtmlEditor component"`.

---

## Task 3: Placeholders panel + routed editor page

**Files:**
- Create `src/app/components/email-workflows/settings/PlaceholdersPanel.tsx`
- Create `src/app/components/email-workflows/settings/EmailTemplateEditorPage.tsx`
- Modify `src/app/router.tsx`

**Interfaces — Consumes:** `PLACEHOLDER_GROUPS`, `extractPlaceholders` (Task 1); `HtmlEditor`/`HtmlEditorHandle` (Task 2); context template + folder handlers. **Produces:** routes `templates/new`, `templates/:id`.

- [ ] **Step 1: `PlaceholdersPanel.tsx`** (matches the provided image — grouped, click to insert):

```tsx
import { PLACEHOLDER_GROUPS } from "./placeholderCatalog";

export function PlaceholdersPanel({ onInsert }: { onInsert: (token: string) => void }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-1 h-4 bg-primary rounded" />
        <h3 className="text-sm font-semibold text-foreground">PLACEHOLDERS</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3">Click to insert into the editor.</p>
      <div className="space-y-4">
        {PLACEHOLDER_GROUPS.map((g) => (
          <div key={g.label}>
            <p className="text-[11px] font-semibold text-muted-foreground tracking-wide mb-1.5">{g.label}</p>
            <div className="space-y-1.5">
              {g.tokens.map((tk) => (
                <button
                  key={tk.token}
                  type="button"
                  onClick={() => onInsert(`{{${tk.token}}}`)}
                  className="w-full text-left px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted font-mono text-sm text-foreground transition-colors"
                >
                  {`{{${tk.token}}}`}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: `EmailTemplateEditorPage.tsx`** — routed page for create + edit. Reads `:id` via `useParams`; `undefined` id → create mode. Uses `useNavigate` to return to `/email-workflows/templates` on save/cancel. Admin-only (loan officers get a read-only view or are redirected — render read-only when `currentUserRole === "loan_officer"`).

```tsx
import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useAppData } from "../../../contexts/AppDataContext";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import HtmlEditor, { type HtmlEditorHandle } from "./HtmlEditor";
import { PlaceholdersPanel } from "./PlaceholdersPanel";
import { extractPlaceholders } from "./placeholderCatalog";
import { FieldLabel } from "./TemplateTabShared";

export function EmailTemplateEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    adminEmailTemplates, templateFolders, currentUserRole,
    handleCreateAdminEmailTemplate, handleUpdateAdminEmailTemplate, handleDeleteAdminEmailTemplate,
  } = useAppData();

  const existing = id ? adminEmailTemplates.find((t) => t.id === id) ?? null : null;
  const readOnly = currentUserRole === "loan_officer";

  const [name, setName] = useState(existing?.name ?? "");
  const [subject, setSubject] = useState(existing?.subject ?? "");
  const [body, setBody] = useState(existing?.body ?? "");
  const [folderId, setFolderId] = useState<string | null>(existing?.folderId ?? null);
  const editorRef = useRef<HtmlEditorHandle | null>(null);

  const back = () => navigate("/email-workflows/templates");

  const save = () => {
    if (!name.trim() || !subject.trim() || !body.trim()) { toast.error("Name, subject, and body are required."); return; }
    const variables = [...new Set([...extractPlaceholders(subject), ...extractPlaceholders(body)])];
    const payload = { name, subject, body, folderId, visibleToLoanOfficers: existing?.visibleToLoanOfficers ?? null, senderType: existing?.senderType ?? "brand" as const, variables };
    if (existing) { handleUpdateAdminEmailTemplate(existing.id, payload); toast.success("Template updated."); }
    else { handleCreateAdminEmailTemplate(payload); toast.success("Template created."); }
    back();
  };

  const remove = () => { if (existing) { handleDeleteAdminEmailTemplate(existing.id); toast.success("Template deleted."); back(); } };

  // Flat, depth-annotated folders for the select.
  const folderOptions: { id: string; name: string; depth: number }[] = [];
  const walk = (parentId: string | null, depth: number) => {
    for (const f of templateFolders.filter((tf) => tf.parentId === parentId)) { folderOptions.push({ id: f.id, name: f.name, depth }); walk(f.id, depth + 1); }
  };
  walk(null, 0);

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={back}><ArrowLeft className="w-4 h-4 mr-1.5" />Back</Button>
          <h1 className="text-lg font-semibold">{existing ? "Edit Template" : "New Template"}</h1>
        </div>
        {!readOnly && (
          <div className="flex items-center gap-2">
            {existing && <Button variant="outline" size="sm" onClick={remove}><Trash2 className="w-4 h-4 mr-1.5" />Delete</Button>}
            <Button size="sm" onClick={save}><Save className="w-4 h-4 mr-1.5" />Save</Button>
          </div>
        )}
      </div>
      <div className="flex flex-1 min-h-0 gap-4 p-6 overflow-y-auto">
        <div className="flex-1 space-y-4 min-w-0">
          <div className="space-y-1.5"><FieldLabel>Template Name</FieldLabel><Input value={name} disabled={readOnly} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-1.5">
            <FieldLabel>Category (Folder)</FieldLabel>
            <Select value={folderId ?? "__none__"} onValueChange={(v) => setFolderId(v === "__none__" ? null : v)} disabled={readOnly}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">No folder (Uncategorized)</SelectItem>
                {folderOptions.map((f) => <SelectItem key={f.id} value={f.id}>{"  ".repeat(f.depth)}{f.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><FieldLabel>Subject Line</FieldLabel><Input value={subject} disabled={readOnly} onChange={(e) => setSubject(e.target.value)} /></div>
          <div className="space-y-1.5">
            <FieldLabel>Body</FieldLabel>
            {readOnly
              ? <div className="prose prose-sm max-w-none rounded-xl border border-border bg-card p-4" dangerouslySetInnerHTML={{ __html: body }} />
              : <HtmlEditor value={body} onChange={setBody} editorRef={editorRef} />}
          </div>
        </div>
        <div className="w-72 shrink-0">
          <PlaceholdersPanel onInsert={(token) => { if (!readOnly) editorRef.current?.insertText(token); }} />
        </div>
      </div>
    </div>
  );
}
```

> Note: the read-only body uses `dangerouslySetInnerHTML` on template HTML authored by admins in this same app (not external input) — acceptable for this prototype.

- [ ] **Step 3: Add routes** in `src/app/router.tsx`, directly after the `{ path: "templates", element: <TemplatesView /> }` entry (import `EmailTemplateEditorPage`):

```tsx
{ path: "templates/new", element: <EmailTemplateEditorPage /> },
{ path: "templates/:id", element: <EmailTemplateEditorPage /> },
```

- [ ] **Step 4: Verify** — `npx tsc -p tsconfig.typecheck.json` → new files 0 errors, total ≤ 66; `npm run build` succeeds. Manually (`npm run dev`): visit `/email-workflows/templates/new` and `/email-workflows/templates/etpl-1` — the editor renders with toolbar, folder select, placeholders panel; clicking a placeholder inserts it; Save persists and returns to the list.

- [ ] **Step 5: Commit** — `git commit -m "feat(email-templates): routed WYSIWYG editor page with placeholders panel"`.

---

## Task 4: Grouped table list (replaces the tree)

**Files:**
- Create `src/app/components/email-workflows/settings/EmailTemplateTable.tsx`
- Modify `src/app/components/email-workflows/settings/EmailTemplatesTab.tsx`
- Delete `src/app/components/email-workflows/settings/EmailTemplateFolderTree.tsx`

**Interfaces — Consumes:** context folder/template handlers + `currentUserRole`; resolver helpers; `useNavigate`. **Produces:** `EmailTemplateTable` used by `EmailTemplatesTab`.

- [ ] **Step 1: Build `EmailTemplateTable.tsx`.** A full-width table wrapped in one `<DndProvider backend={HTML5Backend}>` (enclosing BOTH admin and loan-officer branches — a folder/template node must never render without a provider ancestor; this was a prior Critical bug). Structure:
  - **Columns:** Name · Subject (truncated) · Sender · Visible to LOs · Updated (format "Jun 10"). A trailing actions cell on hover (admin): edit (row→navigate) / delete.
  - **Folder group-header row** (spanning all columns): chevron (collapse/expand), folder name, LO-hidden eye-off badge (admin). Admin hover controls on the header: rename (inline input / double-click), ＋ add subfolder (inline input), 👁/👁‍🗨 visibility toggle (`handleSetFolderVisibility`), 🗑 delete (inline confirm → `handleDeleteFolder`). Nested subfolders render as indented group headers (indent by depth).
  - **Template data rows** under each group; clicking a row (not an action button) `navigate(\`/email-workflows/templates/${t.id}\`)`.
  - **Uncategorized** group at the bottom for `folderId === null`.
  - **"+ New Folder"** control above the table (admin) — inline top-level create.
  - **Role filtering:** filter groups/rows via `canRoleSeeFolder`/`canRoleSeeTemplate`; admin sees hidden items with eye-off badges; loan officer: read-only (no drag, no inline controls, no + New Folder, hidden items absent).
  - **DnD (admin):** a template row is a drag source (`type "email-template"`, `{id}`); a folder group-header row is a drag source (`type "email-folder"`, `{id}`) AND a drop target accepting both. On drop: template → `handleMoveTemplateToFolder(item.id, folderId)`; folder → `handleMoveFolder(item.id, folderId)` guarded by `canDrop` (`item.id !== folderId && !getDescendantFolderIds(item.id, folders).includes(folderId)`); use `monitor.didDrop()` to prevent double-handling. A root/Uncategorized drop zone moves to `null`. Reuse the exact patterns from the deleted `EmailTemplateFolderTree.tsx` (extract its `FolderNode`/`TemplateNode` drag/drop + inline-edit logic and re-home into row/group-row components). Toast on each successful move.
  - Extract `FolderGroupRow` and `TemplateRow` as real components (hooks require components, not render-in-parent functions), passing handlers/selection via props.

- [ ] **Step 2: Rewire `EmailTemplatesTab.tsx`.** Remove the sidebar tree + right-hand detail panel + the create/edit `TemplateModalShell` blocks + `EmailTemplateFolderTree` import. The tab now renders: the "View as" role switcher (keep), a **"New Template"** button that `navigate("/email-workflows/templates/new")` (admin only), and `<EmailTemplateTable />` filling the width. Remove `selected`/`newForm`/`editForm`/modal state and the `TemplateForm` (moved to the editor page). Keep the role switcher + `handleSetCurrentUserRole`.

- [ ] **Step 3: Delete** `EmailTemplateFolderTree.tsx`; `grep -rn EmailTemplateFolderTree src/` must be empty.

- [ ] **Step 4: Verify** — `npx tsc -p tsconfig.typecheck.json` → `EmailTemplateTable.tsx` + `EmailTemplatesTab.tsx` 0 errors, total ≤ 66, no NEW error files; `npm test` 16/16 (+ Task 1 tests). Manual (`npm run dev`): grouped table renders with folder headers + rows; expand/collapse; row click opens the editor route; drag a row onto another group moves it (toast); drag a folder header onto another nests it (self/descendant refused); ＋ New Folder / rename / delete / visibility toggle work inline on headers; **switch View as → Loan Officer**: no drag/controls/＋, hidden groups+rows absent, rows still open a read-only editor. `QuickEmailModal`/workflow pickers still list all templates.

- [ ] **Step 5: Commit** — `git commit -m "feat(email-templates): full-width grouped table list with folder group rows + drag, replacing tree"`.

---

## Task 5: Cleanup + whole-feature verification

**Files:** Modify (as needed) `EmailTemplatesTab.tsx`, `TemplateTabShared.tsx`.

- [ ] **Step 1: Remove now-dead code.** Any exports in `TemplateTabShared.tsx` used only by the removed right-panel/modal path (e.g. `TemplateDetailHeader`, `TemplateModalShell`, `TemplateEmptyState`, `TemplateSidebarShell` if unused by SMS/Voicemail) — verify each with `grep -rn <name> src/`; delete only those with zero remaining consumers. Do NOT remove anything still used by SMS/Voicemail tabs.
- [ ] **Step 2: Full sweep** — `npx tsc -p tsconfig.typecheck.json` total ≤ 66 with no NEW error files; `npm test` green; `npm run lint` 0 warnings; `grep -rn "EmailTemplateFolderTree\|FolderManagerModal" src/` empty.
- [ ] **Step 3: Acceptance pass (`npm run dev`)** — full loop: list (grouped table) → New Template → editor page (WYSIWYG + placeholders insert + folder select) → Save → row appears in correct group → drag to another group → open → edit → Save → Delete. Role switch to loan_officer: read-only everywhere, hidden items absent. Config-page-only: pickers unaffected.
- [ ] **Step 4: Commit** — `git commit -m "refactor(email-templates): remove dead sidebar/modal helpers after table+editor migration"`.

---

## Self-Review

**Spec coverage:**
- Full-width grouped table, folders as group rows → Task 4 ✓
- Keep drag-to-move rows between groups → Task 4 (DnD) ✓
- Separate editor page (real routes) → Task 3 (routes) ✓
- WYSIWYG HTML editor (added library) → Task 2 (TipTap) + Task 3 (page) ✓
- Namespaced + grouped placeholders + seed migration → Task 1 + Task 3 (panel) ✓
- "Category" = folder selector → Task 3 (folder select labeled "Category (Folder)") ✓
- Role rules + config-page-only scope preserved → Tasks 3 & 4 (role gating, pickers untouched) ✓
- Reuse existing handlers/resolver → Tasks 3 & 4 ✓

**Placeholder scan:** no TBD/TODO; every code step has concrete code; UI-structural steps (Task 4) enumerate exact columns, group-row controls, DnD types, and role gating rather than "build a table."

**Type consistency:** `extractPlaceholders`/`migratePlaceholders`/`plainTextToHtml`/`PLACEHOLDER_GROUPS` (Task 1) consumed in Task 3; `HtmlEditor`/`HtmlEditorHandle` (Task 2) consumed in Task 3; DnD type strings `"email-template"`/`"email-folder"` and `handleMoveTemplateToFolder`/`handleMoveFolder` consistent with the existing handlers reused in Task 4.

**Open items (decide during execution, sensible defaults chosen):**
- COMPANY/LISTING placeholder lists are provisional (design image truncated at COMPANY) — catalog is a single constant, trivially editable.
- Table columns are a reasonable default (no [Image #1] reference was provided) — adjust to taste without structural change.
