import {
  FileText,
  Briefcase,
  Users as UsersIcon,
  Workflow,
  User,
  Zap,
  ClipboardList,
  Phone,
  Mail,
  Building,
  Calendar,
} from "lucide-react";
import type { IconNavItem, EmailWorkflowSubItem } from "../types";
import type { CRMSubItem as BaseCRMSubItem } from "../types";

// Extend CRMSubItem to include 'icon' property
type CRMSubItem = BaseCRMSubItem & { icon: React.ElementType };

export const iconNavItems: IconNavItem[] = [
  {
    id: "applications",
    label: "Applications",
    icon: FileText,
    tooltip: "Applications",
  },
  {
    id: "business-acquisition",
    label: "Business Acquisition",
    icon: Briefcase,
    tooltip: "Business Acquisition",
  },
  {
    id: "crm",
    label: "CRM",
    icon: UsersIcon,
    tooltip: "CRM",
    hasSubMenu: true,
  },
  {
    id: "email-workflows",
    label: "Email Workflows",
    icon: Workflow,
    tooltip: "Email Workflows",
    hasSubMenu: true,
  },
  {
    id: "users",
    label: "Users",
    icon: User,
    tooltip: "Users",
  },
  {
    id: "automations",
    label: "Automations",
    icon: Zap,
    tooltip: "Automations",
  },
  {
    id: "questionnaires",
    label: "Questionnaires",
    icon: ClipboardList,
    tooltip: "Questionnaires",
  },
];

export const crmSubItems: CRMSubItem[] = [
  { id: "contacts", label: "Contacts", icon: UsersIcon },
  { id: "companies", label: "Companies", icon: Building },
  { id: "inbox", label: "Inbox", icon: Mail },
  { id: "calls", label: "Calls", icon: Phone },
  { id: "meetings", label: "Meetings", icon: Calendar },
];

export const emailWorkflowsSubItems: EmailWorkflowSubItem[] = [
  { id: "overview", label: "Overview", dividerAfter: true },
  { id: "campaigns", label: "Campaigns" },
  { id: "flow-builder", label: "Email Flows", dividerAfter: true },
  { id: "user-segments", label: "Segments" },
  { id: "templates", label: "Templates" },
  { id: "history", label: "History" },
  { id: "tasks", label: "Tasks", dividerAfter: true },
];
