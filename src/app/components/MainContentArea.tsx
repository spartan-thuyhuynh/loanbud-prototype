import {
  FileText,
  Briefcase,
  Building2,
  Users as UsersIcon,
  Inbox,
  Mail,
  Phone,
  User,
  Zap,
  ClipboardList,
  Sliders,
} from "lucide-react";
import { ContactList } from "./crm";
import {
  TaskQueue,
  EmailHistory,
  UserSegments,
  TemplatesView,
  FlowBuilder,
  TaskRules,
  Campaigns,
  Overview,
} from "./email-workflows";
import { SegmentBuilderView } from "./email-workflows/SegmentBuilderView";
import { PlaceholderView } from "./ui/PlaceholderView";
import type { View, Contact, EmailRecord, Task } from "../types";

interface MainContentAreaProps {
  view: View;
  contacts: Contact[];
  emailHistory: EmailRecord[];
  tasks: Task[];
  showSegmentBuilder: boolean;
  onSendEmail: (
    recipients: Contact[],
    subject: string,
    body: string,
    senderIdentity: string,
  ) => void;
  onComposeFromSegment: (recipients: Contact[]) => void;
  onUpdateContact: (contactId: string, updates: Partial<Contact>) => void;
  onCompleteTask: (taskId: string, disposition: Task["disposition"]) => void;
  onRescheduleTask: (taskId: string, newDate: Date) => void;
  onEditSegment: () => void;
  onBackFromSegmentBuilder: () => void;
}

export const MainContentArea = ({
  view,
  contacts,
  emailHistory,
  tasks,
  showSegmentBuilder,
  onSendEmail,
  onComposeFromSegment,
  onUpdateContact,
  onCompleteTask,
  onRescheduleTask,
  onEditSegment,
  onBackFromSegmentBuilder,
}: MainContentAreaProps) => (
  <main className="flex-1 overflow-auto">
    <div className="h-full">
      {/* Email Workflows Views */}
      {view === "overview" && <Overview />}
      {view === "campaigns" && (
        <Campaigns contacts={contacts} onSendEmail={onSendEmail} />
      )}
      {view === "flow-builder" && <FlowBuilder />}
      {view === "user-segments" && !showSegmentBuilder && (
        <UserSegments contacts={contacts} onEditSegment={onEditSegment} />
      )}
      {view === "user-segments" && showSegmentBuilder && (
        <SegmentBuilderView contacts={contacts} onBack={onBackFromSegmentBuilder} />
      )}
      {view === "templates" && <TemplatesView />}
      {view === "task-rules" && <TaskRules />}
      {view === "history" && <EmailHistory history={emailHistory} />}

      {/* CRM Views */}
      {view === "contacts" && (
        <ContactList
          contacts={contacts}
          onUpdateContact={onUpdateContact}
          onComposeToSegment={onComposeFromSegment}
        />
      )}
      {view === "companies" && (
        <PlaceholderView icon={Building2} title="Companies" />
      )}
      {view === "leads" && <PlaceholderView icon={UsersIcon} title="Leads" />}
      {view === "deals" && <PlaceholderView icon={Briefcase} title="Deals" />}
      {view === "tickets" && <PlaceholderView icon={FileText} title="Tickets" />}
      {view === "orders" && <PlaceholderView icon={FileText} title="Orders" />}
      {view === "listings" && (
        <PlaceholderView icon={FileText} title="Listings" />
      )}
      {view === "segments-lists" && (
        <PlaceholderView icon={UsersIcon} title="Segments (Lists)" />
      )}
      {view === "inbox" && (
        <PlaceholderView icon={Inbox} title="Inbox" badge="99+" />
      )}
      {view === "calls" && <PlaceholderView icon={Phone} title="Calls" />}
      {view === "meetings" && (
        <PlaceholderView icon={FileText} title="Meetings" />
      )}
      {view === "tasks" && (
        <TaskQueue
          tasks={tasks}
          onComplete={onCompleteTask}
          onReschedule={onRescheduleTask}
        />
      )}
      {view === "playbooks" && (
        <PlaceholderView icon={FileText} title="Playbooks" />
      )}
      {view === "message-templates" && (
        <PlaceholderView icon={Mail} title="Message Templates" />
      )}
      {view === "snippets" && (
        <PlaceholderView icon={FileText} title="Snippets" />
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
);
