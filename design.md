# LoanBud CRM — Design System

Source of truth for generating new UI. Always follow these patterns to stay consistent with the existing codebase.

**Stack:** React 18 + TypeScript · Tailwind CSS 4 · Shadcn/ui (Radix UI) · Figma-originated

**Golden rule:** Always use token-based Tailwind classes (`bg-primary`, `text-destructive`, etc.) — never hardcode hex values in components.

---

## 1. Color Tokens

Defined in `src/styles/theme.css` and mapped to Tailwind via `@theme inline`.

| Token | CSS Variable | Tailwind Class | Light Value |
|---|---|---|---|
| Brand | `--primary` | `bg-primary` / `text-primary` | `#0d5e52` |
| Brand text | `--primary-foreground` | `text-primary-foreground` | `#ffffff` |
| Accent | `--accent` | `bg-accent` / `text-accent` | `#fbbf24` |
| Accent text | `--accent-foreground` | `text-accent-foreground` | `#0f1419` |
| Destructive | `--destructive` | `bg-destructive` / `text-destructive` | `#dc2626` |
| Destructive text | `--destructive-foreground` | `text-destructive-foreground` | `#ffffff` |
| Page background | `--background` | `bg-background` | `#fafafa` |
| Card surface | `--card` | `bg-card` | `#ffffff` |
| Body text | `--foreground` | `text-foreground` | `#0f1419` |
| Muted background | `--muted` | `bg-muted` | `#f5f5f5` |
| Muted text | `--muted-foreground` | `text-muted-foreground` | `#6b7280` |
| Secondary bg | `--secondary` | `bg-secondary` | `#f5f5f5` |
| Secondary hover | `--secondary-hover` | `bg-secondary-hover` | `#e5e5e5` |
| Border | `--border` | `border-border` | `#e5e7eb` |
| Input bg | `--input-background` | `bg-input-background` | `#ffffff` |
| Focus ring | `--ring` | `ring-ring` | `#0d5e52` |

### Status Colors

Used for pipeline stage badges and application status chips. Applied via Tailwind color palette classes — no custom variables needed in components.

| Status | Background | Text | Border |
|---|---|---|---|
| New | `bg-blue-100` | `text-blue-600` | `border-blue-200` |
| Draft | `bg-purple-100` | `text-purple-600` | `border-purple-200` |
| Submitted | `bg-green-100` | `text-green-600` | `border-green-200` |
| On Hold | `bg-amber-100` | `text-amber-600` | `border-amber-200` |
| Declined | `bg-red-100` | `text-red-600` | `border-red-200` |
| Closed | `bg-slate-100` | `text-slate-600` | `border-slate-200` |
| Overdue | `bg-red-100` | `text-red-600` | — |

Also available as Tailwind tokens via `text-status-new`, `text-status-submitted`, etc. (from `--status-*` vars).

### Sidebar Colors

```tsx
// Sidebar shell
className="bg-sidebar text-sidebar-foreground"

// Active item
className="bg-sidebar-primary text-sidebar-primary-foreground"  // amber

// Hover item
className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"  // darker teal
```

---

## 2. Typography

| Role | Font | Tailwind |
|---|---|---|
| All UI text | Poppins (300–700) | `font-sans` |
| Code / data | DM Mono (300–500) | `font-mono` |

- Base font size: `16px`
- Default font weight for headings/labels/buttons: `500` (`var(--font-weight-medium)`)
- Default font weight for inputs: `400` (`var(--font-weight-normal)`)

**Typography scale** (use Tailwind text-size utilities; these override `@layer base` defaults):

```tsx
<h1 className="text-3xl font-semibold text-foreground">Page Title</h1>
<h2 className="text-xl font-semibold text-foreground">Section Title</h2>
<h3 className="text-base font-semibold text-foreground">Card Title</h3>
<p className="text-sm text-muted-foreground">Body / secondary text</p>
<span className="text-xs text-muted-foreground">Caption / meta text</span>
<span className="text-[10px] uppercase tracking-tighter">Micro label / badge text</span>
```

When Tailwind font utilities don't give enough control:
```tsx
style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
```

---

## 3. Spacing & Sizing (4px grid)

