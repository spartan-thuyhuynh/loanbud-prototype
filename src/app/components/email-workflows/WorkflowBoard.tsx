import { useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { ArrowLeft, LayoutGrid, List, Check, Search, Edit, Mail, MessageCircle, Phone, ClipboardPlus } from "lucide-react";
import { toast } from "sonner";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useAppData } from "../../contexts/AppDataContext";
import type { Contact, WorkflowEnrollment, WorkflowStep } from "../../types";

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

function StepsTimeline({ steps }: { steps: WorkflowStep[] }) {
  const sorted = [...steps].sort((a, b) => a.dayOffset - b.dayOffset);
  if (sorted.length === 0) return null;


  return (
    <div className="border-b border-border bg-background px-6 py-4 overflow-x-auto">
      <div className="flex items-center gap-1 min-w-max">
        {sorted.map((step, idx) => {
          const cfg = STEP_TYPE_CONFIG[step.actionType] ?? {
            icon: null,
            iconBg: "bg-muted",
            iconColor: "text-muted-foreground",
            dayBg: "bg-muted",
            dayColor: "text-muted-foreground",
          };
          return (
            <div key={step.id} className="flex items-center gap-1">
              <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 border border-border bg-card">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.iconBg} ${cfg.iconColor}`}>
                  {cfg.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold leading-tight text-foreground">{step.name}</span>
                  <span className="text-[10px] font-medium leading-tight text-muted-foreground">
                    Day {step.dayOffset}
                  </span>
                </div>
              </div>
              {idx < sorted.length - 1 && (
                <div className="w-6 flex items-center justify-center">
                  <div className="h-px w-4 bg-border" />
                  <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[5px] border-l-border" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── ContactCard (kanban) ────────────────────────────────────────────────────

// All step types show an actionable button
const MANUAL_ACTION_CONFIG: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  email: {
    label: "Mark Sent",
    icon: <Mail className="h-3 w-3" />,
    className: "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200",
  },
  sms: {
    label: "Mark Sent",
    icon: <MessageCircle className="h-3 w-3" />,
    className: "bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200",
  },
  "call-reminder": {
    label: "Log Call",
    icon: <Phone className="h-3 w-3" />,
    className: "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200",
  },
};


function ContactCard({
  contact,
  enrollmentId,
  columnId,
  currentStep,
  onAdvance,
  onCreateTask,
}: {
  contact: Contact;
  enrollmentId: string;
  columnId: string;
  currentStep: WorkflowStep | null;
  onAdvance: (() => void) | null;
  onCreateTask: () => void;
}) {
  const avatarClass = USER_TYPE_AVATAR[contact.userType] ?? "bg-gray-100 text-gray-700";

  const [{ isDragging }, dragRef] = useDrag<DragItem, unknown, { isDragging: boolean }>({
    type: CARD_DRAG_TYPE,
    item: { enrollmentId, currentColumnId: columnId },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const manualCfg = currentStep ? (MANUAL_ACTION_CONFIG[currentStep.actionType] ?? null) : null;

  return (
    <div
      ref={dragRef}
      className={`rounded-lg border border-border bg-card p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing${isDragging ? " opacity-40" : ""}`}
    >
      <div className="flex items-start gap-2.5 mb-2.5">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${avatarClass}`}>
          {getInitials(contact.firstName, contact.lastName)}
        </div>
        <div className="flex-1 min-w-0">
          <Link
            to={`/crm/contacts/${contact.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-sm font-medium text-foreground hover:text-primary hover:underline truncate block mb-0.5"
          >
            {contact.firstName} {contact.lastName}
          </Link>
          <p className="text-xs text-muted-foreground truncate">{contact.email}</p>
          {contact.phone && (
            <p className="text-xs text-muted-foreground truncate">{contact.phone}</p>
          )}
        </div>
      </div>
      <div className="border-t border-border pt-2 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground truncate">
            <span className="font-medium text-foreground">Listing:</span> {contact.listingName || "—"}
          </p>
          <span className={`flex-shrink-0 inline-block text-xs px-1.5 py-0.5 rounded font-medium ${LISTING_STATUS_STYLES[contact.listingStatus] ?? "bg-gray-100 text-gray-600"}`}>
            {contact.listingStatus}
          </span>
        </div>
        {manualCfg && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              {manualCfg && onAdvance && (
                <button
                  onClick={(e) => { e.stopPropagation(); onAdvance(); }}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md transition-colors cursor-pointer ${manualCfg.className}`}
                >
                  {manualCfg.icon}
                  {manualCfg.label}
                </button>
              )}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onCreateTask(); }}
              title="Create task"
              className="flex-shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <ClipboardPlus className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
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
  handleAdvance,
  handleCreateTask,
}: {
  colId: string;
  label: string;
  colEnrollments: WorkflowEnrollment[];
  contacts: Contact[];
  currentStep: WorkflowStep | null;
  handleDrop: (enrollmentId: string, targetStepId: string) => void;
  handleAdvance: (enrollmentId: string, stepId: string) => void;
  handleCreateTask: (contactId: string, contactName: string) => void;
}) {
  const [{ isOver, canDrop }, dropRef] = useDrop<DragItem, unknown, { isOver: boolean; canDrop: boolean }>({
    accept: CARD_DRAG_TYPE,
    canDrop: (item) => item.currentColumnId !== colId,
    drop: (item) => handleDrop(item.enrollmentId, colId),
    collect: (monitor) => ({ isOver: monitor.isOver(), canDrop: monitor.canDrop() }),
  });

  const isActive = isOver && canDrop;

  return (
    <div className="w-72 flex-shrink-0 flex flex-col bg-muted/40 border border-border rounded-xl">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide truncate">
            {label}
          </h3>
          {currentStep && (currentStep.actionType === "email" || currentStep.actionType === "sms") && (
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
          return (
            <ContactCard
              key={enrollment.id}
              contact={contact}
              enrollmentId={enrollment.id}
              columnId={colId}
              currentStep={currentStep}
              onAdvance={currentStep ? () => handleAdvance(enrollment.id, currentStep.id) : null}
              onCreateTask={() => handleCreateTask(contact.id, `${contact.firstName} ${contact.lastName}`)}
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
  const { workflows, workflowEnrollments, contacts, segments, handleActivateWorkflow, handleAdvanceStep, handleMoveToStep, handleCreateTask, handleUpdateWorkflow } = useAppData();

  const [viewMode, setViewMode] = useState<ViewMode>("kanban");

  // List view filters
  const [listSearch, setListSearch] = useState("");
  const [listStepFilter, setListStepFilter] = useState<string>("all");
  const [listStatusFilter, setListStatusFilter] = useState<string>("all");

  const workflow = workflows.find((wf) => wf.id === id);
  const myEnrollments = workflowEnrollments.filter((e) => e.workflowId === id);
  const sortedSteps = useMemo(
    () => [...(workflow?.steps ?? [])].sort((a, b) => a.dayOffset - b.dayOffset),
    [workflow],
  );

  const segment = segments.find((s) => s.id === workflow?.segmentId);



  // Map enrollment → column (first pending step, or "completed")
  const getContactColumn = (enrollment: WorkflowEnrollment): string => {
    const firstPending = sortedSteps.find(
      (step) => enrollment.stepProgress.find((p) => p.stepId === step.id)?.status === "pending",
    );
    return firstPending?.id ?? "completed";
  };

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
        const firstPending = sortedSteps.find(
          (step) => enrollment.stepProgress.find((p) => p.stepId === step.id)?.status === "pending",
        );
        const colStepId = firstPending?.id ?? "completed";
        const currentStep = sortedSteps.find((s) => s.id === colStepId) ?? null;
        return { enrollment, contact, currentStep, colStepId };
      })
      .filter(({ contact, colStepId, enrollment }) => {
        if (listSearch) {
          const q = listSearch.toLowerCase();
          const name = contact ? `${contact.firstName} ${contact.lastName}`.toLowerCase() : "";
          const email = contact?.email.toLowerCase() ?? "";
          if (!name.includes(q) && !email.includes(q)) return false;
        }
        if (listStepFilter !== "all" && colStepId !== listStepFilter) return false;
        if (listStatusFilter !== "all" && enrollment.status !== listStatusFilter) return false;
        return true;
      });
  }, [myEnrollments, contacts, sortedSteps, listSearch, listStepFilter, listStatusFilter]);

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
      {/* Sticky header */}
      <div className="border-b border-border bg-card px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/email-workflows/flows")}
            className="p-1.5 rounded hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <h2 className="text-xl font-semibold text-foreground">{workflow.name}</h2>
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
          {segment && (
            <span className="text-xs text-muted-foreground hidden sm:block">
              Segment: <span className="font-medium">{segment.name}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-md border border-input overflow-hidden">
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
          <Button size="sm" onClick={() => navigate(`/email-workflows/flows/${workflow.id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Flow
          </Button>
        </div>
      </div>

      {/* Steps timeline */}
      <StepsTimeline steps={sortedSteps} />

      {/* Body */}
      {emptyState ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-muted-foreground">
          <p className="text-lg font-medium text-foreground">No contacts enrolled yet</p>
          <p className="text-sm">Contacts matching this flow's segment will appear here once enrolled.</p>
        </div>
      ) : viewMode === "kanban" ? (
        /* ── Kanban view ─────────────────────────────────────────────────── */
        <DndProvider backend={HTML5Backend}>
          <div className="flex-1 overflow-x-auto">
            <div
              className="flex gap-4 p-6 min-h-full items-start"
              style={{ minWidth: `${(sortedSteps.length + 1) * 288}px` }}
            >
              {[...sortedSteps.map((s) => ({ id: s.id, label: `Day ${s.dayOffset} — ${ACTION_TYPE_DISPLAY[s.actionType] ?? s.actionType}`, step: s as WorkflowStep })), { id: "completed", label: "Completed", step: null as WorkflowStep | null }].map(
                ({ id: colId, label, step }) => {
                  const colEnrollments = myEnrollments.filter(
                    (e) => getContactColumn(e) === colId,
                  );
                  return (
                    <KanbanColumn
                      key={colId}
                      colId={colId}
                      label={label}
                      colEnrollments={colEnrollments}
                      contacts={contacts}
                      currentStep={step}
                      handleDrop={handleDrop}
                      handleAdvance={handleAdvance}
                      handleCreateTask={handleTask}
                    />
                  );
                },
              )}
            </div>
          </div>
        </DndProvider>
      ) : (
        /* ── List view ───────────────────────────────────────────────────── */
        <div className="flex-1 overflow-auto flex flex-col">
          {/* Filters */}
          <div className="px-8 py-3 border-b border-border bg-card flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                placeholder="Search contacts..."
                className="pl-8"
              />
            </div>
            <select
              value={listStepFilter}
              onChange={(e) => setListStepFilter(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Steps</option>
              {sortedSteps.map((s) => (
                <option key={s.id} value={s.id}>
                  Day {s.dayOffset} — {ACTION_TYPE_DISPLAY[s.actionType] ?? s.actionType}
                </option>
              ))}
              <option value="completed">Completed</option>
            </select>
            <select
              value={listStatusFilter}
              onChange={(e) => setListStatusFilter(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
            </select>
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
                      <tr key={enrollment.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-5 py-3">
                          {currentStep && colStepId !== "completed" ? (
                            <button
                              onClick={() => handleAdvance(enrollment.id, currentStep.id)}
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
                                <Link
                                  to={`/crm/contacts/${contact.id}`}
                                  className="font-medium text-foreground hover:text-primary hover:underline"
                                >
                                  {contact.firstName} {contact.lastName}
                                </Link>
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
