# Unlayer Editor + Image-#4 Layout + List Flicker Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use `- [ ]` checkboxes.

**Goal:** Replace the TipTap editor with the **Unlayer** drag-and-drop email builder, restructure the editor page to Image #4's layout (Unlayer left; Name/Category/Subject/Placeholders in a right sidebar), and fix the list-page row-action hover flicker.

**Architecture:** `react-email-editor` (Unlayer) is an iframe-based visual builder loaded from `editor.unlayer.com` (runtime network dependency — accepted). Templates now persist an Unlayer **design JSON** (`design`) for re-editing plus the **exported HTML** (`body`) for preview/send. The editor page becomes a full-height two-pane layout. Placeholders switch from insert-at-cursor to **click-to-copy** (Unlayer's iframe can't take a cursor-insert). The list flicker is a CSS layout-shift bug fixed by revealing action buttons via opacity without reflow.

**Tech Stack:** React 18, React Router 7, `react-email-editor` (Unlayer), Tailwind/Shadcn, Vitest for pure helpers.

## Global Constraints
- **Package manager: npm.** Install deps with `--legacy-peer-deps` (pre-existing eslint peer conflict). Never add/keep a `packageManager` field (corepack re-adds it → `git checkout -- package.json`).
- **Type gate (build does NOT type-check):** `npx tsc -p tsconfig.typecheck.json`; baseline **66**; add **0** new errors; new/edited feature files 0-error. `noUnusedLocals`/`noUnusedParameters` ON.
- **`npm run build` must succeed; `npm test` stays green** (currently 22).
- **RUNTIME UNVERIFIABLE THIS SESSION:** Unlayer renders in an iframe at runtime — build/type-gate passing does NOT prove it works. The implementer must state clearly what was and wasn't runtime-verified. Recommend a human click-through before merge.
- Reuse existing context handlers + resolver; config-page-only scope (pickers untouched); role rules unchanged (loan_officer read-only).
- Consult Unlayer/`react-email-editor` docs (via context7 `mcp__plugin_context7_context7` or the installed package's `.d.ts`) for the exact `EditorRef`/`exportHtml`/`loadDesign` API — do not guess the API shape.

## File Structure
- **Modify** `src/app/types/index.ts` — add `design?: UnlayerDesign | null` to `AdminEmailTemplate`.
- **Modify** `src/app/contexts/AppDataContext.tsx` — create/update handlers already spread the DTO; confirm `design` flows through (no signature change needed since they use `Omit<AdminEmailTemplate, ...>`).
- **Modify** `src/app/data/store.ts` — bump `KEYS.adminEmailTemplates` to v5.
- **Create** `src/app/components/email-workflows/settings/unlayerDesign.ts` — `htmlToUnlayerDesign(html)` + type; **+ test**.
- **Create** `src/app/components/email-workflows/settings/UnlayerEditor.tsx` — `react-email-editor` wrapper.
- **Modify** `src/app/components/email-workflows/settings/EmailTemplateEditorPage.tsx` — Image-#4 layout; Unlayer; right sidebar; placeholders copy.
- **Modify** `src/app/components/email-workflows/settings/PlaceholdersPanel.tsx` — click-to-copy mode.
- **Delete** `src/app/components/email-workflows/settings/HtmlEditor.tsx`; remove `@tiptap/*` from `package.json`.
- **Modify** `src/app/components/email-workflows/settings/EmailTemplateTable.tsx` — flicker fix.

---

## Task 1: Data model — Unlayer `design` field + helper

**Files:** `types/index.ts`, `store.ts`, create `unlayerDesign.ts` (+ `.test.ts`).

**Interfaces — Produces:** `AdminEmailTemplate.design?: UnlayerDesign | null`; `htmlToUnlayerDesign(html: string): UnlayerDesign`; `type UnlayerDesign = { body: { rows: unknown[]; [k: string]: unknown }; [k: string]: unknown }`.

- [ ] **Step 1: Types.** In `types/index.ts`, add to `AdminEmailTemplate`:
```ts
  /** Unlayer design JSON (present once saved via the visual builder); null for legacy HTML-only seeds. */
  design?: UnlayerDesign | null;
```
Add near it:
```ts
export type UnlayerDesign = { body: { rows: unknown[]; [k: string]: unknown }; [k: string]: unknown };
```

- [ ] **Step 2: Failing test** — `unlayerDesign.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { htmlToUnlayerDesign } from "./unlayerDesign";

describe("htmlToUnlayerDesign", () => {
  it("wraps html in a single html content block", () => {
    const d = htmlToUnlayerDesign("<p>Hi</p>");
    expect(d.body.rows).toHaveLength(1);
    // deep path: rows[0].columns[0].contents[0] is an html block carrying the html
    const content = (d.body.rows[0] as any).columns[0].contents[0];
    expect(content.type).toBe("html");
    expect(content.values.html).toBe("<p>Hi</p>");
  });
});
```

- [ ] **Step 3: Run test → FAIL** (`npm test`).

- [ ] **Step 4: Implement** `unlayerDesign.ts`:
```ts
import type { UnlayerDesign } from "../../../types";

/**
 * Minimal Unlayer design that renders raw HTML in one HTML content block.
 * Used to open legacy HTML-only templates (no stored design) in the visual builder.
 * Approximate: the HTML shows as a single block rather than decomposed into visual rows.
 */
export function htmlToUnlayerDesign(html: string): UnlayerDesign {
  return {
    body: {
      rows: [
        {
          columns: [
            { contents: [{ type: "html", values: { html } }] },
          ],
        },
      ],
    },
  };
}
```

- [ ] **Step 5: Run test → PASS.**

- [ ] **Step 6: Store bump.** `store.ts`: `KEYS.adminEmailTemplates` → `"loanbudcrm:v5:adminEmailTemplates"`. (Seed templates keep `body` HTML; `design` is simply absent/undefined — the reviver leaves it alone.)

- [ ] **Step 7: Verify** — `npm test` green; `npx tsc -p tsconfig.typecheck.json` ≤ 66, `unlayerDesign` 0 errors.

- [ ] **Step 8: Commit** — `feat(email-templates): add Unlayer design field + html-to-design helper`.

---

## Task 2: Unlayer editor + Image-#4 editor page layout

**Files:** create `UnlayerEditor.tsx`; modify `EmailTemplateEditorPage.tsx`, `PlaceholdersPanel.tsx`; delete `HtmlEditor.tsx`; remove `@tiptap/*` deps.

**Interfaces — Consumes:** `UnlayerDesign`, `htmlToUnlayerDesign` (Task 1); `PLACEHOLDER_GROUPS`, `extractPlaceholders` (existing). **Produces:** `UnlayerEditor` with an imperative save.

- [ ] **Step 1: Install** — `npm install --legacy-peer-deps react-email-editor`. Remove any `packageManager` field corepack adds. Then `npm uninstall @tiptap/react @tiptap/starter-kit @tiptap/pm` (Unlayer replaces TipTap). Delete `HtmlEditor.tsx`.

- [ ] **Step 2: `UnlayerEditor.tsx`.** Check the installed `react-email-editor` types (`node_modules/react-email-editor/dist/*.d.ts`) for the exact `EditorRef`/`onReady`/`exportHtml`/`loadDesign` signatures and match them. Reference shape (verify against the actual types before finalizing):
```tsx
import { useRef, useImperativeHandle } from "react";
import type React from "react";
import EmailEditor, { type EditorRef } from "react-email-editor";
import type { UnlayerDesign } from "../../../types";

export interface UnlayerEditorHandle {
  /** Exports current design + html; resolves with both. */
  save: () => Promise<{ design: UnlayerDesign; html: string }>;
}

export default function UnlayerEditor({
  initialDesign,
  editorRef,
}: {
  initialDesign: UnlayerDesign;
  editorRef?: React.MutableRefObject<UnlayerEditorHandle | null>;
}) {
  const ref = useRef<EditorRef>(null);

  const onReady = () => {
    ref.current?.editor?.loadDesign(initialDesign as never);
  };

  useImperativeHandle(editorRef, () => ({
    save: () =>
      new Promise((resolve) => {
        ref.current?.editor?.exportHtml((data: { design: unknown; html: string }) => {
          resolve({ design: data.design as UnlayerDesign, html: data.html });
        });
      }),
  }), []);

  return (
    <div className="h-full min-h-0 flex">
      <EmailEditor ref={ref} onReady={onReady} minHeight="100%" style={{ flex: 1 }} />
    </div>
  );
}
```

- [ ] **Step 3: `PlaceholdersPanel.tsx` → copy-to-clipboard.** Change the prop from `onInsert` to `onCopy` (or keep the name but have the parent copy). Update the click handler to copy the token and toast. Match Image #4 subtext "Click to copy, then paste into any text block":
```tsx
import { toast } from "sonner";
import { PLACEHOLDER_GROUPS } from "./placeholderCatalog";

export function PlaceholdersPanel() {
  const copy = (token: string) => {
    navigator.clipboard?.writeText(`{{${token}}}`);
    toast.success(`Copied {{${token}}}`);
  };
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-1 h-4 bg-primary rounded" />
        <h3 className="text-sm font-semibold text-foreground">PLACEHOLDERS</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3">Click to copy, then paste into any text block.</p>
      <div className="space-y-4">
        {PLACEHOLDER_GROUPS.map((g) => (
          <div key={g.label}>
            <p className="text-[11px] font-semibold text-muted-foreground tracking-wide mb-1.5">{g.label}</p>
            <div className="space-y-1.5">
              {g.tokens.map((tk) => (
                <button key={tk.token} type="button" onClick={() => copy(tk.token)}
                  className="w-full text-left px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted font-mono text-sm text-foreground transition-colors">
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

- [ ] **Step 4: `EmailTemplateEditorPage.tsx` — Image #4 layout.** Keep the keyed wrapper + inner split. New structure:
  - **Top bar:** back arrow + template name (or "New Template") + right-aligned `Cancel` and `Save` buttons (admin). (Duplicate / Edit HTML from Image #4 are out of scope for now — note as deferred; do not add.)
  - **Body: two panes, full height.** LEFT (`flex-1`): `<UnlayerEditor initialDesign={...} editorRef={unlayerRef} />` for admin; for loan_officer render the read-only HTML (`dangerouslySetInnerHTML` on `body`, no Unlayer). RIGHT (`w-80 shrink-0 border-l overflow-y-auto`): **Template settings** — `Name` input, `Category` (folder) select (the existing depth-indented select with nbsp indent + "No folder (Uncategorized)"), `Subject` input, then `<PlaceholdersPanel />`.
  - **Initial design:** `const initialDesign = existing?.design ?? htmlToUnlayerDesign(existing?.body ?? "<p></p>")`.
  - **Save:** `const { design, html } = await unlayerRef.current!.save();` then recompute `variables` from `subject + html` via `extractPlaceholders`, and call create/update with `{ name, subject, folderId, body: html, design, visibleToLoanOfficers, senderType, variables }`. Then navigate back.
  - Preserve: keyed remount on route change, unknown-id → create-like, loan_officer read-only (no Save/Cancel-mutation, no Unlayer — show rendered `body`), name/subject/folder still editable only by admin.
  - Remove the TipTap `HtmlEditor` import/usage.

- [ ] **Step 5: Context passthrough.** Confirm `handleCreateAdminEmailTemplate`/`handleUpdateAdminEmailTemplate` accept `design` (they take `Omit<AdminEmailTemplate, "id"|"createdAt"|"updatedAt">` / `Partial<...>`, so adding `design` to the type is enough — verify no explicit field list drops it). `extractVariables`/`variables` stays HTML-token based.

- [ ] **Step 6: Verify** — `npx tsc -p tsconfig.typecheck.json` → new/edited files 0 errors, total ≤ 66; `npm run build` succeeds (Unlayer's wrapper bundles; the editor itself loads at runtime); `npm test` green; `grep -rn "@tiptap\|HtmlEditor" src/` empty. **Runtime:** if a browser is available, load `/email-workflows/templates/new` and `/email-workflows/templates/etpl-1` — Unlayer renders, seed template shows its HTML block, editing + Save round-trips design+html, placeholder click copies. **If no browser, state explicitly that Unlayer runtime behavior is unverified** and list what a human must check.

- [ ] **Step 7: Commit** — `feat(email-templates): Unlayer visual editor + Image-#4 editor layout; placeholders copy-to-clipboard; drop TipTap`.

---

## Task 3: Fix list-page row-action hover flicker

**Files:** `EmailTemplateTable.tsx`.

**Cause:** action clusters use `hidden group-hover:inline-flex` / `hidden group-hover:flex` (lines ~144, ~302). `hidden` removes them from layout; on hover they re-enter layout and reflow the row, so the row height/width shifts, the pointer falls outside the row, hover drops, buttons disappear — an oscillation (flicker).

**Fix:** keep the action cluster ALWAYS in the layout and reveal it with opacity, so hovering causes no reflow. Position it so it never changes row size.

- [ ] **Step 1:** For each action cluster (the template-row one ~line 144 and the folder-group-row one ~line 302), replace the visibility mechanism:
  - Change `hidden group-hover:inline-flex` → `inline-flex opacity-0 group-hover:opacity-100 transition-opacity` (and `hidden group-hover:flex` → `flex opacity-0 group-hover:opacity-100 transition-opacity`).
  - Add `pointer-events-none group-hover:pointer-events-auto` so the invisible cluster isn't clickable/hoverable when hidden.
  - Ensure the cluster's cell reserves its width so revealing doesn't shift siblings: put the actions in a fixed-width trailing cell (e.g. the actions `<td>`/cell gets a stable `w-16`/`w-20`), OR wrap the cluster in a `relative` cell and make the cluster `absolute right-2 top-1/2 -translate-y-1/2` so it overlays without affecting layout. Prefer the absolute-overlay approach for the template row's trailing actions to guarantee zero reflow.
  - Do NOT change the click handlers, the inline delete-confirm, or `stop`/`stopPropagation` behavior.

- [ ] **Step 2: Verify** — `npx tsc -p tsconfig.typecheck.json` ≤ 66, `EmailTemplateTable` 0 errors; `npm run build` + `npm test` green; `npm run lint` 0 warnings. Confirm no `hidden group-hover:` remains for the action clusters: `grep -n "hidden group-hover" src/app/components/email-workflows/settings/EmailTemplateTable.tsx` → empty. **Runtime (if browser):** hover a row — buttons fade in with no row movement, no flicker; clicking edit/delete still works; row click still navigates.

- [ ] **Step 3: Commit** — `fix(email-templates): stop row-action hover flicker via opacity reveal without layout shift`.

---

## Self-Review

**Spec coverage:**
- Unlayer editor → Task 2 (`UnlayerEditor` + page) ✓
- Image-#4 layout (Unlayer left, Name/Category/Subject/Placeholders right) → Task 2 Step 4 ✓
- Design JSON + exported HTML storage → Task 1 (`design` field) + Task 2 (save exports both) ✓
- Placeholders click-to-copy (Image #4) → Task 2 Step 3 ✓
- Sidebar scope = Name/Category/Subject/Placeholders only (send fields excluded) → Task 2 Step 4 ✓
- Flicker fix → Task 3 ✓

**Type consistency:** `UnlayerDesign`/`design` (Task 1) consumed by `UnlayerEditor` + editor page (Task 2); `htmlToUnlayerDesign` bridges legacy HTML seeds. `UnlayerEditorHandle.save()` returns `{design, html}` used by the page's save.

**Known risks / open items (flagged, not blockers):**
- **Unlayer runtime unverifiable without a browser** — Global Constraints call this out; the implementer must report what's unverified.
- **`react-email-editor` API shape** — the reference code in Task 2 MUST be reconciled against the installed package's actual `.d.ts` (loadDesign/exportHtml/onReady/ref) before finalizing; do not ship the reference verbatim if types differ.
- **Legacy-seed fidelity** — `htmlToUnlayerDesign` shows old HTML as one block, not decomposed visual rows; acceptable for a prototype.
- **Duplicate / Edit HTML** top-bar buttons from Image #4 are deferred (out of scope this round).
