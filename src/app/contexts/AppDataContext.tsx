import { createContext, useContext, useState } from "react";
import type { Contact, EmailRecord, Task, TaskItem, Application, BusinessAcquisitionRecord, Segment } from "../types";
import type { Campaign } from "../components/email-workflows/campaign/types";
import { store } from "../data/store";

interface AppDataContextValue {
  // Data
  contacts: Contact[];
  emailHistory: EmailRecord[];
  tasks: Task[];
  taskItems: TaskItem[];
  campaigns: Campaign[];
  segments: Segment[];
  applications: Application[];
  businessAcquisitions: BusinessAcquisitionRecord[];
  // Task handlers
  handleCompleteTask: (taskId: string, disposition: string) => void;
  handleRescheduleTask: (taskId: string, newDate: Date) => void;
  handleDeleteTask: (taskId: string) => void;
  handleBulkCompleteTask: (taskIds: string[], disposition: string) => void;
  handleBulkRescheduleTask: (taskIds: string[], newDate: Date) => void;
  handleBulkDeleteTask: (taskIds: string[]) => void;
  // Contact handlers
  handleUpdateContact: (contactId: string, updates: Partial<Contact>) => void;
  // Standalone task creation (not tied to a campaign)
  handleCreateTask: (params: {
    contactId: string;
    contactName: string;
    taskType: string;
    dueDate: Date;
    objective: string;
    vmScript?: string;
    assignee?: string;
  }) => void;
  // Remove a contact from a campaign and cancel their pending campaign tasks
  handleRemoveContactFromCampaign: (contactId: string, campaignName: string) => void;
  // Campaign/compose handler (navigation handled by the caller)
  handleCompose: (params: any) => void;
  handleDeleteCampaign: (campaignId: string) => void;
  // Segment handlers
  handleCreateSegment: (segment: Omit<Segment, "id" | "createdAt" | "lastUpdatedAt">) => void;
  handleUpdateSegment: (segmentId: string, updates: Partial<Segment>) => void;
  handleDeleteSegment: (segmentId: string) => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>(store.contacts.read());
  const [emailHistory, setEmailHistory] = useState<EmailRecord[]>(store.emailHistory.read());
  const [tasks, setTasks] = useState<Task[]>(store.tasks.read());
  const [taskItems, setTaskItems] = useState<TaskItem[]>(store.taskItems.read());
  const [campaigns, setCampaigns] = useState<Campaign[]>(store.campaigns.read());
  const [segments, setSegments] = useState<Segment[]>(store.segments.read());
  const [applications] = useState<Application[]>(store.applications.read());
  const [businessAcquisitions] = useState<BusinessAcquisitionRecord[]>(store.businessAcquisitions.read());

