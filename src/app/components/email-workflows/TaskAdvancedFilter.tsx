import { useState } from "react";
import { SlidersHorizontal, Plus, X, ChevronDown, ChevronUp } from "lucide-react";

/**
 * RFC-008 (story -06, Phase 3): a HubSpot-style AND/OR field-operator filter builder
 * for the task list, powered by a future `GET /task/schema`. Presentational preview
 * only — it doesn't filter the list yet; it shows the shape of the proposed feature.
 */

const FIELDS = ["Contact status", "Task type", "Assignee", "Due date", "Source", "Segment"];
const OPERATORS = ["is", "is not", "contains", "before", "after"];

interface FilterRow {
  id: string;
  field: string;
  operator: string;
  value: string;
  connector: "AND" | "OR";
}

let rowSeq = 0;
const newRow = (): FilterRow => ({
  id: `afr-${rowSeq++}`,
  field: FIELDS[0],
  operator: OPERATORS[0],
  value: "",
  connector: "AND",
});

export function TaskAdvancedFilter() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<FilterRow[]>([newRow()]);

  const update = (id: string, patch: Partial<FilterRow>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id: string) => setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));

  return (
    <div className="border-b border-border bg-muted/20">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Advanced filter
          <span className="text-[9px] font-bold text-primary/70 uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10">
            RFC-008 · Phase 3 preview
          </span>
        </span>
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {open && (
        <div className="px-5 pb-3 space-y-2">
          {rows.map((row, i) => (
            <div key={row.id} className="flex items-center gap-2">
              {i === 0 ? (
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider w-12 shrink-0">Where</span>
              ) : (
                <select
                  value={row.connector}
                  onChange={(e) => update(row.id, { connector: e.target.value as "AND" | "OR" })}
                  className="w-12 shrink-0 px-1 py-1.5 text-[11px] font-semibold border border-border rounded-lg bg-background text-primary focus:outline-none"
                >
                  <option value="AND">AND</option>
                  <option value="OR">OR</option>
                </select>
              )}
              <select
                value={row.field}
                onChange={(e) => update(row.id, { field: e.target.value })}
                className="flex-1 px-2.5 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
              <select
                value={row.operator}
                onChange={(e) => update(row.id, { operator: e.target.value })}
                className="w-28 shrink-0 px-2.5 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {OPERATORS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <input
                value={row.value}
                onChange={(e) => update(row.id, { value: e.target.value })}
                placeholder="value"
                className="flex-1 px-2.5 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={() => remove(row.id)}
                className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0"
                title="Remove"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setRows((prev) => [...prev, newRow()])}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> Add filter
            </button>
            <span className="text-[10px] text-muted-foreground italic">Preview only — not yet wired to the list</span>
          </div>
        </div>
      )}
    </div>
  );
}
