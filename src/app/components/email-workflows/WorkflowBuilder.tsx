import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft, ChevronRight, Check, AlertCircle,
  Mail, MessageSquare, Phone, ArrowUp, ArrowDown, X,
  Sparkles, User, Search, Users,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useAppData } from "../../contexts/AppDataContext";
import type { WorkflowStep } from "../../types";
import { sampleTemplates } from "./campaign/campaign-data";

// ─── Constants ───────────────────────────────────────────────────────────────

type ActionType = "email" | "sms" | "call-reminder";
type SenderIdentity = "brand" | "loan-officer";

const STEP_DEFAULTS: Record<ActionType, string> = {
  email: "Send Email Step",
  sms: "Send SMS Step",
  "call-reminder": "Call Reminder Step",
};

const TYPE_OPTIONS: { value: ActionType; label: string; description: string }[] = [
  { value: "email", label: "Send Email", description: "Automated email to contact" },
  { value: "sms", label: "Send SMS", description: "Text message to contact" },
  { value: "call-reminder", label: "Call Reminder", description: "Manual call task for agent" },
];

const TYPE_ICON_STYLE: Record<ActionType, string> = {
  email: "border-emerald-500 text-emerald-600",
  sms: "border-purple-400 text-purple-600",
  "call-reminder": "border-blue-400 text-blue-600",
};

const TYPE_ICON_BG: Record<ActionType, string> = {
  email: "bg-emerald-50 text-emerald-600",
  sms: "bg-purple-50 text-purple-600",
  "call-reminder": "bg-blue-50 text-blue-600",
};

const TYPE_HOVER_STYLE: Record<ActionType, string> = {
  email: "hover:border-emerald-300 hover:bg-emerald-50/40",
  sms: "hover:border-purple-300 hover:bg-purple-50/40",
  "call-reminder": "hover:border-blue-300 hover:bg-blue-50/40",
};

const TYPE_BADGE_STYLE: Record<ActionType, string> = {
  email: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  sms: "bg-purple-50 text-purple-700 border border-purple-200",
  "call-reminder": "bg-blue-50 text-blue-700 border border-blue-200",
};

const SMS_TEMPLATES = [
  { id: "sms-1", name: "Quick Follow-up", message: "Hi {{first_name}}, just checking in! Reply to schedule a quick call." },
  { id: "sms-2", name: "Appointment Reminder", message: "Hi {{first_name}}, reminder about your appointment tomorrow. Reply YES to confirm." },
  { id: "sms-3", name: "New Offer Alert", message: "Hi {{first_name}}, we have a new offer that matches your profile. Reply to learn more." },
];

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
    name: STEP_DEFAULTS[type],
    order: 1,
    dayOffset,
    actionType: type,
    note: "",
  };
}

