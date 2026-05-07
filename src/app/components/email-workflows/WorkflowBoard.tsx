import { useState, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { ArrowLeft, LayoutGrid, List, Check, Search, Edit, Mail, MessageCircle, Phone, ClipboardPlus, Clock, AlertTriangle, CheckCircle2, Zap, SkipForward, PauseCircle, X, ChevronDown, Square } from "lucide-react";
import { WorkflowContactPanel } from "./WorkflowContactPanel";
import { toast } from "sonner";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "../ui/dialog";
import { useAppData } from "../../contexts/AppDataContext";
import type { Contact, WorkflowEnrollment, WorkflowStep } from "../../types";
import { CURRENT_USER } from "../../config/featureFlags";

const CARD_DRAG_TYPE = "WORKFLOW_CONTACT_CARD";

interface DragItem {
  enrollmentId: string;
  currentColumnId: string;
}

// ── helpers ────────────────────────────────────────────────────────────────

const ACTION_LABELS: Record<string, string> = {
  email: "Mark Sent",
  sms: "Mark Sent",
  "call-reminder": "Log Call",
};

const ACTION_TYPE_DISPLAY: Record<string, string> = {
  email: "Email",
  sms: "SMS",
  "call-reminder": "Call Reminder",
};

const USER_TYPE_AVATAR: Record<string, string> = {
  Broker: "bg-blue-100 text-blue-700",
  Lender: "bg-purple-100 text-purple-700",
  Partner: "bg-green-100 text-green-700",
};

const LISTING_STATUS_STYLES: Record<string, string> = {
  New: "bg-sky-100 text-sky-700",
  Draft: "bg-gray-100 text-gray-600",
  Submitted: "bg-indigo-100 text-indigo-700",
  "On Hold": "bg-yellow-100 text-yellow-700",
  Declined: "bg-red-100 text-red-700",
};

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function getScheduleGroup(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 86_400_000);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  if (d < today) return "Overdue";
  if (d.getTime() === today.getTime()) return "Today";
  if (d.getTime() === tomorrow.getTime()) return "Tomorrow";
  return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

// ── Steps Timeline ─────────────────────────────────────────────────────────

const STEP_TYPE_CONFIG: Record<string, { icon: React.ReactNode; iconBg: string; iconColor: string; dayBg: string; dayColor: string }> = {
  email: {
    icon: <Mail className="h-3.5 w-3.5" />,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    dayBg: "bg-blue-50",
    dayColor: "text-blue-600",
  },
  sms: {
    icon: <MessageCircle className="h-3.5 w-3.5" />,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    dayBg: "bg-violet-50",
    dayColor: "text-violet-600",
  },
  "call-reminder": {
    icon: <Phone className="h-3.5 w-3.5" />,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    dayBg: "bg-amber-50",
    dayColor: "text-amber-600",
  },
};

function StepsTimeline({ steps, enrollmentStats }: {
  steps: WorkflowStep[];
  enrollmentStats: { total: number; active: number; completed: number; paused: number };
}) {
  const [expanded, setExpanded] = useState(false);
  const sorted = [...steps].sort((a, b) => a.order - b.order);
  if (sorted.length === 0) return null;

  const actionSteps = sorted.filter((s) => s.actionType !== "delay");
  const delaySteps = sorted.filter((s) => s.actionType === "delay");
  const totalDays = delaySteps.reduce((sum, s) => sum + (s.delayDays ?? 0), 0);
  const completionRate = enrollmentStats.total > 0
    ? Math.round((enrollmentStats.completed / enrollmentStats.total) * 100)
    : 0;

  const typeCount = actionSteps.reduce<Record<string, number>>((acc, s) => {
    acc[s.actionType] = (acc[s.actionType] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="border-b border-border bg-background">
      {/* Compact summary bar */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-4 px-6 py-2.5 hover:bg-muted/40 transition-colors text-left"
      >
        {/* Flow shape */}
        <span className="text-xs font-medium text-muted-foreground">{actionSteps.length} steps</span>
        <span className="text-muted-foreground/30 text-xs">·</span>
        <span className="text-xs text-muted-foreground">{totalDays}d total</span>
        <span className="text-muted-foreground/30 text-xs">·</span>
        <div className="flex items-center gap-1.5">
          {Object.entries(typeCount).map(([type, count]) => {
            const cfg = STEP_TYPE_CONFIG[type];
            if (!cfg) return null;
            return (
              <span key={type} className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${cfg.iconBg} ${cfg.iconColor}`}>
                {cfg.icon}
                {count}
              </span>
            );
          })}
        </div>

        {/* Divider */}
        <div className="h-4 w-px bg-border mx-1" />

        {/* Health stats */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{enrollmentStats.total}</span> enrolled
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-green-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            <span className="font-semibold">{enrollmentStats.active}</span> active
          </span>
          {enrollmentStats.paused > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-amber-700">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              <span className="font-semibold">{enrollmentStats.paused}</span> paused
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
            <span className="font-semibold">{enrollmentStats.completed}</span> completed
          </span>
          {enrollmentStats.total > 0 && (
            <span className="text-xs font-semibold text-primary">{completionRate}% done</span>
          )}
        </div>

        <ChevronDown className={`ml-auto h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
      </button>

      {/* Expanded full timeline */}
      {expanded && (
        <div className="px-6 pb-4 overflow-x-auto border-t border-border/60">
          <div className="flex items-end gap-0 min-w-max pt-3">
            {sorted.map((step) => {
              if (step.actionType === "delay") {
                return (
                  <div key={step.id} className="flex flex-col items-center gap-0.5 self-end mb-[22px]">
                    <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 whitespace-nowrap">
                      +{step.delayDays}d wait
                    </span>
                    <div className="flex items-center w-16">
                      <div className="h-px flex-1 bg-amber-300" />
                      <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[5px] border-l-amber-300" />
                    </div>
                  </div>
                );
              }
              const cfg = STEP_TYPE_CONFIG[step.actionType] ?? {
                icon: null,
                iconBg: "bg-muted",
                iconColor: "text-muted-foreground",
              };
              return (
                <div key={step.id} className="w-48 flex flex-col items-center">
                  <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 border border-border bg-card w-full">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.iconBg} ${cfg.iconColor}`}>
                      {cfg.icon}
                    </div>
                    <span className="text-xs font-semibold leading-tight text-foreground">{step.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── ContactCard (kanban) ────────────────────────────────────────────────────



function ContactCard({
  contact,
  enrollmentId,
  columnId,
  currentStep,
  scheduledDate,
  onCreateTask,
  onCardClick,
}: {
  contact: Contact;
  enrollmentId: string;
  columnId: string;
  currentStep: WorkflowStep | null;
  scheduledDate: Date | null;
  onCreateTask: () => void;
  onCardClick: () => void;
}) {
  const avatarClass = USER_TYPE_AVATAR[contact.userType] ?? "bg-gray-100 text-gray-700";
  const isCompleted = columnId === "completed";

  const [{ isDragging }, dragRef] = useDrag<DragItem, unknown, { isDragging: boolean }>({
    type: CARD_DRAG_TYPE,
    item: { enrollmentId, currentColumnId: columnId },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const isAutoStep = currentStep?.actionType === "email" || currentStep?.actionType === "sms";
  const isCallReminder = currentStep?.actionType === "call-reminder";
  const dueStr = scheduledDate && !isCompleted ? fmtDate(scheduledDate) : null;
  const cantSend = isAutoStep && contact.optedOut;

  const accentClass = isCompleted
    ? "border-l-green-300"
    : currentStep?.actionType === "email"
      ? "border-l-blue-300"
      : currentStep?.actionType === "sms"
        ? "border-l-violet-300"
        : currentStep?.actionType === "call-reminder"
          ? "border-l-amber-300"
          : "border-l-border";

  return (
    <div
      ref={dragRef}
      onClick={onCardClick}
      className={`rounded-lg border border-border border-l-2 ${accentClass} bg-card p-3 shadow-sm hover:shadow-md transition-all cursor-pointer active:cursor-grabbing${isDragging ? " opacity-40" : ""}`}
    >
      {/* Header: avatar + name/email */}
      <div className="flex items-start gap-2.5">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5 ${avatarClass}`}>
          {getInitials(contact.firstName, contact.lastName)}
        </div>
        <div className="flex-1 min-w-0">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onCardClick(); }}
            className="text-sm font-semibold text-foreground hover:text-primary hover:underline truncate block text-left w-full leading-tight"
          >
            {contact.firstName} {contact.lastName}
          </button>
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">{contact.email}</p>
          {contact.listingName && (
            <div className="flex items-center gap-1.5 mt-1">
              <p className="text-[11px] text-muted-foreground truncate">{contact.listingName}</p>
              <span className={`flex-shrink-0 inline-block text-[10px] px-1.5 py-0.5 rounded font-medium leading-none ${LISTING_STATUS_STYLES[contact.listingStatus] ?? "bg-gray-100 text-gray-600"}`}>
                {contact.listingStatus}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer: due date chip + action */}
      <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
          {/* Due date chip */}
          {dueStr && (
            <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              Due {dueStr}
            </span>
          )}
          {isCompleted && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded bg-green-50 text-green-600">
              <Check className="h-2.5 w-2.5" /> Done
            </span>
          )}
          {isCallReminder && !isCompleted && (
            <span className="text-[10px] text-muted-foreground truncate">
              {CURRENT_USER}
            </span>
          )}
          {/* Auto status chips */}
          {isAutoStep && cantSend && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-100">
              <AlertTriangle className="h-2.5 w-2.5" />
              Can't Send
            </span>
          )}
          {isAutoStep && !cantSend && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-50 text-slate-500 border border-slate-100">
              <Clock className="h-2.5 w-2.5" />
              Scheduled
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onCreateTask(); }}
            title="Create task"
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <ClipboardPlus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── KanbanColumn ───────────────────────────────────────────────────────────

function KanbanColumn({
  colId,
  label,
  colEnrollments,
  contacts,
  currentStep,
  handleDrop,
  handleCreateTask,
  handleCardClick,
}: {
  colId: string;
  label: string;
  colEnrollments: WorkflowEnrollment[];
  contacts: Contact[];
  currentStep: WorkflowStep | null;
  handleDrop: (enrollmentId: string, targetStepId: string) => void;
  handleCreateTask: (contactId: string, contactName: string) => void;
  handleCardClick: (contactId: string, enrollmentId: string) => void;
}) {
  const [{ isOver, canDrop }, dropRef] = useDrop<DragItem, unknown, { isOver: boolean; canDrop: boolean }>({
    accept: CARD_DRAG_TYPE,
    canDrop: (item) => item.currentColumnId !== colId,
    drop: (item) => handleDrop(item.enrollmentId, colId),
    collect: (monitor) => ({ isOver: monitor.isOver(), canDrop: monitor.canDrop() }),
  });

  const isActive = isOver && canDrop;
  const isAutoStep = currentStep && (currentStep.actionType === "email" || currentStep.actionType === "sms");

  return (
    <div className="w-72 flex-shrink-0 flex flex-col bg-muted/40 border border-border rounded-xl">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide truncate">
            {label}
          </h3>
          {isAutoStep && (
            <span className="flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 leading-none uppercase tracking-wide">
              Auto
            </span>
          )}
        </div>
        <span className="ml-2 flex-shrink-0 text-xs font-medium bg-muted text-muted-foreground rounded-full px-2 py-0.5">
          {colEnrollments.length}
        </span>
      </div>
      <div
        ref={dropRef}
        className={`flex flex-col gap-2 flex-1 min-h-[120px] px-3 pb-3 rounded-b-xl transition-colors ${
          isActive ? "bg-primary/5 border-t border-dashed border-primary/40" : ""
        }`}
      >
        {colEnrollments.map((enrollment) => {
          const contact = contacts.find((c) => c.id === enrollment.contactId);
          if (!contact) return null;
          const scheduledDate = currentStep
            ? new Date(enrollment.startDate.getTime() + currentStep.dayOffset * 86_400_000)
            : null;
          return (
            <ContactCard
              key={enrollment.id}
              contact={contact}
              enrollmentId={enrollment.id}
              columnId={colId}
              currentStep={currentStep}
              scheduledDate={scheduledDate}
              onCreateTask={() => handleCreateTask(contact.id, `${contact.firstName} ${contact.lastName}`)}
              onCardClick={() => handleCardClick(contact.id, enrollment.id)}
            />
          );
        })}
        {colEnrollments.length === 0 && (
          <div className={`rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground ${isActive ? "border-primary/40 text-primary/60" : "border-border"}`}>
            {isActive ? "Drop here" : "No contacts"}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Board ─────────────────────────────────────────────────────────────

type ViewMode = "kanban" | "list";

export function WorkflowBoard() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { workflows, workflowEnrollments, contacts, segments, handleActivateWorkflow, handleAdvanceStep, handleMoveToStep, handleCreateTask, handleUpdateWorkflow, handleSkipStep, handleSetEnrollmentStatus, handleBulkSkipSteps, handleBulkSetEnrollmentStatus } = useAppData();

  const navState = location.state as { openContactId?: string; openEnrollmentId?: string } | null;

  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [selectedContactId, setSelectedContactId] = useState<string | null>(navState?.openContactId ?? null);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string | null>(navState?.openEnrollmentId ?? null);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [showAutomationsModal, setShowAutomationsModal] = useState(false);
  const [automationSearch, setAutomationSearch] = useState("");
  const [selectedAutomationKeys, setSelectedAutomationKeys] = useState<Set<string>>(new Set());

  // Shared filters (synced across kanban & list)
  const [search, setSearch] = useState("");
  const [stepFilter, setStepFilter] = useState<string>("all");

  // List-only filter
  const [listStatusFilter, setListStatusFilter] = useState<string>("all");

  const workflow = workflows.find((wf) => wf.id === id);
  const myEnrollments = workflowEnrollments.filter((e) => e.workflowId === id);
  const sortedSteps = useMemo(
    () => [...(workflow?.steps ?? [])].sort((a, b) => a.order - b.order),
    [workflow],
  );
  const actionSteps = useMemo(
    () => sortedSteps.filter((s) => s.actionType !== "delay"),
    [sortedSteps],
  );

  const segment = segments.find((s) => s.id === workflow?.segmentId);

  // Map enrollment → column (first pending action step, or "completed")
  const getContactColumn = (enrollment: WorkflowEnrollment): string => {
    const firstPending = actionSteps.find(
      (step) => enrollment.stepProgress.find((p) => p.stepId === step.id)?.status === "pending",
    );
    return firstPending?.id ?? "completed";
  };

  const completedCount = useMemo(
    () => myEnrollments.filter((e) => {
      const firstPending = actionSteps.find(
        (step) => e.stepProgress.find((p) => p.stepId === step.id)?.status === "pending",
      );
      return firstPending === undefined;
    }).length,
    [myEnrollments, actionSteps],
  );

  const enrollmentStats = useMemo(() => ({
    total: myEnrollments.length,
    active: myEnrollments.filter((e) => e.status === "active").length,
    paused: myEnrollments.filter((e) => e.status === "paused").length,
    completed: completedCount,
  }), [myEnrollments, completedCount]);

  const handleAdvance = (enrollmentId: string, stepId: string) => {
    handleAdvanceStep(enrollmentId, stepId);
    toast.success("Step completed");
  };

  const handleDrop = (enrollmentId: string, targetStepId: string) => {
    handleMoveToStep(enrollmentId, targetStepId);
    toast.success("Contact moved");
  };

  const handleTask = (contactId: string, contactName: string) => {
    handleCreateTask({
      contactId,
      contactName,
      taskType: "Follow-up",
      dueDate: new Date(),
      objective: "",
    });
    toast.success(`Task created for ${contactName}`);
  };

  // ── List view data (must be before any conditional returns) ────────────
  const listRows = useMemo(() => {
    return myEnrollments
      .map((enrollment) => {
        const contact = contacts.find((c) => c.id === enrollment.contactId);
        const firstPending = actionSteps.find(
          (step) => enrollment.stepProgress.find((p) => p.stepId === step.id)?.status === "pending",
        );
        const colStepId = firstPending?.id ?? "completed";
        const currentStep = actionSteps.find((s) => s.id === colStepId) ?? null;
        return { enrollment, contact, currentStep, colStepId };
      })
      .filter(({ contact, colStepId, enrollment }) => {
        if (search) {
          const q = search.toLowerCase();
          const name = contact ? `${contact.firstName} ${contact.lastName}`.toLowerCase() : "";
          const email = contact?.email.toLowerCase() ?? "";
          if (!name.includes(q) && !email.includes(q)) return false;
        }
        if (stepFilter !== "all" && colStepId !== stepFilter) return false;
        if (listStatusFilter !== "all" && enrollment.status !== listStatusFilter) return false;
        return true;
      });
  }, [myEnrollments, contacts, actionSteps, search, stepFilter, listStatusFilter]);

  const completedRows = useMemo(() => {
    return myEnrollments
      .filter((e) => {
        const firstPending = actionSteps.find(
          (step) => e.stepProgress.find((p) => p.stepId === step.id)?.status === "pending",
        );
        return firstPending === undefined;
      })
      .map((enrollment) => {
        const contact = contacts.find((c) => c.id === enrollment.contactId);
        return { enrollment, contact };
      });
  }, [myEnrollments, contacts, actionSteps]);

  const upcomingAutomations = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const items = myEnrollments
      .filter((e) => e.status === "active")
      .map((enrollment) => {
        const contact = contacts.find((c) => c.id === enrollment.contactId);
        const firstPending = actionSteps.find(
          (step) => enrollment.stepProgress.find((p) => p.stepId === step.id)?.status === "pending",
        );
        if (!firstPending || (firstPending.actionType !== "email" && firstPending.actionType !== "sms")) return null;
        const scheduledDate = new Date(enrollment.startDate.getTime() + firstPending.dayOffset * 86_400_000);
        return { enrollment, contact, step: firstPending, scheduledDate };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);

    const upcoming = items
      .filter((r) => r.scheduledDate >= todayStart)
      .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());
    const overdue = items
      .filter((r) => r.scheduledDate < todayStart)
      .sort((a, b) => b.scheduledDate.getTime() - a.scheduledDate.getTime());

    return [...upcoming, ...overdue];
  }, [myEnrollments, contacts, actionSteps]);

  if (!workflow) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Workflow not found.
      </div>
    );
  }

  const emptyState = myEnrollments.length === 0;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Completed contacts modal */}
      <Dialog open={showCompletedModal} onOpenChange={setShowCompletedModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Completed Contacts ({completedCount})</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto flex-1 mt-2">
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 border-b border-border">
                  <tr>
                    {["Contact", "Enrollment Status", "Start Date"].map((col) => (
                      <th key={col} className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {completedRows.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-5 py-8 text-center text-muted-foreground text-sm">
                        No completed contacts yet.
                      </td>
                    </tr>
                  ) : (
                    completedRows.map(({ enrollment, contact }) => (
                      <tr
                        key={enrollment.id}
                        onClick={() => {
                          if (contact) {
                            setSelectedContactId(contact.id);
                            setSelectedEnrollmentId(enrollment.id);
                            setShowCompletedModal(false);
                          }
                        }}
                        className="hover:bg-muted/10 transition-colors cursor-pointer"
                      >
                        <td className="px-5 py-3">
                          {contact ? (
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${USER_TYPE_AVATAR[contact.userType] ?? "bg-gray-100 text-gray-700"}`}>
                                {getInitials(contact.firstName, contact.lastName)}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{contact.firstName} {contact.lastName}</p>
                                <p className="text-xs text-muted-foreground">{contact.email}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">Unknown contact</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                            <Check className="h-3 w-3" /> Completed
                          </span>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground text-xs">
                          {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(enrollment.startDate)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upcoming automations modal */}
      <Dialog open={showAutomationsModal} onOpenChange={(open) => { setShowAutomationsModal(open); if (!open) { setAutomationSearch(""); setSelectedAutomationKeys(new Set()); } }}>
        <DialogContent className="max-w-3xl h-[80vh] overflow-hidden flex flex-col">
          {/* X close button */}
          <DialogClose className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground">
            <X className="h-4 w-4" />
          </DialogClose>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Upcoming Automations ({upcomingAutomations.length})
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground -mt-1">Sorted by nearest schedule. Skip a step or pause the enrollment to stop delivery.</p>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={automationSearch}
              onChange={(e) => { setAutomationSearch(e.target.value); setSelectedAutomationKeys(new Set()); }}
              placeholder="Search by contact name or email..."
              className="w-full pl-8 pr-3 py-2 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {(() => {
            const filtered = automationSearch
              ? upcomingAutomations.filter(({ contact }) => {
                  const q = automationSearch.toLowerCase();
                  const name = contact ? `${contact.firstName} ${contact.lastName}`.toLowerCase() : "";
                  return name.includes(q) || (contact?.email.toLowerCase().includes(q) ?? false);
                })
              : upcomingAutomations;
            const allRowKeys = filtered.map(({ enrollment, step }) => `${enrollment.id}::${step.id}`);
            const allSelected = allRowKeys.length > 0 && allRowKeys.every((k) => selectedAutomationKeys.has(k));
            const someSelected = allRowKeys.some((k) => selectedAutomationKeys.has(k));
            const toggleAll = () => {
              if (allSelected) {
                setSelectedAutomationKeys(new Set());
              } else {
                setSelectedAutomationKeys(new Set(allRowKeys));
              }
            };
            const toggleRow = (key: string) => {
              setSelectedAutomationKeys((prev) => {
                const next = new Set(prev);
                if (next.has(key)) next.delete(key); else next.add(key);
                return next;
              });
            };
            return (
              <>
                {selectedAutomationKeys.size > 0 && (
                  <div className="flex items-center gap-3 px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg text-xs">
                    <span className="font-medium text-foreground flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-primary" />
                      {selectedAutomationKeys.size} selected
                    </span>
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        onClick={() => {
                          const items = filtered
                            .filter(({ enrollment, step }) => selectedAutomationKeys.has(`${enrollment.id}::${step.id}`))
                            .map(({ enrollment, step }) => ({ enrollmentId: enrollment.id, stepId: step.id }));
                          handleBulkSkipSteps(items);
                          setSelectedAutomationKeys(new Set());
                          toast.success(`Skipped ${items.length} step${items.length !== 1 ? "s" : ""}`);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded border border-border bg-background hover:bg-muted transition-colors text-muted-foreground"
                      >
                        <SkipForward className="h-3 w-3" />
                        Skip Selected
                      </button>
                      <button
                        onClick={() => {
                          const enrollmentIds = [...new Set(
                            filtered
                              .filter(({ enrollment, step }) => selectedAutomationKeys.has(`${enrollment.id}::${step.id}`))
                              .map(({ enrollment }) => enrollment.id),
                          )];
                          handleBulkSetEnrollmentStatus(enrollmentIds, "paused");
                          setSelectedAutomationKeys(new Set());
                          toast.success(`Paused ${enrollmentIds.length} enrollment${enrollmentIds.length !== 1 ? "s" : ""}`);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded border border-border bg-background hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition-colors text-muted-foreground"
                      >
                        <PauseCircle className="h-3 w-3" />
                        Pause Selected
                      </button>
                      <button
                        onClick={() => setSelectedAutomationKeys(new Set())}
                        className="flex items-center gap-1 px-2.5 py-1 rounded border border-border bg-background hover:bg-muted transition-colors text-muted-foreground"
                      >
                        <X className="h-3 w-3" />
                        Clear
                      </button>
                    </div>
                  </div>
                )}
                <div className="overflow-auto flex-1">
                  {filtered.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground text-sm">No upcoming automated steps.</div>
                  ) : (
                    <div className="rounded-lg border border-border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/40 border-b border-border sticky top-0">
                          <tr>
                            <th className="pl-4 pr-2 py-3 w-8">
                              <button
                                onClick={toggleAll}
                                className="w-4 h-4 rounded border border-border bg-background flex items-center justify-center hover:border-primary transition-colors"
                                title={allSelected ? "Deselect all" : "Select all"}
                              >
                                {allSelected ? (
                                  <Check className="h-2.5 w-2.5 text-primary" />
                                ) : someSelected ? (
                                  <Square className="h-2.5 w-2.5 text-primary fill-primary/30" />
                                ) : null}
                              </button>
                            </th>
                            {["Contact", "Step", "Scheduled", "Actions"].map((col) => (
                              <th key={col} className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-card">
                          {(() => {
                            const groups = new Map<string, typeof upcomingAutomations>();
                            for (const item of filtered) {
                              const label = getScheduleGroup(item.scheduledDate);
                              if (!groups.has(label)) groups.set(label, []);
                              groups.get(label)!.push(item);
                            }
                            return [...groups.entries()].flatMap(([label, groupItems]) => [
                              <tr key={`group-${label}`}>
                                <td colSpan={5} className="px-5 py-2 bg-muted/60 border-y border-border">
                                  <span className={`text-xs font-semibold uppercase tracking-wide ${label === "Today" ? "text-amber-600" : label === "Overdue" ? "text-red-600" : "text-muted-foreground"}`}>
                                    {label}
                                  </span>
                                </td>
                              </tr>,
                              ...groupItems.map(({ enrollment, contact, step, scheduledDate }) => {
                                const rowKey = `${enrollment.id}::${step.id}`;
                                const isSelected = selectedAutomationKeys.has(rowKey);
                                return (
                                  <tr
                                    key={`${enrollment.id}-${step.id}`}
                                    className={`hover:bg-muted/10 transition-colors ${isSelected ? "bg-primary/5" : ""}`}
                                  >
                                    <td className="pl-4 pr-2 py-3 w-8">
                                      <button
                                        onClick={() => toggleRow(rowKey)}
                                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? "border-primary bg-primary" : "border-border bg-background hover:border-primary"}`}
                                        title={isSelected ? "Deselect" : "Select"}
                                      >
                                        {isSelected && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                                      </button>
                                    </td>
                                    <td className="px-5 py-3">
                                      {contact ? (
                                        <div className="flex items-center gap-2">
                                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${USER_TYPE_AVATAR[contact.userType] ?? "bg-gray-100 text-gray-700"}`}>
                                            {getInitials(contact.firstName, contact.lastName)}
                                          </div>
                                          <div>
                                            <p className="font-medium text-foreground text-xs">{contact.firstName} {contact.lastName}</p>
                                            <p className="text-[11px] text-muted-foreground">{contact.email}</p>
                                          </div>
                                        </div>
                                      ) : (
                                        <span className="text-muted-foreground text-xs">Unknown</span>
                                      )}
                                    </td>
                                    <td className="px-5 py-3">
                                      <div className="flex items-center gap-1.5">
                                        {step.actionType === "email" ? (
                                          <Mail className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                                        ) : (
                                          <MessageCircle className="h-3.5 w-3.5 text-violet-500 flex-shrink-0" />
                                        )}
                                        <span className="text-xs text-foreground truncate max-w-[160px]">{step.name}</span>
                                      </div>
                                    </td>
                                    <td className="px-5 py-3 whitespace-nowrap">
                                      <p className="text-xs font-medium text-foreground">{fmtDate(scheduledDate)}</p>
                                      <p className="text-[11px] text-muted-foreground">{fmtTime(scheduledDate)}</p>
                                    </td>
                                    <td className="px-5 py-3">
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => {
                                            handleSkipStep(enrollment.id, step.id);
                                            toast.success(`Step skipped for ${contact?.firstName ?? "contact"}`);
                                          }}
                                          className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-border hover:bg-muted transition-colors text-muted-foreground"
                                          title="Skip this step"
                                        >
                                          <SkipForward className="h-3 w-3" />
                                          Skip
                                        </button>
                                        <button
                                          onClick={() => {
                                            handleSetEnrollmentStatus(enrollment.id, "paused");
                                            toast.success(`Enrollment paused for ${contact?.firstName ?? "contact"}`);
                                          }}
                                          className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-border hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition-colors text-muted-foreground"
                                          title="Pause entire enrollment"
                                        >
                                          <PauseCircle className="h-3 w-3" />
                                          Pause
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              }),
                            ]);
                          })()}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      <WorkflowContactPanel
        open={selectedContactId !== null}
        contactId={selectedContactId}
        enrollmentId={selectedEnrollmentId}
        workflowId={workflow.id}
        onClose={() => { setSelectedContactId(null); setSelectedEnrollmentId(null); }}
      />
      {/* Sticky header */}
      <div className="border-b border-border bg-card px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/email-workflows/flows")}
            className="p-1.5 rounded hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold text-foreground">{workflow.name}</h2>
            {segment && (
              <span className="text-xs text-muted-foreground hidden sm:block">
                Segment: <span className="font-medium">{segment.name}</span>
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (workflow.status !== "active") {
                handleActivateWorkflow(workflow.id);
                toast.success("Flow activated — contacts enrolled");
              } else {
                handleUpdateWorkflow(workflow.id, { status: "paused" });
                toast.success("Flow paused");
              }
            }}
            title={workflow.status === "active" ? "Deactivate flow" : "Activate flow"}
            className="flex items-center gap-2"
          >
            <div className="relative rounded-full transition-colors duration-200 bg-transparent"
              style={{ height: "18px", width: "32px" }}
            >
              <div className={`absolute inset-0 rounded-full transition-colors duration-200 ${workflow.status === "active" ? "bg-green-500" : "bg-gray-300"}`} />
              <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-all duration-200 ${workflow.status === "active" ? "left-[14px]" : "left-0.5"}`} />
            </div>
            <span className={`text-xs font-medium ${workflow.status === "active" ? "text-green-700" : "text-muted-foreground"}`}>
              {workflow.status === "active" ? "Active" : workflow.status === "draft" ? "Draft" : "Paused"}
            </span>
          </button>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/email-workflows/flows/${workflow.id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Flow
          </Button>
        </div>
      </div>

      {/* Steps timeline */}
      <StepsTimeline steps={sortedSteps} enrollmentStats={enrollmentStats} />

      {/* Body */}
      {emptyState ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-muted-foreground">
          <p className="text-lg font-medium text-foreground">No contacts enrolled yet</p>
          <p className="text-sm">Contacts matching this flow's segment will appear here once enrolled.</p>
        </div>
      ) : viewMode === "kanban" ? (
        /* ── Kanban view ─────────────────────────────────────────────────── */
        <DndProvider backend={HTML5Backend}>
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Toolbar row — stays fixed while columns scroll horizontally */}
            <div className="flex items-center gap-3 px-6 pt-4 pb-2 flex-wrap flex-shrink-0">
              {/* View toggle */}
              <div className="flex rounded-md border border-input overflow-hidden flex-shrink-0">
                <button
                  onClick={() => setViewMode("kanban")}
                  className={`px-3 py-1.5 transition-colors ${viewMode === "kanban" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
                  title="Kanban view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1.5 border-l border-input transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
                  title="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
              {/* Search */}
              <div className="relative flex-1 min-w-40 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search contacts..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setShowAutomationsModal(true)}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 transition-colors text-amber-700"
                >
                  <Zap className="h-3.5 w-3.5" />
                  {`Automations (${upcomingAutomations.length})`}
                </button>
                <button
                  onClick={() => setShowCompletedModal(true)}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {`Show Completed (${completedCount})`}
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-x-auto">
            <div
              className="flex gap-4 p-6 min-h-full items-start"
              style={{ minWidth: `${actionSteps.length * 288}px` }}
            >
              {actionSteps.map((s, i) => ({ id: s.id, label: `Step ${i + 1} — ${ACTION_TYPE_DISPLAY[s.actionType] ?? s.actionType}`, step: s as WorkflowStep }))
              .map(({ id: colId, label, step }) => {
                  const colEnrollments = myEnrollments.filter((e) => {
                    if (getContactColumn(e) !== colId) return false;
                    if (search) {
                      const contact = contacts.find((c) => c.id === e.contactId);
                      if (!contact) return false;
                      const q = search.toLowerCase();
                      const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
                      if (!fullName.includes(q) && !contact.email.toLowerCase().includes(q)) return false;
                    }
                    return true;
                  });
                  return (
                    <KanbanColumn
                      key={colId}
                      colId={colId}
                      label={label}
                      colEnrollments={colEnrollments}
                      contacts={contacts}
                      currentStep={step}
                      handleDrop={handleDrop}
                      handleCreateTask={handleTask}
                      handleCardClick={(cId, eId) => { setSelectedContactId(cId); setSelectedEnrollmentId(eId); }}
                    />
                  );
                },
              )}
            </div>
            </div>
          </div>
        </DndProvider>
      ) : (
        /* ── List view ───────────────────────────────────────────────────── */
        <div className="flex-1 overflow-auto flex flex-col">
          {/* Filters */}
          <div className="flex items-center gap-3 px-6 pt-4 pb-3 flex-wrap border-b border-border">
            {/* View toggle */}
            <div className="flex rounded-md border border-input overflow-hidden flex-shrink-0">
              <button
                onClick={() => setViewMode("kanban")}
                className={`px-3 py-1.5 transition-colors ${viewMode === "kanban" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
                title="Kanban view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 border-l border-input transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
                title="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <div className="relative flex-1 min-w-40 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search contacts..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select
              value={stepFilter}
              onChange={(e) => setStepFilter(e.target.value)}
              className="text-xs border border-border rounded-lg bg-background px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 text-muted-foreground"
            >
              <option value="all">All Steps</option>
              {actionSteps.map((s, i) => (
                <option key={s.id} value={s.id}>
                  Step {i + 1} — {ACTION_TYPE_DISPLAY[s.actionType] ?? s.actionType}
                </option>
              ))}
            </select>
            <select
              value={listStatusFilter}
              onChange={(e) => setListStatusFilter(e.target.value)}
              className="text-xs border border-border rounded-lg bg-background px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 text-muted-foreground"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
            </select>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setShowAutomationsModal(true)}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 transition-colors text-amber-700"
              >
                <Zap className="h-3.5 w-3.5" />
                {`Automations (${upcomingAutomations.length})`}
              </button>
              <button
                onClick={() => setShowCompletedModal(true)}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {`Show Completed (${completedCount})`}
              </button>
            </div>
          </div>
          {/* Table */}
          <div className="px-8 py-4 flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto">
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 border-b border-border">
                  <tr>
                    {["Actions", "Contact", "Current Step", "Enrollment Status", "Start Date"].map((col) => (
                      <th key={col} className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {listRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground text-sm">
                        No contacts match the current filters.
                      </td>
                    </tr>
                  ) : (
                    listRows.map(({ enrollment, contact, currentStep, colStepId }) => (
                      <tr
                        key={enrollment.id}
                        onClick={() => contact && (setSelectedContactId(contact.id), setSelectedEnrollmentId(enrollment.id))}
                        className="hover:bg-muted/10 transition-colors cursor-pointer"
                      >
                        <td className="px-5 py-3">
                          {currentStep && colStepId !== "completed" ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleAdvance(enrollment.id, currentStep.id); }}
                              className="text-xs px-2.5 py-1.5 rounded bg-primary/10 text-primary hover:bg-primary/20 font-medium transition-colors"
                            >
                              {ACTION_LABELS[currentStep.actionType] ?? currentStep.actionType}
                            </button>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          {contact ? (
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${USER_TYPE_AVATAR[contact.userType] ?? "bg-gray-100 text-gray-700"}`}>
                                {getInitials(contact.firstName, contact.lastName)}
                              </div>
                              <div>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setSelectedContactId(contact.id); setSelectedEnrollmentId(enrollment.id); }}
                                  className="font-medium text-foreground hover:text-primary hover:underline text-left"
                                >
                                  {contact.firstName} {contact.lastName}
                                </button>
                                <p className="text-xs text-muted-foreground">{contact.email}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">Unknown contact</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-muted-foreground text-xs">
                          {colStepId === "completed" ? (
                            <span className="flex items-center gap-1 text-green-600 font-medium">
                              <Check className="h-3.5 w-3.5" /> Completed
                            </span>
                          ) : currentStep ? (
                            <div className="flex items-center gap-2">
                              <span>{`Day ${currentStep.dayOffset} — ${ACTION_TYPE_DISPLAY[currentStep.actionType] ?? currentStep.actionType}`}</span>
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary leading-none">
                                Day {Math.floor((Date.now() - new Date(enrollment.startDate).getTime()) / 86_400_000)}
                              </span>
                            </div>
                          ) : "—"}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            enrollment.status === "active"
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : enrollment.status === "completed"
                                ? "bg-gray-100 text-gray-600 border border-gray-200"
                                : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                          }`}>
                            {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground text-xs">
                          {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(enrollment.startDate)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
