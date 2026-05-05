import { Copy, Trash2, Plus, X, ChevronDown } from "lucide-react";
import type { FilterGroup, FilterRule } from "@/app/types";

interface FilterGroupCardProps {
  group: FilterGroup;
  groupIdx: number;
  isOnly: boolean;
  isLast: boolean;
  onAddFilter: (groupId: string) => void;
  onRemoveFilter: (groupId: string, idx: number) => void;
  onUpdateFilter: (
    groupId: string,
    idx: number,
    updates: Partial<FilterRule>,
  ) => void;
  onToggleFilterLogic: (groupId: string, filterIdx: number) => void;
  onDuplicateGroup: (groupId: string) => void;
  onRemoveGroup: (groupId: string) => void;
  onToggleGroupConnector: (groupId: string) => void;
}

const selectClass =
  "px-3 py-1.5 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none pr-7";

export function FilterGroupCard({
  group,
  groupIdx,
  isOnly,
  isLast,
  onAddFilter,
  onRemoveFilter,
  onUpdateFilter,
  onToggleFilterLogic,
  onDuplicateGroup,
  onRemoveGroup,
  onToggleGroupConnector,
}: FilterGroupCardProps) {
  return (
    <div>
      {/* Group card */}
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        {/* Group header */}
        <div className="flex items-center justify-between px-4 py-2 bg-muted/40 border-b border-border">
          <span className="text-sm font-semibold text-foreground">
            Group {groupIdx + 1}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onDuplicateGroup(group.id)}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
              title="Duplicate group"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onRemoveGroup(group.id)}
              disabled={isOnly}
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Remove group"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 py-3 space-y-2">
          {group.filters.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              No filters — add one below to match contacts.
            </p>
          ) : (
            group.filters.map((filter, filterIdx) => (
              <div key={filterIdx}>
                {/* Filter row */}
                <div className="flex items-center gap-2">
                  {/* Field */}
                  <div className="relative">
                    <select
                      value={filter.field}
                      onChange={(e) =>
                        onUpdateFilter(group.id, filterIdx, {
                          field: e.target.value as FilterRule["field"],
                          value:
                            e.target.value === "listingStatus" ? "New" : "Broker",
                        })
                      }
                      className={selectClass}
                    >
                      <option value="listingStatus">Listing Status</option>
                      <option value="userType">User Type</option>
                    </select>
                    <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                  </div>

                  {/* Operator */}
                  <div className="relative">
                    <select
                      value={filter.operator}
                      onChange={(e) =>
                        onUpdateFilter(group.id, filterIdx, {
                          operator: e.target.value as FilterRule["operator"],
                        })
                      }
                      className={selectClass}
                    >
                      <option value="=">equals</option>
                      <option value="!=">not equals</option>
                    </select>
                    <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                  </div>

                  {/* Value */}
                  <div className="relative">
                    <select
                      value={filter.value}
                      onChange={(e) =>
                        onUpdateFilter(group.id, filterIdx, {
                          value: e.target.value,
                        })
                      }
                      className={selectClass}
                    >
                      {filter.field === "listingStatus" ? (
                        <>
                          <option value="New">New</option>
                          <option value="Draft">Draft</option>
                          <option value="Submitted">Submitted</option>
                          <option value="On Hold">On Hold</option>
                          <option value="Declined">Declined</option>
                        </>
                      ) : (
                        <>
                          <option value="Broker">Broker</option>
                          <option value="Direct">Direct</option>
                          <option value="Partner">Partner</option>
                        </>
                      )}
                    </select>
                    <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                  </div>

                  <button
                    onClick={() => onRemoveFilter(group.id, filterIdx)}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Per-filter connector */}
                {filterIdx < group.filters.length - 1 && (
                  <div className="flex items-center gap-2 my-1.5 pl-1">
                    <button
                      onClick={() => onToggleFilterLogic(group.id, filterIdx)}
                      className="flex items-center gap-0.5 px-2 py-0.5 bg-background border border-border rounded-full text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      {filter.logic}
                      <ChevronDown className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Add filter row */}
          <div className="flex items-center gap-3 pt-1">
            {group.filters.length > 0 && (
              <button
                onClick={() =>
                  onToggleFilterLogic(group.id, group.filters.length - 1)
                }
                className="flex items-center gap-0.5 px-2 py-0.5 bg-background border border-border rounded-full text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                {group.filters[group.filters.length - 1].logic}
                <ChevronDown className="w-2.5 h-2.5" />
              </button>
            )}
            <button
              onClick={() => onAddFilter(group.id)}
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              Add filter
            </button>
          </div>
        </div>
      </div>

      {/* Between-group connector */}
      {!isLast && (
        <div className="flex items-center gap-3 my-2 pl-2">
          <button
            onClick={() => onToggleGroupConnector(group.id)}
            className="flex items-center gap-1 px-3 py-1 bg-background border border-border rounded-full text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            {group.connectorAfter}
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
