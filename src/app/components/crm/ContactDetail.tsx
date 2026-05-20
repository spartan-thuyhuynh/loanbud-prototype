import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Phone,
  Mail,
  Plus,
  CheckCircle2,
  Calendar,
  Trash2,
  Clock,
  PhoneCall,
  MessageSquare,
  PauseCircle,
  AlertTriangle,
  Pencil,
  Copy,
  CalendarDays,
  FileText,
  ChevronDown,
  ChevronUp,
  Building2,
  X,
} from "lucide-react";
import { useAppData } from "@/app/contexts/AppDataContext";
import { useDialer } from "@/app/contexts/DialerContext";
import { useVersion } from "@/app/contexts/VersionContext";
import { CreateTaskModal } from "@/app/components/email-workflows/CreateTaskModal";
import { TaskActionModal } from "@/app/components/email-workflows/TaskActionModal";
import { PauseAllCommsModal } from "./PauseAllCommsModal";
import { ContactCommunicationsTab } from "./ContactCommunicationsTab";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import type { Contact, TaskItem, ContactActivityRecord } from "@/app/types";

type TaskModalMode = "complete" | "reschedule" | "delete" | null;

type ActivityEntry = ContactActivityRecord & { _ts: Date; direction?: "inbound" | "outbound"; read?: boolean };

const STATUS_COLORS: Record<string, string> = {
  New: "bg-blue-100 text-blue-700",
  Draft: "bg-yellow-100 text-yellow-700",
  Submitted: "bg-purple-100 text-purple-700",
  "On Hold": "bg-orange-100 text-orange-700",
  Declined: "bg-red-100 text-red-700",
};


function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function formatShortDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(d);
}