| Context | Class Pattern |
|---|---|
| Page header padding | `px-8 py-6` |
| Section toolbar padding | `px-5 py-2.5` |
| Table cell padding | `px-6 py-4` |
| Compact chip padding | `px-3 py-1.5` |
| Status micro-badge | `px-1.5 py-0.5` |
| Card internal gap | `gap-6` |
| Chip/button internal gap | `gap-1.5` |
| Button icon size | `w-3.5 h-3.5` |
| Standard icon size | `w-4 h-4` |
| Small avatar | `w-6 h-6` |
| Medium avatar | `w-8 h-8` |

**Border radius** (`--radius: 0.5rem`):
- `rounded-md` → `calc(0.5rem - 2px)` — buttons, inputs, chips
- `rounded-lg` → `0.5rem` — cards, panels
- `rounded-xl` → `calc(0.5rem + 4px)` — large card surfaces
- `rounded-full` — pill chips, avatars

---

## 4. Button Recipes

Source: `src/app/components/ui/button.tsx`

```tsx
import { Button } from "@/components/ui/button";

// Primary — main CTA
<Button>Save Changes</Button>

// Secondary / cancel
<Button variant="outline">Cancel</Button>

// Danger
<Button variant="destructive">Delete</Button>

// Subtle / contextual
<Button variant="secondary">Export</Button>

// Minimal hover-only
<Button variant="ghost">View</Button>

// Text link
<Button variant="link">Learn more</Button>

// Square icon button
<Button variant="ghost" size="icon">
  <PlusIcon />
</Button>

// Small toolbar button (most common in feature UIs)
<Button size="sm" className="gap-1.5 text-xs rounded-lg">
  <Plus className="w-3.5 h-3.5" />
  New Task
</Button>

// Small outline toolbar button
<Button variant="outline" size="sm" className="text-xs rounded-lg">
  Apply Filters
</Button>
```

**Size reference:**
| Size | Height | Padding |
|---|---|---|
| `default` | `h-9` | `px-4 py-2` |
| `sm` | `h-8` | `px-3` |
| `lg` | `h-10` | `px-6` |
| `icon` | `size-9` | — |

---

## 5. Badge & Chip Recipes

Source: `src/app/components/ui/badge.tsx`

```tsx
import { Badge } from "@/components/ui/badge";

// Default (primary teal)
<Badge>Active</Badge>

// Muted secondary
<Badge variant="secondary">Pending</Badge>

// Danger
<Badge variant="destructive">Blocked</Badge>

// Outlined
<Badge variant="outline">Draft</Badge>
```

**Custom status badge** (most common in feature components):
```tsx
// Overdue indicator
<span className="inline-block text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded uppercase tracking-tighter">
  Overdue
</span>

// Pipeline stage badge
<span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-600 border border-green-200">
  Submitted
</span>
```

**Filter chip (active/inactive toggle):**
```tsx
<button
  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border transition-colors ${
    active
      ? "bg-primary text-primary-foreground border-primary font-semibold"
      : "bg-muted text-muted-foreground border-border hover:bg-muted/70"
  }`}
>
  {label}
</button>
```

**Toolbar filter chip with count:**
```tsx
<button
  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
    active
      ? "bg-muted text-foreground border-border"
      : "text-muted-foreground hover:bg-muted/60 border-border"
  }`}
>
  {label}
  {count > 0 && (
    <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">
      {count}
    </span>
  )}
</button>
```

**Type badge with icon:**
```tsx
<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-tighter bg-blue-100 text-blue-600">
  <PhoneIcon className="w-2.5 h-2.5" />
  Call
</span>
```

**Rules:**
- Chips always appear in sets of 3+
- Never use a dropdown for ≤2 options — use a toggle or radio group

---

## 6. Card Recipes

Source: `src/app/components/ui/card.tsx`

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

// Standard card
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Supporting text</CardDescription>
  </CardHeader>
  <CardContent>
    {/* content */}
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Card with action in header (top-right)
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <div data-slot="card-action">
      <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
    </div>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

**Custom card surface** (without Shadcn Card, for simpler use):
```tsx
<div className="bg-card rounded-xl border border-border p-6">
  {/* content */}
</div>
```

---

## 7. Input & Form Recipes

