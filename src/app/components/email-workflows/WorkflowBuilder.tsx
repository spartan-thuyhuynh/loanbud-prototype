import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft, ChevronRight, Check, AlertCircle,
  ArrowUp, ArrowDown, X,
  Search, Users, Clock,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useAppData } from "../../contexts/AppDataContext";
import type { WorkflowStep } from "../../types";
import { computeDayOffsets } from "../../lib/workflowUtils";
import {
  StepTypeIcon, StepConfigFields, SectionLabel, FieldLabel,
  STEP_DEFAULTS, TYPE_OPTIONS, TYPE_ICON_STYLE, TYPE_BADGE_STYLE, TYPE_HOVER_STYLE,
  type ActionType, type StepDraft,
} from "./StepConfigForm";

// ─── Constants ───────────────────────────────────────────────────────────────


const WIZARD_STEPS = ["Choose Segment", "Configure Steps"];

// ─── Step templates ───────────────────────────────────────────────────────────

interface StepTemplate {
  id: string;
  name: string;
  description: string;
  steps: Array<{ name: string; actionType: ActionType; dayOffset: number }>;
}

const STEP_TEMPLATES: StepTemplate[] = [
  {
    id: "14-day-comms",
    name: "Active Sequence",
    description: "11-step sequence over 14 days: email, call, and SMS touchpoints",
    steps: [
      { name: "First Email",        actionType: "email",         dayOffset: 0  },
      { name: "Call Reminder Step", actionType: "call-reminder", dayOffset: 0  },
      { name: "Send SMS Step",      actionType: "sms",           dayOffset: 0  },
      { name: "Send Email Step",    actionType: "email",         dayOffset: 2  },
      { name: "Call Reminder",      actionType: "call-reminder", dayOffset: 3  },
      { name: "Delayed SMS",        actionType: "sms",           dayOffset: 4  },
      { name: "Follow up Email",    actionType: "email",         dayOffset: 6  },
      { name: "Call Reminder",      actionType: "call-reminder", dayOffset: 7  },
      { name: "Send SMS Step",      actionType: "sms",           dayOffset: 9  },
      { name: "Send Email Step",    actionType: "email",         dayOffset: 11 },
      { name: "Final Call",         actionType: "call-reminder", dayOffset: 14 },
    ],
  },
  {
    id: "calls-closed",
    name: "Calls Closed Sequence",
    description: "3-step closing sequence: email, call reminder, then SMS follow-up",
    steps: [
      { name: "Send Email",    actionType: "email",         dayOffset: 0 },
      { name: "Call Reminder", actionType: "call-reminder", dayOffset: 1 },
      { name: "Send SMS",      actionType: "sms",           dayOffset: 2 },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeStepId() {
  return `step-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function defaultStep(dayOffset: number, type: ActionType = "email"): WorkflowStep {
  return {
    id: makeStepId(),
    name: STEP_DEFAULTS[type] ?? "Step",
    order: 1,
    dayOffset,
    actionType: type,
    note: "",
  };
}

function defaultDelayStep(): WorkflowStep {
  return {
    id: makeStepId(),
    name: "Wait",
    order: 1,
    dayOffset: 0,
    actionType: "delay",
    delayDays: 1,
  };
}

// ─── Wizard step indicator ────────────────────────────────────────────────────

function StepIndicator({ current, steps }: { current: number; steps: string[] }) {
  return (
    <div className="flex items-center mb-8">
      {steps.map((label, i) => {
        const isComplete = i < current;
        const isActive = i === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
                  isComplete || isActive
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-background border-muted text-muted-foreground"
                }`}
              >
                {isComplete ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-xs whitespace-nowrap font-medium ${isActive ? "text-primary" : isComplete ? "text-muted-foreground" : "text-muted-foreground"}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-20 mx-3 mb-5 rounded-full transition-colors ${i < current ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── StepRow ──────────────────────────────────────────────────────────────────

interface StepRowProps {
  step: WorkflowStep;
  index: number;
  totalSteps: number;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updated: WorkflowStep) => void;
  onCancel: () => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  showConnector: boolean;
}

function StepRow({
  step, index, totalSteps, isEditing,
  onEdit, onSave, onCancel, onRemove,
  onMoveUp, onMoveDown, showConnector,
}: StepRowProps) {
  const [draft, setDraft] = useState<StepDraft>({
    name: step.name,
    actionType: step.actionType as ActionType,
    templateId: step.templateId,
    templateName: step.templateName,
    senderIdentity: step.senderIdentity,
    subject: step.subject,
    body: step.body,
    smsTemplateId: step.smsTemplateId,
    smsTemplateName: step.smsTemplateName,
    message: step.message,
    note: step.note,
    reminderDaysBefore: step.reminderDaysBefore,
  });

  useEffect(() => {
    setDraft({
      name: step.name,
      actionType: step.actionType as ActionType,
      templateId: step.templateId,
      templateName: step.templateName,
      senderIdentity: step.senderIdentity,
      subject: step.subject,
      body: step.body,
      smsTemplateId: step.smsTemplateId,
      smsTemplateName: step.smsTemplateName,
      message: step.message,
      note: step.note,
      reminderDaysBefore: step.reminderDaysBefore,
    });
  }, [step, isEditing]);

  return (
    <div className="flex gap-4">
      {/* Timeline column */}
      <div className="flex flex-col items-center flex-shrink-0 w-10">
        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center bg-white shadow-sm ${TYPE_ICON_STYLE[step.actionType]}`}>
          <StepTypeIcon type={step.actionType} />
        </div>
        {showConnector && <div className="w-0.5 bg-border/60 flex-1 min-h-6 mt-1 rounded-full" />}
      </div>

      {/* Card column */}
      <div className="flex-1 pb-4">
        {isEditing ? (
          /* ── Edit form ── */
          <div className="rounded-xl border-2 border-primary/30 bg-card shadow-sm">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${TYPE_ICON_STYLE[step.actionType]}`}>
                  <StepTypeIcon type={step.actionType} size="sm" />
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {draft.name || STEP_DEFAULTS[draft.actionType]}
                </span>
              </div>
              <button onClick={onCancel} className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5">
              <StepConfigFields draft={draft} onChange={(p) => setDraft((d) => ({ ...d, ...p }))} />
              <div className="flex items-center gap-2 pt-5 mt-5 border-t border-border">
                <Button size="sm" onClick={() => onSave({ ...step, ...draft })}>Save Step</Button>
                <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
              </div>
            </div>
          </div>
        ) : (
          /* ── Collapsed card ── */
          <div className="rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all px-4 py-3 flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center flex-shrink-0 select-none">
              {index + 1}
            </span>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="font-semibold text-foreground text-sm truncate">
                {step.name || STEP_DEFAULTS[step.actionType]}
              </span>
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${TYPE_BADGE_STYLE[step.actionType]}`}>
                <StepTypeIcon type={step.actionType} size="sm" />
                {TYPE_OPTIONS.find((o) => o.value === step.actionType)?.label}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium whitespace-nowrap">
                Day {step.dayOffset}
              </span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={onMoveUp}
                disabled={index === 0}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Move up"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={onMoveDown}
                disabled={index === totalSteps - 1}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Move down"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={onEdit}
                className="px-3 h-7 text-xs font-semibold rounded-md border border-border bg-background hover:bg-muted text-foreground transition-colors"
              >
                Edit
              </button>
              <button
                onClick={onRemove}
                disabled={totalSteps <= 1}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Remove step"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DelayRow ─────────────────────────────────────────────────────────────────

function DelayRow({
  step,
  onChangeDays,
  onRemove,
}: {
  step: WorkflowStep;
  onChangeDays: (days: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 py-1 pl-10 pr-0 my-1">
      <div className="h-px flex-1 bg-amber-200" />
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-dashed border-amber-300 bg-amber-50 shrink-0">
        <Clock className="h-3.5 w-3.5 text-amber-500" />
        <span className="text-xs font-medium text-amber-700">Wait</span>
        <button
          type="button"
          onClick={() => onChangeDays(Math.max(1, (step.delayDays ?? 1) - 1))}
          className="w-5 h-5 flex items-center justify-center rounded text-amber-600 hover:bg-amber-200 transition-colors text-sm font-bold leading-none"
        >
          −
        </button>
        <span className="text-xs font-bold text-amber-700 w-5 text-center">{step.delayDays ?? 1}</span>
        <button
          type="button"
          onClick={() => onChangeDays((step.delayDays ?? 1) + 1)}
          className="w-5 h-5 flex items-center justify-center rounded text-amber-600 hover:bg-amber-200 transition-colors text-sm font-bold leading-none"
        >
          +
        </button>
        <span className="text-xs text-amber-600">{(step.delayDays ?? 1) === 1 ? "day" : "days"}</span>
        <button
          type="button"
          onClick={onRemove}
          className="w-5 h-5 flex items-center justify-center rounded text-amber-500 hover:bg-amber-200 hover:text-amber-700 transition-colors ml-1"
          title="Remove delay"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      <div className="h-px flex-1 bg-amber-200" />
    </div>
  );
}

// ─── WorkflowBuilder ──────────────────────────────────────────────────────────

export function WorkflowBuilder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { workflows, segments, handleCreateWorkflow, handleUpdateWorkflow } = useAppData();

  const [wizardStep, setWizardStep] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSegmentId, setSelectedSegmentId] = useState("");
  const [segmentSearch, setSegmentSearch] = useState("");
  const [steps, setSteps] = useState<WorkflowStep[]>([defaultStep(0)]);
  const [editingIndex, setEditingIndex] = useState<number | null>(0);
  const [step1Error, setStep1Error] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const hasSeeded = useRef(false);

  useEffect(() => {
    if (id && !hasSeeded.current) {
      const wf = workflows.find((w) => w.id === id);
      if (wf) {
        setName(wf.name);
        setDescription(wf.description ?? "");
        setSelectedSegmentId(wf.segmentId);
        const seeded = computeDayOffsets(
          [...wf.steps].sort((a, b) => a.order - b.order),
        ).map((s, i) => ({ ...s, order: i + 1 }));
        setSteps(seeded);
        setEditingIndex(null);
        hasSeeded.current = true;
      }
    }
  }, [id, workflows]);

  const filteredSegments = segments.filter((s) =>
    s.name.toLowerCase().includes(segmentSearch.toLowerCase()),
  );
  const selectedSegment = segments.find((s) => s.id === selectedSegmentId);

  const emailCount = steps.filter((s) => s.actionType === "email").length;
  const smsCount = steps.filter((s) => s.actionType === "sms").length;
  const callCount = steps.filter((s) => s.actionType === "call-reminder").length;
  const actionStepCount = steps.filter((s) => s.actionType !== "delay").length;
  const maxDay = steps.length > 0 ? Math.max(...steps.map((s) => s.dayOffset)) : 0;

  const handleNextStep = () => {
    if (!name.trim()) { setStep1Error("Workflow name is required."); return; }
    if (!selectedSegmentId) { setStep1Error("Please select a segment."); return; }
    setStep1Error("");
    setWizardStep(1);
  };

  const recompute = (arr: WorkflowStep[]) =>
    computeDayOffsets(arr).map((s, i) => ({ ...s, order: i + 1 }));

  const handleAddStep = (type: ActionType) => {
    const newStep = defaultStep(0, type);
    const newSteps = recompute([...steps, newStep]);
    setSteps(newSteps);
    setEditingIndex(newSteps.length - 1);
  };

  const handleInsertDelay = (afterIndex: number) => {
    const arr = [...steps];
    arr.splice(afterIndex + 1, 0, defaultDelayStep());
    setSteps(recompute(arr));
  };

  const handleDelayDaysChange = (index: number, days: number) => {
    const updated = steps.map((s, i) =>
      i === index ? { ...s, delayDays: Math.max(1, days) } : s,
    );
    setSteps(recompute(updated));
  };

  const handleStepSave = (index: number, updated: WorkflowStep) => {
    setSteps(recompute(steps.map((s, i) => (i === index ? updated : s))));
    setEditingIndex(null);
  };

  const handleRemoveStep = (index: number) => {
    const filtered = steps.filter((_, i) => i !== index);
    setSteps(recompute(filtered));
    if (editingIndex === index) setEditingIndex(null);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const ns = [...steps];
    [ns[index - 1], ns[index]] = [ns[index], ns[index - 1]];
    setSteps(recompute(ns));
    if (editingIndex === index) setEditingIndex(index - 1);
    else if (editingIndex === index - 1) setEditingIndex(index);
  };

  const handleMoveDown = (index: number) => {
    if (index === steps.length - 1) return;
    const ns = [...steps];
    [ns[index], ns[index + 1]] = [ns[index + 1], ns[index]];
    setSteps(recompute(ns));
    if (editingIndex === index) setEditingIndex(index + 1);
    else if (editingIndex === index + 1) setEditingIndex(index);
  };

  const handleLoadTemplate = (tpl: StepTemplate) => {
    const actionStepsCount = steps.filter((s) => s.actionType !== "delay").length;
    if (actionStepsCount > 0) {
      if (!window.confirm(`Replace current steps with the "${tpl.name}" template?`)) return;
    }
    const sorted = [...tpl.steps].sort((a, b) => a.dayOffset - b.dayOffset);
    const result: WorkflowStep[] = [];
    sorted.forEach((s, i) => {
      result.push({ ...defaultStep(0, s.actionType), name: s.name });
      if (i < sorted.length - 1) {
        const gap = sorted[i + 1].dayOffset - s.dayOffset;
        if (gap > 0) result.push({ ...defaultDelayStep(), delayDays: gap });
      }
    });
    setSteps(recompute(result));
    setEditingIndex(null);
  };

  const handleSave = () => {
    const sortedSteps = recompute([...steps]);
    const segmentName = selectedSegment?.name ?? "";
    if (id) {
      handleUpdateWorkflow(id, { name, description, segmentId: selectedSegmentId, segmentName, steps: sortedSteps });
    } else {
      handleCreateWorkflow({ name, description, segmentId: selectedSegmentId, segmentName, status: "draft", createdBy: "Admin", steps: sortedSteps });
    }
    navigate("/email-workflows/flows");
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* ── Page header ── */}
      <div className="border-b border-border bg-card px-8 py-4 flex items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/email-workflows/flows")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <span className="text-border">|</span>
          <h1 className="text-lg font-semibold text-foreground">
            {id ? "Edit Flow" : "Create New Flow"}
          </h1>
        </div>
        {wizardStep === 1 && (
          <Button onClick={handleSave} disabled={steps.length === 0}>
            {id ? "Update Flow" : "Save Flow"}
          </Button>
        )}
      </div>

      {/* ── Wizard body ── */}
      <div className="flex-1 overflow-auto">
        {/* ════════════ STEP 1: Choose Segment ════════════ */}
        {wizardStep === 0 && (
          <div className="max-w-2xl mx-auto px-8 py-8">
            <StepIndicator current={0} steps={WIZARD_STEPS} />

            <div className="space-y-5">
              {/* Flow details card */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                <SectionLabel>Flow Details</SectionLabel>
                <div>
                  <FieldLabel required>Flow Name</FieldLabel>
                  <Input
                    value={name}
                    onChange={(e) => { setName(e.target.value); if (step1Error) setStep1Error(""); }}
                    placeholder="e.g. New Broker Onboarding"
                    className={!name.trim() && step1Error ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                </div>
                <div>
                  <FieldLabel>Description</FieldLabel>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what this flow does and who it targets…"
                    rows={3}
                  />
                </div>
              </div>

              {/* Segment picker card */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-3">
                <SectionLabel>Target Segment</SectionLabel>
                <FieldLabel required>Segment</FieldLabel>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    value={segmentSearch}
                    onChange={(e) => setSegmentSearch(e.target.value)}
                    placeholder="Search segments…"
                    className="pl-9"
                  />
                </div>

                {selectedSegmentId && !segmentSearch && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/8 border border-primary/20 text-sm">
                    <Users className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="font-medium text-primary truncate">{selectedSegment?.name}</span>
                    <span className="text-primary/70 ml-auto whitespace-nowrap text-xs">{selectedSegment?.contactCount.toLocaleString()} contacts</span>
                  </div>
                )}

                <ul className="max-h-56 overflow-y-auto rounded-lg border border-input bg-background divide-y divide-border">
                  {filteredSegments.length === 0 ? (
                    <li className="px-4 py-5 text-sm text-muted-foreground text-center">No segments found</li>
                  ) : (
                    filteredSegments.map((seg) => (
                      <li
                        key={seg.id}
                        onClick={() => { setSelectedSegmentId(seg.id); setSegmentSearch(""); }}
                        className={`flex items-center justify-between px-4 py-3 text-sm cursor-pointer transition-colors ${
                          selectedSegmentId === seg.id
                            ? "bg-primary/5 border-l-2 border-primary"
                            : "hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {selectedSegmentId === seg.id && (
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          )}
                          <span className={`font-medium ${selectedSegmentId === seg.id ? "text-primary" : "text-foreground"}`}>
                            {seg.name}
                          </span>
                        </div>
                        <span className="text-muted-foreground text-xs ml-4">{seg.contactCount.toLocaleString()} contacts</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {/* Error */}
              {step1Error && (
                <p className="flex items-center gap-1.5 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" /> {step1Error}
                </p>
              )}

              {/* Actions */}
              <div className="flex justify-end">
                <Button onClick={handleNextStep} size="default">
                  Next — Configure Steps <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════ STEP 2: Configure Steps ════════════ */}
        {wizardStep === 1 && (
          <div className="px-8 py-8 flex gap-8 items-start max-w-6xl mx-auto w-full">
            {/* ── Main content ── */}
            <div className="flex-1 min-w-0 space-y-5">
              <StepIndicator current={1} steps={WIZARD_STEPS} />

              {/* Segment info bar */}
              <div className="flex items-center gap-4 rounded-xl border border-primary/20 bg-primary/5 px-5 py-3.5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-4.5 w-4.5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-primary/60 mb-0.5">Target Segment</p>
                  <p className="font-semibold text-foreground truncate">{selectedSegment?.name}</p>
                </div>
                {selectedSegment && (
                  <div className="ml-auto text-right flex-shrink-0">
                    <p className="text-base font-bold text-primary leading-tight">{selectedSegment.contactCount.toLocaleString()}</p>
                    <p className="text-[11px] text-muted-foreground">contacts</p>
                  </div>
                )}
              </div>

              {/* Steps timeline */}
              {steps.filter((s) => s.actionType !== "delay").length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-border p-12 text-center text-muted-foreground">
                  <Mail className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium text-foreground mb-1">No steps yet</p>
                  <p className="text-sm">Add a step from the panel on the right to get started.</p>
                </div>
              ) : (
                <div>
                  {steps.map((step, i) => {
                    if (step.actionType === "delay") {
                      return (
                        <DelayRow
                          key={step.id}
                          step={step}
                          onChangeDays={(days) => handleDelayDaysChange(i, days)}
                          onRemove={() => handleRemoveStep(i)}
                        />
                      );
                    }
                    const isLastStep = i === steps.length - 1;
                    const nextIsDelay = !isLastStep && steps[i + 1]?.actionType === "delay";
                    return (
                      <div key={step.id}>
                        <StepRow
                          step={step}
                          index={i}
                          totalSteps={steps.length}
                          isEditing={editingIndex === i}
                          onEdit={() => setEditingIndex(i)}
                          onSave={(updated) => handleStepSave(i, updated)}
                          onCancel={() => setEditingIndex(null)}
                          onRemove={() => handleRemoveStep(i)}
                          onMoveUp={() => handleMoveUp(i)}
                          onMoveDown={() => handleMoveDown(i)}
                          showConnector={!isLastStep && !nextIsDelay}
                        />
                        {!isLastStep && !nextIsDelay && (
                          <button
                            type="button"
                            onClick={() => handleInsertDelay(i)}
                            className="flex items-center gap-1.5 mx-auto pl-12 py-0.5 text-[11px] text-muted-foreground hover:text-amber-600 transition-colors group"
                          >
                            <span className="h-px w-8 bg-border group-hover:bg-amber-300 transition-colors" />
                            <Clock className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                            <span>add delay</span>
                            <span className="h-px w-8 bg-border group-hover:bg-amber-300 transition-colors" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

            {/* ── Right sidebar ── */}
            <div className="w-72 flex-shrink-0 sticky top-8">
              {/* Templates */}
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm mb-4">
                <SectionLabel>Templates</SectionLabel>
                <div className="flex flex-col gap-2">
                  {STEP_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setSelectedTemplateId(tpl.id === selectedTemplateId ? "" : tpl.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg border-2 transition-all ${
                        selectedTemplateId === tpl.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40 hover:bg-muted/30"
                      }`}
                    >
                      <p className={`text-sm font-semibold leading-tight ${selectedTemplateId === tpl.id ? "text-primary" : "text-foreground"}`}>
                        {tpl.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{tpl.description}</p>
                    </button>
                  ))}
                  <Button
                    size="sm"
                    variant={selectedTemplateId ? "default" : "outline"}
                    disabled={!selectedTemplateId}
                    onClick={() => {
                      const tpl = STEP_TEMPLATES.find((t) => t.id === selectedTemplateId);
                      if (tpl) handleLoadTemplate(tpl);
                    }}
                    className="w-full"
                  >
                    Load Template
                  </Button>
                </div>
              </div>

              {/* Add step */}
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm mb-4">
                <SectionLabel>Add Step</SectionLabel>
                <div className="space-y-2">
                  {TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleAddStep(opt.value)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-background text-left transition-all duration-150 group ${TYPE_HOVER_STYLE[opt.value]}`}
                    >
                      <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${TYPE_ICON_BG[opt.value]}`}>
                        <StepTypeIcon type={opt.value} />
                      </span>
                      <span className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-foreground leading-snug">{opt.label}</span>
                        <span className="text-[11px] text-muted-foreground leading-snug truncate">{opt.description}</span>
                      </span>
                    </button>
                  ))}
                  <button
                    onClick={() => handleInsertDelay(steps.length - 1)}
                    disabled={steps.length === 0}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-background text-left transition-all duration-150 hover:border-amber-300 hover:bg-amber-50/40 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-amber-50 text-amber-600">
                      <Clock className="h-4 w-4" />
                    </span>
                    <span className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-foreground leading-snug">Add Delay</span>
                      <span className="text-[11px] text-muted-foreground leading-snug">Wait period between steps</span>
                    </span>
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <SectionLabel>Summary</SectionLabel>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="rounded-lg bg-muted/50 px-3 py-2 text-center">
                    <p className="text-lg font-bold text-foreground leading-tight">{actionStepCount}</p>
                    <p className="text-[11px] text-muted-foreground">Steps</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 px-3 py-2 text-center">
                    <p className="text-lg font-bold text-foreground leading-tight">{maxDay}</p>
                    <p className="text-[11px] text-muted-foreground">Days</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between rounded-lg px-2.5 py-1.5 bg-emerald-50">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                      <Mail className="h-3.5 w-3.5" /> Emails
                    </span>
                    <span className="text-xs font-bold text-emerald-700">{emailCount}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg px-2.5 py-1.5 bg-purple-50">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-purple-700">
                      <MessageSquare className="h-3.5 w-3.5" /> SMS
                    </span>
                    <span className="text-xs font-bold text-purple-700">{smsCount}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg px-2.5 py-1.5 bg-blue-50">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-blue-700">
                      <Phone className="h-3.5 w-3.5" /> Calls
                    </span>
                    <span className="text-xs font-bold text-blue-700">{callCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
