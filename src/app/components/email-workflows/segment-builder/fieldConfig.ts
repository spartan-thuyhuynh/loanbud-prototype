import type { FilterFieldV2, FilterOperatorV2 } from "@/app/types";
import type { FieldPickerItem } from "./FilterFieldPicker";

// ─── Field config ─────────────────────────────────────────────────────────────

export interface FieldConfig {
  label: string;
  description: string;
  category: string;
  subCategory?: string;
  type: "select" | "boolean" | "workflow" | "date" | "text" | "number";
  operators: FilterOperatorV2[];
  options?: string[];
}

export const FIELD_CONFIG: Record<FilterFieldV2, FieldConfig> = {
  firstName: {
    label: "First Name",
    description: "The contact's first name",
    category: "Properties",
    subCategory: "Contact Info",
    type: "text",
    operators: ["contains", "not_contains", "=", "!="],
  },
  lastName: {
    label: "Last Name",
    description: "The contact's last name",
    category: "Properties",
    subCategory: "Contact Info",
    type: "text",
    operators: ["contains", "not_contains", "=", "!="],
  },
  email: {
    label: "Email",
    description: "The contact's email address",
    category: "Properties",
    subCategory: "Contact Info",
    type: "text",
    operators: ["contains", "not_contains", "=", "!="],
  },
  phone: {
    label: "Phone",
    description: "The contact's phone number",
    category: "Properties",
    subCategory: "Contact Info",
    type: "text",
    operators: ["contains", "not_contains", "=", "!="],
  },
  userType: {
    label: "User Type",
    description: "Role of the contact in the lending network",
    category: "Properties",
    subCategory: "Contact Info",
    type: "select",
    operators: ["=", "!="],
    options: ["Broker", "Lender", "Partner"],
  },
  brokerageName: {
    label: "Brokerage Name",
    description: "Brokerage organization the contact is affiliated with",
    category: "Properties",
    subCategory: "Contact Info",
    type: "text",
    operators: ["contains", "not_contains", "=", "!="],
  },
  listingStatus: {
    label: "Listing Status",
    description: "Current processing stage of the loan application",
    category: "Properties",
    subCategory: "Application",
    type: "select",
    operators: ["=", "!="],
    options: ["New", "Draft", "Submitted", "On Hold", "Declined"],
  },
  listingName: {
    label: "Listing Name",
    description: "Name or title of the loan listing",
    category: "Properties",
    subCategory: "Application",
    type: "text",
    operators: ["contains", "not_contains", "=", "!="],
  },
  createAt: {
    label: "Created Date",
    description: "Date the contact record was created",
    category: "Properties",
    subCategory: "Application",
    type: "date",
    operators: ["before", "after", "within_last_n_days"],
  },
  openReminders: {
    label: "Open Reminders",
    description: "Number of open reminder tasks for this contact",
    category: "Properties",
    subCategory: "Application",
    type: "number",
    operators: ["=", "!=", ">", "<", ">=", "<="],
  },
  optedOut: {
    label: "Opted Out",
    description: "Whether the contact has opted out of email communications",
    category: "Activity",
    type: "boolean",
    operators: ["is true", "is false"],
  },
  lastContacted: {
    label: "Last Contacted",
    description: "Date this contact was last reached out to",
    category: "Activity",
    type: "date",
    operators: ["before", "after", "within_last_n_days"],
  },
  hasActiveEnrollment: {
    label: "Has Active Enrollment",
    description: "Whether the contact is enrolled in any active workflow",
    category: "Membership",
    type: "boolean",
    operators: ["is true", "is false"],
  },
  enrolledInWorkflow: {
    label: "Enrolled in Workflow",
    description: "The specific workflow the contact is enrolled in",
    category: "Membership",
    type: "workflow",
    operators: ["=", "!="],
  },
};

export const OPERATOR_LABELS: Partial<Record<FilterOperatorV2, string>> = {
  "=": "equals",
  "!=": "not equals",
  "contains": "contains",
  "not_contains": "not contains",
  "is true": "is true",
  "is false": "is false",
  "before": "before",
  "after": "after",
  "within_last_n_days": "within last N days",
  ">": "greater than",
  "<": "less than",
  ">=": "at least",
  "<=": "at most",
};

export const ALL_FIELDS: FilterFieldV2[] = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "userType",
  "brokerageName",
  "listingStatus",
  "listingName",
  "createAt",
  "openReminders",
  "optedOut",
  "lastContacted",
  "hasActiveEnrollment",
  "enrolledInWorkflow",
];

export const FIELD_PICKER_ITEMS: FieldPickerItem<FilterFieldV2>[] = ALL_FIELDS.map((f) => ({
  field: f,
  label: FIELD_CONFIG[f].label,
  description: FIELD_CONFIG[f].description,
  category: FIELD_CONFIG[f].category,
  subCategory: FIELD_CONFIG[f].subCategory,
  fieldType: FIELD_CONFIG[f].type,
  options: FIELD_CONFIG[f].options,
}));

export function defaultValueForField(field: FilterFieldV2): string {
  const cfg = FIELD_CONFIG[field];
  if (cfg.type === "boolean") return "";
  if (cfg.type === "select" && cfg.options?.length) return cfg.options[0];
  if (cfg.type === "number") return "0";
  return "";
}

export function defaultOperatorForField(field: FilterFieldV2): FilterOperatorV2 {
  return FIELD_CONFIG[field].operators[0];
}
