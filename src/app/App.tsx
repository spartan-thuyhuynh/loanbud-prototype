import { useState } from "react";
import { ContactList } from "./components/crm";
import { IconSidebar } from "./components/ui/IconSidebar";
import { CRMSidebar } from "./components/crm";
import { EmailWorkflowsSidebar } from "./components/email-workflows";
import {
  TaskQueue,
  EmailHistory,
  SegmentsView,
  TemplatesView,
  FlowBuilder,
  TaskRules,
  Campaigns,
  UserSegments,
  Overview,
  ComposeEmail,
} from "./components/email-workflows";
import {
  FileText,
  Briefcase,
  Users as UsersIcon,
  Building2,
  Inbox,
  Mail,
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
} from "./types";
import type {
  Campaign,
  ComposeSubmitParams,
} from "./components/email-workflows/campaign/types";
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
  <div className="h-full flex items-center justify-center bg-background">
    <div className="text-center">
      <Icon className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
      <h2
        className="text-2xl mb-2"
        style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}
      >
        {title}
      </h2>
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
  const [view, setView] = useState<View>("applications");
  const [activeSection, setActiveSection] = useState<MainSection | null>(null);
  const [contacts, setContacts] = useState<Contact[]>(store.contacts.read());
  const [emailHistory, setEmailHistory] = useState<EmailRecord[]>(
    store.emailHistory.read(),
  );
  const [tasks, setTasks] = useState<Task[]>(store.tasks.read());
  const [campaigns, setCampaigns] = useState<Campaign[]>(
    store.campaigns.read(),
  );
  const [composeSegmentId, setComposeSegmentId] = useState<string>("");
  const [showSegmentBuilder, setShowSegmentBuilder] = useState(false);

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
    { id: "campaigns", label: "Campaigns" },
    { id: "flow-builder", label: "Email Flows", dividerAfter: true },
    { id: "user-segments", label: "Segments" },
    { id: "templates", label: "Templates" },
    { id: "task-rules", label: "Task Rules" },
    { id: "history", label: "History" },
  ];

  const handleOpenCompose = (segmentId = "") => {
    setComposeSegmentId(segmentId);
    setView("compose");
  };

  const handleCompose = (params: ComposeSubmitParams) => {
    const now = new Date();

    const newEmails: EmailRecord[] = params.recipients.map((c, i) => ({
      id: `email-${Date.now()}-${i}`,
      contactId: c.id,
      contactName: `${c.firstName} ${c.lastName}`,
      subject: params.subject,
      senderIdentity: params.senderIdentity,
      status: "Sent" as const,
      sequenceDay: 0,
      sentAt: now,
    }));

    const newTasks: Task[] = params.recipients.map((c, i) => ({
      id: `task-${Date.now()}-${i}`,
      contactId: c.id,
      contactName: `${c.firstName} ${c.lastName}`,
      contactPhone: c.phone,
      listingStatus: c.listingStatus,
      callObjective: params.followUp.objective,
      voicemailScript: params.followUp.vmScript,
      dueDay: 0,
      scheduledFor: params.followUp.dueDate,
      status: "pending" as const,
    }));

    const newTaskItems: TaskItem[] = params.recipients.map((c, i) => ({
      id: `taskitem-${Date.now()}-${i}`,
      contactName: `${c.firstName} ${c.lastName}`,
      contactId: c.id,
      contactStatus: c.listingStatus,
      taskType: params.followUp.taskType,
      source: params.campaignName,
      sourceType: "campaign" as const,
      dueDate: params.followUp.dueDate,
      assignee: params.senderIdentity,
      status: "pending" as const,
      triggerContext: params.followUp.objective,
      notes: params.followUp.vmScript || undefined,
    }));

    const newCampaign: Campaign = {
      id: `campaign-${Date.now()}`,
      name: params.campaignName,
      segmentId: params.segmentId,
      segmentName: params.segmentName,
      templateId: params.templateId,
      templateName: params.templateName,
      status: "sent",
      sentAt: now,
      recipientCount: params.recipients.length,
      followUpTasks: [
        {
          daysAfter: 0,
          taskType: params.followUp.taskType,
          description: params.followUp.objective,
        },
      ],
    };

    const updatedHistory = [...emailHistory, ...newEmails];
    const updatedTasks = [...tasks, ...newTasks];
    const updatedItems = [...store.taskItems.read(), ...newTaskItems];
    const updatedCampaigns = [...campaigns, newCampaign];

    setEmailHistory(updatedHistory);
    setTasks(updatedTasks);
    setCampaigns(updatedCampaigns);

    store.emailHistory.write(updatedHistory);
    store.tasks.write(updatedTasks);
    store.taskItems.write(updatedItems);
    store.campaigns.write(updatedCampaigns);

    setView("history");
  };

  const handleComposeFromSegment = (_recipients: Contact[]) => {
    setView("campaigns");
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

  const handleCompleteTask = (
    taskId: string,
    disposition: Task["disposition"],
  ) => {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, status: "completed" as const, disposition } : t,
    );
    setTasks(updated);
    store.tasks.write(updated);
  };

  const handleRescheduleTask = (taskId: string, newDate: Date) => {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, scheduledFor: newDate } : t,
    );
    setTasks(updated);
    store.tasks.write(updated);
  };

  const handleSectionClick = (section: MainSection) => {
    if (section === "crm") {
      setActiveSection(activeSection === "crm" ? null : "crm");
      if (activeSection !== "crm") {
        setView("contacts");
      }
    } else if (section === "email-workflows") {
      setActiveSection(
        activeSection === "email-workflows" ? null : "email-workflows",
      );
      if (activeSection !== "email-workflows") {
        setView("overview");
      }
    } else {
      setActiveSection(null);
      setView(section);
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* 1. Main Icon Sidebar */}
      <IconSidebar
        items={iconNavItems}
        activeSection={activeSection}
        activeView={view}
        onSectionClick={handleSectionClick}
      />

      {/* Sub-Sidebar for CRM */}
      {activeSection === "crm" && (
        <CRMSidebar
          items={crmSubItems}
          activeView={view}
          onViewChange={setView}
        />
      )}

      {activeSection === "email-workflows" &&
        view !== "compose" &&
        !(view === "user-segments" && showSegmentBuilder) && (
          <EmailWorkflowsSidebar
            items={emailWorkflowsSubItems}
            activeView={view}
            onViewChange={(newView) => {
              setView(newView);
              setShowSegmentBuilder(false);
            }}
            onResetSegmentBuilder={() => setShowSegmentBuilder(false)}
          />
        )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="h-full">
          {/* Email Workflows Views */}
          {view === "overview" && <Overview />}
          {view === "campaigns" && (
            <Campaigns
              campaigns={campaigns}
              onCompose={() => handleOpenCompose()}
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
          {view === "flow-builder" && <FlowBuilder />}
          {view === "user-segments" && !showSegmentBuilder && (
            <UserSegments
              contacts={contacts}
              onEditSegment={() => setShowSegmentBuilder(true)}
              onCompose={(segId: string) => handleOpenCompose(segId)}
            />
          )}
          {view === "user-segments" && showSegmentBuilder && (
            <div className="h-full flex flex-col">
              <div className="px-8 py-4 border-b border-border bg-card flex items-center gap-3">
                <button
                  onClick={() => setShowSegmentBuilder(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-lg hover:bg-muted/80 transition-all text-sm"
                >
                  ← Back
                </button>
                <span className="text-muted-foreground text-sm">
                  Segment Builder
                </span>
              </div>
              <div className="flex-1 overflow-auto">
                <SegmentsView contacts={contacts} />
              </div>
            </div>
          )}
          {view === "templates" && <TemplatesView />}
          {view === "task-rules" && <TaskRules />}
          {view === "history" && <EmailHistory history={emailHistory} />}

          {/* CRM Views */}
          {view === "contacts" && (
            <ContactList
              contacts={contacts}
              onUpdateContact={handleUpdateContact}
              onComposeToSegment={handleComposeFromSegment}
            />
          )}
          {view === "companies" && (
            <PlaceholderView icon={Building2} title="Companies" />
          )}

          {view === "inbox" && (
            <PlaceholderView icon={Inbox} title="Inbox" badge="99+" />
          )}
          {view === "calls" && <PlaceholderView icon={Phone} title="Calls" />}
          {view === "meetings" && (
            <PlaceholderView icon={FileText} title="Meetings" />
          )}

          {/* Main Navigation Views */}
          {view === "applications" && (
            <PlaceholderView icon={FileText} title="Applications" />
          )}
          {view === "business-acquisition" && (
            <PlaceholderView icon={Briefcase} title="Business Acquisition" />
          )}
          {view === "users" && <PlaceholderView icon={User} title="Users" />}
          {view === "automations" && (
            <PlaceholderView icon={Zap} title="Automations" />
          )}
          {view === "questionnaires" && (
            <PlaceholderView icon={ClipboardList} title="Questionnaires" />
          )}
          {view === "configurations" && (
            <PlaceholderView icon={Sliders} title="Configurations" />
          )}
        </div>
      </main>
    </div>
  );
}
