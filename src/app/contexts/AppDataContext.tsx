import { createContext, useContext, useState } from "react";
import type { Contact, EmailRecord, Task, TaskItem, Application, BusinessAcquisitionRecord, Segment, FilterRule, Workflow, WorkflowEnrollment, WorkflowStep, WorkflowStepProgress, ContactActivityRecord } from "../types";
import type { Campaign } from "../components/email-workflows/campaign/types";
import { store } from "../data/store";

interface AppDataContextValue {
  // Data
  contacts: Contact[];
  emailHistory: EmailRecord[];
  tasks: Task[];
  taskItems: TaskItem[];
  contactActivity: ContactActivityRecord[];
  campaigns: Campaign[];
  segments: Segment[];
  applications: Application[];
  businessAcquisitions: BusinessAcquisitionRecord[];
  // Task handlers
  handleCompleteTask: (taskId: string, disposition: string, note?: string) => void;
  handleRescheduleTask: (taskId: string, newDate: Date, assignee?: string, objective?: string) => void;
  handleDeleteTask: (taskId: string) => void;
  handleBulkCompleteTask: (taskIds: string[], disposition: string, note?: string) => void;
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
  // Workflow data
  workflows: Workflow[];
  workflowEnrollments: WorkflowEnrollment[];
  // Workflow handlers
  handleCreateWorkflow: (w: Omit<Workflow, "id" | "createdAt" | "enrolledCount">) => void;
  handleUpdateWorkflow: (id: string, updates: Partial<Workflow>) => void;
  handleDeleteWorkflow: (id: string) => void;
  handleEnrollContacts: (workflowId: string, contactIds: string[], startDate: Date) => void;
  handleActivateWorkflow: (workflowId: string) => void;
  handleAdvanceStep: (enrollmentId: string, stepId: string) => void;
  handleMoveToStep: (enrollmentId: string, targetStepId: string | "completed") => void;
  handleSetEnrollmentStatus: (enrollmentId: string, status: "active" | "paused") => void;
  handleSkipStep: (enrollmentId: string, stepId: string) => void;
  handleUnskipStep: (enrollmentId: string, stepId: string) => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>(store.contacts.read());
  const [emailHistory, setEmailHistory] = useState<EmailRecord[]>(store.emailHistory.read());
  const [tasks, setTasks] = useState<Task[]>(store.tasks.read());
  const [taskItems, setTaskItems] = useState<TaskItem[]>(store.taskItems.read());
  const [contactActivity, setContactActivity] = useState<ContactActivityRecord[]>(store.contactActivity.read());
  const [campaigns, setCampaigns] = useState<Campaign[]>(store.campaigns.read());
  const [segments, setSegments] = useState<Segment[]>(store.segments.read());
  const [applications] = useState<Application[]>(store.applications.read());
  const [businessAcquisitions] = useState<BusinessAcquisitionRecord[]>(store.businessAcquisitions.read());
  const [workflows, setWorkflows] = useState<Workflow[]>(store.workflows.read());
  const [workflowEnrollments, setWorkflowEnrollments] = useState<WorkflowEnrollment[]>(store.workflowEnrollments.read());

