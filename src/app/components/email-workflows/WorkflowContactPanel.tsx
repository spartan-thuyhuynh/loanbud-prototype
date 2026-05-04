import type React from "react";
import { useMemo, useState } from "react";
import { Mail, MessageCircle, Phone, CheckCircle2, Clock, X, Pause, Play, SkipForward, ChevronDown, ChevronRight, User, MapPin, Ban, Check, Plus, Trash2, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { useAppData } from "../../contexts/AppDataContext";
import type { ContactActivityRecord, CustomWorkflowStep } from "../../types";
import { mergeSteps } from "../../lib/workflowUtils";
import { toast } from "sonner";

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

function formatDate(date: Date | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
}

function formatDateTime(date: Date | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(date));
}

const STEP_ICON: Record<string, React.ReactNode> = {
  email: <Mail className="h-3.5 w-3.5" />,
  sms: <MessageCircle className="h-3.5 w-3.5" />,
  "call-reminder": <Phone className="h-3.5 w-3.5" />,
};

const STEP_ICON_BG: Record<string, string> = {
  email: "bg-blue-100 text-blue-600",
  sms: "bg-violet-100 text-violet-600",
  "call-reminder": "bg-amber-100 text-amber-600",
};

const EVENT_TYPE_LABEL: Record<string, string> = {
  email_sent: "Email Sent",
  sms_sent: "SMS Sent",
  task_completed: "Task Completed",
  step_skipped: "Step Skipped",
  step_unskipped: "Step Unskipped",
  enrollment_paused: "Flow Paused",
  enrollment_resumed: "Flow Resumed",
  custom_step_added: "Custom Step Added",
  custom_step_removed: "Custom Step Removed",
  contact_moved_to_step: "Moved to Step",
};

function getDetail(entry: ContactActivityRecord): React.ReactNode {
  if (entry.type === "email_sent") {
    return entry.subject
      ? <><span className="font-semibold">Subject</span> — {entry.subject}{entry.stepName ? ` · ${entry.stepName}` : ""}</>
      : entry.stepName ?? "—";
  }
  if (entry.type === "sms_sent") {
    return entry.message
      ? <><span className="font-semibold">Message</span> — {entry.message.slice(0, 80)}{entry.message.length > 80 ? "…" : ""}{entry.stepName ? ` · ${entry.stepName}` : ""}</>
      : entry.stepName ?? "—";
  }
  if (entry.type === "task_completed") {
    const parts: string[] = [];
    if (entry.taskType) parts.push(entry.taskType);
    if (entry.disposition) parts.push(entry.disposition);
    if (entry.stepName) parts.push(entry.stepName);
    return parts.join(" · ") || "—";
  }
  if (entry.type === "step_skipped" || entry.type === "step_unskipped") {
    return entry.stepName
      ? <><span className="font-semibold">Step</span> — {entry.stepName}</>
      : "—";
  }
  if (entry.type === "enrollment_paused" || entry.type === "enrollment_resumed") {
    return entry.type === "enrollment_paused" ? "Contact paused in this flow" : "Contact resumed in this flow";
  }
  if (entry.type === "custom_step_added" || entry.type === "custom_step_removed") {
    return entry.stepName
      ? <><span className="font-semibold">Step</span> — {entry.stepName}</>
      : "—";
  }
  if (entry.type === "contact_moved_to_step") {
    return entry.stepName
      ? <><span className="font-semibold">Target</span> — {entry.stepName}</>
      : "—";
  }
  return "—";
}

interface WorkflowContactPanelProps {
  open: boolean;
  contactId: string | null;
  enrollmentId: string | null;
  workflowId: string;
  onClose: () => void;
}

type TabId = "steps" | "history";

