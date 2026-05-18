import { Copy, Trash2, Plus, X, ChevronDown } from "lucide-react";
import type { FilterGroup, FilterRule } from "@/app/types";
import { FilterFieldPicker } from "./FilterFieldPicker";
import type { FieldPickerItem } from "./FilterFieldPicker";

// ─── Field config ─────────────────────────────────────────────────────────────

type V1FieldMeta = {
  type: "text" | "select";
  options?: string[];
  operators: { value: FilterRule["operator"]; label: string }[];
  defaultValue: string;
  defaultOperator: FilterRule["operator"];
};

const TEXT_OPS: V1FieldMeta["operators"] = [
  { value: "contains", label: "contains" },
  { value: "not_contains", label: "not contains" },
  { value: "=", label: "equals" },
  { value: "!=", label: "not equals" },
];

const SELECT_OPS: V1FieldMeta["operators"] = [
  { value: "=", label: "equals" },
  { value: "!=", label: "not equals" },
];

const V1_FIELD_META: Record<FilterRule["field"], V1FieldMeta> = {
  firstName: { type: "text", operators: TEXT_OPS, defaultValue: "", defaultOperator: "contains" },
  lastName: { type: "text", operators: TEXT_OPS, defaultValue: "", defaultOperator: "contains" },
  email: { type: "text", operators: TEXT_OPS, defaultValue: "", defaultOperator: "contains" },
  phone: { type: "text", operators: TEXT_OPS, defaultValue: "", defaultOperator: "contains" },
  listingName: { type: "text", operators: TEXT_OPS, defaultValue: "", defaultOperator: "contains" },
  userType: {
    type: "select",
    options: ["Broker", "Lender", "Partner"],
    operators: SELECT_OPS,
    defaultValue: "Broker",
    defaultOperator: "=",
  },
  listingStatus: {
    type: "select",
    options: ["New", "Draft", "Submitted", "On Hold", "Declined"],
    operators: SELECT_OPS,
    defaultValue: "New",
    defaultOperator: "=",
  },
};

const V1_FIELD_PICKER_ITEMS: FieldPickerItem<FilterRule["field"]>[] = [
  {
    field: "firstName",
    label: "First Name",
    description: "The contact's first name",
    category: "Properties",
    subCategory: "Contact Info",
    fieldType: "text",
  },
  {
    field: "lastName",
    label: "Last Name",
    description: "The contact's last name",
    category: "Properties",
    subCategory: "Contact Info",
    fieldType: "text",
  },
  {
    field: "email",
    label: "Email",
    description: "The contact's email address",
    category: "Properties",
    subCategory: "Contact Info",
    fieldType: "text",
  },
  {
    field: "phone",
    label: "Phone",
    description: "The contact's phone number",
    category: "Properties",
    subCategory: "Contact Info",
    fieldType: "text",
  },
  {
    field: "userType",
    label: "User Type",
    description: "Role of the contact in the lending network",
    category: "Properties",
    subCategory: "Contact Info",
    fieldType: "select",
    options: ["Broker", "Lender", "Partner"],
  },
  {
    field: "listingStatus",
    label: "Listing Status",
    description: "Current processing stage of the loan application",
    category: "Properties",
    subCategory: "Application",
    fieldType: "select",
    options: ["New", "Draft", "Submitted", "On Hold", "Declined"],
  },
  {
    field: "listingName",
    label: "Listing Name",
    description: "Name or title of the loan listing",
    category: "Properties",
    subCategory: "Application",
    fieldType: "text",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface FilterGroupCardProps {
  group: FilterGroup;
  groupIdx: number;
  isOnly: boolean;
  isLast: boolean;
  onAddFilter: (groupId: string) => void;
  onRemoveFilter: (groupId: string, idx: number) => void;
  onUpdateFilter: (groupId: string, idx: number, updates: Partial<FilterRule>) => void;
  onDuplicateGroup: (groupId: string) => void;
  onRemoveGroup: (groupId: string) => void;
}

const selectClass =
  "px-3 py-1.5 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none pr-7";

const inputClass =
  "px-3 py-1.5 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring w-36";

const connectorBadge = (label: string) => (
  <span className="px-2 py-0.5 bg-muted border border-border rounded-full text-xs font-semibold text-muted-foreground uppercase tracking-wide">
    {label}
  </span>
);

export function FilterGroupCard({
  group,
  groupIdx,
  isOnly,
  isLast,
  onAddFilter,
  onRemoveFilter,
  onUpdateFilter,
  onDuplicateGroup,
  onRemoveGroup,
}: FilterGroupCardProps) {
  return (
    <div>
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        {/* Group header */}
        <div className="flex items-center justify-between px-4 py-2 bg-muted/40 border-b border-border">
          <span className="text-sm font-semibold text-foreground">Group {groupIdx + 1}</span>
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
            group.filters.map((filter, filterIdx) => {
              const meta = V1_FIELD_META[filter.field];
              return (
                <div key={filterIdx}>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Field picker */}
                    <FilterFieldPicker
                      value={filter.field}
                      fields={V1_FIELD_PICKER_ITEMS}
                      lockedCategories={["Activity", "Membership"]}
                      onChange={(newField) =>
                        onUpdateFilter(group.id, filterIdx, {
                          field: newField,
                          operator: V1_FIELD_META[newField].defaultOperator,
                          value: V1_FIELD_META[newField].defaultValue,
                        })
                      }
                    />

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
                        {meta.operators.map((op) => (
                          <option key={op.value} value={op.value}>{op.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                    </div>

                    {/* Value */}
                    {meta.type === "select" ? (
                      <div className="relative">
                        <select
                          value={filter.value}
                          onChange={(e) =>
                            onUpdateFilter(group.id, filterIdx, { value: e.target.value })
                          }
                          className={selectClass}
                        >
                          {meta.options!.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={filter.value}
                        onChange={(e) =>
                          onUpdateFilter(group.id, filterIdx, { value: e.target.value })
                        }
                        placeholder="value…"
                        className={inputClass}
                      />
                    )}

                    <button
                      onClick={() => onRemoveFilter(group.id, filterIdx)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Static AND connector */}
                  {filterIdx < group.filters.length - 1 && (
                    <div className="flex items-center gap-2 my-1.5 pl-1">
                      {connectorBadge("and")}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Add filter row */}
          <div className="flex items-center gap-3 pt-1">
            {group.filters.length > 0 && connectorBadge("and")}
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

      {/* Static OR connector between groups */}
      {!isLast && (
        <div className="flex items-center gap-3 my-2 pl-2">
          {connectorBadge("or")}
        </div>
      )}
    </div>
  );
}