Source: `src/app/components/ui/input.tsx`

```tsx
import { Input } from "@/components/ui/input";

// Standard labeled input (React Hook Form)
<div className="flex flex-col gap-1.5">
  <label className="text-sm font-medium text-foreground">Email</label>
  <Input type="email" placeholder="you@example.com" {...register("email")} />
  {errors.email && (
    <p className="text-xs text-destructive">{errors.email.message}</p>
  )}
</div>
```

`aria-invalid` on `<Input>` automatically triggers a red focus ring via Shadcn styles — no extra class needed.

**Search input with icon:**
```tsx
<div className="relative">
  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
  <input
    type="text"
    placeholder="Search..."
    className="w-full pl-9 pr-4 py-1.5 bg-muted/40 border border-border rounded-lg
               text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
  />
</div>
```

---

## 8. Table Recipe

```tsx
<div className="overflow-auto">
  <table className="w-full table-fixed min-w-[900px]">
    <thead className="bg-muted/50 border-b border-border sticky top-0">
      <tr>
        {/* Checkbox column */}
        <th className="w-[50px] px-4 py-4 text-left">
          <input type="checkbox" />
        </th>
        {/* Sortable column */}
        <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground cursor-pointer hover:text-foreground">
          <div className="flex items-center gap-1.5">
            Name <ChevronUpIcon className="w-3.5 h-3.5" />
          </div>
        </th>
        {/* Plain column */}
        <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
          Status
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-border">
      <tr
        className={`group hover:bg-muted/20 transition-colors cursor-pointer ${
          isSelected ? "bg-muted/10" : ""
        } ${isDisabled ? "opacity-50" : ""}`}
      >
        <td className="px-4 py-4">
          <input type="checkbox" />
        </td>
        <td className="px-6 py-4">
          <div className="text-sm font-semibold text-blue-600">{name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>
        </td>
        <td className="px-6 py-4">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-600 border border-green-200">
            Active
          </span>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

**Row states:**
- Default hover: `hover:bg-muted/20`
- Selected: `bg-muted/10`
- Disabled / suspended: `opacity-50`
- Show row actions on hover: `group-hover:opacity-100 opacity-0 transition-opacity` on action buttons

---

## 9. Page Layout Recipe

```tsx
// Full-height page — the standard shell for all feature views
<div className="h-full flex flex-col bg-background">

  {/* ① Page header — title + subtitle */}
  <div className="border-b border-border bg-card px-8 py-6 shrink-0">
    <h1 className="text-3xl font-semibold text-foreground">Page Title</h1>
    <p className="text-sm text-muted-foreground mt-0.5">{count} items</p>
  </div>

  {/* ② Filter / toolbar row */}
  <div className="flex items-center justify-between gap-3 px-5 py-2.5 border-b border-border shrink-0">
    {/* Left: filter chips */}
    <div className="flex items-center gap-1">
      {/* chips here */}
    </div>
    {/* Right: search + actions */}
    <div className="flex items-center gap-3 shrink-0">
      {/* search input + buttons */}
    </div>
  </div>

  {/* ③ Scrollable content area */}
  <div className="flex-1 overflow-auto">
    {/* table or list */}
  </div>

</div>
```

**Three-panel contact detail layout:**
```tsx
<div className="h-full flex overflow-hidden">
  <div className="w-72 shrink-0 border-r border-border overflow-y-auto">
    {/* Left panel: info */}
  </div>
  <div className="flex-1 overflow-y-auto">
    {/* Center panel: activity / main content */}
  </div>
  <div className="w-80 shrink-0 border-l border-border overflow-y-auto">
    {/* Right panel: related items */}
  </div>
</div>
```

---

## 10. Avatar Recipe

```tsx
// Initials avatar (small — table rows, chips)
<div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
  <span className="text-[10px] font-semibold text-primary">{initials}</span>
</div>

// Medium avatar (contact headers, assignee lists)
<div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
  <span className="text-xs font-semibold text-primary">{initials}</span>
</div>

// Large avatar (profile headers)
<div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
  <span className="text-base font-semibold text-primary">{initials}</span>
