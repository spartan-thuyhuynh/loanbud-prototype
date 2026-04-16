import { useState } from "react";
import { ContactList } from "./components/crm";
import { ApplicationList, BusinessAcquisitionList } from "./components/applications";
import { IconSidebar } from "./components/ui/IconSidebar";
import { CRMSidebar } from "./components/crm";
import { EmailWorkflowsSidebar } from "./components/email-workflows";
import {
  TaskQueue,
  EmailHistory,
  SegmentsView,
  TemplatesView,
  FlowBuilder,
  Campaigns,
  UserSegments,
  Overview,
  ComposeEmail,
} from "./components/email-workflows";
import {
  FileText,
  Briefcase,
  Users as UsersIcon,
  Inbox,
  Phone,
  User,
  Workflow,
  Zap,
  ClipboardList,
  Sliders,
} from "lucide-react";
import type {
  MainSection,
  EmailWorkflowView,
  View,
  Contact,
  EmailRecord,
  Task,
  TaskItem,
  Application,
  BusinessAcquisitionRecord,
} from "./types";
import type { Campaign } from "./components/email-workflows/campaign/types";
import { store } from "./data/store";
import React from "react";
import { crmSubItems } from "./data/navigation";

const PlaceholderView = ({
  icon: Icon,
  title,
  badge,
}: {
  icon: React.ElementType;
  title: string;
  badge?: string;
}) => (
  <div className="h-full flex items-center justify-center bg-background font-sans">
    <div className="text-center">
      <Icon className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
      <h2 className="text-2xl mb-2 font-semibold text-foreground">{title}</h2>
      {badge && (
        <span className="inline-block px-3 py-1 bg-red-500 text-white text-sm rounded-full mb-2">
          {badge}
        </span>
      )}
      <p className="text-muted-foreground">Coming soon</p>
    </div>
  </div>
);

