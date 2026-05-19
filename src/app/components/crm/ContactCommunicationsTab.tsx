import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Pause,
  Play,
  AlertTriangle,
  Workflow,
  Mail,
  Phone,
  MessageSquare,
  ArrowUpRight,
  ArrowUpDown,
  Search,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";
import { useAppData } from "@/app/contexts/AppDataContext";
import { mergeSteps } from "@/app/lib/workflowUtils";
import type { WorkflowEnrollment, Workflow as WorkflowType } from "@/app/types";
import { PauseAllCommsModal } from "./PauseAllCommsModal";

type SortKey = "status" | "name" | "recent";

interface ContactCommunicationsTabProps {
  contactId: string;
  contactOptedOut: boolean;
}

function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(d);
}

function getStepInfo(enrollment: WorkflowEnrollment, workflow: WorkflowType) {
  const allSteps = mergeSteps(workflow.steps, enrollment.customSteps);
  const actionSteps = allSteps.filter((s) => s.actionType !== "delay");
  const pendingStep = actionSteps.find(
    (s) => enrollment.stepProgress.find((p) => p.stepId === s.id)?.status === "pending",
  );
  const doneCount = enrollment.stepProgress.filter(
    (p) => p.status === "done" || p.status === "skipped",
  ).length;
  const pendingIdx = pendingStep ? actionSteps.indexOf(pendingStep) + 1 : actionSteps.length;
  return {
    stepLabel: pendingStep ? `Step ${pendingIdx} of ${actionSteps.length}` : "Completed",
    stepName: pendingStep?.name ?? "—",
    totalSteps: actionSteps.length,
    pct: enrollment.stepProgress.length > 0
      ? Math.round((doneCount / enrollment.stepProgress.length) * 100)
      : 0,
  };
}

type CommItem = {
  id: string;
  ts: Date;
  kind: "email" | "sms" | "call";
  label: string;
  detail: string;
  unread: boolean;
};

const COMM_ICON = { email: Mail, sms: MessageSquare, call: Phone } as const;
const COMM_ICON_CLASS = {
  email: "bg-blue-100 text-blue-600",
  sms:   "bg-purple-100 text-purple-600",
  call:  "bg-green-100 text-green-600",
} as const;

