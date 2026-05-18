import { useState } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { ChevronDown, Check, Search, Info, AlignLeft, ToggleLeft, Calendar, GitBranch, List, Lock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";

export interface FieldPickerItem<F extends string> {
  field: F;
  label: string;
  description: string;
  category: string;
  subCategory?: string;
  fieldType?: string;
  options?: string[];
}

const TYPE_META: Record<string, { icon: React.ReactNode; label: string }> = {
  select: { icon: <List className="w-3.5 h-3.5" />, label: "Select" },
  text: { icon: <AlignLeft className="w-3.5 h-3.5" />, label: "Text" },
  boolean: { icon: <ToggleLeft className="w-3.5 h-3.5" />, label: "Boolean" },
  date: { icon: <Calendar className="w-3.5 h-3.5" />, label: "Date" },
  workflow: { icon: <GitBranch className="w-3.5 h-3.5" />, label: "Workflow" },
  number: { icon: <span className="text-[11px] font-bold">#</span>, label: "Number" },
};

function FieldInfoTooltip({ item }: { item: FieldPickerItem<string> }) {
  const typeMeta = item.fieldType ? TYPE_META[item.fieldType] : undefined;

  return (
    <div className="w-56 bg-white border border-border rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-3.5 pb-3">
        <p className="text-sm font-semibold text-foreground leading-tight">{item.label}</p>
        <p className="text-xs text-muted-foreground leading-snug mt-1.5">{item.description}</p>
      </div>

      {/* Details */}
      {(typeMeta || (item.options && item.options.length > 0)) && (
        <>
          <div className="h-px bg-border mx-0" />
          <div className="px-4 py-3 space-y-2">
            <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
              Details
            </p>
            {typeMeta && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground w-16 shrink-0">
                  Field type
                </span>
                <span className="flex items-center gap-1.5 text-xs text-foreground">
                  <span className="text-muted-foreground">{typeMeta.icon}</span>
                  {typeMeta.label}
                </span>
              </div>
            )}
            {item.options && item.options.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-xs font-medium text-muted-foreground w-16 shrink-0 pt-0.5">
                  Options
                </span>
                <div className="flex flex-wrap gap-1">
                  {item.options.slice(0, 3).map((opt) => (
                    <span
                      key={opt}
                      className="px-1.5 py-0.5 bg-muted rounded text-[11px] text-foreground"
                    >
                      {opt}
                    </span>
                  ))}
                  {item.options.length > 3 && (
                    <span className="px-1.5 py-0.5 bg-muted rounded text-[11px] text-muted-foreground">
                      +{item.options.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function FilterFieldPicker<F extends string>({
  value,
  fields,
  onChange,
  lockedCategories = [],
}: {
  value: F;
  fields: FieldPickerItem<F>[];
  onChange: (field: F) => void;
  lockedCategories?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = fields.find((f) => f.field === value);

  // Build category order: active categories from fields + locked ones appended
  const activeCategoryOrder: string[] = [];
  const grouped = new Map<string, FieldPickerItem<F>[]>();
  for (const item of fields) {
    if (!grouped.has(item.category)) {
      activeCategoryOrder.push(item.category);
      grouped.set(item.category, []);
    }
    grouped.get(item.category)!.push(item);
  }
  const allCategories = [
    ...activeCategoryOrder,
    ...lockedCategories.filter((c) => !activeCategoryOrder.includes(c)),
  ];

  const [activeCategory, setActiveCategory] = useState<string>(
    () => selected?.category ?? activeCategoryOrder[0],
  );

  const trimmed = query.trim().toLowerCase();
  const isSearching = trimmed.length > 0;

  const searchResults = isSearching
    ? fields.filter(
        (f) =>
          f.label.toLowerCase().includes(trimmed) ||
          f.description.toLowerCase().includes(trimmed) ||
          f.category.toLowerCase().includes(trimmed) ||
          (f.subCategory ?? "").toLowerCase().includes(trimmed),
      )
    : null;

  // Fall back to first available category if activeCategory is stale/invalid
  const resolvedCategory = grouped.has(activeCategory) ? activeCategory : (activeCategoryOrder[0] ?? "");
  const tabItems = isSearching ? searchResults! : (grouped.get(resolvedCategory) ?? []);

  // Sub-group within active tab
  const subGroups: { sub: string; items: FieldPickerItem<F>[] }[] = [];
  if (!isSearching) {
    const subMap = new Map<string, FieldPickerItem<F>[]>();
    const subOrder: string[] = [];
    for (const item of tabItems) {
      const sub = item.subCategory ?? "";
      if (!subMap.has(sub)) { subOrder.push(sub); subMap.set(sub, []); }
      subMap.get(sub)!.push(item);
    }
    for (const sub of subOrder) subGroups.push({ sub, items: subMap.get(sub)! });
  }

  const hasSubs = subGroups.length > 1 || (subGroups.length === 1 && subGroups[0].sub !== "");

  function handleSelect(field: F) {
    onChange(field);
    setOpen(false);
    setQuery("");
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setQuery("");
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring hover:bg-muted/50 transition-colors min-w-[130px] justify-between"
        >
          <span className="truncate">{selected?.label ?? "Select field"}</span>
          <ChevronDown className="w-3 h-3 text-muted-foreground flex-shrink-0" />
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-80 p-0 overflow-hidden">
        {/* Search */}
        <div className="px-3 py-2 border-b border-border">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted/50 border border-border focus-within:border-ring focus-within:ring-1 focus-within:ring-ring transition-colors">
            <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search fields…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 min-w-0"
            />
          </div>
        </div>

        {/* Category tabs */}
        {!isSearching && (
          <div className="flex border-b border-border">
            {allCategories.map((cat) => {
              const isLocked = lockedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  disabled={isLocked}
                  onClick={() => !isLocked && setActiveCategory(cat)}
                  title={isLocked ? "Available in V2" : undefined}
                  className={`flex-1 px-2 py-2 text-xs font-semibold transition-colors whitespace-nowrap flex items-center justify-center gap-1 ${
                    isLocked
                      ? "text-muted-foreground/40 cursor-not-allowed"
                      : activeCategory === cat
                      ? "text-foreground border-b-2 border-primary -mb-px"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                  {isLocked && <Lock className="w-2.5 h-2.5" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Fields list */}
        <TooltipPrimitive.Provider delayDuration={300}>
          <div className="max-h-60 overflow-y-auto py-1">
            {tabItems.length === 0 && isSearching ? (
              <p className="px-4 py-3 text-sm text-muted-foreground">No fields match.</p>
            ) : isSearching ? (
              // Flat search results
              tabItems.map((item) => <FieldRow key={item.field} item={item} value={value} isSearching onSelect={handleSelect} />)
            ) : hasSubs ? (
              // Sub-grouped within tab
              subGroups.map(({ sub, items }) => (
                <div key={sub}>
                  {sub && (
                    <div className="px-3 pt-2.5 pb-1">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground/70">
                        {sub}
                      </span>
                    </div>
                  )}
                  {items.map((item) => <FieldRow key={item.field} item={item} value={value} isSearching={false} onSelect={handleSelect} />)}
                </div>
              ))
            ) : (
              tabItems.map((item) => <FieldRow key={item.field} item={item} value={value} isSearching={false} onSelect={handleSelect} />)
            )}
          </div>
        </TooltipPrimitive.Provider>
      </PopoverContent>
    </Popover>
  );
}

function FieldRow<F extends string>({
  item,
  value,
  isSearching,
  onSelect,
}: {
  item: FieldPickerItem<F>;
  value: F;
  isSearching: boolean;
  onSelect: (f: F) => void;
}) {
  const isSelected = item.field === value;
  return (
    <div
      className={`flex items-center gap-1 pr-2 hover:bg-muted transition-colors ${
        isSelected ? "bg-muted/60" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(item.field)}
        className="flex-1 text-left px-3 py-2 flex items-center gap-2 min-w-0"
      >
        <Check
          className={`w-3.5 h-3.5 flex-shrink-0 ${
            isSelected ? "text-primary" : "text-transparent"
          }`}
        />
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground leading-tight truncate">
            {item.label}
          </div>
          {isSearching && (
            <div className="text-[10px] font-bold tracking-wide uppercase text-primary/70 mt-0.5">
              {[item.category, item.subCategory].filter(Boolean).join(" › ")}
            </div>
          )}
        </div>
      </button>

      {/* Info tooltip */}
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <span className="p-1 text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-default flex-shrink-0">
            <Info className="w-3.5 h-3.5" />
          </span>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content side="right" sideOffset={10} className="z-50">
            <FieldInfoTooltip item={item as FieldPickerItem<string>} />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </div>
  );
}