export default function App() {
  // --- State Hooks ---
  const [view, setView] = useState<View>("applications");
  const [activeSection, setActiveSection] = useState<MainSection | null>(null);
  const [contacts, setContacts] = useState<Contact[]>(store.contacts.read());
  const [emailHistory, setEmailHistory] = useState<EmailRecord[]>(
    store.emailHistory.read(),
  );
  const [tasks, setTasks] = useState<Task[]>(store.tasks.read());
  const [taskItems, setTaskItems] = useState<TaskItem[]>(
    store.taskItems.read(),
  ); // Added state for TaskItems
  const [campaigns, setCampaigns] = useState<Campaign[]>(
    store.campaigns.read(),
  );
  const [applications] = useState<Application[]>(store.applications.read());
  const [businessAcquisitions] = useState<BusinessAcquisitionRecord[]>(
    store.businessAcquisitions.read(),
  );
  const [composeSegmentId, setComposeSegmentId] = useState<string>("");
  const [showSegmentBuilder, setShowSegmentBuilder] = useState(false);

  // --- Nav Items ---
  const iconNavItems = [
    {
      id: "applications" as MainSection,
      label: "Applications",
      icon: FileText,
      tooltip: "Applications",
    },
    {
      id: "business-acquisition" as MainSection,
      label: "Business Acquisition",
      icon: Briefcase,
      tooltip: "Business Acquisition",
    },
    {
      id: "crm" as MainSection,
      label: "CRM",
      icon: UsersIcon,
      tooltip: "CRM",
      hasSubMenu: true,
    },
    {
      id: "email-workflows" as MainSection,
      label: "Email Workflows",
      icon: Workflow,
      tooltip: "Email Workflows",
      hasSubMenu: true,
    },
    {
      id: "users" as MainSection,
      label: "Users",
      icon: User,
      tooltip: "Users",
    },
    {
      id: "automations" as MainSection,
      label: "Automations",
      icon: Zap,
      tooltip: "Automations",
    },
    {
      id: "questionnaires" as MainSection,
      label: "Questionnaires",
      icon: ClipboardList,
      tooltip: "Questionnaires",
    },
    {
      id: "configurations" as MainSection,
      label: "Configurations",
      icon: Sliders,
      tooltip: "Configurations",
    },
  ];

  const emailWorkflowsSubItems: {
    id: EmailWorkflowView;
    label: string;
    dividerAfter?: boolean;
  }[] = [
    { id: "overview", label: "Overview", dividerAfter: true },
    { id: "campaigns", label: "Email Campaigns" },
    { id: "flow-builder", label: "Email Flows", dividerAfter: true },
    { id: "user-segments", label: "Segments" },
    { id: "templates", label: "Templates" },
    { id: "history", label: "History" },
  ];

  // --- Handlers ---
  const handleOpenCompose = (segmentId = "") => {
    setComposeSegmentId(segmentId);
    setView("compose");
  };

  const handleCompose = (params: any) => {
    const now = new Date();
    const newEmails: EmailRecord[] = params.recipients.map(
      (c: any, i: number) => ({
        id: `email-${Date.now()}-${i}`,
        contactId: c.id,
        contactName: `${c.firstName} ${c.lastName}`,
        subject: params.subject,
        senderIdentity: params.senderIdentity,
        status: "Sent" as const,
        sequenceDay: 0,
        sentAt: now,
      }),
    );

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

    const newCampaign: Campaign = {
      id: `campaign-${Date.now()}`,
      name: params.campaignName || "Campaign",
      segmentId: params.segmentId,
      segmentName: params.segmentName,
      status: "sent",
      sentAt: now,
      recipientCount: params.recipients.length,
      followUpTasks: params.reminders.map((r: any) => ({
        taskType: r.type,
        description: r.objective,
      })),
      templateId: "",
      templateName: "",
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

    setView("history");
  };

  const handleCompleteTask = (taskId: string, disposition: string) => {
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status: "completed" as const, disposition } : t,
    );
    const updatedItems = taskItems.map((ti) =>
      ti.id.includes(taskId)
        ? { ...ti, status: "completed" as const, disposition }
        : ti,
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
      taskIds.some((id) => ti.id.includes(id))
        ? { ...ti, status: "completed" as const, disposition }
        : ti,
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

  const handleUpdateContact = (
    contactId: string,
    updates: Partial<Contact>,
  ) => {
    const updated = contacts.map((c) =>
      c.id === contactId ? { ...c, ...updates } : c,
    );
    setContacts(updated);
    store.contacts.write(updated);
  };

  const handleSectionClick = (section: MainSection) => {
    if (section === "crm") {
      setActiveSection(activeSection === "crm" ? null : "crm");
      if (activeSection !== "crm") setView("contacts");
    } else if (section === "email-workflows") {
      setActiveSection(
        activeSection === "email-workflows" ? null : "email-workflows",
      );
      if (activeSection !== "email-workflows") setView("overview");
    } else {
      setActiveSection(null);
      setView(section);
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      <IconSidebar
        items={iconNavItems}
        activeSection={activeSection}
        activeView={view}
        onSectionClick={handleSectionClick}
      />

      {activeSection === "crm" && (
        <CRMSidebar
          items={crmSubItems}
          activeView={view}
          onViewChange={setView}
        />
      )}

      {activeSection === "email-workflows" &&
        view !== "compose" &&
        !showSegmentBuilder && (
          <EmailWorkflowsSidebar
            items={emailWorkflowsSubItems}
            activeView={view}
            onViewChange={(v) => {
              setView(v);
              setShowSegmentBuilder(false);
            }}
            onResetSegmentBuilder={function (): void {
              throw new Error("Function not implemented.");
            }}
          />
        )}

      <main className="flex-1 overflow-auto">
        <div className="h-full">
          {/* Email Views */}
          {view === "campaigns" && (
            <Campaigns campaigns={campaigns} onCompose={handleOpenCompose} />
          )}
          {view === "overview" && (
            <Overview
              onComplete={handleCompleteTask}
              onReschedule={handleRescheduleTask}
              onDelete={handleDeleteTask}
            />
          )}
          {view === "tasks" && (
            <TaskQueue
              tasks={taskItems}
              onComplete={handleCompleteTask}
              onReschedule={handleRescheduleTask}
              onDelete={handleDeleteTask}
              onBulkComplete={handleBulkCompleteTask}
              onBulkReschedule={handleBulkRescheduleTask}
              onBulkDelete={handleBulkDeleteTask}
            />
          )}
          {view === "compose" && (
            <ComposeEmail
              contacts={contacts}
              preSelectedSegmentId={composeSegmentId}
              onSend={handleCompose}
              onCancel={() => setView("campaigns")}
            />
          )}
          {view === "user-segments" && !showSegmentBuilder && (
            <UserSegments
              contacts={contacts}
              onEditSegment={() => setShowSegmentBuilder(true)}
              onCompose={handleOpenCompose}
            />
          )}

          {/* Segment Builder Sub-view */}
          {view === "user-segments" && showSegmentBuilder && (
            <SegmentsView
              contacts={contacts}
              onBack={() => setShowSegmentBuilder(false)}
            />
          )}

          {/* CRM Views */}
          {view === "contacts" && (
            <ContactList
              contacts={contacts}
              onUpdateContact={handleUpdateContact}
              onComposeToSegment={() => setView("campaigns")}
            />
          )}

          {/* Utilities & History */}
          {view === "history" && <EmailHistory history={emailHistory} />}
          {view === "templates" && <TemplatesView />}
          {view === "flow-builder" && <FlowBuilder />}

          {/* Applications & Business Acquisition */}
          {view === "applications" && (
            <ApplicationList applications={applications} />
          )}
          {view === "business-acquisition" && (
            <BusinessAcquisitionList businessAcquisitions={businessAcquisitions} />
          )}

          {/* Placeholder Views */}
          {[
            "users",
            "automations",
            "questionnaires",
            "configurations",
            "companies",
            "inbox",
            "calls",
            "meetings",
          ].includes(view) && (
            <PlaceholderView
              icon={
                view === "inbox" ? Inbox : view === "calls" ? Phone : FileText
              }
              title={view.replace("-", " ").toUpperCase()}
            />
          )}
        </div>
      </main>
    </div>
  );
}