export function WorkflowContactPanel({ open, contactId, enrollmentId, workflowId, onClose }: WorkflowContactPanelProps) {
  const { contacts, workflowEnrollments, workflows, contactActivity, handleSetEnrollmentStatus, handleSkipStep, handleUnskipStep, handleCustomizeDelay, handleMoveToStep, handleAddCustomStep, handleRemoveCustomStep } = useAppData();
  const [activeTab, setActiveTab] = useState<TabId>("steps");
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [selectedStepIds, setSelectedStepIds] = useState<Set<string>>(new Set());

  // Edit mode: unlocks per-contact journey editing controls
  const [isEditing, setIsEditing] = useState(false);

  // Shared confirmation dialog
  const [confirm, setConfirm] = useState<{ title: string; description: string; onConfirm: () => void } | null>(null);
  const askConfirm = (title: string, description: string, onConfirm: () => void) =>
    setConfirm({ title, description, onConfirm });

  // Per-delay draft state: stepId → pending days value
  const [delayDrafts, setDelayDrafts] = useState<Record<string, number>>({});

  // Inline insert form: tracks which stepId the "+" was clicked after (undefined = form closed)
  const [activeInsertPoint, setActiveInsertPoint] = useState<string | null | undefined>(undefined);
  const [addStepDraft, setAddStepDraft] = useState<{
    name: string;
    actionType: "email" | "sms" | "call-reminder";
    subject: string;
    body: string;
    message: string;
    note: string;
  }>({ name: "", actionType: "email", subject: "", body: "", message: "", note: "" });

  const resetInsertForm = () => {
    setActiveInsertPoint(undefined);
    setAddStepDraft({ name: "", actionType: "email", subject: "", body: "", message: "", note: "" });
  };

  const exitEditMode = () => {
    setIsEditing(false);
    resetInsertForm();
    setDelayDrafts({});
  };

  const contact = contactId ? contacts.find((c) => c.id === contactId) : null;
  const enrollment = enrollmentId ? workflowEnrollments.find((e) => e.id === enrollmentId) : null;
  const workflow = workflows.find((w) => w.id === workflowId);

  const sortedSteps = useMemo(
    () => mergeSteps(workflow?.steps ?? [], enrollment?.customSteps),
    [workflow, enrollment?.customSteps],
  );

  const actionSteps = useMemo(
    () => sortedSteps.filter((s) => s.actionType !== "delay"),
    [sortedSteps],
  );

  const flowActivity = useMemo(() => {
    if (!contactId || !workflow) return [];
    return [...contactActivity]
      .filter(
        (a) =>
          a.contactId === contactId &&
          a.sourceType === "flow" &&
          a.source === workflow.name,
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [contactActivity, contactId, workflow]);

  if (!open || !contact || !enrollment || !workflow) return null;

  const avatarClass = USER_TYPE_AVATAR[contact.userType] ?? "bg-gray-100 text-gray-700";
  const isPaused = enrollment.status === "paused";
  const isCompleted = enrollment.status === "completed";

  const enrollmentStatusStyle =
    enrollment.status === "active"
      ? "bg-green-100 text-green-700 border border-green-200"
      : enrollment.status === "completed"
      ? "bg-gray-100 text-gray-600 border border-gray-200"
      : "bg-yellow-100 text-yellow-700 border border-yellow-200";

  const firstPendingIdx = sortedSteps.findIndex(
    (step) =>
      step.actionType !== "delay" &&
      enrollment.stepProgress.find((p) => p.stepId === step.id)?.status === "pending",
  );

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: "steps", label: "Step Progress" },
    { id: "history", label: "Activity Log", count: flowActivity.length },
  ];

  const toggleSelect = (stepId: string) => {
    setSelectedStepIds((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) { next.delete(stepId); } else { next.add(stepId); }
      return next;
    });
  };

  const handleBulkSkip = () => {
    askConfirm(
      `Skip ${selectedStepIds.size} step${selectedStepIds.size > 1 ? "s" : ""}?`,
      "These steps will be marked as skipped and cannot be automatically undone in bulk.",
      () => {
        selectedStepIds.forEach((stepId) => handleSkipStep(enrollment.id, stepId));
        toast.success(`${selectedStepIds.size} step${selectedStepIds.size > 1 ? "s" : ""} skipped`);
        setSelectedStepIds(new Set());
      },
    );
  };

  return (
    <>
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="w-[1200px] p-0 gap-0 flex flex-col" style={{ height: "85vh" }}>
        {/* Header — full width */}
        <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-base font-semibold">Contact in Flow</DialogTitle>
              {isEditing && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
                  Editing Journey
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isCompleted && (
                isEditing ? (
                  <button
                    onClick={exitEditMode}
                    className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md bg-violet-600 text-white hover:bg-violet-700 transition-colors"
                  >
                    <Check className="h-3 w-3" />
                    Done Editing
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit Journey
                  </button>
                )
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* Body: left content + right sidebar */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* LEFT — tabs + scrollable content */}
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden border-r border-border">
            {/* Sticky tab bar */}
            <div className="sticky top-0 z-10 border-b border-border bg-background px-6 flex items-center gap-0 shrink-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-1 py-3 mr-6 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      activeTab === tab.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Scrollable tab content */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
              {/* Step Progress tab */}
              {activeTab === "steps" && (
                <div className="space-y-2">
                  {/* Bulk skip toolbar */}
                  {selectedStepIds.size > 0 && (
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/60 border border-border mb-3">
                      <span className="text-xs text-muted-foreground">
                        {selectedStepIds.size} step{selectedStepIds.size > 1 ? "s" : ""} selected
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedStepIds(new Set())}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                        <button
                          onClick={handleBulkSkip}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          <SkipForward className="h-3 w-3" />
                          Skip {selectedStepIds.size} step{selectedStepIds.size > 1 ? "s" : ""}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Timeline wrapper */}
                  <div className="relative">
                    <div className="absolute left-[35px] top-5 bottom-5 w-px bg-border" />

                    {sortedSteps.flatMap((step, idx) => {
                      const isLastStep = idx === sortedSteps.length - 1;
                      const showInsertZone = !isCompleted && !isLastStep && isEditing;
                      if (step.actionType === "delay") {
                        const delayProgress = enrollment.stepProgress.find((p) => p.stepId === step.id);
                        const savedDays = delayProgress?.customDelayDays ?? step.delayDays ?? 1;
                        const draftDays = delayDrafts[step.id] ?? savedDays;
                        const hasDraft = draftDays !== savedDays;
                        const stepElement = (
                          <div key={step.id} className="relative flex items-center gap-3 my-1 pl-[44px]">
                            <div className="flex-1 flex items-center gap-2">
                              <div className="h-px flex-1 bg-border" />
                              <div className="flex flex-col items-center gap-1 shrink-0">
                                <div className="flex items-center gap-1.5 bg-muted/50 border border-border rounded-full px-2.5 py-1">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-[11px] font-medium text-muted-foreground">Wait</span>
                                  {isEditing ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => setDelayDrafts((d) => ({ ...d, [step.id]: Math.max(1, draftDays - 1) }))}
                                        className="w-4 h-4 flex items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-xs font-bold leading-none"
                                      >
                                        −
                                      </button>
                                      <span className={`text-[11px] font-bold min-w-[14px] text-center ${hasDraft ? "text-primary" : "text-foreground"}`}>{draftDays}</span>
                                      <button
                                        type="button"
                                        onClick={() => setDelayDrafts((d) => ({ ...d, [step.id]: draftDays + 1 }))}
                                        className="w-4 h-4 flex items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-xs font-bold leading-none"
                                      >
                                        +
                                      </button>
                                    </>
                                  ) : (
                                    <span className="text-[11px] font-bold min-w-[14px] text-center text-foreground">{savedDays}</span>
                                  )}
                                  <span className="text-[11px] text-muted-foreground">{draftDays === 1 ? "day" : "days"}</span>
                                </div>
                                {hasDraft && (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => askConfirm(
                                        "Apply delay change?",
                                        `Set wait to ${draftDays} day${draftDays !== 1 ? "s" : ""} for this contact only.`,
                                        () => {
                                          handleCustomizeDelay(enrollment.id, step.id, draftDays);
                                          setDelayDrafts((d) => { const n = { ...d }; delete n[step.id]; return n; });
                                          toast.success(`Delay updated to ${draftDays} day${draftDays !== 1 ? "s" : ""}`);
                                        },
                                      )}
                                      className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                    >
                                      <Check className="h-2.5 w-2.5" /> Apply
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDelayDrafts((d) => { const n = { ...d }; delete n[step.id]; return n; })}
                                      className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                      Discard
                                    </button>
                                  </div>
                                )}
                              </div>
                              <div className="h-px flex-1 bg-border" />
                            </div>
                          </div>
                        );
                        return [stepElement, showInsertZone && activeInsertPoint === step.id ? (
                          <div key={`ins-${step.id}`} className="ml-[52px] my-1 rounded-lg border border-violet-200 bg-violet-50/40 p-4 space-y-3 z-10 relative">
                            <p className="text-xs font-semibold text-violet-700">New custom step</p>
                            <div className="flex items-center gap-2">
                              {(["email", "sms", "call-reminder"] as const).map((t) => (
                                <button key={t} type="button" onClick={() => setAddStepDraft((d) => ({ ...d, actionType: t }))} className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${addStepDraft.actionType === t ? "border-violet-400 bg-violet-100 text-violet-700" : "border-border bg-background text-muted-foreground hover:bg-muted"}`}>
                                  {STEP_ICON[t]} {t === "call-reminder" ? "Call" : t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                              ))}
                            </div>
                            <input autoFocus type="text" placeholder="Step name" value={addStepDraft.name} onChange={(e) => setAddStepDraft((d) => ({ ...d, name: e.target.value }))} className="w-full text-xs border border-border rounded-md px-2.5 py-1.5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                            {addStepDraft.actionType === "email" && (<><input type="text" placeholder="Subject" value={addStepDraft.subject} onChange={(e) => setAddStepDraft((d) => ({ ...d, subject: e.target.value }))} className="w-full text-xs border border-border rounded-md px-2.5 py-1.5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" /><textarea placeholder="Body" value={addStepDraft.body} onChange={(e) => setAddStepDraft((d) => ({ ...d, body: e.target.value }))} rows={3} className="w-full text-xs border border-border rounded-md px-2.5 py-1.5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none" /></>)}
                            {addStepDraft.actionType === "sms" && <textarea placeholder="Message" value={addStepDraft.message} onChange={(e) => setAddStepDraft((d) => ({ ...d, message: e.target.value }))} rows={3} className="w-full text-xs border border-border rounded-md px-2.5 py-1.5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none" />}
                            {addStepDraft.actionType === "call-reminder" && <input type="text" placeholder="Note" value={addStepDraft.note} onChange={(e) => setAddStepDraft((d) => ({ ...d, note: e.target.value }))} className="w-full text-xs border border-border rounded-md px-2.5 py-1.5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />}
                            <div className="flex items-center gap-2 pt-1">
                              <button type="button" disabled={!addStepDraft.name.trim()} onClick={() => { if (!addStepDraft.name.trim()) return; handleAddCustomStep(enrollment.id, { name: addStepDraft.name.trim(), actionType: addStepDraft.actionType, ...(addStepDraft.actionType === "email" && { subject: addStepDraft.subject, body: addStepDraft.body }), ...(addStepDraft.actionType === "sms" && { message: addStepDraft.message }), ...(addStepDraft.actionType === "call-reminder" && { note: addStepDraft.note }) }, step.id); toast.success(`Custom step "${addStepDraft.name.trim()}" added`); resetInsertForm(); }} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-violet-600 text-white hover:bg-violet-700 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"><Plus className="h-3 w-3" /> Add Step</button>
                              <button type="button" onClick={resetInsertForm} className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Cancel</button>
                            </div>
                          </div>
                        ) : showInsertZone ? (
                          <div key={`ins-${step.id}`} className="group relative h-5 flex items-center -my-0.5 z-10">
                            <div className="absolute left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setActiveInsertPoint(step.id)} className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-violet-50 border border-violet-200 text-violet-600 hover:bg-violet-100 shadow-sm whitespace-nowrap cursor-pointer"><Plus className="h-2.5 w-2.5" /> Add step</button>
                            </div>
                          </div>
                        ) : null];
                      }
                      const progress = enrollment.stepProgress.find((p) => p.stepId === step.id);
                      const status = progress?.status ?? "pending";
                      const isCurrentStep = idx === firstPendingIdx;
                      const isSkipped = status === "skipped";
                      const isDone = status === "done";
                      const isPending = status === "pending";
                      const isFuture = isPending && idx > firstPendingIdx;
                      const canSkip = isPending && !isCompleted && step.actionType !== "delay";
                      const isExpanded = expandedSteps.has(step.id);
                      const isSelected = selectedStepIds.has(step.id);

                      const hasDetail = !!(
                        step.subject || step.body || step.templateName ||
                        step.message || step.smsTemplateName ||
                        step.note || step.senderIdentity || step.reminderDaysBefore
                      );

                      const timelineNode = isDone ? (
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0 z-10 ring-2 ring-background">
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                      ) : isSkipped ? (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 z-10 ring-2 ring-background">
                          <Ban className="h-4 w-4 text-gray-400" />
                        </div>
                      ) : isCurrentStep ? (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 z-10 ring-2 ring-primary/30 ring-offset-1">
                          <MapPin className="h-4 w-4 text-primary-foreground" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-background border-2 border-border flex items-center justify-center shrink-0 z-10">
                          <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                        </div>
                      );

                      const isCustom = !!(step as CustomWorkflowStep).isCustom;

                      const stepElement = (
                        <div key={step.id} className={`relative flex gap-3 mb-2 ${isSkipped ? "opacity-60" : ""}`}>
                          <div className="flex flex-col items-center shrink-0 pt-2">
                            {timelineNode}
                          </div>

                          <div className={`flex-1 min-w-0 rounded-lg border transition-all mb-1 ${
                            isCurrentStep
                              ? "border-primary/50 bg-primary/5 shadow-sm"
                              : isSkipped
                              ? "border-dashed border-gray-200 bg-muted/20"
                              : isCustom
                              ? "border-dashed border-violet-300 bg-violet-50/40"
                              : isSelected
                              ? "border-primary/30 bg-primary/5"
                              : isDone
                              ? "border-border bg-muted/20"
                              : "border-border bg-card"
                          }`}>
                            <div className="flex items-center gap-2 px-3 py-2.5">
                              {canSkip ? (
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelect(step.id)}
                                  className="h-3.5 w-3.5 rounded border-gray-300 text-primary accent-primary cursor-pointer shrink-0"
                                />
                              ) : (
                                <div className="w-3.5 shrink-0" />
                              )}

                              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                isSkipped ? "bg-gray-100 text-gray-300" : isCustom ? "bg-violet-100 text-violet-600" : STEP_ICON_BG[step.actionType] ?? "bg-muted text-muted-foreground"
                              }`}>
                                {STEP_ICON[step.actionType]}
                              </div>

                              <button
                                onClick={() => {
                                  if (!hasDetail) return;
                                  setExpandedSteps((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(step.id)) { next.delete(step.id); } else { next.add(step.id); }
                                    return next;
                                  });
                                }}
                                disabled={!hasDetail}
                                className={`flex-1 min-w-0 flex items-center gap-2 text-left ${hasDetail ? "cursor-pointer" : "cursor-default"}`}
                              >
                                <span className={`text-sm font-medium truncate ${
                                  isSkipped ? "text-muted-foreground/60 line-through" : "text-foreground"
                                }`}>
                                  {step.name}
                                </span>
                                {isCustom && (
                                  <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-medium border border-violet-300 text-violet-600 bg-violet-50">
                                    Custom
                                  </span>
                                )}
                                <span className={`text-[11px] shrink-0 ${isSkipped ? "text-muted-foreground/50" : "text-muted-foreground"}`}>
                                  {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
                                    new Date(new Date(enrollment.startDate).getTime() + step.dayOffset * 86_400_000)
                                  )}
                                </span>
                                {hasDetail && !isSkipped && (
                                  isExpanded
                                    ? <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                                    : <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                                )}
                              </button>

                              <div className="flex items-center gap-2 shrink-0">
                                {isCurrentStep && (
                                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-primary text-primary-foreground whitespace-nowrap">
                                    <MapPin className="h-2.5 w-2.5" />
                                    Current
                                  </span>
                                )}
                                {isDone && (
                                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-muted text-muted-foreground whitespace-nowrap">
                                    <CheckCircle2 className="h-2.5 w-2.5" />
                                    Done{progress?.completedAt ? ` · ${formatDate(progress.completedAt)}` : ""}
                                  </span>
                                )}
                                {isSkipped && (
                                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-gray-100 text-gray-400 whitespace-nowrap">
                                    <Ban className="h-2.5 w-2.5" />
                                    Skipped
                                  </span>
                                )}
                                {isPending && !isCurrentStep && (
                                  <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-muted text-muted-foreground whitespace-nowrap">
                                    Upcoming
                                  </span>
                                )}
                                {isCurrentStep && !isDone && !isSkipped && (
                                  <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-700 whitespace-nowrap">
                                    Pending
                                  </span>
                                )}

                                {canSkip && !isSelected && (
                                  <button
                                    onClick={() => askConfirm(
                                      `Skip "${step.name}"?`,
                                      "This step will be marked as skipped. You can unskip it later.",
                                      () => { handleSkipStep(enrollment.id, step.id); toast.success(`"${step.name}" skipped`); },
                                    )}
                                    className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                                      isFuture
                                        ? "border-gray-200 text-muted-foreground hover:text-foreground hover:bg-muted"
                                        : "border-orange-200 text-orange-600 hover:bg-orange-50"
                                    }`}
                                  >
                                    <SkipForward className="h-3 w-3" />
                                    {isFuture ? "Mark Skip" : "Skip"}
                                  </button>
                                )}

                                {isSkipped && (
                                  <button
                                    onClick={() => askConfirm(
                                      `Restore "${step.name}"?`,
                                      "This step will be marked as pending again.",
                                      () => { handleUnskipStep(enrollment.id, step.id); toast.success(`"${step.name}" restored`); },
                                    )}
                                    className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                  >
                                    <SkipForward className="h-3 w-3 rotate-180" />
                                    Unskip
                                  </button>
                                )}

                                {isCustom && (
                                  <button
                                    onClick={() => askConfirm(
                                      `Remove "${step.name}"?`,
                                      "This custom step will be permanently removed from this contact's journey.",
                                      () => { handleRemoveCustomStep(enrollment.id, step.id); toast.success(`"${step.name}" removed`); },
                                    )}
                                    className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    Remove
                                  </button>
                                )}
                              </div>
                            </div>

                            {isExpanded && hasDetail && !isSkipped && (
                              <div className="mx-3 mb-3 rounded-md border border-border p-3 text-xs space-y-2 bg-muted/40">
                                {step.senderIdentity && (
                                  <div className="flex items-start gap-2">
                                    <User className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                    <span className="text-muted-foreground">From: <span className="text-foreground font-medium">{step.senderIdentity}</span></span>
                                  </div>
                                )}
                                {(step.templateName || step.smsTemplateName) && (
                                  <div className="flex items-start gap-2">
                                    <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                    <span className="text-muted-foreground">Template: <span className="text-foreground font-medium">{step.templateName ?? step.smsTemplateName}</span></span>
                                  </div>
                                )}
                                {step.subject && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-muted-foreground shrink-0 font-medium w-14">Subject:</span>
                                    <span className="text-foreground">{step.subject}</span>
                                  </div>
                                )}
                                {step.message && (
                                  <div className="flex items-start gap-2">
                                    <MessageCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                    <span className="text-foreground">{step.message}</span>
                                  </div>
                                )}
                                {step.body && (
                                  <div className="pt-1 border-t border-border">
                                    <p className="text-muted-foreground mb-1 font-medium">Body:</p>
                                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">{step.body}</p>
                                  </div>
                                )}
                                {step.note && (
                                  <div className="flex items-start gap-2">
                                    <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                    <span className="text-muted-foreground">Note: <span className="text-foreground">{step.note}</span></span>
                                  </div>
                                )}
                                {step.reminderDaysBefore !== undefined && (
                                  <div className="text-muted-foreground">
                                    Reminder <span className="text-foreground font-medium">{step.reminderDaysBefore}</span> day{step.reminderDaysBefore !== 1 ? "s" : ""} before due date
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );

                      // Insert zone between steps (hover "+" connector)
                      const insertZoneKey = `ins-${step.id}`;
                      const insertZone = showInsertZone && (
                        activeInsertPoint === step.id ? (
                          // Expanded inline form at this position
                          <div key={insertZoneKey} className="ml-[52px] my-1 rounded-lg border border-violet-200 bg-violet-50/40 p-4 space-y-3 z-10 relative">
                            <p className="text-xs font-semibold text-violet-700">New custom step</p>
                            <div className="flex items-center gap-2">
                              {(["email", "sms", "call-reminder"] as const).map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setAddStepDraft((d) => ({ ...d, actionType: t }))}
                                  className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                                    addStepDraft.actionType === t
                                      ? "border-violet-400 bg-violet-100 text-violet-700"
                                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                                  }`}
                                >
                                  {STEP_ICON[t]} {t === "call-reminder" ? "Call" : t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                              ))}
                            </div>
                            <input
                              autoFocus
                              type="text"
                              placeholder="Step name"
                              value={addStepDraft.name}
                              onChange={(e) => setAddStepDraft((d) => ({ ...d, name: e.target.value }))}
                              className="w-full text-xs border border-border rounded-md px-2.5 py-1.5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            {addStepDraft.actionType === "email" && (
                              <>
                                <input
                                  type="text"
                                  placeholder="Subject"
                                  value={addStepDraft.subject}
                                  onChange={(e) => setAddStepDraft((d) => ({ ...d, subject: e.target.value }))}
                                  className="w-full text-xs border border-border rounded-md px-2.5 py-1.5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                <textarea
                                  placeholder="Body"
                                  value={addStepDraft.body}
                                  onChange={(e) => setAddStepDraft((d) => ({ ...d, body: e.target.value }))}
                                  rows={3}
                                  className="w-full text-xs border border-border rounded-md px-2.5 py-1.5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                                />
                              </>
                            )}
                            {addStepDraft.actionType === "sms" && (
                              <textarea
                                placeholder="Message"
                                value={addStepDraft.message}
                                onChange={(e) => setAddStepDraft((d) => ({ ...d, message: e.target.value }))}
                                rows={3}
                                className="w-full text-xs border border-border rounded-md px-2.5 py-1.5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                              />
                            )}
                            {addStepDraft.actionType === "call-reminder" && (
                              <input
                                type="text"
                                placeholder="Note"
                                value={addStepDraft.note}
                                onChange={(e) => setAddStepDraft((d) => ({ ...d, note: e.target.value }))}
                                className="w-full text-xs border border-border rounded-md px-2.5 py-1.5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                            )}
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                disabled={!addStepDraft.name.trim()}
                                onClick={() => {
                                  if (!addStepDraft.name.trim()) return;
                                  handleAddCustomStep(
                                    enrollment.id,
                                    {
                                      name: addStepDraft.name.trim(),
                                      actionType: addStepDraft.actionType,
                                      ...(addStepDraft.actionType === "email" && { subject: addStepDraft.subject, body: addStepDraft.body }),
                                      ...(addStepDraft.actionType === "sms" && { message: addStepDraft.message }),
                                      ...(addStepDraft.actionType === "call-reminder" && { note: addStepDraft.note }),
                                    },
                                    step.id,
                                  );
                                  toast.success(`Custom step "${addStepDraft.name.trim()}" added`);
                                  resetInsertForm();
                                }}
                                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-violet-600 text-white hover:bg-violet-700 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <Plus className="h-3 w-3" /> Add Step
                              </button>
                              <button type="button" onClick={resetInsertForm} className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Thin hover strip with "+" button
                          <div key={insertZoneKey} className="group relative h-5 flex items-center -my-0.5 z-10">
                            <div className="absolute left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setActiveInsertPoint(step.id)}
                                className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-violet-50 border border-violet-200 text-violet-600 hover:bg-violet-100 shadow-sm whitespace-nowrap cursor-pointer"
                              >
                                <Plus className="h-2.5 w-2.5" /> Add step
                              </button>
                            </div>
                          </div>
                        )
                      );

                      return [stepElement, insertZone];
                    })}
                  </div>
                </div>
              )}

              {/* Activity Log tab */}
              {activeTab === "history" && (
                flowActivity.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
                    <Clock className="h-10 w-10 opacity-25" />
                    <p className="text-sm">No activity logged for this contact in this flow yet.</p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#b8d4b8] text-foreground">
                          {["Changed at", "Changed by", "Event Type", "Detail"].map((col) => (
                            <th key={col} className="px-4 py-3 text-left text-xs font-semibold border-r border-[#a0c4a0] last:border-r-0">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border bg-card">
                        {flowActivity.map((entry) => (
                          <tr key={entry.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                              {formatDateTime(entry.timestamp)}
                            </td>
                            <td className="px-4 py-3 text-xs text-foreground whitespace-nowrap">
                              {entry.assignee ?? "—"}
                            </td>
                            <td className="px-4 py-3 text-xs text-foreground whitespace-nowrap">
                              {EVENT_TYPE_LABEL[entry.type] ?? entry.type}
                            </td>
                            <td className="px-4 py-3 text-xs text-foreground">
                              {getDetail(entry)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </div>
          </div>

          {/* RIGHT — contact info sidebar */}
          <div className="w-72 shrink-0 overflow-y-auto px-5 py-5 space-y-5 bg-muted/10">
            {/* Avatar + name + type badge */}
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${avatarClass}`}>
                {getInitials(contact.firstName, contact.lastName)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-foreground">
                    {contact.firstName} {contact.lastName}
                  </span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${avatarClass}`}>
                  {contact.userType}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Email + phone */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Contact</p>
              <p className="text-xs text-foreground break-all">{contact.email}</p>
              {contact.phone && <p className="text-xs text-foreground">{contact.phone}</p>}
            </div>

            {/* Listing + status */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Listing</p>
              <p className="text-xs text-foreground">{contact.listingName || "—"}</p>
              <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-medium ${LISTING_STATUS_STYLES[contact.listingStatus] ?? "bg-gray-100 text-gray-600"}`}>
                {contact.listingStatus}
              </span>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Enrollment status + date */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Enrollment</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${enrollmentStatusStyle}`}>
                {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
              </span>
              <p className="text-xs text-muted-foreground">Enrolled {formatDate(enrollment.startDate)}</p>
            </div>

            {/* Pause / Resume */}
            {!isCompleted && (
              <button
                onClick={() => {
                  const next = isPaused ? "active" : "paused";
                  askConfirm(
                    isPaused ? "Resume contact?" : "Pause contact?",
                    isPaused
                      ? "The contact will be re-enrolled and continue from their current step."
                      : "The contact will be paused. No steps will advance until resumed.",
                    () => {
                      handleSetEnrollmentStatus(enrollment.id, next);
                      toast.success(next === "paused" ? "Contact paused in flow" : "Contact resumed in flow");
                    },
                  );
                }}
                className={`w-full flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-md border transition-colors cursor-pointer ${
                  isPaused
                    ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                    : "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                }`}
              >
                {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                {isPaused ? "Resume" : "Pause"}
              </button>
            )}

            {/* Move to step */}
            {!isCompleted && isEditing && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Move to step</p>
                <select
                  defaultValue=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    const targetStep = val === "completed" ? null : actionSteps.find((s) => s.id === val);
                    const label = targetStep ? targetStep.name : "Completed";
                    askConfirm(
                      `Move contact to "${label}"?`,
                      "Steps before this will be marked done; steps after will be reset to pending.",
                      () => {
                        handleMoveToStep(enrollment.id, val as string);
                        toast.success(`Contact moved to "${label}"`);
                      },
                    );
                    e.target.value = "";
                  }}
                  className="w-full text-xs border border-border rounded-md px-2 py-1.5 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="">Select a step…</option>
                  {actionSteps.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                  <option value="completed">— Mark completed —</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <AlertDialog open={confirm !== null} onOpenChange={(v) => { if (!v) setConfirm(null); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{confirm?.title}</AlertDialogTitle>
          <AlertDialogDescription>{confirm?.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setConfirm(null)}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              confirm?.onConfirm();
              setConfirm(null);
            }}
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
