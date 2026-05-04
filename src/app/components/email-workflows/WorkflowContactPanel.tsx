import type React from "react";
import { useMemo, useState } from "react";
import { Mail, MessageCircle, Phone, CheckCircle2, Clock, X, Pause, Play, SkipForward, ChevronDown, ChevronRight, User, MapPin, Ban } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useAppData } from "../../contexts/AppDataContext";
import type { ContactActivityRecord } from "../../types";
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
  const { contacts, workflowEnrollments, workflows, contactActivity, handleSetEnrollmentStatus, handleSkipStep, handleUnskipStep } = useAppData();
  const [activeTab, setActiveTab] = useState<TabId>("steps");
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [selectedStepIds, setSelectedStepIds] = useState<Set<string>>(new Set());

  const contact = contactId ? contacts.find((c) => c.id === contactId) : null;
  const enrollment = enrollmentId ? workflowEnrollments.find((e) => e.id === enrollmentId) : null;
  const workflow = workflows.find((w) => w.id === workflowId);

  const sortedSteps = useMemo(
    () => [...(workflow?.steps ?? [])].sort((a, b) => a.dayOffset - b.dayOffset),
    [workflow],
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
    (step) => enrollment.stepProgress.find((p) => p.stepId === step.id)?.status === "pending",
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
    selectedStepIds.forEach((stepId) => handleSkipStep(enrollment.id, stepId));
    toast.success(`${selectedStepIds.size} step${selectedStepIds.size > 1 ? "s" : ""} skipped`);
    setSelectedStepIds(new Set());
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="w-[1200px] p-0 gap-0 flex flex-col" style={{ height: "85vh" }}>
        {/* Header — full width */}
        <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-semibold">Contact in Flow</DialogTitle>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
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

                    {sortedSteps.map((step, idx) => {
                      const progress = enrollment.stepProgress.find((p) => p.stepId === step.id);
                      const status = progress?.status ?? "pending";
                      const isCurrentStep = idx === firstPendingIdx;
                      const isSkipped = status === "skipped";
                      const isDone = status === "done";
                      const isPending = status === "pending";
                      const isFuture = isPending && idx > firstPendingIdx;
                      const canSkip = isPending && !isCompleted;
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

                      return (
                        <div key={step.id} className={`relative flex gap-3 mb-2 ${isSkipped ? "opacity-60" : ""}`}>
                          <div className="flex flex-col items-center shrink-0 pt-2">
                            {timelineNode}
                          </div>

                          <div className={`flex-1 min-w-0 rounded-lg border transition-all mb-1 ${
                            isCurrentStep
                              ? "border-primary/50 bg-primary/5 shadow-sm"
                              : isSkipped
                              ? "border-dashed border-gray-200 bg-muted/20"
                              : isSelected
                              ? "border-primary/30 bg-primary/5"
                              : isDone
                              ? "border-green-100 bg-green-50/30"
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
                                isSkipped ? "bg-gray-100 text-gray-300" : STEP_ICON_BG[step.actionType] ?? "bg-muted text-muted-foreground"
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
                                <span className={`text-[11px] shrink-0 ${isSkipped ? "text-muted-foreground/50" : "text-muted-foreground"}`}>
                                  Day {step.dayOffset}
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
                                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-green-100 text-green-700 whitespace-nowrap">
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
                                    onClick={() => { handleSkipStep(enrollment.id, step.id); toast.success(`"${step.name}" skipped`); }}
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
                                    onClick={() => { handleUnskipStep(enrollment.id, step.id); toast.success(`"${step.name}" restored`); }}
                                    className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                  >
                                    <SkipForward className="h-3 w-3 rotate-180" />
                                    Unskip
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
                  handleSetEnrollmentStatus(enrollment.id, next);
                  toast.success(next === "paused" ? "Contact paused in flow" : "Contact resumed in flow");
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
