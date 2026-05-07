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
  Settings,
  Layers,
  CheckSquare,
} from "lucide-react";
import type { AppSidebarSection } from "../types";

export const appSidebarSections: AppSidebarSection[] = [
  {
    items: [
      { id: "applications",         label: "Applications",         icon: FileText,  route: "/applications" },
      { id: "business-acquisition", label: "Business Acquisition", icon: Briefcase, route: "/business-acquisition" },
    ],
  },
  {
    items: [
      {
        id: "crm",
        label: "CRM",
        icon: UsersIcon,
        route: "/crm/contacts",
        children: [
          { id: "crm-contacts",  label: "Contacts",  route: "/crm/contacts",  icon: UsersIcon },
          { id: "crm-companies", label: "Companies", route: "/crm/companies", icon: Building  },
          { id: "crm-inbox",     label: "Inbox",     route: "/crm/inbox",     icon: Mail      },
          { id: "crm-calls",     label: "Calls",     route: "/crm/calls",     icon: Phone     },
          { id: "crm-meetings",  label: "Meetings",  route: "/crm/meetings",  icon: Calendar  },
        ],
      },
      {
        id: "email-workflows",
        label: "Workflow",
        icon: Workflow,
        route: "/email-workflows/flows",
        children: [
          { id: "ew-segments",  label: "Segments",      route: "/email-workflows/user-segments", icon: Layers          },
          { id: "ew-flows",     label: "Workflows",     route: "/email-workflows/flows",         icon: Workflow        },
          { id: "ew-tasks",     label: "Tasks",         route: "/email-workflows/tasks",         icon: CheckSquare     },
          { id: "ew-config",    label: "Configuration", route: "/email-workflows/templates",     icon: Settings        },
        ],
      },
      { id: "users",           label: "Users",           icon: User,          route: "/users"          },
      { id: "automations",     label: "Automations",     icon: Zap,           route: "/automations"    },
      { id: "questionnaires",  label: "Questionnaires",  icon: ClipboardList, route: "/questionnaires" },
      { id: "configurations",  label: "Configurations",  icon: Settings,      route: "/configurations" },
    ],
  },
];