export function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    contacts,
    emailHistory,
    taskItems,
    contactActivity,
    workflowEnrollments,
    workflows,
    handleCompleteTask,
    handleRescheduleTask,
    handleDeleteTask,
    handleMarkEmailRead,
    handlePauseAllEnrollments,
    handleUpdateContact,
    applications,
  } = useAppData();

  const { openDialer } = useDialer();
  const { version } = useVersion();
  const isV2 = version === "v2";

  const [activeTab, setActiveTab] = useState<"timeline" | "tasks" | "communications" | "notes">("timeline");
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [modalTask, setModalTask] = useState<TaskItem | null>(null);
  const [modalMode, setModalMode] = useState<TaskModalMode>(null);
  const [infoOpen, setInfoOpen] = useState(true);
  const [addressOpen, setAddressOpen] = useState(true);
  const [applicationsOpen, setApplicationsOpen] = useState(true);
  const [companiesOpen, setCompaniesOpen] = useState(true);
  const [listingOpen, setListingOpen] = useState(true);

  const contact = contacts.find((c) => c.id === id);

  if (!contact) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="mb-4">Contact not found.</p>
          <button onClick={() => navigate(-1)} className="text-primary underline text-sm">
            Back to contacts
          </button>
        </div>
      </div>
    );
  }

  const contactEmails = emailHistory
    .filter((e) => e.contactId === contact.id)
    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

  const contactTasks = taskItems
    .filter((t) => t.contactId === contact.id)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const pendingTasks = contactTasks.filter((t) => t.status !== "completed");

  // Unified activity feed: contactActivity records + campaign emailHistory records
  const activityFeed: ActivityEntry[] = [
    ...contactActivity
      .filter((a) => a.contactId === contact.id)
      .map((a) => ({ ...a, _ts: new Date(a.timestamp) })),
    // Campaign emails from emailHistory (workflow email/SMS go through contactActivity)
    ...contactEmails.map((e) => ({
      id: e.id,
      contactId: e.contactId,
      type: (e.channel === "sms" ? "sms_sent" : "email_sent") as ContactActivityRecord["type"],
      subject: e.subject || undefined,
      source: e.senderIdentity,
      assignee: e.senderIdentity,
      timestamp: new Date(e.sentAt),
      _ts: new Date(e.sentAt),
      direction: e.direction,
      read: e.read,
    })),
  ].sort((a, b) => b._ts.getTime() - a._ts.getTime());

  // Timeline: non-communication contact activity (tasks, status updates, step events)
  const isCommsEntry = (e: ActivityEntry) =>
    e.type === "email_sent" ||
    e.type === "sms_sent" ||
    (e.type === "task_completed" && (e.taskType === "Call" || e.taskType === "Voicemail")) ||
    e.direction !== undefined;
  const timelineFeed = activityFeed.filter((e) => !isCommsEntry(e));

  const initials = `${contact.firstName[0] ?? ""}${contact.lastName[0] ?? ""}`.toUpperCase();

  const contactEnrollments = workflowEnrollments.filter(
    (e) => e.contactId === contact.id && e.status !== "completed",
  );
  const activeEnrollmentCount = contactEnrollments.filter((e) => e.status === "active").length;

  const sortedEnrollments = [...contactEnrollments]
    .sort((a, b) => {
      const wfA = workflows.find((w) => w.id === a.workflowId);
      const wfB = workflows.find((w) => w.id === b.workflowId);
      const lastA = contactActivity
        .filter((x) => x.contactId === contact.id && x.sourceType === "flow" && x.source === wfA?.name)
        .reduce((max, x) => Math.max(max, new Date(x.timestamp).getTime()), new Date(a.startDate).getTime());
      const lastB = contactActivity
        .filter((x) => x.contactId === contact.id && x.sourceType === "flow" && x.source === wfB?.name)
        .reduce((max, x) => Math.max(max, new Date(x.timestamp).getTime()), new Date(b.startDate).getTime());
      return lastB - lastA;
    })
    .slice(0, 3);
  const hasOverdueEnrollments = contactEnrollments.some(
    (e) =>
      e.status === "paused" && e.pausedUntil && new Date(e.pausedUntil) <= new Date(),
  );

  const openModal = (task: TaskItem, mode: TaskModalMode) => {
    setModalTask(task);
    setModalMode(mode);
  };
  const closeModal = () => {
    setModalTask(null);
    setModalMode(null);
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">

      {/* 3-column body */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT PANEL ── */}
        <aside className="w-72 xl:w-80 2xl:w-96 shrink-0 border-r border-border bg-card flex flex-col overflow-y-auto">

          {/* Back button */}
          <div className="px-5 pt-4 pb-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Contacts
            </button>
          </div>

          {/* Avatar + Name + Role */}
          <div className="px-5 pt-3 pb-4 border-b border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <span className="text-base font-semibold text-primary">{initials}</span>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold leading-tight truncate">{contact.firstName} {contact.lastName}</h2>
                {/* Role select — sits directly below the name */}
                <Select
                  value={contact.userType}
                  onValueChange={(v) => handleUpdateContact(contact.id, { userType: v as Contact["userType"] })}
                >
                  <SelectTrigger className="!border-0 !bg-transparent !shadow-none !px-0 !py-0 !h-auto !ring-0 !ring-offset-0 !justify-start !gap-1 text-sm font-medium text-muted-foreground mt-0.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Broker", "Lender", "Partner", "Borrower", "Co-Borrower"].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {contact.optedOut && (
              <div className="mt-3 px-3 py-2 bg-destructive/10 border border-destructive/30 rounded-lg text-xs text-destructive text-center">
                Opted out — do not email
              </div>
            )}

            {/* Action icons */}
            <div className="flex justify-between mt-4">
              <button onClick={() => openDialer(contact.phone)} className="flex flex-col items-center gap-1 group" title="Call">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center group-hover:opacity-80 transition-opacity">
                  <Phone className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-[10px] text-muted-foreground">Call</span>
              </button>
              <a href={`mailto:${contact.email}`} className="flex flex-col items-center gap-1 group" title="Email">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center group-hover:opacity-80 transition-opacity">
                  <Mail className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-[10px] text-muted-foreground">Mail</span>
              </a>
              <button className="flex flex-col items-center gap-1 group" title="SMS">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center group-hover:opacity-80 transition-opacity">
                  <MessageSquare className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-[10px] text-muted-foreground">SMS</span>
              </button>
              <button onClick={() => setShowCreateTask(true)} className="flex flex-col items-center gap-1 group" title="Schedule">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center group-hover:opacity-80 transition-opacity">
                  <CalendarDays className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-[10px] text-muted-foreground">Schedule</span>
              </button>
              <button className="flex flex-col items-center gap-1 group" title="Note">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center group-hover:opacity-80 transition-opacity">
                  <FileText className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-[10px] text-muted-foreground">Note</span>
              </button>
            </div>
          </div>

          {/* Status + Visibility */}
          <div className="px-5 py-4 border-b border-border grid grid-cols-2 gap-x-3">
            <div>
              <p className="text-sm font-semibold mb-0.5">Status</p>
              <Select
                value={contact.status ?? "Active"}
                onValueChange={(v) => handleUpdateContact(contact.id, { status: v as Contact["status"] })}
              >
                <SelectTrigger className="!border-0 !bg-transparent !shadow-none !px-0 !py-0 !h-auto !ring-0 !ring-offset-0 !justify-start !gap-1 text-sm text-primary font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-sm font-semibold mb-0.5">Visibility</p>
              <Select
                value={contact.visibility ?? "Public"}
                onValueChange={(v) => handleUpdateContact(contact.id, { visibility: v as Contact["visibility"] })}
              >
                <SelectTrigger className="!border-0 !bg-transparent !shadow-none !px-0 !py-0 !h-auto !ring-0 !ring-offset-0 !justify-start !gap-1 text-sm text-primary font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Public">Public</SelectItem>
                  <SelectItem value="Private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loan Officer */}
          <div className="px-5 py-4 border-b border-border">
            <div className="flex items-center justify-between mb-0.5">
              <p className="text-sm font-semibold">Loan Officer</p>
              {contact.loanOfficer && (
                <button
                  onClick={() => handleUpdateContact(contact.id, { loanOfficer: undefined })}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
            <Select
              value={contact.loanOfficer ?? ""}
              onValueChange={(v) => handleUpdateContact(contact.id, { loanOfficer: v })}
            >
              <SelectTrigger className="!border-0 !bg-transparent !shadow-none !px-0 !py-0 !h-auto !ring-0 !ring-offset-0 !justify-start !gap-1 text-sm text-primary font-medium">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {["Andy Officer", "Sarah Manager", "John Lead", "Maria Broker"].map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* V2: Workflow status + comms controls */}
          {isV2 && contactEnrollments.length > 0 && !contact.optedOut && (
            <div className="border-b border-border px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold">Enrolled communication flow</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 bg-muted text-muted-foreground rounded-full">
                  {contactEnrollments.length}
                </span>
              </div>

              {hasOverdueEnrollments && (
                <button
                  onClick={() => setActiveTab("communications")}
                  className="mb-3 w-full flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-700 hover:bg-amber-100 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  Resume due — click to view
                </button>
              )}

              <div className="space-y-2.5">
                {sortedEnrollments.map((e) => {
                  const isPaused = e.status === "paused";
                  const wf = workflows.find((w) => w.id === e.workflowId);
                  const wfName = wf?.name ?? e.workflowId;
                  const actionStepCount = wf?.steps.filter((s) => s.actionType !== "delay").length ?? 0;
                  const stepsComplete = e.stepProgress.filter(
                    (p) => p.status === "done" || p.status === "skipped",
                  ).length;
                  const pct =
                    e.stepProgress.length > 0
                      ? Math.round((stepsComplete / e.stepProgress.length) * 100)
                      : 0;
                  return (
                    <div key={e.id} className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${isPaused ? "bg-amber-400" : "bg-green-500"}`}
                        />
                        <span className="text-xs font-medium truncate flex-1">
                          {wfName}
                        </span>
                        {actionStepCount > 0 && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded-full shrink-0 whitespace-nowrap">
                            {actionStepCount} steps
                          </span>
                        )}
                        {isPaused && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full shrink-0">
                            Paused
                          </span>
                        )}
                      </div>
                      {isPaused && e.pausedUntil && (
                        <div className="text-[10px] text-amber-600 pl-3">
                          Until {formatShortDate(e.pausedUntil)}
                        </div>
                      )}
                      <div className="h-1 bg-muted rounded-full overflow-hidden ml-3">
                        <div
                          className="h-full bg-primary/60 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex flex-col gap-2">
                {activeEnrollmentCount > 0 && (
                  <button
                    onClick={() => setShowPauseModal(true)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border border-amber-300 text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    <PauseCircle className="w-3.5 h-3.5" />
                    Pause All Comms
                  </button>
                )}
                <button
                  onClick={() => setActiveTab("communications")}
                  className="w-full text-xs text-primary hover:underline py-1"
                >
                  View Details →
                </button>
              </div>
            </div>
          )}

          {/* Contact Info accordion */}
          <div className="px-5 py-5 border-b border-border">
            <button
              onClick={() => setInfoOpen((v) => !v)}
              className="flex items-center justify-between w-full mb-3"
            >
              <span className="text-sm font-semibold">Contact Info</span>
              {infoOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            {infoOpen && (
              <div className="space-y-4">
                {/* Phone */}
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Phone</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-primary truncate">{contact.phone}</span>
                    <button className="text-muted-foreground hover:text-foreground shrink-0" title="Edit phone">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {/* Email */}
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Email</p>
                  <span className="text-sm break-all">{contact.email}</span>
                </div>
                {/* LinkedIn */}
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Linkedin</p>
                  <span className="text-sm text-muted-foreground">{contact.linkedin ?? "N/A"}</span>
                </div>
                {/* Do Not Call + SMS Consent */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Do Not Call</p>
                    <span className="text-sm">{contact.doNotCall ?? "Allowed"}</span>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">SMS Consent</p>
                    <span className="text-sm">{contact.smsConsent ?? "No"}</span>
                  </div>
                </div>
                {/* Time Zone + Preferred Language */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Time Zone</p>
                    <span className="text-sm">{contact.timeZone ?? "—"}</span>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Preferred Language</p>
                    <span className="text-sm">{contact.preferredLanguage ?? "—"}</span>
                  </div>
                </div>
                {/* Created at + Updated at */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Created at</p>
                    <span className="text-xs text-muted-foreground">{formatDate(contact.createAt)}</span>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Updated at</p>
                    <span className="text-xs text-muted-foreground">{contact.updatedAt ? formatDate(contact.updatedAt) : "—"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Address accordion */}
          <div className="px-5 py-5">
            <button
              onClick={() => setAddressOpen((v) => !v)}
              className="flex items-center justify-between w-full mb-3"
            >
              <span className="text-sm font-semibold">Address</span>
              {addressOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            {addressOpen && (
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Home Address</p>
                  <span className="text-sm">{contact.address ?? "—"}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">City</p>
                    <span className="text-sm">{contact.city ?? "—"}</span>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">State</p>
                    <span className="text-sm">{contact.state ?? "—"}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">ZIP Code</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm">{contact.zipCode ?? "—"}</span>
                    {contact.zipCode && (
                      <button
                        onClick={() => navigator.clipboard.writeText(contact.zipCode!)}
                        className="text-muted-foreground hover:text-foreground shrink-0"
                        title="Copy ZIP code"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ── CENTER PANEL ── */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Tab bar */}
          <div className="border-b border-border flex justify-center gap-8">
            {(["timeline", ...(isV2 ? ["communications" as const] : []), "tasks", "notes"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-sm capitalize border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "timeline"
                  ? `Timeline (${timelineFeed.length})`
                  : tab === "tasks"
                  ? `Tasks (${contactTasks.length})`
                  : tab === "notes"
                  ? "Notes"
                  : "Communications"}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto bg-muted/40 px-6 py-5">

            {/* TIMELINE TAB — non-communication contact activity */}
            {activeTab === "timeline" && (
              <div className="bg-card rounded-xl p-5">
                {timelineFeed.length === 0 ? (
                  <EmptyState icon={Clock} message="No activity for this contact yet." />
                ) : (
                  <div className="space-y-2">
                    {timelineFeed.map((entry) => {
                      const isCall = entry.type === "task_completed" && entry.taskType === "Call";
                      const isEmail = entry.type === "email_sent";
                      const isSms = entry.type === "sms_sent";
                      const isTask = entry.type === "task_completed";
                      const isUnreadInbound = isEmail && entry.direction === "inbound" && !entry.read;

                      const iconBg = isCall
                        ? "bg-green-100 text-green-600"
                        : isEmail
                        ? "bg-blue-100 text-blue-600"
                        : isSms
                        ? "bg-purple-100 text-purple-600"
                        : "bg-muted text-muted-foreground";

                      const dispositionColors: Record<string, string> = {
                        Answered: "bg-green-100 text-green-700",
                        "Voicemail Left": "bg-amber-100 text-amber-700",
                        "No Answer — Voicemail Drop": "bg-red-100 text-red-700",
                        "Not Needed": "bg-muted text-muted-foreground",
                      };

                      const typeLabel = isCall
                        ? "Call"
                        : isEmail
                        ? entry.direction === "inbound" ? "Reply received" : "Email"
                        : isSms
                        ? "SMS"
                        : entry.taskType ?? "Task";

                      return (
                        <div
                          key={entry.id}
                          className={`flex items-start gap-3 p-4 bg-card border rounded-xl transition-colors ${isUnreadInbound ? "border-blue-200 bg-blue-50/40 cursor-pointer hover:bg-blue-50" : "border-border"}`}
                          onClick={isUnreadInbound ? () => handleMarkEmailRead(entry.id) : undefined}
                          title={isUnreadInbound ? "Click to mark as read" : undefined}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${iconBg}`}>
                            {isCall && <PhoneCall className="w-4 h-4" />}
                            {isEmail && <Mail className="w-4 h-4" />}
                            {isSms && <MessageSquare className="w-4 h-4" />}
                            {isTask && !isCall && <CheckCircle2 className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-sm font-medium ${isUnreadInbound ? "text-blue-700" : ""}`}>{typeLabel}</span>
                              {isUnreadInbound && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                                  Unread
                                </span>
                              )}
                              {isTask && entry.disposition && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${dispositionColors[entry.disposition] ?? "bg-muted text-muted-foreground"}`}>
                                  {entry.disposition}
                                </span>
                              )}
                            </div>
                            {isEmail && entry.subject && (
                              <div className="text-xs text-foreground mt-0.5 truncate">{entry.subject}</div>
                            )}
                            {isSms && entry.message && (
                              <div className="text-xs text-foreground mt-0.5 line-clamp-2">{entry.message}</div>
                            )}
                            {entry.note && (
                              <div className="text-xs text-muted-foreground italic mt-1">"{entry.note}"</div>
                            )}
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              {entry.source && (
                                <span className="text-xs text-muted-foreground">
                                  {entry.source}{entry.stepName ? ` — ${entry.stepName}` : ""}
                                </span>
                              )}
                              {entry.assignee && (
                                <span className="text-xs text-muted-foreground">· {entry.assignee}</span>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(entry._ts)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TASKS TAB */}
            {activeTab === "tasks" && (
              <div className="bg-card rounded-xl p-5">
                {contactTasks.length === 0 ? (
                  <EmptyState icon={CheckCircle2} message="No tasks for this contact." />
                ) : (
                  <div className="space-y-2">
                    {contactTasks.map((task) => {
                      const isOverdue = task.status !== "completed" && new Date(task.dueDate) < new Date();
                      const isCompleted = task.status === "completed";
                      return (
                        <div
                          key={task.id}
                          className={`flex items-start gap-4 p-4 bg-card border rounded-xl transition-colors ${
                            isCompleted ? "border-border opacity-60" : isOverdue ? "border-red-200 bg-red-50/30" : "border-border"
                          }`}
                        >
                          <div className="shrink-0 mt-0.5">
                            <span className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wide font-medium ${
                              isCompleted ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                            }`}>
                              {task.taskType}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            {task.triggerContext && (
                              <div className="text-sm text-foreground line-clamp-2">{task.triggerContext}</div>
                            )}
                            {task.notes && (
                              <div className="text-xs text-muted-foreground italic mt-0.5 line-clamp-1">VM: {task.notes}</div>
                            )}
                            <div className="flex items-center gap-1.5 mt-1">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span className={`text-xs ${isOverdue && !isCompleted ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
                                {formatDate(task.dueDate)}
                              </span>
                              {isOverdue && !isCompleted && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded uppercase tracking-tight">Overdue</span>
                              )}
                              {isCompleted && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded uppercase tracking-tight">Done</span>
                              )}
                            </div>
                          </div>
                          {!isCompleted && (
                            <div className="flex items-center gap-1 shrink-0">
                              <button onClick={() => openModal(task, "complete")} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Complete">
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => openModal(task, "reschedule")} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Reschedule">
                                <Calendar className="w-4 h-4" />
                              </button>
                              <button onClick={() => openModal(task, "delete")} className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* NOTES TAB */}
            {activeTab === "notes" && (
              <div className="bg-card rounded-xl">
                <EmptyState icon={FileText} message="No notes for this contact yet." />
              </div>
            )}

            {/* COMMUNICATIONS TAB (V2 only) */}
            {activeTab === "communications" && isV2 && (
              <div className="bg-card rounded-xl overflow-hidden p-5">
                <ContactCommunicationsTab
                  contactId={contact.id}
                  contactOptedOut={contact.optedOut ?? false}
                />
              </div>
            )}
          </div>
        </main>

        {/* ── RIGHT PANEL ── */}
        <aside className="w-72 xl:w-80 2xl:w-96 shrink-0 border-l border-border bg-card flex flex-col overflow-y-auto">

          {/* Applications */}
          <div className="px-5 py-5 border-b border-border">
            <button
              onClick={() => setApplicationsOpen((v) => !v)}
              className="flex items-center justify-between w-full mb-3"
            >
              <h3 className="text-sm font-semibold">Applications</h3>
              {applicationsOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {applicationsOpen && (() => {
              const linkedApp = applications.find((a) => a.id === contact.linkedApplicationId);
              return linkedApp ? (
                <div className="p-3 border border-border rounded-xl bg-background">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-foreground">#{linkedApp.applicationNumber}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full">{linkedApp.stage}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{linkedApp.loanPurpose}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{linkedApp.loanOfficerName}</div>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Link Application (Loan ID #)</p>
                  <button className="text-sm font-medium text-primary hover:underline">
                    Select application
                  </button>
                </div>
              );
            })()}
          </div>

          {/* Companies */}
          <div className="px-5 py-5 border-b border-border">
            <button
              onClick={() => setCompaniesOpen((v) => !v)}
              className="flex items-center justify-between w-full mb-3"
            >
              <h3 className="text-sm font-semibold">Companies</h3>
              {companiesOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {companiesOpen && (
              <div className="flex flex-wrap gap-2">
                {(contact.companies ?? []).map((company) => (
                  <span key={company} className="inline-flex items-center gap-1 px-2.5 py-1 bg-muted rounded-full text-xs font-medium">
                    {company}
                    <button
                      onClick={() => handleUpdateContact(contact.id, {
                        companies: (contact.companies ?? []).filter((c) => c !== company),
                      })}
                      className="text-muted-foreground hover:text-foreground ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <button className="inline-flex items-center gap-1 px-2.5 py-1 border border-dashed border-border rounded-full text-xs text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
                  <Plus className="w-3 h-3" />
                  Add company
                </button>
              </div>
            )}
          </div>

          {/* Listings */}
          <div className="px-5 py-5 border-b border-border">
            <button
              onClick={() => setListingOpen((v) => !v)}
              className="flex items-center justify-between w-full mb-3"
            >
              <h3 className="text-sm font-semibold">Listings</h3>
              {listingOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {listingOpen && (
              <div className="p-3 border border-border rounded-xl bg-background">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm font-medium truncate">{contact.listingName}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[contact.listingStatus] ?? "bg-muted text-muted-foreground"}`}>
                    {contact.listingStatus}
                  </span>
                  {contact.optedOut && (
                    <span className="text-xs px-2 py-0.5 bg-destructive/10 text-destructive rounded-full">Opted Out</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Upcoming Tasks */}
          <div className="px-5 py-5 flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Upcoming Tasks</h3>
              <button
                onClick={() => setShowCreateTask(true)}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Task
              </button>
            </div>

            {pendingTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No upcoming tasks</p>
            ) : (
              <div className="space-y-2">
                {pendingTasks.map((task) => {
                  const isOverdue = new Date(task.dueDate) < new Date();
                  const typeColors: Record<string, { border: string; badge: string }> = {
                    Call: { border: "border-l-green-500", badge: "bg-green-50 text-green-700" },
                    Email: { border: "border-l-blue-400", badge: "bg-blue-50 text-blue-700" },
                    SMS: { border: "border-l-purple-400", badge: "bg-purple-50 text-purple-700" },
                  };
                  const colors = typeColors[task.taskType] ?? { border: "border-l-border", badge: "bg-muted text-muted-foreground" };
                  return (
                    <div key={task.id} className={`border border-l-4 border-border rounded-lg bg-white ${colors.border}`}>
                      <div className="px-3 py-3">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wide ${colors.badge}`}>
                              {task.taskType}
                            </span>
                            {isOverdue && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide bg-red-100 text-red-500">
                                Overdue
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                            <Clock className="w-3 h-3 shrink-0" />
                            {formatDate(task.dueDate)}
                          </div>
                        </div>
                        {task.triggerContext && (
                          <p className="text-xs text-foreground leading-relaxed line-clamp-2">{task.triggerContext}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        preselectedContactId={contact.id}
      />

      <TaskActionModal
        isOpen={modalMode !== null}
        mode={modalMode}
        task={modalTask}
        onComplete={(taskId, dis, note) => { handleCompleteTask(taskId, dis, note); closeModal(); }}
        onReschedule={(taskId, date, assignee, objective) => { handleRescheduleTask(taskId, date, assignee, objective); closeModal(); }}
        onDelete={(taskId) => { handleDeleteTask(taskId); closeModal(); }}
        onClose={closeModal}
      />

      <PauseAllCommsModal
        isOpen={showPauseModal}
        contactName={`${contact.firstName} ${contact.lastName}`}
        activeEnrollmentCount={activeEnrollmentCount}
        onConfirm={(pausedUntil, reason) => {
          handlePauseAllEnrollments(contact.id, pausedUntil, reason);
          setShowPauseModal(false);
        }}
        onClose={() => setShowPauseModal(false)}
      />
    </div>
  );
}


function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <Icon className="w-10 h-10 mb-3 opacity-20" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