  const handleCompleteTask = (taskId: string, disposition: string) => {
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status: "completed" as const, disposition } : t,
    );
    const updatedItems = taskItems.map((ti) =>
      ti.id.includes(taskId) ? { ...ti, status: "completed" as const, disposition } : ti,
    );
    setTasks(updatedTasks);
    setTaskItems(updatedItems);
    store.tasks.write(updatedTasks);
    store.taskItems.write(updatedItems);
  };

  const handleRescheduleTask = (taskId: string, newDate: Date) => {
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, scheduledFor: newDate } : t,
    );
    const updatedItems = taskItems.map((ti) =>
      ti.id.includes(taskId) ? { ...ti, dueDate: newDate } : ti,
    );
    setTasks(updatedTasks);
    setTaskItems(updatedItems);
    store.tasks.write(updatedTasks);
    store.taskItems.write(updatedItems);
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter((t) => t.id !== taskId);
    const updatedItems = taskItems.filter((ti) => !ti.id.includes(taskId));
    setTasks(updatedTasks);
    setTaskItems(updatedItems);
    store.tasks.write(updatedTasks);
    store.taskItems.write(updatedItems);
  };

  const handleBulkCompleteTask = (taskIds: string[], disposition: string) => {
    const idSet = new Set(taskIds);
    const updatedTasks = tasks.map((t) =>
      idSet.has(t.id) ? { ...t, status: "completed" as const, disposition } : t,
    );
    const updatedItems = taskItems.map((ti) =>
      taskIds.some((id) => ti.id.includes(id)) ? { ...ti, status: "completed" as const, disposition } : ti,
    );
    setTasks(updatedTasks);
    setTaskItems(updatedItems);
    store.tasks.write(updatedTasks);
    store.taskItems.write(updatedItems);
  };

  const handleBulkRescheduleTask = (taskIds: string[], newDate: Date) => {
    const idSet = new Set(taskIds);
    const updatedTasks = tasks.map((t) =>
      idSet.has(t.id) ? { ...t, scheduledFor: newDate } : t,
    );
    const updatedItems = taskItems.map((ti) =>
      taskIds.some((id) => ti.id.includes(id)) ? { ...ti, dueDate: newDate } : ti,
    );
    setTasks(updatedTasks);
    setTaskItems(updatedItems);
    store.tasks.write(updatedTasks);
    store.taskItems.write(updatedItems);
  };

  const handleBulkDeleteTask = (taskIds: string[]) => {
    const idSet = new Set(taskIds);
    const updatedTasks = tasks.filter((t) => !idSet.has(t.id));
    const updatedItems = taskItems.filter(
      (ti) => !taskIds.some((id) => ti.id.includes(id)),
    );
    setTasks(updatedTasks);
    setTaskItems(updatedItems);
    store.tasks.write(updatedTasks);
    store.taskItems.write(updatedItems);
  };

  const handleCreateTask = (params: {
    contactId: string;
    contactName: string;
    taskType: string;
    dueDate: Date;
    objective: string;
    vmScript?: string;
    assignee?: string;
  }) => {
    const contact = contacts.find((c) => c.id === params.contactId);
    const uniqueId = `manual-${Date.now()}`;
    const newTask: Task = {
      id: `task-${uniqueId}`,
      contactId: params.contactId,
      contactName: params.contactName,
      contactPhone: contact?.phone ?? "",
      listingStatus: contact?.listingStatus ?? "",
      callObjective: params.objective,
      voicemailScript: params.vmScript ?? "",
      dueDay: 0,
      scheduledFor: params.dueDate,
      status: "pending",
    };
    const newItem: TaskItem = {
      id: `taskitem-${uniqueId}`,
      contactId: params.contactId,
      contactName: params.contactName,
      contactStatus: contact?.listingStatus ?? "",
      taskType: params.taskType,
      source: "Manual",
      sourceType: "manual",
      dueDate: params.dueDate,
      assignee: params.assignee ?? "",
      status: "pending",
      triggerContext: params.objective,
      notes: params.vmScript,
      disposition: "",
    };
    const updatedTasks = [...tasks, newTask];
    const updatedItems = [...taskItems, newItem];
    setTasks(updatedTasks);
    setTaskItems(updatedItems);
    store.tasks.write(updatedTasks);
    store.taskItems.write(updatedItems);
  };

  const handleRemoveContactFromCampaign = (contactId: string, campaignName: string) => {
    const updatedTasks = tasks.filter(
      (t) => !(t.contactId === contactId && t.status === "pending"),
    );
    const updatedItems = taskItems.filter(
      (ti) =>
        !(
          ti.contactId === contactId &&
          ti.sourceType === "campaign" &&
          ti.source === campaignName &&
          ti.status === "pending"
        ),
    );
    setTasks(updatedTasks);
    setTaskItems(updatedItems);
    store.tasks.write(updatedTasks);
    store.taskItems.write(updatedItems);
  };

  const handleUpdateContact = (contactId: string, updates: Partial<Contact>) => {
    const updated = contacts.map((c) =>
      c.id === contactId ? { ...c, ...updates } : c,
    );
    setContacts(updated);
    store.contacts.write(updated);
  };

  const handleCompose = (params: any) => {
    const now = new Date();
    const newEmails: EmailRecord[] = params.recipients.map((c: any, i: number) => ({
      id: `email-${Date.now()}-${i}`,
      contactId: c.id,
      contactName: `${c.firstName} ${c.lastName}`,
      subject: params.channel === "sms" ? "" : params.subject,
      senderIdentity: params.senderIdentity,
      status: "Sent" as const,
      sequenceDay: 0,
      sentAt: now,
      channel: (params.channel ?? "email") as "email" | "sms",
    }));

    const newTasks: Task[] = [];
    const newTaskItems: TaskItem[] = [];

    params.reminders.forEach((reminder: any, rIdx: number) => {
      params.recipients.forEach((c: any, cIdx: number) => {
        const uniqueId = `${Date.now()}-${rIdx}-${cIdx}`;
        newTasks.push({
          id: `task-${uniqueId}`,
          contactId: c.id,
          contactName: `${c.firstName} ${c.lastName}`,
          contactPhone: c.phone,
          listingStatus: c.listingStatus,
          callObjective: reminder.objective,
          voicemailScript: reminder.vmScript,
          dueDay: 0,
          scheduledFor: new Date(reminder.dueDate),
          status: "pending" as const,
        });
        newTaskItems.push({
          id: `taskitem-${uniqueId}`,
          contactName: `${c.firstName} ${c.lastName}`,
          contactId: c.id,
          contactStatus: c.listingStatus,
          taskType: reminder.type,
          source: params.campaignName || "Email Campaign",
          sourceType: "campaign" as const,
          dueDate: new Date(reminder.dueDate),
          assignee: params.senderIdentity,
          status: "pending" as const,
          triggerContext: reminder.objective,
          notes: reminder.vmScript || undefined,
          disposition: "",
        });
      });
    });

    const sendMode: "now" | "scheduled" | "auto" = params.sendMode ?? "now";
    const newCampaign: Campaign = {
      id: `campaign-${Date.now()}`,
      name: params.campaignName || "Campaign",
      description: params.campaignDescription,
      segmentId: params.segmentId,
      segmentName: params.segmentName,
      status: sendMode === "now" ? "sent" : sendMode === "scheduled" ? "scheduled" : "auto",
      ...(sendMode === "now" ? { sentAt: now } : {}),
      ...(sendMode === "scheduled" && params.scheduledAt ? { scheduledFor: params.scheduledAt } : {}),
      recipientCount: params.recipients.length,
      followUpTasks: params.reminders.map((r: any) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(r.dueDate + "T00:00:00");
        const daysAfter = Math.max(0, Math.round((due.getTime() - today.getTime()) / 86400000));
        return { daysAfter, taskType: r.type, description: r.objective };
      }),
      templateId: "",
      templateName: "",
      channel: (params.channel ?? "email") as "email" | "sms",
      ...(sendMode === "auto" && params.triggerDelayMinutes != null
        ? { triggerDelayMinutes: params.triggerDelayMinutes }
        : {}),
    };

    const updatedHistory = [...emailHistory, ...newEmails];
    const updatedTasks = [...tasks, ...newTasks];
    const updatedItems = [...taskItems, ...newTaskItems];
    const updatedCampaigns = [...campaigns, newCampaign];

    setEmailHistory(updatedHistory);
    setTasks(updatedTasks);
    setTaskItems(updatedItems);
    setCampaigns(updatedCampaigns);

    store.emailHistory.write(updatedHistory);
    store.tasks.write(updatedTasks);
    store.taskItems.write(updatedItems);
    store.campaigns.write(updatedCampaigns);
    // Navigation after compose is handled by the ComposeEmail component
  };

  const handleDeleteCampaign = (campaignId: string) => {
    const updated = campaigns.filter((c) => c.id !== campaignId);
    setCampaigns(updated);
    store.campaigns.write(updated);
  };

  const handleCreateSegment = (segment: Omit<Segment, "id" | "createdAt" | "lastUpdatedAt">) => {
    const now = new Date();
    const newSegment: Segment = {
      ...segment,
      id: `segment-${Date.now()}`,
      createdAt: now,
      lastUpdatedAt: now,
    };
    const updated = [...segments, newSegment];
    setSegments(updated);
    store.segments.write(updated);
  };

  const handleUpdateSegment = (segmentId: string, updates: Partial<Segment>) => {
    const updated = segments.map((s) =>
      s.id === segmentId ? { ...s, ...updates, lastUpdatedAt: new Date() } : s,
    );
    setSegments(updated);
    store.segments.write(updated);
  };

  const handleDeleteSegment = (segmentId: string) => {
    const updated = segments.filter((s) => s.id !== segmentId);
    setSegments(updated);
    store.segments.write(updated);
  };

  return (
    <AppDataContext.Provider
      value={{
        contacts,
        emailHistory,
        tasks,
        taskItems,
        campaigns,
        segments,
        applications,
        businessAcquisitions,
        handleCompleteTask,
        handleRescheduleTask,
        handleDeleteTask,
        handleBulkCompleteTask,
        handleBulkRescheduleTask,
        handleBulkDeleteTask,
        handleUpdateContact,
        handleCreateTask,
        handleRemoveContactFromCampaign,
        handleCompose,
        handleDeleteCampaign,
        handleCreateSegment,
        handleUpdateSegment,
        handleDeleteSegment,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside AppDataProvider");
  return ctx;
}