</div>
```

---

## 11. Hover & Interaction Patterns

| Pattern | Classes |
|---|---|
| Table / list row hover | `hover:bg-muted/20 transition-colors` |
| Primary button hover | built-in `hover:bg-primary/90` |
| Outline button hover | built-in `hover:bg-secondary-hover` |
| Chip hover | `hover:bg-muted/70` |
| Clickable surface | add `cursor-pointer` |
| Focus ring | `focus-visible:ring-[3px] focus-visible:ring-ring/50` (Shadcn built-in) |
| Hide until row hover | `opacity-0 group-hover:opacity-100 transition-opacity` (parent needs `group`) |
| Fade/scale transition | `transition-all duration-150` |

---

## 12. Empty & Loading States

**Empty state (no data):**
```tsx
<div className="flex flex-col items-center justify-center h-full gap-3 text-center py-16">
  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
    <InboxIcon className="w-6 h-6 text-muted-foreground" />
  </div>
  <div>
    <p className="text-sm font-medium text-foreground">No items yet</p>
    <p className="text-xs text-muted-foreground mt-0.5">Get started by creating one.</p>
  </div>
  <Button size="sm">Create</Button>
</div>
```

**Loading skeleton row:**
```tsx
<tr className="animate-pulse">
  <td className="px-6 py-4">
    <div className="h-4 bg-muted rounded w-32" />
  </td>
  <td className="px-6 py-4">
    <div className="h-4 bg-muted rounded w-20" />
  </td>
</tr>
```

---

## 13. Shadcn/ui Component Policy

All primitives live in `src/app/components/ui/`. Import from `@/components/ui/`.

**Do not modify** files in `ui/` unless strictly necessary.

**Available components:** Button, Badge, Card, Input, Textarea, Label, Select, Checkbox, Switch, Tabs, Dialog, Sheet, Popover, DropdownMenu, Tooltip, Avatar, Separator, Skeleton, Table, ScrollArea, Command, and more.

**Do NOT use MUI** — Shadcn/Radix is the only component library. If a primitive doesn't exist in `ui/`, build it with Tailwind + Radix primitives directly.

---

## 14. Figma Design Rules

These rules originate from the Figma source and must be respected in all new UI:

| Rule | Detail |
|---|---|
| Date format | `"Jun 10"` — short month + day. Never ISO (`2025-06-10`) or full month (`June 10, 2025`) |
| Bottom toolbar | Max 4 items. Never combine with a floating action button (FAB) |
| Chips | Always appear in sets of 3+. Never a lone chip |
| ≤2 options | Use a toggle or radio group, never a `<Select>` dropdown |
| Positioning | No `absolute` unless strictly necessary — prefer `flex`/`grid` layouts |
| Layout | No inline styles for spacing — use Tailwind utilities |

---

## 15. Dark Mode

All Shadcn components auto-support dark mode — the `.dark` class on `<html>` remaps all CSS custom properties to OKLch values via `src/styles/theme.css`.

```tsx
// Manual dark overrides (only when Shadcn defaults aren't enough)
className="bg-card dark:bg-input/30 border-border dark:border-input"

// Never hardcode hex — it won't adapt to dark mode
// ❌ className="bg-[#ffffff]"
// ✅ className="bg-card"
```

Dark mode status colors: `--status-closed` remaps to `#475569` in `.dark`; all others stay the same.

---

## Quick Reference: New Feature Checklist

When building a new feature component:

- [ ] Page shell uses `h-full flex flex-col bg-background`
- [ ] Header uses `border-b border-border bg-card px-8 py-6 shrink-0`
- [ ] Toolbar uses `px-5 py-2.5 border-b border-border`
- [ ] Scrollable area uses `flex-1 overflow-auto`
- [ ] Tables use `bg-muted/50 sticky top-0` thead + `divide-y divide-border` tbody
- [ ] All colors use token classes, no raw hex
- [ ] Dates formatted as `"Jun 10"` style
- [ ] Interactive rows have `cursor-pointer hover:bg-muted/20 transition-colors`
- [ ] Chips appear in sets of 3+
- [ ] Buttons imported from `@/components/ui/button`
- [ ] Forms use React Hook Form + Shadcn `Input` with `aria-invalid` for validation
- [ ] Toasts via `import { toast } from "sonner"`
