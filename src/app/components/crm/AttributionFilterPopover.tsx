import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Filter, Sparkles, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Checkbox } from "../ui/checkbox";
import type { AttributionNode } from "@/app/types";
import {
  ATTRIBUTION_NODES,
  attributionChildren,
  attributionDescendantIds,
  attributionNodeById,
} from "@/app/data/attributionTaxonomy";

/**
 * V2 (RFC-009): hierarchical attribution filter — the "lead source pyramid".
 * Ticking any node means "that node and everything under it" (descendant-inclusive),
 * so marketing filters by broad category (Paid Social, Partnership) without
 * hand-picking individual leaf sources. Mirrors the TreeSelect planned for frontend-hub.
 */

const KIND_LABEL: Record<AttributionNode["kind"], string> = {
  channel: "Channel",
  platform: "Platform",
  campaign: "Campaign",
  ad_set: "Ad Set",
  creative: "Creative",
};

interface AttributionFilterPopoverProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  /** contact counts per node id (descendant-inclusive), for the little badges */
  countsByNodeId: Map<string, number>;
  /** trigger button label (defaults to "Attribution") */
  triggerLabel?: string;
}

interface TreeRowProps extends AttributionFilterPopoverProps {
  node: AttributionNode;
  depth: number;
  expanded: Set<string>;
  toggleExpanded: (id: string) => void;
  impliedSelected: Set<string>;
}

function TreeRow({
  node,
  depth,
  expanded,
  toggleExpanded,
  selectedIds,
  onChange,
  countsByNodeId,
  impliedSelected,
}: TreeRowProps) {
  const children = attributionChildren(node.id);
  const isOpen = expanded.has(node.id);
  const isChecked = selectedIds.includes(node.id);
  const isImplied = !isChecked && impliedSelected.has(node.id);
  const count = countsByNodeId.get(node.id) ?? 0;

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 rounded-md px-1.5 py-1 hover:bg-muted/60 transition-colors ${
          isImplied ? "opacity-70" : ""
        }`}
        style={{ paddingLeft: `${6 + depth * 16}px` }}
      >
        {children.length > 0 ? (
          <button
            type="button"
            onClick={() => toggleExpanded(node.id)}
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        <Checkbox
          checked={isChecked || isImplied}
          disabled={isImplied}
          onCheckedChange={(checked) => {
            if (checked === true) {
              // selecting a parent supersedes any previously-selected descendants
              const branch = attributionDescendantIds([node.id]);
              onChange([...selectedIds.filter((id) => !branch.has(id)), node.id]);
            } else {
              onChange(selectedIds.filter((id) => id !== node.id));
            }
          }}
        />
        <button
          type="button"
          className="flex items-center gap-1.5 flex-1 min-w-0 text-left"
          onClick={() => (children.length > 0 ? toggleExpanded(node.id) : undefined)}
        >
          <span className="text-sm truncate">{node.name}</span>
          {node.isAutoCreated && (
            <span
              className="inline-flex items-center gap-0.5 px-1.5 py-px rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] shrink-0"
              title="Auto-created from UTM data (Phase 2) — appeared in the tree the first time a lead arrived from it"
            >
              <Sparkles className="w-2.5 h-2.5" />
              auto
            </span>
          )}
        </button>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground shrink-0">
          {KIND_LABEL[node.kind]}
        </span>
        <span
          className={`text-xs tabular-nums shrink-0 w-7 text-right ${
            count > 0 ? "text-foreground" : "text-muted-foreground/50"
          }`}
        >
          {count}
        </span>
      </div>
      {isOpen &&
        children.map((child) => (
          <TreeRow
            key={child.id}
            node={child}
            depth={depth + 1}
            expanded={expanded}
            toggleExpanded={toggleExpanded}
            selectedIds={selectedIds}
            onChange={onChange}
            countsByNodeId={countsByNodeId}
            impliedSelected={impliedSelected}
          />
        ))}
    </div>
  );
}

export function AttributionFilterPopover({
  selectedIds,
  onChange,
  countsByNodeId,
  triggerLabel = "Attribution",
}: AttributionFilterPopoverProps) {
  const [expanded, setExpanded] = useState<Set<string>>(
    // start with the branches that make the demo story visible
    () => new Set(["paid-social", "partnership", "bizbuysell", "meta-ads"]),
  );

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // descendants of every checked node render as checked-but-disabled (implied by the parent)
  const impliedSelected = useMemo(() => {
    const all = attributionDescendantIds(selectedIds);
    for (const id of selectedIds) all.delete(id);
    return all;
  }, [selectedIds]);

  const roots = ATTRIBUTION_NODES.filter((n) => n.parentId === null);

  return (
    <Popover>
      {/* Plain <button> on purpose: this repo's Button component doesn't forward refs
          (React 18), so `asChild` + Button silently breaks the Radix popover anchor —
          same pattern as segment-builder/FilterFieldPicker.tsx. */}
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
            selectedIds.length > 0
              ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
              : "bg-background text-foreground border-border hover:bg-muted/50"
          }`}
          style={{ height: "38px" }}
        >
          <Filter className="w-3.5 h-3.5" />
          {triggerLabel}
          {selectedIds.length > 0 && (
            <span className="ml-0.5 inline-flex items-center justify-center rounded-full bg-background/20 px-1.5 text-xs tabular-nums">
              {selectedIds.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[420px] p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div>
            <p className="text-sm font-semibold">Attribution source</p>
            <p className="text-xs text-muted-foreground">
              Selecting a category includes everything under it
            </p>
          </div>
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs text-primary hover:underline shrink-0"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="max-h-[380px] overflow-auto p-2">
          {roots.map((root) => (
            <TreeRow
              key={root.id}
              node={root}
              depth={0}
              expanded={expanded}
              toggleExpanded={toggleExpanded}
              selectedIds={selectedIds}
              onChange={onChange}
              countsByNodeId={countsByNodeId}
              impliedSelected={impliedSelected}
            />
          ))}
        </div>
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-4 py-3 border-t border-border bg-muted/30">
            {selectedIds.map((id) => {
              const node = attributionNodeById(id);
              if (!node) return null;
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30 text-xs"
                >
                  {node.name}
                  <button type="button" onClick={() => onChange(selectedIds.filter((s) => s !== id))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