function StepTypeIcon({ type, size = "md" }: { type: ActionType; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  if (type === "email") return <Mail className={cls} />;
  if (type === "sms") return <MessageSquare className={cls} />;
  return <Phone className={cls} />;
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

// ─── Sender identity toggle ───────────────────────────────────────────────────

function SenderIdentityToggle({
  value,
  onChange,
}: {
  value: SenderIdentity;
  onChange: (v: SenderIdentity) => void;
}) {
  const options: { value: SenderIdentity; label: string; sub: string; Icon: React.ElementType }[] = [
    { value: "brand", label: "Brand Voice", sub: "Sent as LoanBud brand", Icon: Sparkles },
    { value: "loan-officer", label: "Loan Officer", sub: "Sent as assigned agent", Icon: User },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-left transition-colors ${
              active
                ? "border-primary bg-primary/5 text-primary"
                : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted/30"
            }`}
          >
            <opt.Icon className={`h-5 w-5 flex-shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} />
            <div>
              <p className={`text-sm font-semibold leading-tight ${active ? "text-primary" : "text-foreground"}`}>{opt.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{opt.sub}</p>
            </div>
            {active && (
              <div className="ml-auto w-4 h-4 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Check className="h-2.5 w-2.5 text-primary-foreground" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Email template preview ───────────────────────────────────────────────────

function EmailPreview({ subject, body }: { subject: string; body: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border bg-muted/40 flex items-center gap-2">
        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Preview</span>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <span className="text-xs font-medium text-muted-foreground">Subject</span>
          <p className="text-sm font-medium text-foreground mt-0.5">{subject}</p>
        </div>
        <div>
          <span className="text-xs font-medium text-muted-foreground">Body</span>
          <p className="text-sm text-foreground whitespace-pre-wrap font-mono mt-0.5 leading-relaxed">{body}</p>
        </div>
      </div>
    </div>
  );
}

// ─── SMS preview ──────────────────────────────────────────────────────────────

function SmsPreview({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border bg-muted/40 flex items-center gap-2">
        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Preview</span>
      </div>
      <div className="p-4">
        <div className="inline-block max-w-xs bg-primary text-primary-foreground rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed">
          {message}
        </div>
      </div>
    </div>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{children}</p>
  );
}

// ─── Field label ──────────────────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-sm font-medium text-foreground mb-1.5 block">
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
    </label>
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
  const [draft, setDraft] = useState<WorkflowStep>({ ...step });

  useEffect(() => {
    setDraft({ ...step });
  }, [step, isEditing]);

  const handleTypeChange = (type: ActionType) => {
    setDraft((d) => ({
      ...d,
      actionType: type,
      name: d.name === STEP_DEFAULTS[d.actionType] ? STEP_DEFAULTS[type] : d.name,
    }));
  };

  const selectedEmailTpl = sampleTemplates.find((t) => t.name === draft.templateId);
  const selectedSmsTpl = SMS_TEMPLATES.find((t) => t.id === draft.smsTemplateId);

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
            {/* Form header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${TYPE_ICON_STYLE[step.actionType]}`}>
                  <StepTypeIcon type={step.actionType} size="sm" />
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {draft.name || STEP_DEFAULTS[draft.actionType]}
                </span>
              </div>
              <button
                onClick={onCancel}
                className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Row: name + day */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Step Name</FieldLabel>
                  <Input
                    value={draft.name}
                    onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                    placeholder={STEP_DEFAULTS[draft.actionType]}
                  />
                </div>
                <div>
                  <FieldLabel>Day from Start</FieldLabel>
                  <Input
                    type="number"
                    min={0}
                    value={draft.dayOffset}
                    onChange={(e) => setDraft((d) => ({ ...d, dayOffset: Math.max(0, Number(e.target.value)) }))}
                  />
                </div>
              </div>

              {/* Type selector */}
              <div>
                <FieldLabel>Type</FieldLabel>
                <div className="flex rounded-lg border border-input overflow-hidden w-fit">
                  {TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleTypeChange(opt.value)}
                      className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-r border-input last:border-0 transition-colors ${
                        draft.actionType === opt.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-background text-foreground hover:bg-muted"
                      }`}
                    >
                      <StepTypeIcon type={opt.value} size="sm" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Email-specific ── */}
              {draft.actionType === "email" && (
                <div className="space-y-4">
                  <div>
                    <FieldLabel>Email Template</FieldLabel>
                    <select
                      value={draft.templateId ?? ""}
                      onChange={(e) => {
                        const tpl = sampleTemplates.find((t) => t.name === e.target.value);
                        setDraft((d) => ({
                          ...d,
                          templateId: e.target.value,
                          templateName: tpl?.name ?? "",
                          subject: tpl?.subject ?? d.subject,
                          body: tpl?.body ?? d.body,
                        }));
                      }}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    >
                      <option value="">— Select a template —</option>
                      {sampleTemplates.map((t) => (
                        <option key={t.name} value={t.name}>
                          {t.name} · {t.category}
                        </option>
                      ))}
                    </select>
                    {selectedEmailTpl && (
                      <div className="mt-3">
                        <EmailPreview subject={selectedEmailTpl.subject} body={selectedEmailTpl.body} />
                      </div>
                    )}
                  </div>
                  <div>
                    <FieldLabel>Sender Identity</FieldLabel>
                    <SenderIdentityToggle
                      value={(draft.senderIdentity as SenderIdentity) ?? "brand"}
                      onChange={(v) => setDraft((d) => ({ ...d, senderIdentity: v }))}
                    />
                  </div>
                </div>
              )}

              {/* ── SMS-specific ── */}
              {draft.actionType === "sms" && (
                <div>
                  <FieldLabel>SMS Template</FieldLabel>
                  <select
                    value={draft.smsTemplateId ?? ""}
                    onChange={(e) => {
                      const tpl = SMS_TEMPLATES.find((t) => t.id === e.target.value);
                      setDraft((d) => ({
                        ...d,
                        smsTemplateId: e.target.value,
                        smsTemplateName: tpl?.name ?? "",
                        message: tpl?.message ?? d.message,
                      }));
                    }}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  >
                    <option value="">— Select a template —</option>
                    {SMS_TEMPLATES.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  {selectedSmsTpl && (
                    <div className="mt-3">
                      <SmsPreview message={selectedSmsTpl.message} />
                    </div>
                  )}
                </div>
              )}

              {/* ── Call reminder-specific ── */}
              {draft.actionType === "call-reminder" && (
                <div>
                  <FieldLabel>Remind Before</FieldLabel>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min={0}
                      value={draft.reminderDaysBefore ?? 1}
                      onChange={(e) => setDraft((d) => ({ ...d, reminderDaysBefore: Math.max(0, Number(e.target.value)) }))}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">day(s) before this step's scheduled date</span>
                  </div>
                </div>
              )}

              {/* Note/Script */}
              <div>
                <FieldLabel>Note / Script</FieldLabel>
                <Textarea
                  value={draft.note ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
                  placeholder="Agent notes or message content..."
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1 border-t border-border">
                <Button size="sm" onClick={() => onSave(draft)}>Save Step</Button>
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
        setSteps(wf.steps.map((s) => ({ ...s })));
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
  const maxDay = steps.length > 0 ? Math.max(...steps.map((s) => s.dayOffset)) : 0;

  const handleNextStep = () => {
    if (!name.trim()) { setStep1Error("Workflow name is required."); return; }
    if (!selectedSegmentId) { setStep1Error("Please select a segment."); return; }
    setStep1Error("");
    setWizardStep(1);
  };

  const handleAddStep = (type: ActionType) => {
    const nextDay = steps.length > 0 ? Math.max(...steps.map((s) => s.dayOffset)) + 1 : 0;
    const newStep = defaultStep(nextDay, type);
    const newIndex = steps.length;
    setSteps([...steps, newStep]);
    setEditingIndex(newIndex);
  };

  const handleStepSave = (index: number, updated: WorkflowStep) => {
    setSteps(steps.map((s, i) => (i === index ? updated : s)));
    setEditingIndex(null);
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const ns = [...steps];
    [ns[index - 1], ns[index]] = [ns[index], ns[index - 1]];
    setSteps(ns);
    if (editingIndex === index) setEditingIndex(index - 1);
    else if (editingIndex === index - 1) setEditingIndex(index);
  };

  const handleMoveDown = (index: number) => {
    if (index === steps.length - 1) return;
    const ns = [...steps];
    [ns[index], ns[index + 1]] = [ns[index + 1], ns[index]];
    setSteps(ns);
    if (editingIndex === index) setEditingIndex(index + 1);
    else if (editingIndex === index + 1) setEditingIndex(index);
  };

  const handleLoadTemplate = (tpl: StepTemplate) => {
    if (steps.length > 0) {
      if (!window.confirm(`Replace current ${steps.length} step(s) with the "${tpl.name}" template?`)) return;
    }
    const newSteps = tpl.steps.map((s, i) => ({
      ...defaultStep(s.dayOffset, s.actionType),
      name: s.name,
      order: i + 1,
    }));
    setSteps(newSteps);
    setEditingIndex(null);
  };

  const handleSave = () => {
    const sortedSteps = [...steps]
      .sort((a, b) => a.dayOffset - b.dayOffset)
      .map((s, i) => ({ ...s, order: i + 1 }));
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
              {steps.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-border p-12 text-center text-muted-foreground">
                  <Mail className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium text-foreground mb-1">No steps yet</p>
                  <p className="text-sm">Add a step from the panel on the right to get started.</p>
                </div>
              ) : (
                <div>
                  {steps.map((step, i) => (
                    <StepRow
                      key={step.id}
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
                      showConnector={i < steps.length - 1}
                    />
                  ))}
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
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <SectionLabel>Summary</SectionLabel>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="rounded-lg bg-muted/50 px-3 py-2 text-center">
                    <p className="text-lg font-bold text-foreground leading-tight">{steps.length}</p>
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