export function ContactCommunicationsTab({ contactId, contactOptedOut }: ContactCommunicationsTabProps) {
  const {
    workflows,
    workflowEnrollments,
    emailHistory,
    contactActivity,
    handleSetEnrollmentStatus,
    handlePauseAllEnrollments,
  } = useAppData();
  const navigate = useNavigate();

  const [showPauseModal, setShowPauseModal] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("status");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const now = new Date();

  // ── All enrollments for this contact (active + completed) ──
  const allEnrollments = workflowEnrollments.filter((e) => e.contactId === contactId);
  const activeCount = allEnrollments.filter((e) => e.status === "active").length;
  const overdueEnrollments = allEnrollments.filter(
    (e) => e.status === "paused" && e.pausedUntil && new Date(e.pausedUntil) <= now,
  );

  // ── All comms items, tagged with sourceKey (workflow name or "Campaign") ──
  const emailItems: (CommItem & { sourceKey: string })[] = emailHistory
    .filter((e) => e.contactId === contactId)
    .map((e) => {
      const wfName = e.workflowId ? workflows.find((w) => w.id === e.workflowId)?.name : undefined;
      return {
        id: e.id,
        ts: new Date(e.sentAt),
        kind: "email" as const,
        label: e.direction === "inbound" ? "Email received" : "Email sent",
        detail: e.subject ?? "",
        unread: e.direction === "inbound" && !e.read,
        sourceKey: wfName ?? "Campaign",
      };
    });

  const activityItems: (CommItem & { sourceKey: string })[] = contactActivity
    .filter(
      (a) =>
        a.contactId === contactId &&
        (a.type === "sms_sent" ||
          (a.type === "task_completed" && (a.taskType === "Call" || a.taskType === "Voicemail"))),
    )
    .map((a) => ({
      id: a.id,
      ts: new Date(a.timestamp),
      kind: a.type === "sms_sent" ? ("sms" as const) : ("call" as const),
      label: a.type === "sms_sent" ? "SMS sent" : a.taskType === "Voicemail" ? "Voicemail" : "Call",
      detail: a.note ?? "",
      unread: false,
      sourceKey: a.source ?? "Campaign",
    }));

  const allComms = [...emailItems, ...activityItems].sort((a, b) => b.ts.getTime() - a.ts.getTime());

  // ── Build sections: one per enrollment + one "Campaign" catch-all ──
  // Map workflow name → comms
  const commsForSource = (key: string) => allComms.filter((c) => c.sourceKey === key);

  // Enrollment-based sections
  const enrollmentSections = allEnrollments.map((enrollment) => {
    const workflow = workflows.find((w) => w.id === enrollment.workflowId);
    const name = workflow?.name ?? enrollment.workflowId;
    const comms = commsForSource(name);
    const latestTs = comms[0]?.ts ?? new Date(enrollment.startDate);
    return { type: "enrollment" as const, enrollment, workflow, name, comms, latestTs };
  });

  // Collect workflow names already accounted for
  const enrolledWorkflowNames = new Set(enrollmentSections.map((s) => s.name));

  // Campaign section: comms that don't map to any enrolled workflow
  const campaignComms = allComms.filter((c) => !enrolledWorkflowNames.has(c.sourceKey));
  const campaignGroups = new Map<string, CommItem[]>();
  for (const item of campaignComms) {
    const g = campaignGroups.get(item.sourceKey) ?? [];
    g.push(item);
    campaignGroups.set(item.sourceKey, g);
  }

  // ── Filter by search ──
  const filteredSections = enrollmentSections.filter((s) =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()),
  );

  // ── Sort ──
  const sortedSections = [...filteredSections].sort((a, b) => {
    if (sortBy === "status") {
      const order = { active: 0, paused: 1, completed: 2 };
      const diff = (order[a.enrollment.status] ?? 3) - (order[b.enrollment.status] ?? 3);
      if (diff !== 0) return diff;
    }
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "recent") return b.latestTs.getTime() - a.latestTs.getTime();
    return 0;
  });

  const toggleCollapse = (key: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });

  if (allEnrollments.length === 0 && campaignGroups.size === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Workflow className="w-8 h-8 mb-2 opacity-20" />
        <p className="text-sm">No communication history for this contact.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Header bar ── */}
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold whitespace-nowrap shrink-0">
          Communication Flow
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
            ({allEnrollments.length} workflow{allEnrollments.length !== 1 ? "s" : ""})
          </span>
        </h3>

        <div className="flex-1" />

        {/* Search — fixed width */}
        <div className="relative w-40 shrink-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workflows…"
            className="w-full pl-7 pr-6 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Sort + Pause All */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="relative">
            <ArrowUpDown className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="pl-6 pr-2 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
            >
              <option value="status">Status</option>
              <option value="name">Name</option>
              <option value="recent">Recent</option>
            </select>
          </div>

          {!contactOptedOut && activeCount > 0 && (
            <button
              onClick={() => setShowPauseModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-amber-300 text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors whitespace-nowrap"
            >
              <Pause className="w-2.5 h-2.5" /> Pause All
            </button>
          )}
        </div>
      </div>

      {/* Overdue banner */}
      {overdueEnrollments.length > 0 && (
        <div className="flex items-center gap-2.5 px-3 py-2 bg-amber-50 border border-amber-300 rounded-lg">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <p className="text-xs text-amber-800 flex-1">
            {overdueEnrollments.length} workflow{overdueEnrollments.length > 1 ? "s" : ""} — resume due
          </p>
          <button
            onClick={() => overdueEnrollments.forEach((e) => handleSetEnrollmentStatus(e.id, "active"))}
            className="px-2.5 py-1 text-xs font-medium bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
          >
            Resume All
          </button>
        </div>
      )}

      {/* ── Enrollment sections ── */}
      <div className="space-y-2">
        {sortedSections.length === 0 && search && (
          <p className="text-xs text-muted-foreground py-6 text-center">No workflows match "{search}".</p>
        )}

        {sortedSections.map(({ enrollment, workflow, name, comms }) => {
          const isPaused = enrollment.status === "paused";
          const isCompleted = enrollment.status === "completed";
          const isCollapsed = collapsed.has(enrollment.id);
          const unreadCount = comms.filter((c) => c.unread).length;
          const { stepLabel, stepName, totalSteps, pct } = workflow
            ? getStepInfo(enrollment, workflow)
            : { stepLabel: "—", stepName: "—", totalSteps: 0, pct: 0 };

          return (
            <div
              key={enrollment.id}
              className={`border rounded-xl overflow-hidden ${
                isPaused && enrollment.pausedUntil && new Date(enrollment.pausedUntil) <= now
                  ? "border-amber-300"
                  : "border-border"
              }`}
            >
              {/* Workflow header row */}
              <div className="flex items-center gap-2.5 px-3 py-2.5 bg-card">
                {/* Collapse toggle */}
                <button
                  onClick={() => toggleCollapse(enrollment.id)}
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isCollapsed
                    ? <ChevronRight className="w-3.5 h-3.5" />
                    : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {/* Status dot */}
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  isCompleted ? "bg-gray-400" : isPaused ? "bg-amber-400" : "bg-green-500"
                }`} />

                {/* Workflow name + badges */}
                <button
                  onClick={() => toggleCollapse(enrollment.id)}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-semibold truncate">{name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
                      isCompleted ? "bg-gray-100 text-gray-600"
                        : isPaused ? "bg-amber-100 text-amber-700"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {isCompleted ? "Completed" : isPaused ? "Paused" : "Active"}
                    </span>
                    {unreadCount > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700 shrink-0">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {stepLabel}{stepName !== "—" ? ` · ${stepName}` : ""}
                    {totalSteps > 0 && <span className="text-muted-foreground/60"> ({totalSteps} steps)</span>}
                    {comms.length > 0 && <span className="ml-2">· {comms.length} message{comms.length !== 1 ? "s" : ""}</span>}
                  </div>
                </button>

                {/* Actions */}
                <div className="flex items-center gap-0.5 shrink-0">
                  {!isCompleted && (
                    <button
                      disabled={contactOptedOut}
                      onClick={() => handleSetEnrollmentStatus(enrollment.id, isPaused ? "active" : "paused")}
                      title={isPaused ? "Resume" : "Pause"}
                      className={`p-1.5 rounded-md transition-colors ${
                        contactOptedOut ? "opacity-40 cursor-not-allowed text-muted-foreground"
                          : isPaused ? "text-green-600 hover:bg-green-50"
                          : "text-amber-500 hover:bg-amber-50"
                      }`}
                    >
                      {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  {workflow && (
                    <button
                      onClick={() => navigate(`/email-workflows/flows/${workflow.id}/board`, {
                        state: { openContactId: contactId, openEnrollmentId: enrollment.id },
                      })}
                      title="Open workflow board"
                      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bar (always visible) */}
              {totalSteps > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 border-t border-border/40">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground shrink-0 tabular-nums">
                    {stepLabel}
                  </span>
                </div>
              )}

              {/* Comms thread (collapsible) */}
              {!isCollapsed && (
                <div className="divide-y divide-border/50">
                  {comms.length === 0 ? (
                    <div className="px-10 py-3 text-xs text-muted-foreground italic">No messages yet.</div>
                  ) : (
                    comms.map((item) => {
                      const Icon = COMM_ICON[item.kind];
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center gap-2.5 pl-9 pr-3 py-2.5 ${item.unread ? "bg-blue-50/40" : "bg-background"}`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${COMM_ICON_CLASS[item.kind]}`}>
                            <Icon className="w-3 h-3" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-medium">{item.label}</span>
                              {item.unread && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                            </div>
                            {item.detail && (
                              <div className="text-xs text-muted-foreground truncate">{item.detail}</div>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                            {formatDate(item.ts)}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Campaign / unattached comms */}
        {!search && [...campaignGroups.entries()].map(([sourceKey, items]) => {
          const isCollapsed = collapsed.has(`__${sourceKey}`);
          const unreadCount = items.filter((i) => i.unread).length;
          const latestItem = items[0];
          const Icon = COMM_ICON[latestItem.kind];

          return (
            <div key={sourceKey} className="border border-border rounded-xl overflow-hidden">
              <div className="flex items-center gap-2.5 px-3 py-2.5 bg-card">
                <button
                  onClick={() => toggleCollapse(`__${sourceKey}`)}
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-muted">
                  <Icon className="w-3 h-3 text-muted-foreground" />
                </div>
                <button
                  onClick={() => toggleCollapse(`__${sourceKey}`)}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold truncate">{sourceKey}</span>
                    {unreadCount > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700 shrink-0">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {items.length} message{items.length !== 1 ? "s" : ""}
                  </div>
                </button>
              </div>
              {!isCollapsed && (
                <div className="divide-y divide-border/50">
                  {items.map((item) => {
                    const ItemIcon = COMM_ICON[item.kind];
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-2.5 pl-9 pr-3 py-2.5 ${item.unread ? "bg-blue-50/40" : "bg-background"}`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${COMM_ICON_CLASS[item.kind]}`}>
                          <ItemIcon className="w-3 h-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium">{item.label}</span>
                          {item.detail && (
                            <div className="text-xs text-muted-foreground truncate">{item.detail}</div>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                          {formatDate(item.ts)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <PauseAllCommsModal
        isOpen={showPauseModal}
        contactName=""
        activeEnrollmentCount={activeCount}
        onConfirm={(pausedUntil, reason) => {
          handlePauseAllEnrollments(contactId, pausedUntil, reason);
          setShowPauseModal(false);
        }}
        onClose={() => setShowPauseModal(false)}
      />
    </div>
  );
}