  const handleCompleteTask = (taskId: string, disposition: string, note?: string) => {
    const now = new Date();
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status: "completed" as const, disposition } : t,
    );
    const completedItem = taskItems.find((ti) => ti.id === taskId || ti.id.includes(taskId));
    const updatedItems = taskItems.map((ti) =>
      ti.id === taskId || ti.id.includes(taskId)
        ? { ...ti, status: "completed" as const, disposition, completedAt: now, ...(note ? { outcome: note } : {}) }
        : ti,
    );
    const newActivity: ContactActivityRecord = {
      id: `activity-${Date.now()}`,
      contactId: completedItem?.contactId ?? "",
      type: "task_completed",
      taskType: completedItem?.taskType,
      disposition,
      note: note || undefined,
      source: completedItem?.source,
      sourceType: completedItem?.sourceType,
      stepName: completedItem?.ruleName,
      assignee: completedItem?.assignee,
      timestamp: now,
    };
    const updatedActivity = completedItem
      ? [...contactActivity, newActivity]
      : contactActivity;
    setTasks(updatedTasks);
    setTaskItems(updatedItems);
    if (completedItem) {
      setContactActivity(updatedActivity);
      store.contactActivity.write(updatedActivity);
    }
    store.tasks.write(updatedTasks);
    store.taskItems.write(updatedItems);
  };

  const handleRescheduleTask = (taskId: string, newDate: Date, assignee?: string, objective?: string) => {
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, scheduledFor: newDate, ...(assignee !== undefined && { assignee }) } : t,
    );
    const updatedItems = taskItems.map((ti) =>
      ti.id.includes(taskId)
        ? {
            ...ti,
            dueDate: newDate,
            ...(assignee !== undefined && { assignee }),
            ...(objective !== undefined && { triggerContext: objective }),
          }
        : ti,
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

  const handleBulkCompleteTask = (taskIds: string[], disposition: string, note?: string) => {
    const now = new Date();
    const idSet = new Set(taskIds);
    const updatedTasks = tasks.map((t) =>
      idSet.has(t.id) ? { ...t, status: "completed" as const, disposition } : t,
    );
    const completedItems = taskItems.filter((ti) => taskIds.some((id) => ti.id === id || ti.id.includes(id)));
    const updatedItems = taskItems.map((ti) =>
      taskIds.some((id) => ti.id === id || ti.id.includes(id))
        ? { ...ti, status: "completed" as const, disposition, completedAt: now, ...(note ? { outcome: note } : {}) }
        : ti,
    );
    const newActivities: ContactActivityRecord[] = completedItems.map((ti, i) => ({
      id: `activity-bulk-${Date.now()}-${i}`,
      contactId: ti.contactId,
      type: "task_completed" as const,
      taskType: ti.taskType,
      disposition,
      note: note || undefined,
      source: ti.source,
      sourceType: ti.sourceType,
      stepName: ti.ruleName,
      assignee: ti.assignee,
      timestamp: now,
    }));
    const updatedActivity = [...contactActivity, ...newActivities];
    setTasks(updatedTasks);
    setTaskItems(updatedItems);
    setContactActivity(updatedActivity);
    store.tasks.write(updatedTasks);
    store.taskItems.write(updatedItems);
    store.contactActivity.write(updatedActivity);
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

  const buildCallReminderTaskItems = (
    workflow: Workflow,
    enrollments: WorkflowEnrollment[],
    allContacts: Contact[],
  ): TaskItem[] => {
    const callSteps = workflow.steps.filter((s: WorkflowStep) => s.actionType === "call-reminder");
    if (callSteps.length === 0) return [];
    const items: TaskItem[] = [];
    for (const enrollment of enrollments) {
      const contact = allContacts.find((c) => c.id === enrollment.contactId);
      for (const step of callSteps) {
        const offsetDays = Math.max(0, step.dayOffset - (step.reminderDaysBefore ?? 0));
        const dueDate = new Date(enrollment.startDate);
        dueDate.setDate(dueDate.getDate() + offsetDays);
        items.push({
          id: `taskitem-call-${enrollment.id}-${step.id}`,
          contactId: enrollment.contactId,
          contactName: contact ? `${contact.firstName} ${contact.lastName}` : enrollment.contactId,
          contactStatus: contact?.listingStatus ?? "",
          taskType: "Call",
          source: workflow.name,
          sourceType: "flow",
          dueDate,
          status: "pending",
          ruleId: step.id,
          ruleName: step.name,
          ...(step.note ? { triggerContext: step.note } : {}),
        });
      }
    }
    return items;
  };

  const handleCreateWorkflow = (w: Omit<Workflow, "id" | "createdAt" | "enrolledCount">) => {
    const newWorkflow: Workflow = {
      ...w,
      id: `workflow-${Date.now()}`,
      createdAt: new Date(),
      enrolledCount: 0,
    };

    // Auto-enroll matching segment contacts
    const segment = segments.find((s) => s.id === w.segmentId);
    const matchContact = (contact: Contact, filters: FilterRule[]): boolean => {
      if (filters.length === 0) return true;
      const record = contact as unknown as Record<string, string>;
      let result = filters[0].operator === "="
        ? record[filters[0].field] === filters[0].value
        : record[filters[0].field] !== filters[0].value;
      for (let i = 1; i < filters.length; i++) {
        const f = filters[i];
        const next = f.operator === "=" ? record[f.field] === f.value : record[f.field] !== f.value;
        result = filters[i - 1].logic === "and" ? result && next : result || next;
      }
      return result;
    };
    const matchedContacts = segment
      ? contacts.filter((c) => matchContact(c, segment.filters))
      : [];
    const startDate = new Date();
    const newEnrollments: WorkflowEnrollment[] = matchedContacts.map((c) => ({
      id: `enroll-${Date.now()}-${c.id}`,
      workflowId: newWorkflow.id,
      contactId: c.id,
      startDate,
      status: "active" as const,
      stepProgress: newWorkflow.steps.map((s) => ({ stepId: s.id, status: "pending" as const })),
    }));
    newWorkflow.enrolledCount = matchedContacts.length;

    const callTasks = buildCallReminderTaskItems(newWorkflow, newEnrollments, contacts);
    const updatedWorkflows = [...workflows, newWorkflow];
    const updatedEnrollments = [...workflowEnrollments, ...newEnrollments];
    const updatedItems = callTasks.length > 0 ? [...taskItems, ...callTasks] : taskItems;

    setWorkflows(updatedWorkflows);
    setWorkflowEnrollments(updatedEnrollments);
    if (callTasks.length > 0) setTaskItems(updatedItems);
    store.workflows.write(updatedWorkflows);
    store.workflowEnrollments.write(updatedEnrollments);
    if (callTasks.length > 0) store.taskItems.write(updatedItems);
  };

  const handleUpdateWorkflow = (id: string, updates: Partial<Workflow>) => {
    const updated = workflows.map((wf) => (wf.id === id ? { ...wf, ...updates } : wf));
    setWorkflows(updated);
    store.workflows.write(updated);
  };

  const handleDeleteWorkflow = (id: string) => {
    const updatedWorkflows = workflows.filter((wf) => wf.id !== id);
    const updatedEnrollments = workflowEnrollments.filter((e) => e.workflowId !== id);
    setWorkflows(updatedWorkflows);
    setWorkflowEnrollments(updatedEnrollments);
    store.workflows.write(updatedWorkflows);
    store.workflowEnrollments.write(updatedEnrollments);
  };

  const handleEnrollContacts = (workflowId: string, contactIds: string[], startDate: Date) => {
    const workflow = workflows.find((wf) => wf.id === workflowId);
    if (!workflow) return;
    const alreadyEnrolled = new Set(
      workflowEnrollments.filter((e) => e.workflowId === workflowId).map((e) => e.contactId),
    );
    const newIds = contactIds.filter((id) => !alreadyEnrolled.has(id));
    if (newIds.length === 0) return;
    const newEnrollments: WorkflowEnrollment[] = newIds.map((contactId) => ({
      id: `enroll-${Date.now()}-${contactId}`,
      workflowId,
      contactId,
      startDate,
      status: "active" as const,
      stepProgress: workflow.steps.map((s: WorkflowStep) => ({ stepId: s.id, status: "pending" as const })),
    }));
    const updatedEnrollments = [...workflowEnrollments, ...newEnrollments];
    const updatedWorkflows = workflows.map((wf) =>
      wf.id === workflowId ? { ...wf, enrolledCount: wf.enrolledCount + newIds.length } : wf,
    );
    const callTasks = buildCallReminderTaskItems(workflow, newEnrollments, contacts);
    const updatedItems = callTasks.length > 0 ? [...taskItems, ...callTasks] : taskItems;

    setWorkflowEnrollments(updatedEnrollments);
    setWorkflows(updatedWorkflows);
    if (callTasks.length > 0) setTaskItems(updatedItems);
    store.workflowEnrollments.write(updatedEnrollments);
    store.workflows.write(updatedWorkflows);
    if (callTasks.length > 0) store.taskItems.write(updatedItems);
  };

  // Generates varied mock step progress so the board looks populated when a workflow starts
  function generateMockProgress(steps: WorkflowStep[], idx: number): WorkflowStepProgress[] {
    const sorted = [...steps].sort((a, b) => a.dayOffset - b.dayOffset);
    const now = new Date();
    const progress: WorkflowStepProgress[] = sorted.map((s) => ({ stepId: s.id, status: "pending" as const }));

    const markDone = (stepId: string) => {
      const p = progress.find((p) => p.stepId === stepId);
      if (p) { p.status = "done"; p.completedAt = now; }
    };

    const emailSteps = sorted.filter((s) => s.actionType === "email");
    const smsSteps = sorted.filter((s) => s.actionType === "sms");

    switch (idx % 5) {
      case 0: // fresh — all pending
        break;
      case 1: // first email sent, rest pending
        if (emailSteps[0]) markDone(emailSteps[0].id);
        break;
      case 2: // first email + first SMS done, rest pending
        if (emailSteps[0]) markDone(emailSteps[0].id);
        if (smsSteps[0]) markDone(smsSteps[0].id);
        break;
      case 3: // first two steps done
        if (sorted[0]) markDone(sorted[0].id);
        if (sorted[1]) markDone(sorted[1].id);
        break;
      case 4: // all email and SMS done, calls pending
        sorted.forEach((s) => {
          if (s.actionType === "email" || s.actionType === "sms") markDone(s.id);
        });
        break;
    }

    return progress;
  }

  const handleActivateWorkflow = (workflowId: string) => {
    const workflow = workflows.find((wf) => wf.id === workflowId);
    if (!workflow) return;

    const alreadyEnrolled = new Set(
      workflowEnrollments.filter((e) => e.workflowId === workflowId).map((e) => e.contactId),
    );

    // Pick up to 8 contacts not already enrolled
    const available = contacts.filter((c) => !alreadyEnrolled.has(c.id));
    const selected = available.slice(0, 8);

    const now = new Date();
    const newEnrollments: WorkflowEnrollment[] = selected.map((contact, idx) => {
      const startDate = new Date(now.getTime() - idx * 2 * 24 * 60 * 60 * 1000);
      const stepProgress = generateMockProgress(workflow.steps, idx);
      const allDone = stepProgress.every((p) => p.status === "done" || p.status === "skipped");
      return {
        id: `enroll-${workflowId}-${contact.id}-${Date.now() + idx}`,
        workflowId,
        contactId: contact.id,
        startDate,
        status: allDone ? ("completed" as const) : ("active" as const),
        stepProgress,
      };
    });

    const updatedEnrollments = [...workflowEnrollments, ...newEnrollments];
    const updatedWorkflows = workflows.map((wf) =>
      wf.id === workflowId
        ? { ...wf, status: "active" as const, enrolledCount: wf.enrolledCount + newEnrollments.length }
        : wf,
    );

    setWorkflowEnrollments(updatedEnrollments);
    setWorkflows(updatedWorkflows);
    store.workflowEnrollments.write(updatedEnrollments);
    store.workflows.write(updatedWorkflows);
  };

  const handleAdvanceStep = (enrollmentId: string, stepId: string) => {
    const enrollment = workflowEnrollments.find((e) => e.id === enrollmentId);
    if (!enrollment) return;
    const workflow = workflows.find((wf) => wf.id === enrollment.workflowId);
    if (!workflow) return;
    const step = workflow.steps.find((s: WorkflowStep) => s.id === stepId);
    if (!step) return;
    const contact = contacts.find((c) => c.id === enrollment.contactId);

    const now = new Date();
    const updatedProgress = enrollment.stepProgress.map((p) =>
      p.stepId === stepId ? { ...p, status: "done" as const, completedAt: now } : p,
    );
    const allDone = updatedProgress.every((p) => p.status === "done" || p.status === "skipped");
    const updatedEnrollment: WorkflowEnrollment = {
      ...enrollment,
      stepProgress: updatedProgress,
      status: allDone ? "completed" : "active",
    };

    const updatedEnrollments = workflowEnrollments.map((e) =>
      e.id === enrollmentId ? updatedEnrollment : e,
    );
    const updatedWorkflows = allDone
      ? workflows.map((wf) =>
          wf.id === workflow.id
            ? { ...wf, enrolledCount: Math.max(0, wf.enrolledCount - 1) }
            : wf,
        )
      : workflows;

    let updatedItems: TaskItem[];
    let updatedActivity = contactActivity;
    if (step.actionType === "call-reminder") {
      // Complete the pre-created call reminder task instead of creating a new one
      const taskId = `taskitem-call-${enrollmentId}-${stepId}`;
      updatedItems = taskItems.map((ti) =>
        ti.id === taskId ? { ...ti, status: "completed" as const, completedAt: now } : ti,
      );
    } else {
      const triggerMap: Record<string, string> = {
        email: step.subject ?? "",
        sms: (step.message ?? "").slice(0, 80),
      };
      const taskTypeMap: Record<string, string> = { email: "Email", sms: "SMS" };
      const uniqueId = `${enrollmentId}-${stepId}-${Date.now()}`;
      const newTaskItem: TaskItem = {
        id: `taskitem-flow-${uniqueId}`,
        contactId: enrollment.contactId,
        contactName: contact ? `${contact.firstName} ${contact.lastName}` : enrollment.contactId,
        contactStatus: contact?.listingStatus ?? "",
        taskType: taskTypeMap[step.actionType] ?? step.actionType,
        source: workflow.name,
        sourceType: "flow",
        dueDate: now,
        assignee: step.senderIdentity ?? "",
        status: "pending",
        triggerContext: triggerMap[step.actionType] ?? "",
      };
      updatedItems = [...taskItems, newTaskItem];
      // Log email/SMS actions to contact activity
      const activityType = step.actionType === "sms" ? "sms_sent" : "email_sent";
      const newActivity: ContactActivityRecord = {
        id: `activity-flow-${uniqueId}`,
        contactId: enrollment.contactId,
        type: activityType,
        source: workflow.name,
        sourceType: "flow",
        stepName: step.name,
        subject: step.actionType === "email" ? step.subject : undefined,
        message: step.actionType === "sms" ? step.message : undefined,
        assignee: step.senderIdentity ?? "",
        timestamp: now,
      };
      updatedActivity = [...contactActivity, newActivity];
    }

    setWorkflowEnrollments(updatedEnrollments);
    setWorkflows(updatedWorkflows);
    setTaskItems(updatedItems);
    if (updatedActivity !== contactActivity) {
      setContactActivity(updatedActivity);
      store.contactActivity.write(updatedActivity);
    }
    store.workflowEnrollments.write(updatedEnrollments);
    store.workflows.write(updatedWorkflows);
    store.taskItems.write(updatedItems);
  };

  const handleSetEnrollmentStatus = (enrollmentId: string, status: "active" | "paused") => {
    const enrollment = workflowEnrollments.find((e) => e.id === enrollmentId);
    if (!enrollment) return;
    const workflow = workflows.find((wf) => wf.id === enrollment.workflowId);
    const updated = workflowEnrollments.map((e) =>
      e.id === enrollmentId ? { ...e, status } : e,
    );
    const now = new Date();
    const newActivity: ContactActivityRecord = {
      id: `activity-flow-${enrollmentId}-${status}-${Date.now()}`,
      contactId: enrollment.contactId,
      type: status === "paused" ? "enrollment_paused" : "enrollment_resumed",
      source: workflow?.name,
      sourceType: "flow",
      assignee: "You",
      timestamp: now,
    };
    const updatedActivity = [...contactActivity, newActivity];
    setWorkflowEnrollments(updated);
    setContactActivity(updatedActivity);
    store.workflowEnrollments.write(updated);
    store.contactActivity.write(updatedActivity);
  };

  const handleSkipStep = (enrollmentId: string, stepId: string) => {
    const enrollment = workflowEnrollments.find((e) => e.id === enrollmentId);
    if (!enrollment) return;
    const workflow = workflows.find((wf) => wf.id === enrollment.workflowId);
    const step = workflow?.steps.find((s: WorkflowStep) => s.id === stepId);
    const updatedProgress = enrollment.stepProgress.map((p) =>
      p.stepId === stepId && p.status === "pending"
        ? { ...p, status: "skipped" as const }
        : p,
    );
    const allDone = updatedProgress.every((p) => p.status === "done" || p.status === "skipped");
    const updatedEnrollment: WorkflowEnrollment = {
      ...enrollment,
      stepProgress: updatedProgress,
      status: allDone ? "completed" : enrollment.status,
    };
    const updated = workflowEnrollments.map((e) =>
      e.id === enrollmentId ? updatedEnrollment : e,
    );
    const now = new Date();
    const newActivity: ContactActivityRecord = {
      id: `activity-flow-${enrollmentId}-skip-${stepId}-${Date.now()}`,
      contactId: enrollment.contactId,
      type: "step_skipped",
      source: workflow?.name,
      sourceType: "flow",
      stepName: step?.name,
      assignee: "You",
      timestamp: now,
    };
    const updatedActivity = [...contactActivity, newActivity];
    setWorkflowEnrollments(updated);
    setContactActivity(updatedActivity);
    store.workflowEnrollments.write(updated);
    store.contactActivity.write(updatedActivity);
  };

  const handleUnskipStep = (enrollmentId: string, stepId: string) => {
    const enrollment = workflowEnrollments.find((e) => e.id === enrollmentId);
    if (!enrollment) return;
    const workflow = workflows.find((wf) => wf.id === enrollment.workflowId);
    const step = workflow?.steps.find((s: WorkflowStep) => s.id === stepId);
    const updatedProgress = enrollment.stepProgress.map((p) =>
      p.stepId === stepId && p.status === "skipped"
        ? { ...p, status: "pending" as const }
        : p,
    );
    const updatedEnrollment: WorkflowEnrollment = {
      ...enrollment,
      stepProgress: updatedProgress,
      status: enrollment.status === "completed" ? "active" : enrollment.status,
    };
    const updated = workflowEnrollments.map((e) =>
      e.id === enrollmentId ? updatedEnrollment : e,
    );
    const now = new Date();
    const newActivity: ContactActivityRecord = {
      id: `activity-flow-${enrollmentId}-unskip-${stepId}-${Date.now()}`,
      contactId: enrollment.contactId,
      type: "step_unskipped",
      source: workflow?.name,
      sourceType: "flow",
      stepName: step?.name,
      assignee: "You",
      timestamp: now,
    };
    const updatedActivity = [...contactActivity, newActivity];
    setWorkflowEnrollments(updated);
    setContactActivity(updatedActivity);
    store.workflowEnrollments.write(updated);
    store.contactActivity.write(updatedActivity);
  };

  const handleMoveToStep = (enrollmentId: string, targetStepId: string | "completed") => {
    const enrollment = workflowEnrollments.find((e) => e.id === enrollmentId);
    if (!enrollment) return;
    const workflow = workflows.find((wf) => wf.id === enrollment.workflowId);
    if (!workflow) return;

    const sortedSteps = [...workflow.steps].sort((a: WorkflowStep, b: WorkflowStep) => a.dayOffset - b.dayOffset);
    const targetIndex =
      targetStepId === "completed"
        ? sortedSteps.length
        : sortedSteps.findIndex((s: WorkflowStep) => s.id === targetStepId);
    if (targetIndex === -1) return;

    const now = new Date();
    const finalProgress = enrollment.stepProgress.map((p) => {
      const stepIndex = sortedSteps.findIndex((s: WorkflowStep) => s.id === p.stepId);
      if (stepIndex === -1) return p;
      if (stepIndex < targetIndex) {
        return { ...p, status: "done" as const, completedAt: p.completedAt ?? now };
      }
      return { stepId: p.stepId, status: "pending" as const };
    });

    const allDone = finalProgress.every((p) => p.status === "done" || p.status === "skipped");
    const wasCompleted = enrollment.status === "completed";
    const updatedEnrollment: WorkflowEnrollment = {
      ...enrollment,
      stepProgress: finalProgress,
      status: allDone ? "completed" : "active",
    };

    const updatedEnrollments = workflowEnrollments.map((e) =>
      e.id === enrollmentId ? updatedEnrollment : e,
    );

    let updatedWorkflows = workflows;
    if (!wasCompleted && allDone) {
      updatedWorkflows = workflows.map((wf) =>
        wf.id === workflow.id ? { ...wf, enrolledCount: Math.max(0, wf.enrolledCount - 1) } : wf,
      );
    } else if (wasCompleted && !allDone) {
      updatedWorkflows = workflows.map((wf) =>
        wf.id === workflow.id ? { ...wf, enrolledCount: wf.enrolledCount + 1 } : wf,
      );
    }

    setWorkflowEnrollments(updatedEnrollments);
    setWorkflows(updatedWorkflows);
    store.workflowEnrollments.write(updatedEnrollments);
    store.workflows.write(updatedWorkflows);
  };

  return (
    <AppDataContext.Provider
      value={{
        contacts,
        emailHistory,
        tasks,
        taskItems,
        contactActivity,
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
        workflows,
        workflowEnrollments,
        handleCreateWorkflow,
        handleUpdateWorkflow,
        handleDeleteWorkflow,
        handleEnrollContacts,
        handleActivateWorkflow,
        handleAdvanceStep,
        handleMoveToStep,
        handleSetEnrollmentStatus,
        handleSkipStep,
        handleUnskipStep,
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
