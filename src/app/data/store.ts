import type { Contact, EmailRecord, Task, Segment, TaskItem, Application, BusinessAcquisitionRecord, Workflow, WorkflowEnrollment, ContactActivityRecord } from "../types";
import type { Campaign } from "../components/email-workflows/campaign/types";
import contactsJson from "./contacts.json";
import segmentsJson from "./segments.json";
import taskItemsJson from "./taskItems.json";
import emailHistoryJson from "./emailHistory.json";
import tasksJson from "./tasks.json";
import campaignsJson from "./campaigns.json";
import applicationsJson from "./applications.json";
import businessAcquisitionsJson from "./businessAcquisitions.json";
import workflowsJson from "./workflows.json";
import workflowEnrollmentsJson from "./workflowEnrollments.json";

const KEYS = {
  contacts: "loanbudcrm:contacts",
  segments: "loanbudcrm:segments",
  taskItems: "loanbudcrm:taskItems",
  emailHistory: "loanbudcrm:emailHistory",
  tasks: "loanbudcrm:tasks",
  campaigns: "loanbudcrm:campaigns",
  applications: "loanbudcrm:applications",
  businessAcquisitions: "loanbudcrm:businessAcquisitions",
  workflows: "loanbudcrm:workflows",
  workflowEnrollments: "loanbudcrm:workflowEnrollments",
  contactActivity: "loanbudcrm:contactActivity",
} as const;

function reviveDates<T extends Record<string, unknown>>(
  items: T[],
  dateFields: string[],
): T[] {
  return items.map((item) => {
    const result = { ...item };
    for (const field of dateFields) {
      const val = result[field];
      if (typeof val === "string") {
        result[field] = new Date(val);
      }
    }
    return result;
  });
}

function read<T extends Record<string, unknown>>(
  key: string,
  fallback: T[],
  dateFields: string[],
): T[] {
  const raw = localStorage.getItem(key);
  const parsed: T[] = raw ? (JSON.parse(raw) as T[]) : fallback;
  return reviveDates(parsed, dateFields);
}

function write<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export const store = {
  contacts: {
    read: () =>
      read<Contact>(
        KEYS.contacts,
        contactsJson as Contact[],
        ["createAt"],
      ),
    write: (data: Contact[]) => write(KEYS.contacts, data),
  },
  segments: {
    read: () =>
      read<Segment>(
        KEYS.segments,
        segmentsJson as Segment[],
        ["lastUpdatedAt", "createdAt"],
      ),
    write: (data: Segment[]) => write(KEYS.segments, data),
  },
  taskItems: {
    read: () =>
      read<TaskItem>(
        KEYS.taskItems,
        taskItemsJson as TaskItem[],
        ["dueDate", "completedAt"],
      ),
    write: (data: TaskItem[]) => write(KEYS.taskItems, data),
  },
  emailHistory: {
    read: () =>
      read<EmailRecord>(
        KEYS.emailHistory,
        emailHistoryJson as EmailRecord[],
        ["sentAt"],
      ),
    write: (data: EmailRecord[]) => write(KEYS.emailHistory, data),
  },
  tasks: {
    read: () =>
      read<Task>(
        KEYS.tasks,
        tasksJson as Task[],
        ["scheduledFor", "completedAt"],
      ),
    write: (data: Task[]) => write(KEYS.tasks, data),
  },
  campaigns: {
    read: () =>
      read<Campaign>(
        KEYS.campaigns,
        campaignsJson as Campaign[],
        ["sentAt", "scheduledFor"],
      ),
    write: (data: Campaign[]) => write(KEYS.campaigns, data),
  },
  applications: {
    read: () =>
      read<Application>(
        KEYS.applications,
        applicationsJson as Application[],
        ["createdAt", "updatedAt"],
      ),
    write: (data: Application[]) => write(KEYS.applications, data),
  },
  businessAcquisitions: {
    read: () =>
      read<BusinessAcquisitionRecord>(
        KEYS.businessAcquisitions,
        businessAcquisitionsJson as BusinessAcquisitionRecord[],
        ["createdAt", "updatedAt"],
      ),
    write: (data: BusinessAcquisitionRecord[]) =>
      write(KEYS.businessAcquisitions, data),
  },
  workflows: {
    read: () =>
      read<Workflow>(
        KEYS.workflows,
        workflowsJson as unknown as Workflow[],
        ["createdAt"],
      ),
    write: (data: Workflow[]) => write(KEYS.workflows, data),
  },
  workflowEnrollments: {
    read: () =>
      read<WorkflowEnrollment>(
        KEYS.workflowEnrollments,
        workflowEnrollmentsJson as unknown as WorkflowEnrollment[],
        ["startDate"],
      ),
    write: (data: WorkflowEnrollment[]) => write(KEYS.workflowEnrollments, data),
  },
  contactActivity: {
    read: () => read<ContactActivityRecord>(KEYS.contactActivity, [], ["timestamp"]),
    write: (data: ContactActivityRecord[]) => write(KEYS.contactActivity, data),
  },
};
