import type { Contact, EmailRecord, Task, Segment, TaskItem } from "../types";
import contactsJson from "./contacts.json";
import segmentsJson from "./segments.json";
import taskItemsJson from "./taskItems.json";
import emailHistoryJson from "./emailHistory.json";
import tasksJson from "./tasks.json";

const KEYS = {
  contacts: "loanbudcrm:contacts",
  segments: "loanbudcrm:segments",
  taskItems: "loanbudcrm:taskItems",
  emailHistory: "loanbudcrm:emailHistory",
  tasks: "loanbudcrm:tasks",
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
};
